"""HTTP inference service for the trained SecureNet deepfake classifier."""

from __future__ import annotations

from hashlib import sha256
from io import BytesIO
import logging
import os
from pathlib import Path
import threading
import time
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
import numpy as np
import tensorflow as tf

from config import IMAGE_CHANNELS, IMAGE_HEIGHT, IMAGE_WIDTH, MODEL_DIR

logger = logging.getLogger(__name__)

MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024
MAX_VIDEO_FRAMES = 15
MAX_VIDEO_DURATION_SECONDS = 30
MAX_VIDEO_FRAME_BATCH_BYTES = 24 * 1024 * 1024
MODEL_NAME = "SecureNet EfficientNet-B0"
ALLOWED_IMAGE_FORMATS = {
    "JPEG": "image/jpeg",
    "PNG": "image/png",
    "WEBP": "image/webp",
}

app = FastAPI(title="SecureNet Deepfake Inference", docs_url=None, redoc_url=None)
_model: tf.keras.Model | None = None
_model_version: str | None = None
_model_lock = threading.Lock()


def _configured_model_path() -> Path:
    configured_path = os.environ.get("DEEPFAKE_MODEL_PATH")
    if configured_path:
        return Path(configured_path).expanduser()
    return MODEL_DIR / "best_model.keras"


def _load_model() -> tuple[tf.keras.Model, str]:
    global _model, _model_version

    if _model is not None and _model_version is not None:
        return _model, _model_version

    with _model_lock:
        if _model is not None and _model_version is not None:
            return _model, _model_version

        model_path = _configured_model_path()
        if not model_path.is_file():
            raise HTTPException(
                status_code=503,
                detail=(
                    "The trained deepfake model is unavailable. "
                    "No prediction was generated."
                ),
            )

        try:
            model = tf.keras.models.load_model(model_path, compile=False)
            if (
                model.name != "deepfake_efficientnetb0"
                or tuple(model.input_shape[1:])
                != (IMAGE_HEIGHT, IMAGE_WIDTH, IMAGE_CHANNELS)
                or tuple(model.output_shape[1:]) != (1,)
            ):
                raise ValueError("Unexpected model architecture or input shape.")

            digest = sha256()
            with model_path.open("rb") as checkpoint:
                for chunk in iter(lambda: checkpoint.read(1024 * 1024), b""):
                    digest.update(chunk)
        except Exception as error:
            logger.exception("Unable to load configured deepfake model.")
            raise HTTPException(
                status_code=503,
                detail=(
                    "The trained deepfake model is unavailable. "
                    "No prediction was generated."
                ),
            ) from error

        _model = model
        _model_version = digest.hexdigest()[:12]
        return _model, _model_version


def _decode_image(payload: bytes) -> np.ndarray:
    try:
        with Image.open(BytesIO(payload)) as image:
            image_format = image.format
            image.verify()
        if image_format not in ALLOWED_IMAGE_FORMATS:
            raise HTTPException(
                status_code=415,
                detail="Upload a JPG, PNG, or WEBP image.",
            )
        with Image.open(BytesIO(payload)) as image:
            rgb_pixels = np.asarray(image.convert("RGB"), dtype=np.uint8)
            resized_pixels = tf.image.resize(
                tf.convert_to_tensor(rgb_pixels),
                [IMAGE_HEIGHT, IMAGE_WIDTH],
                method=tf.image.ResizeMethod.BILINEAR,
                antialias=True,
            )
            pixels = tf.ensure_shape(
                resized_pixels,
                [IMAGE_HEIGHT, IMAGE_WIDTH, IMAGE_CHANNELS],
            ).numpy()
    except HTTPException:
        raise
    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
        SyntaxError,
        Image.DecompressionBombError,
    ) as error:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is unreadable or invalid.",
        ) from error

    if pixels.shape != (IMAGE_HEIGHT, IMAGE_WIDTH, IMAGE_CHANNELS):
        raise HTTPException(
            status_code=400,
            detail="The uploaded image could not be prepared for analysis.",
        )
    return pixels[np.newaxis, ...]


def _predict_probabilities(
    model: tf.keras.Model,
    batch: np.ndarray,
) -> tuple[np.ndarray, float]:
    try:
        start_time = time.perf_counter()
        output = model(tf.convert_to_tensor(batch), training=False).numpy()
        inference_time_ms = (time.perf_counter() - start_time) * 1000.0
    except Exception as error:
        logger.exception("Deepfake model inference failed.")
        raise HTTPException(
            status_code=500,
            detail="Deepfake inference failed.",
        ) from error

    if (
        output.shape != (len(batch), 1)
        or not np.isfinite(output).all()
        or np.any((output < 0.0) | (output > 1.0))
    ):
        logger.error("Deepfake model returned an invalid probability tensor.")
        raise HTTPException(
            status_code=500,
            detail="Deepfake inference returned an invalid result.",
        )
    return output[:, 0], inference_time_ms


def _analysis_payload(
    fake_probability: float,
    inference_time_ms: float,
    model_version: str,
    *,
    frames_analyzed: int | None = None,
    sampled_duration_seconds: float | None = None,
) -> dict[str, object]:
    real_probability = 1.0 - fake_probability
    predicted_class: Literal["real", "fake", "inconclusive"] = (
        "inconclusive"
        if fake_probability == 0.5
        else "fake"
        if fake_probability > 0.5
        else "real"
    )
    risk_level: Literal["low", "high", "inconclusive"] = (
        "inconclusive"
        if predicted_class == "inconclusive"
        else "high"
        if predicted_class == "fake"
        else "low"
    )
    explanation = (
        f"The classifier's raw sigmoid scores were {fake_probability:.1%} "
        f"DEEPFAKE and {real_probability:.1%} REAL. These are not calibrated "
        "probabilities or confidence. The verdict uses a "
        "0.50 decision threshold; an exact tie is inconclusive. The risk band "
        "mirrors the binary verdict. Scores are not proof of authenticity."
    )
    result: dict[str, object] = {
        "real_probability": real_probability,
        "fake_probability": fake_probability,
        "predicted_class": predicted_class,
        "risk_level": risk_level,
        "model_name": MODEL_NAME,
        "model_version": model_version,
        "inference_time_ms": round(inference_time_ms, 2),
        "explanation": explanation,
        "analysis_mode": (
            "sampled_video" if frames_analyzed is not None else "image"
        ),
    }
    if frames_analyzed is not None and sampled_duration_seconds is not None:
        result["frames_analyzed"] = frames_analyzed
        result["sampled_duration_seconds"] = round(sampled_duration_seconds, 2)
        result["explanation"] += (
            f" This video result is the arithmetic mean of image-classifier "
            f"scores over {frames_analyzed} sampled frames. The model was not "
            "trained or evaluated as a video-forensics model."
        )
    return result


@app.get("/health")
def health() -> dict[str, str | bool]:
    """Report readiness without returning any local filesystem information."""
    _, version = _load_model()
    return {
        "status": "ready",
        "model_name": MODEL_NAME,
        "model_version": version,
    }


@app.post("/v1/analyze")
def analyze_image(file: UploadFile = File(...)) -> dict[str, object]:
    """Return actual classifier probabilities for a validated image upload."""
    payload = file.file.read(MAX_IMAGE_SIZE_BYTES + 1)
    if not payload:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")
    if len(payload) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Image exceeds the 10 MB maximum file size.",
        )

    batch = _decode_image(payload)
    model, model_version = _load_model()
    probabilities, inference_time_ms = _predict_probabilities(model, batch)
    return _analysis_payload(
        float(probabilities[0]),
        inference_time_ms,
        model_version,
    )


@app.post("/v1/analyze/frames")
def analyze_video_frames(
    frames: list[UploadFile] = File(...),
    duration_seconds: float = Form(...),
) -> dict[str, object]:
    """Analyze a bounded set of client-sampled frames as image inputs."""
    if not 1 <= len(frames) <= MAX_VIDEO_FRAMES:
        raise HTTPException(
            status_code=400,
            detail="Video analysis requires between 1 and 15 sampled frames.",
        )
    if (
        not np.isfinite(duration_seconds)
        or duration_seconds <= 0
        or duration_seconds > MAX_VIDEO_DURATION_SECONDS
    ):
        raise HTTPException(
            status_code=400,
            detail="Video duration must be at most 30 seconds.",
        )

    decoded_frames: list[np.ndarray] = []
    total_frame_bytes = 0
    for frame in frames:
        payload = frame.file.read(MAX_IMAGE_SIZE_BYTES + 1)
        if not payload:
            raise HTTPException(
                status_code=400,
                detail="A sampled video frame is empty.",
            )
        if len(payload) > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail="A sampled video frame exceeds the image size limit.",
            )
        total_frame_bytes += len(payload)
        if total_frame_bytes > MAX_VIDEO_FRAME_BATCH_BYTES:
            raise HTTPException(
                status_code=413,
                detail="Sampled video frames exceed the maximum request size.",
            )
        decoded_frames.append(_decode_image(payload))

    batch = np.concatenate(decoded_frames, axis=0)
    model, model_version = _load_model()
    probabilities, inference_time_ms = _predict_probabilities(model, batch)
    return _analysis_payload(
        float(np.mean(probabilities)),
        inference_time_ms,
        model_version,
        frames_analyzed=len(frames),
        sampled_duration_seconds=duration_seconds,
    )
