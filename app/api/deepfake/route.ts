import { NextResponse } from "next/server";
import type { ApiResponse, DeepfakeScanResponse } from "@/types";
import {
  DEEPFAKE_IMAGE_TYPES,
  createValidatedDeepfakeImage,
  detectDeepfakeImageMimeType,
  MAX_DEEPFAKE_IMAGE_SIZE,
  MAX_DEEPFAKE_VIDEO_DURATION_SECONDS,
  MAX_DEEPFAKE_VIDEO_FRAMES,
  validateDeepfakeImageMetadata,
} from "@/lib/deepfake/utilities/imageValidation";
import {
  analyzeWithPythonService,
  analyzeVideoFramesWithPythonService,
  getPythonDeepfakeServiceStatus,
  PythonDeepfakeServiceError,
} from "@/lib/deepfake/inference/pythonService";
import type { ValidatedDeepfakeImage } from "@/lib/deepfake/types";

export const runtime = "nodejs";
const MAX_VIDEO_REQUEST_SIZE = 24 * 1024 * 1024;

export async function GET() {
  try {
    const status = await getPythonDeepfakeServiceStatus();
    return NextResponse.json<ApiResponse<typeof status>>(
      { success: true, data: status },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof PythonDeepfakeServiceError) {
      return errorResponse(error.message, error.status);
    }
    return errorResponse("Could not check deepfake model status.", 500);
  }
}

class DeepfakeUploadError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

function errorResponse(message: string, status: number) {
  return NextResponse.json<ApiResponse<null>>(
    { success: false, error: message },
    { status }
  );
}

function unavailableResponse(message: string) {
  return NextResponse.json<ApiResponse<DeepfakeScanResponse>>(
    {
      success: false,
      data: { status: "unavailable", message },
      error: "Deepfake model unavailable.",
    },
    { status: 503 }
  );
}

async function validateUploadedImage(file: File): Promise<ValidatedDeepfakeImage> {
  const metadataError = validateDeepfakeImageMetadata(file);
  if (metadataError) {
    throw new DeepfakeUploadError(
      metadataError,
      file.size > MAX_DEEPFAKE_IMAGE_SIZE ? 413 : 400
    );
  }

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch {
    throw new DeepfakeUploadError("The uploaded image could not be read.", 400);
  }

  let mimeType: ReturnType<typeof detectDeepfakeImageMimeType>;
  try {
    mimeType = detectDeepfakeImageMimeType(bytes);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "The uploaded file content is not a supported image.";
    throw new DeepfakeUploadError(message, 415);
  }
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const extensionMatchesContent = DEEPFAKE_IMAGE_TYPES[mimeType].some(
    (allowedExtension) => allowedExtension === extension
  );

  if (!extensionMatchesContent || (file.type && file.type !== mimeType)) {
    throw new DeepfakeUploadError(
      "The image extension, media type, and file content do not match.",
      400
    );
  }

  return createValidatedDeepfakeImage(file, mimeType, bytes);
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
    return errorResponse(
      "Unsupported Content-Type. Upload supported media using multipart/form-data.",
      415
    );
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_VIDEO_REQUEST_SIZE + 128 * 1024
  ) {
    return errorResponse("Upload exceeds the maximum request size.", 413);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("The uploaded form data could not be read.", 400);
  }

  const mode = formData.get("mode");
  if (mode === "sampled_video") {
    const rawDuration = formData.get("duration_seconds");
    const durationSeconds =
      typeof rawDuration === "string" ? Number(rawDuration) : NaN;
    const rawFrames = formData.getAll("frames");

    if (
      !Number.isFinite(durationSeconds) ||
      durationSeconds <= 0 ||
      durationSeconds > MAX_DEEPFAKE_VIDEO_DURATION_SECONDS
    ) {
      return errorResponse("Video duration must be at most 30 seconds.", 400);
    }
    if (
      rawFrames.length === 0 ||
      rawFrames.length > MAX_DEEPFAKE_VIDEO_FRAMES ||
      rawFrames.some((frame) => typeof frame === "string")
    ) {
      return errorResponse(
        "Video analysis requires between 1 and 15 valid sampled frames.",
        400
      );
    }

    try {
      const uploadedFrames = rawFrames.filter(
        (frame): frame is File => typeof frame !== "string"
      );
      const totalFrameBytes = uploadedFrames.reduce(
        (total, frame) => total + frame.size,
        0
      );
      if (totalFrameBytes > MAX_VIDEO_REQUEST_SIZE) {
        return errorResponse(
          "Sampled video frames exceed the maximum request size.",
          413
        );
      }
      const frames = await Promise.all(
        uploadedFrames.map((frame) => validateUploadedImage(frame))
      );
      const result = await analyzeVideoFramesWithPythonService(
        frames,
        durationSeconds
      );
      return NextResponse.json<ApiResponse<DeepfakeScanResponse>>(
        { success: true, data: { status: "available", result } },
        { status: 200 }
      );
    } catch (error: unknown) {
      if (error instanceof DeepfakeUploadError) {
        return errorResponse(error.message, error.status);
      }
      if (error instanceof PythonDeepfakeServiceError) {
        if (error.status === 503) {
          return unavailableResponse(error.message);
        }
        return errorResponse(error.message, error.status);
      }
      return errorResponse("Deepfake video analysis failed.", 500);
    }
  }
  if (mode !== null) {
    return errorResponse("Unsupported deepfake analysis mode.", 400);
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return errorResponse(
      "Image file is required in the 'file' form field.",
      400
    );
  }

  let image: ValidatedDeepfakeImage;
  try {
    image = await validateUploadedImage(file);
  } catch (error: unknown) {
    if (error instanceof DeepfakeUploadError) {
      return errorResponse(error.message, error.status);
    }
    return errorResponse("The uploaded image could not be read.", 400);
  }

  try {
    const result = await analyzeWithPythonService(image);
    return NextResponse.json<ApiResponse<DeepfakeScanResponse>>(
      { success: true, data: { status: "available", result } },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof PythonDeepfakeServiceError) {
      if (error.status === 503) {
        return unavailableResponse(error.message);
      }
      return errorResponse(error.message, error.status);
    }
    return errorResponse("Deepfake image analysis failed.", 500);
  }
}
