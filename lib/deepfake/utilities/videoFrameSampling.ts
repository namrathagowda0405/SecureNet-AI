import {
  MAX_DEEPFAKE_VIDEO_DURATION_SECONDS,
  MAX_DEEPFAKE_VIDEO_FRAMES,
} from "./imageValidation";

const MAX_FRAME_DIMENSION = 960;
const FRAME_SEEK_TIMEOUT_MS = 10_000;

export interface SampledVideoFrames {
  frames: Blob[];
  durationSeconds: number;
}

function waitForVideoMetadata(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("The video could not be opened in this browser."));
    }, FRAME_SEEK_TIMEOUT_MS);
    const cleanup = () => {
      window.clearTimeout(timeout);
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("error", onError);
    };
    const onLoaded = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("The video is unreadable or uses an unsupported codec."));
    };

    video.addEventListener("loadedmetadata", onLoaded, { once: true });
    video.addEventListener("error", onError, { once: true });
  });
}

function seekVideo(video: HTMLVideoElement, seconds: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("A video frame could not be decoded."));
    }, FRAME_SEEK_TIMEOUT_MS);
    const cleanup = () => {
      window.clearTimeout(timeout);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("A video frame could not be decoded."));
    };

    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onError, { once: true });
    video.currentTime = seconds;
  });
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("A video frame could not be encoded.")),
      "image/jpeg",
      0.85
    );
  });
}

export async function sampleVideoFrames(
  previewUrl: string
): Promise<SampledVideoFrames> {
  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.src = previewUrl;

  try {
    await waitForVideoMetadata(video);
    const durationSeconds = video.duration;
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      throw new Error("The video duration could not be determined.");
    }
    if (durationSeconds > MAX_DEEPFAKE_VIDEO_DURATION_SECONDS) {
      throw new Error("Videos must be 30 seconds or shorter.");
    }
    if (video.videoWidth <= 0 || video.videoHeight <= 0) {
      throw new Error("The video does not contain decodable picture frames.");
    }

    const frameCount = Math.min(
      MAX_DEEPFAKE_VIDEO_FRAMES,
      Math.max(1, Math.ceil(durationSeconds / 2))
    );
    const canvas = document.createElement("canvas");
    const scale = Math.min(
      1,
      MAX_FRAME_DIMENSION / Math.max(video.videoWidth, video.videoHeight)
    );
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("This browser cannot prepare video frames for analysis.");
    }

    const frames: Blob[] = [];
    for (let index = 0; index < frameCount; index += 1) {
      const timestamp = (durationSeconds * (index + 0.5)) / frameCount;
      await seekVideo(video, Math.min(timestamp, durationSeconds - 0.01));
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push(await canvasToJpeg(canvas));
    }

    return { frames, durationSeconds };
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.load();
  }
}
