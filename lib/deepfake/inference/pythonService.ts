import type {
  DeepfakeAnalysisResult,
  DeepfakeModelServiceStatus,
  ValidatedDeepfakeImage,
} from "../types";

const SERVICE_TIMEOUT_MS = 60_000;
const DEFAULT_SERVICE_URL = "http://127.0.0.1:8001";
const FAKE_DECISION_THRESHOLD = 0.5;
const HEALTH_TIMEOUT_MS = 5_000;

export class PythonDeepfakeServiceError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "PythonDeepfakeServiceError";
  }
}

export async function getPythonDeepfakeServiceStatus(): Promise<DeepfakeModelServiceStatus> {
  const serviceBaseUrl =
    process.env.DEEPFAKE_INFERENCE_URL?.trim() || DEFAULT_SERVICE_URL;
  let healthUrl: URL;
  try {
    healthUrl = new URL("/health", serviceBaseUrl);
  } catch {
    return {
      status: "unavailable",
      message: "Deepfake inference service is not configured correctly.",
    };
  }

  let response: Response;
  try {
    response = await fetch(healthUrl, {
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    return {
      status: "unavailable",
      message: "The local deepfake inference service is not responding.",
    };
  }

  if (response.status === 503) {
    return {
      status: "unavailable",
      message: "The trained model checkpoint is not available yet.",
    };
  }
  if (!response.ok) {
    throw new PythonDeepfakeServiceError(
      "The deepfake inference service returned an unexpected health response.",
      502
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new PythonDeepfakeServiceError(
      "Deepfake inference service returned an invalid health response.",
      502
    );
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("status" in payload) ||
    payload.status !== "ready" ||
    !("model_name" in payload) ||
    typeof payload.model_name !== "string" ||
    !("model_version" in payload) ||
    typeof payload.model_version !== "string"
  ) {
    throw new PythonDeepfakeServiceError(
      "Deepfake inference service returned an invalid health response.",
      502
    );
  }

  return {
    status: "available",
    model_name: payload.model_name,
    model_version: payload.model_version,
  };
}

const extensionByMimeType = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
} as const;

function isAnalysisResult(value: unknown): value is DeepfakeAnalysisResult {
  if (typeof value !== "object" || value === null) return false;
  const result = value as Record<string, unknown>;
  if (
    typeof result.real_probability !== "number" ||
    !Number.isFinite(result.real_probability) ||
    result.real_probability < 0 ||
    result.real_probability > 1 ||
    typeof result.fake_probability !== "number" ||
    !Number.isFinite(result.fake_probability) ||
    result.fake_probability < 0 ||
    result.fake_probability > 1 ||
    Math.abs(result.real_probability + result.fake_probability - 1) > 0.001 ||
    (result.predicted_class !== "real" &&
      result.predicted_class !== "fake" &&
      result.predicted_class !== "inconclusive") ||
    (result.risk_level !== "low" &&
      result.risk_level !== "medium" &&
      result.risk_level !== "high" &&
      result.risk_level !== "inconclusive") ||
    typeof result.model_name !== "string" ||
    result.model_name.length === 0 ||
    typeof result.model_version !== "string" ||
    result.model_version.length === 0 ||
    typeof result.inference_time_ms !== "number" ||
    !Number.isFinite(result.inference_time_ms) ||
    result.inference_time_ms < 0 ||
    typeof result.explanation !== "string" ||
    result.explanation.length === 0 ||
    (result.analysis_mode !== undefined &&
      result.analysis_mode !== "image" &&
      result.analysis_mode !== "sampled_video") ||
    (result.frames_analyzed !== undefined &&
      (typeof result.frames_analyzed !== "number" ||
        !Number.isInteger(result.frames_analyzed) ||
        result.frames_analyzed <= 0)) ||
    (result.sampled_duration_seconds !== undefined &&
      (typeof result.sampled_duration_seconds !== "number" ||
        !Number.isFinite(result.sampled_duration_seconds) ||
        result.sampled_duration_seconds <= 0))
  ) {
    return false;
  }

  const expectedClass =
    result.fake_probability === FAKE_DECISION_THRESHOLD
      ? "inconclusive"
      : result.fake_probability > FAKE_DECISION_THRESHOLD
        ? "fake"
        : "real";
  const expectedRisk =
    expectedClass === "inconclusive"
      ? "inconclusive"
      : expectedClass === "fake"
        ? "high"
        : "low";
  return (
    result.predicted_class === expectedClass &&
    result.risk_level === expectedRisk
  );
}

export async function analyzeWithPythonService(
  image: ValidatedDeepfakeImage
): Promise<DeepfakeAnalysisResult> {
  const formData = new FormData();
  appendImage(formData, image);
  return analyzeImageForm(formData, "/v1/analyze");
}

async function analyzeImageForm(
  formData: FormData,
  endpoint: string
): Promise<DeepfakeAnalysisResult> {
  const serviceBaseUrl =
    process.env.DEEPFAKE_INFERENCE_URL?.trim() || DEFAULT_SERVICE_URL;
  let serviceUrl: URL;

  try {
    serviceUrl = new URL(endpoint, serviceBaseUrl);
  } catch {
    throw new PythonDeepfakeServiceError(
      "Deepfake inference service is not configured correctly.",
      503
    );
  }

  let response: Response;
  try {
    response = await fetch(serviceUrl, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(SERVICE_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new PythonDeepfakeServiceError(
        "Deepfake inference service timed out. Please retry.",
        504
      );
    }
    throw new PythonDeepfakeServiceError(
      "Deepfake inference service is unavailable.",
      503
    );
  }

  if (response.status !== 200) {
    if (response.status === 503) {
      throw new PythonDeepfakeServiceError(
        "The trained deepfake model is unavailable. No prediction was generated.",
        503
      );
    }
    if (response.status === 413) {
      throw new PythonDeepfakeServiceError(
        "The uploaded media exceeds the maximum file size.",
        413
      );
    }
    if (response.status === 415) {
      throw new PythonDeepfakeServiceError(
        "Unsupported or invalid image frame.",
        415
      );
    }
    if (response.status === 400) {
      throw new PythonDeepfakeServiceError(
        "The uploaded image is unreadable or invalid.",
        400
      );
    }
    throw new PythonDeepfakeServiceError(
      "Deepfake inference failed. Please retry.",
      502
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new PythonDeepfakeServiceError(
      "Deepfake inference service returned an invalid response.",
      502
    );
  }

  if (!isAnalysisResult(payload)) {
    throw new PythonDeepfakeServiceError(
      "Deepfake inference service returned an invalid response.",
      502
    );
  }

  return payload;
}

function appendImage(formData: FormData, image: ValidatedDeepfakeImage) {
  const imageBuffer = new Uint8Array(image.bytes).buffer;
  formData.append(
    "file",
    new Blob([imageBuffer], { type: image.mimeType }),
    `upload${extensionByMimeType[image.mimeType]}`
  );
}

export async function analyzeVideoFramesWithPythonService(
  frames: readonly ValidatedDeepfakeImage[],
  durationSeconds: number
): Promise<DeepfakeAnalysisResult> {
  const formData = new FormData();
  frames.forEach((frame, index) => {
    const imageBuffer = new Uint8Array(frame.bytes).buffer;
    formData.append(
      "frames",
      new Blob([imageBuffer], { type: frame.mimeType }),
      `frame-${index + 1}${extensionByMimeType[frame.mimeType]}`
    );
  });
  formData.append("duration_seconds", String(durationSeconds));

  return analyzeImageForm(formData, "/v1/analyze/frames");
}
