"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  Film,
  Image as ImageIcon,
  Loader2,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { DashboardCard } from "@/components";
import type {
  ApiResponse,
  DeepfakeAnalysisResult,
  DeepfakeInferenceResponse,
  DeepfakeModelServiceStatus,
} from "@/types";
import {
  MAX_DEEPFAKE_IMAGE_SIZE,
  MAX_DEEPFAKE_VIDEO_DURATION_SECONDS,
  MAX_DEEPFAKE_VIDEO_SIZE,
  validateDeepfakeImageMetadata,
  validateDeepfakeVideoMetadata,
} from "@/lib/deepfake/utilities/imageValidation";
import { sampleVideoFrames } from "@/lib/deepfake/utilities/videoFrameSampling";

const formatProbability = (value: number) => `${(value * 100).toFixed(1)}%`;

const getVerdictLabel = (
  predictedClass: DeepfakeAnalysisResult["predicted_class"]
) => {
  switch (predictedClass) {
    case "real":
      return "REAL";
    case "fake":
      return "DEEPFAKE";
    case "inconclusive":
      return "Inconclusive";
  }
};

export default function DeepfakeCheckerPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedMedia, setSelectedMedia] = useState<{
    file: File;
    previewUrl: string;
    kind: "image" | "video";
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailableMessage, setUnavailableMessage] = useState<string | null>(
    null
  );
  const [result, setResult] = useState<DeepfakeAnalysisResult | null>(null);
  const [modelStatus, setModelStatus] =
    useState<DeepfakeModelServiceStatus | null>(null);

  useEffect(() => {
    let active = true;
    const checkModelStatus = async () => {
      try {
        const response = await fetch("/api/deepfake", { cache: "no-store" });
        const payload: ApiResponse<DeepfakeModelServiceStatus> =
          await response.json();
        if (!active) return;
        if (payload.success && payload.data) {
          setModelStatus(payload.data);
        } else {
          setModelStatus({
            status: "unavailable",
            message: payload.error || "Could not check model status.",
          });
        }
      } catch {
        if (active) {
          setModelStatus({
            status: "unavailable",
            message: "Could not check the local model status.",
          });
        }
      }
    };

    void checkModelStatus();
    const intervalId = window.setInterval(() => {
      void checkModelStatus();
    }, 15_000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(
    () => () => {
      if (selectedMedia) URL.revokeObjectURL(selectedMedia.previewUrl);
    },
    [selectedMedia]
  );

  const selectMedia = (file?: File) => {
    if (!file) return;

    const isVideo = /\.(mp4|webm)$/i.test(file.name);
    const validationError = isVideo
      ? validateDeepfakeVideoMetadata(file)
      : validateDeepfakeImageMetadata(file);
    setResult(null);
    setUnavailableMessage(null);
    setError(validationError);
    setSelectedMedia(
      validationError
        ? null
        : {
          file,
          previewUrl: URL.createObjectURL(file),
          kind: isVideo ? "video" : "image",
        }
    );
  };

  const reset = () => {
    setSelectedMedia(null);
    setResult(null);
    setUnavailableMessage(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const analyzeMedia = async () => {
    if (!selectedMedia || isAnalyzing) return;

    setIsAnalyzing(true);
    setError(null);
    setUnavailableMessage(null);
    setResult(null);

    try {
      const formData = new FormData();
      if (selectedMedia.kind === "image") {
        formData.append("file", selectedMedia.file, selectedMedia.file.name);
      } else {
        const sampled = await sampleVideoFrames(selectedMedia.previewUrl);
        formData.append("mode", "sampled_video");
        formData.append(
          "duration_seconds",
          String(sampled.durationSeconds)
        );
        sampled.frames.forEach((frame, index) => {
          formData.append("frames", frame, `frame-${index + 1}.jpg`);
        });
      }

      const response = await fetch("/api/deepfake", {
        method: "POST",
        body: formData,
      });
      const payload: ApiResponse<DeepfakeInferenceResponse> =
        await response.json();

      if (payload.data?.status === "unavailable") {
        setUnavailableMessage(payload.data.message);
        return;
      }

      if (!payload.success || !payload.data) {
        setError(
          payload.error ||
          `Deepfake analysis failed with status ${response.status}.`
        );
        return;
      }

      if (!response.ok) {
        setError(`Deepfake analysis failed with status ${response.status}.`);
        return;
      }

      setResult(payload.data.result);
    } catch (analysisError: unknown) {
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "Deepfake analysis failed. Please retry."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectedFile = selectedMedia?.file ?? null;
  const previewUrl = selectedMedia?.previewUrl ?? null;
  const verdictIcon =
    result?.predicted_class === "real" ? (
      <ShieldCheck className="h-6 w-6 text-emerald-400" />
    ) : result?.predicted_class === "fake" ? (
      <ShieldAlert className="h-6 w-6 text-red-400" />
    ) : (
      <AlertCircle className="h-6 w-6 text-amber-400" />
    );

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-white/[0.08] pb-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-xs font-semibold tracking-wider text-blue-400 uppercase">
            Image & Video Authenticity
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-blue-300">
            {modelStatus?.status === "available"
              ? `${modelStatus.model_name} · Ready`
              : modelStatus
                ? "Model pending"
                : "Checking model"}
          </span>
        </div>
        <h1 className="font-heading flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
            <ImageIcon className="h-6 w-6" />
          </div>
          <span>Deepfake Detection</span>
        </h1>
        <p className="font-body mt-1 max-w-2xl text-sm text-slate-400">
          Analyze an image for signs of AI-generated or manipulated facial
          content.
        </p>
      </div>

      {modelStatus?.status === "unavailable" && (
        <div
          role="status"
          className="rounded-xl border border-amber-500/25 bg-amber-950/20 px-4 py-3 text-sm text-amber-100/80"
        >
          {modelStatus.message} No prediction will be shown until the trained
          checkpoint is ready.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <DashboardCard
            title="Media Upload"
            subtitle="JPG, JPEG, PNG, WEBP images or MP4/WEBM videos"
          >
            <div className="space-y-5">
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-300"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp,video/mp4,video/webm,.mp4,.webm"
                className="hidden"
                onChange={(event) => {
                  selectMedia(event.currentTarget.files?.[0]);
                  event.currentTarget.value = "";
                }}
                aria-label="Choose an image or MP4 or WEBM video"
              />

              <div
                role="region"
                aria-label="Image upload dropzone"
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  selectMedia(event.dataTransfer.files[0]);
                }}
                className={`flex min-h-52 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${isDragging
                  ? "border-blue-400 bg-blue-950/30"
                  : "border-white/15 hover:border-blue-500/50"
                  }`}
              >
                <UploadCloud className="mb-3 h-10 w-10 text-blue-400" />
                <span className="font-heading text-base font-semibold text-white">
                  Drag and drop an image or video here
                </span>
                <span className="mt-1 text-xs text-slate-400">or</span>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={isAnalyzing}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 font-mono text-xs font-semibold text-blue-300 transition-colors hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UploadCloud className="h-4 w-4" />
                  Browse / Select Media
                </button>
                <span className="mt-3 text-xs text-slate-400">
                  Images: JPG · JPEG · PNG · WEBP, up to{" "}
                  {Math.round(MAX_DEEPFAKE_IMAGE_SIZE / (1024 * 1024))} MB
                  {" · "}Videos: MP4 · WEBM, up to{" "}
                  {Math.round(MAX_DEEPFAKE_VIDEO_SIZE / (1024 * 1024))} MB and{" "}
                  {MAX_DEEPFAKE_VIDEO_DURATION_SECONDS} seconds
                </span>
              </div>

              {selectedFile && previewUrl && (
                <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2 text-sm text-slate-200">
                      <ImageIcon className="h-4 w-4 shrink-0 text-blue-400" />
                      <span className="truncate">{selectedFile.name}</span>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-slate-400">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  {selectedMedia?.kind === "image" ? (
                    <div className="relative h-64 overflow-hidden rounded-lg bg-black/40">
                      <Image
                        src={previewUrl}
                        alt={`Preview of ${selectedFile.name}`}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 66vw"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="max-h-72 w-full rounded-lg bg-black/40"
                      aria-label={`Preview of ${selectedFile.name}`}
                    />
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={analyzeMedia}
                  disabled={!selectedFile || isAnalyzing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 font-mono text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-colors hover:from-blue-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : selectedMedia?.kind === "video" ? (
                    <Film className="h-4 w-4" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                  {isAnalyzing
                    ? "Analyzing..."
                    : selectedMedia?.kind === "video"
                      ? "Analyze Video"
                      : "Analyze Image"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 font-mono text-sm text-slate-300 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>
          </DashboardCard>

          {isAnalyzing && (
            <div
              role="status"
              className="flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-950/20 p-4 text-sm text-blue-200"
            >
              <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
              {selectedMedia?.kind === "video"
                ? "Sampling video frames in your browser and analyzing them with EfficientNet-B0..."
                : "Validating the image and requesting EfficientNet-B0 analysis..."}
            </div>
          )}

          {unavailableMessage && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4 text-sm text-amber-100"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <div>
                <div className="font-heading font-semibold">
                  Model unavailable
                </div>
                <p className="mt-1 text-xs leading-relaxed text-amber-100/70">
                  {unavailableMessage}
                </p>
              </div>
            </div>
          )}

          {result && (
            <DashboardCard
              title="Analysis Result"
              subtitle={
                result.analysis_mode === "sampled_video"
                  ? `${result.frames_analyzed} sampled frames · ${result.sampled_duration_seconds} seconds`
                  : "Analysis output from the configured model pipeline"
              }
            >
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  {verdictIcon}
                  <div>
                    <div className="font-heading text-lg font-semibold text-white">
                      Verdict: {getVerdictLabel(result.predicted_class)}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-4">
                    <div className="text-xs text-slate-400">
                      DEEPFAKE raw model score (not calibrated)
                    </div>
                    <div className="mt-1 font-mono text-2xl font-bold text-red-300">
                      {formatProbability(result.fake_probability)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
                    <div className="text-xs text-slate-400">
                      REAL raw model score (not calibrated)
                    </div>
                    <div className="mt-1 font-mono text-2xl font-bold text-emerald-300">
                      {formatProbability(result.real_probability)}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 p-4">
                    <div className="text-xs text-slate-400">Risk level</div>
                    <div className="mt-1 font-mono text-sm font-semibold text-white">
                      {result.risk_level === "inconclusive"
                        ? "Inconclusive"
                        : result.risk_level.toUpperCase()}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 p-4">
                    <div className="text-xs text-slate-400">
                      Processing time
                    </div>
                    <div className="mt-1 font-mono text-sm font-semibold text-white">
                      {result.inference_time_ms} ms
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 p-4">
                  <div className="mb-1 text-xs text-slate-400">Explanation</div>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {result.explanation}
                  </p>
                </div>

                {result.analysis_mode === "sampled_video" && (
                  <div
                    role="note"
                    className="rounded-xl border border-amber-500/25 bg-amber-950/20 p-3 text-xs leading-relaxed text-amber-100/80"
                  >
                    Frame-sampled estimate only: this image classifier has not
                    been validated as a video deepfake detector. No video file
                    was sent to a third-party service.
                  </div>
                )}

                <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                  Model information: {result.model_name} · Version{" "}
                  {result.model_version}
                </div>
              </div>
            </DashboardCard>
          )}
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <DashboardCard title="Analysis Pipeline">
            <ol className="space-y-3 text-sm text-slate-300">
              {[
                "Image validation or local video-frame sampling",
                "RGB decoding and resize to 224 × 224",
                "EfficientNet-B0 image-model inference",
                "Frame-score average and REAL / DEEPFAKE verdict",
              ].map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 font-mono text-xs text-blue-300">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </DashboardCard>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-5">
            <h2 className="font-heading text-sm font-semibold text-blue-200">
              Interpreting model results
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-blue-100/70">
              These percentages are the model&apos;s raw sigmoid scores, not
              calibrated probabilities or confidence. Results are indicators only and do not
              prove whether media is authentic. Video results average sampled
              image scores; this model has not been trained or evaluated as a
              video-forensics detector. The classifier does not perform
              separate face detection.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
