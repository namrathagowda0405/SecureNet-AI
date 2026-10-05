import type { ValidatedDeepfakeImage } from "../types";

export const MAX_DEEPFAKE_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_DEEPFAKE_VIDEO_SIZE = 50 * 1024 * 1024;
export const MAX_DEEPFAKE_VIDEO_DURATION_SECONDS = 30;
export const MAX_DEEPFAKE_VIDEO_FRAMES = 15;

const DEEPFAKE_VIDEO_TYPES = {
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
} as const;

export const DEEPFAKE_IMAGE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
} as const;

export type DeepfakeImageMimeType = keyof typeof DEEPFAKE_IMAGE_TYPES;
export type DeepfakeVideoMimeType = keyof typeof DEEPFAKE_VIDEO_TYPES;

export class DeepfakeImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeepfakeImageValidationError";
  }
}

export function validateDeepfakeImageMetadata(
  file: Pick<File, "name" | "size" | "type">
): string | null {
  if (file.size <= 0) {
    return "The selected image is empty.";
  }

  if (file.size > MAX_DEEPFAKE_IMAGE_SIZE) {
    return "Image exceeds the 10 MB maximum file size.";
  }

  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const allowedType = Object.entries(DEEPFAKE_IMAGE_TYPES).find(
    ([, extensions]) => extensions.some((allowed) => allowed === extension)
  );

  if (!allowedType) {
    return "Unsupported file. Upload a JPG, JPEG, PNG, or WEBP image.";
  }

  if (file.type && file.type !== allowedType[0]) {
    return "The image file extension and media type do not match.";
  }

  return null;
}

export function validateDeepfakeVideoMetadata(
  file: Pick<File, "name" | "size" | "type">
): string | null {
  if (file.size <= 0) {
    return "The selected video is empty.";
  }

  if (file.size > MAX_DEEPFAKE_VIDEO_SIZE) {
    return "Video exceeds the 50 MB maximum file size.";
  }

  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const allowedType = Object.entries(DEEPFAKE_VIDEO_TYPES).find(
    ([, extensions]) => extensions.some((allowed) => allowed === extension)
  );

  if (!allowedType) {
    return "Unsupported file. Upload an MP4 or WEBM video.";
  }

  if (file.type && file.type !== allowedType[0]) {
    return "The video file extension and media type do not match.";
  }

  return null;
}

export function detectDeepfakeImageMimeType(
  bytes: Uint8Array
): DeepfakeImageMimeType {
  const isWebp =
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;
  if (isWebp) return "image/webp";

  const isPng =
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  if (isPng) return "image/png";

  const isJpeg =
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff;
  if (isJpeg) return "image/jpeg";

  throw new DeepfakeImageValidationError(
    "The uploaded file content is not a supported JPG, JPEG, PNG, or WEBP image."
  );
}

export function createValidatedDeepfakeImage(
  file: Pick<File, "name" | "size" | "type">,
  mimeType: DeepfakeImageMimeType,
  bytes: Uint8Array
): ValidatedDeepfakeImage {
  return {
    fileName: file.name,
    mimeType,
    size: file.size,
    bytes,
  };
}
