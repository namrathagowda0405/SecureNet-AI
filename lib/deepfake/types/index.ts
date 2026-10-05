export type DeepfakePredictedClass = "real" | "fake" | "inconclusive";
export type DeepfakeRiskLevel = "low" | "medium" | "high" | "inconclusive";

export interface ValidatedDeepfakeImage {
  fileName: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  size: number;
  bytes: Uint8Array;
}

export interface DeepfakeAnalysisResult {
  real_probability: number;
  fake_probability: number;
  predicted_class: DeepfakePredictedClass;
  model_name: string;
  model_version: string;
  inference_time_ms: number;
  risk_level: DeepfakeRiskLevel;
  explanation: string;
  analysis_mode?: "image" | "sampled_video";
  frames_analyzed?: number;
  sampled_duration_seconds?: number;
}

export type DeepfakeModelServiceStatus =
  | {
      status: "available";
      model_name: string;
      model_version: string;
    }
  | {
      status: "unavailable";
      message: string;
    };

export type DeepfakeInferenceResponse =
  | {
      status: "available";
      result: DeepfakeAnalysisResult;
    }
  | {
      status: "unavailable";
      message: string;
    };
