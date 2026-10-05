"""Evaluate a saved deepfake classifier on its recorded held-out test split."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import time
from typing import Any

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
import keras_hub
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)

from config import CLASS_NAMES, RESULTS_DIR, TrainingConfig
from dataset import build_test_dataset, load_test_records


def _sha256_file(path: Path) -> str:
    """Return a streaming checksum for an evaluation artifact."""
    digest = hashlib.sha256()
    with path.open("rb") as artifact:
        for chunk in iter(lambda: artifact.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _probabilities_for_batch(
    model: tf.keras.Model, images: tf.Tensor
) -> np.ndarray:
    """Run inference and validate the classifier's single sigmoid output."""
    outputs = model(images, training=False)
    probabilities = np.asarray(outputs.numpy())
    if probabilities.ndim != 2 or probabilities.shape[1] != 1:
        raise ValueError(
            "Expected the trained binary classifier to return one fake "
            "probability per image."
        )
    if not np.isfinite(probabilities).all() or np.any(
        (probabilities < 0.0) | (probabilities > 1.0)
    ):
        raise ValueError("The trained model returned invalid probability values.")
    return probabilities[:, 0]


def _save_confusion_matrix(matrix: np.ndarray, output_path: Path) -> None:
    """Save an explicitly labeled matrix: actual classes by predicted classes."""
    figure, axis = plt.subplots(figsize=(6, 5))
    image = axis.imshow(matrix, cmap="Blues")
    figure.colorbar(image, ax=axis, label="Image count")
    axis.set(
        xticks=(0, 1),
        yticks=(0, 1),
        xticklabels=("REAL", "DEEPFAKE"),
        yticklabels=("REAL", "DEEPFAKE"),
        xlabel="Predicted label",
        ylabel="Actual label",
        title="Held-out Test Confusion Matrix",
    )
    threshold = float(matrix.max()) / 2.0
    for row in range(2):
        for column in range(2):
            axis.text(
                column,
                row,
                str(int(matrix[row, column])),
                ha="center",
                va="center",
                color="white" if matrix[row, column] > threshold else "black",
            )
    figure.tight_layout()
    figure.savefig(output_path, dpi=160)
    plt.close(figure)


def _save_roc_curve(
    labels: np.ndarray, fake_probabilities: np.ndarray, output_path: Path
) -> float | None:
    """Save an ROC curve only when the held-out test set contains both classes."""
    if np.unique(labels).size != 2:
        output_path.unlink(missing_ok=True)
        return None

    area = float(roc_auc_score(labels, fake_probabilities))
    false_positive_rates, true_positive_rates, _ = roc_curve(
        labels, fake_probabilities
    )
    figure, axis = plt.subplots(figsize=(6, 5))
    axis.plot(false_positive_rates, true_positive_rates, label=f"ROC AUC = {area:.4f}")
    axis.plot((0, 1), (0, 1), linestyle="--", color="gray", label="Chance reference")
    axis.set(
        xlim=(0, 1),
        ylim=(0, 1.02),
        xlabel="False-positive rate",
        ylabel="True-positive rate",
        title="Held-out Test ROC Curve",
    )
    axis.grid(True, alpha=0.3)
    axis.legend(loc="lower right")
    figure.tight_layout()
    figure.savefig(output_path, dpi=160)
    plt.close(figure)
    return area


def evaluate_model(
    model: tf.keras.Model,
    test_dataset: tf.data.Dataset,
    output_dir: Path,
    *,
    model_path: Path | None = None,
    split_manifest_path: Path | None = None,
) -> dict[str, Any]:
    """Measure and save classification metrics from the supplied test split only."""
    first_batch = next(iter(test_dataset), None)
    if first_batch is None:
        raise ValueError("The held-out test dataset is empty; evaluation cannot run.")

    # Warm up using a real test batch, but exclude this pass from timing and metrics.
    _probabilities_for_batch(model, first_batch[0])

    true_batches: list[np.ndarray] = []
    probability_batches: list[np.ndarray] = []
    inference_seconds = 0.0
    image_count = 0

    for images, labels in test_dataset:
        label_values = np.asarray(labels.numpy()).reshape(-1).astype(np.int32)
        if np.any((label_values != 0) & (label_values != 1)):
            raise ValueError("Test labels must use 0 for REAL and 1 for DEEPFAKE.")

        start = time.perf_counter()
        fake_probabilities = _probabilities_for_batch(model, images)
        inference_seconds += time.perf_counter() - start

        if fake_probabilities.size != label_values.size:
            raise ValueError("Model output count does not match the test label count.")
        true_batches.append(label_values)
        probability_batches.append(fake_probabilities)
        image_count += int(label_values.size)

    if image_count == 0:
        raise ValueError("The held-out test dataset contains no images.")

    y_true = np.concatenate(true_batches)
    fake_probabilities = np.concatenate(probability_batches)
    test_class_counts = np.bincount(y_true, minlength=2)
    manifest_metadata: dict[str, Any] = {}
    if split_manifest_path is not None:
        manifest_data = json.loads(
            split_manifest_path.read_text(encoding="utf-8")
        )
        manifest_test = manifest_data["splits"]["test"]
        manifest_test_counts = np.bincount(
            [int(record["label"]) for record in manifest_test],
            minlength=2,
        )
        if (
            len(manifest_test) != image_count
            or not np.array_equal(test_class_counts, manifest_test_counts)
        ):
            raise ValueError(
                "Evaluation data counts do not match the held-out test split "
                "in the supplied manifest."
            )
        manifest_metadata = {
            "split_seed": manifest_data["seed"],
            "dataset_source": manifest_data["source"],
            "split_counts": {
                name: {
                    "total": len(records),
                    "real": sum(record["label"] == 0 for record in records),
                    "fake": sum(record["label"] == 1 for record in records),
                }
                for name, records in manifest_data["splits"].items()
            },
            "split_manifest_sha256": _sha256_file(split_manifest_path),
        }

    y_pred = (fake_probabilities >= 0.5).astype(np.int32)
    matrix = confusion_matrix(y_true, y_pred, labels=[0, 1])
    true_real, false_deepfake, false_real, true_deepfake = (
        int(value) for value in matrix.ravel()
    )

    false_positive_rate = (
        false_deepfake / (true_real + false_deepfake)
        if true_real + false_deepfake
        else None
    )
    false_negative_rate = (
        false_real / (false_real + true_deepfake)
        if false_real + true_deepfake
        else None
    )
    report_text = classification_report(
        y_true,
        y_pred,
        labels=[0, 1],
        target_names=["REAL", "DEEPFAKE"],
        digits=4,
        zero_division=0,
    )
    report_data = classification_report(
        y_true,
        y_pred,
        labels=[0, 1],
        target_names=["REAL", "DEEPFAKE"],
        output_dict=True,
        zero_division=0,
    )
    output_dir.mkdir(parents=True, exist_ok=True)
    confusion_matrix_path = output_dir / "confusion_matrix.png"
    _save_confusion_matrix(matrix, confusion_matrix_path)
    (output_dir / "classification_report.txt").write_text(
        "Held-out test classification report\n"
        "Labels: 0 = REAL, 1 = DEEPFAKE\n"
        "Confusion matrix rows are actual labels; columns are predicted labels.\n\n"
        f"{report_text}\n"
        "Confusion matrix (actual rows: REAL, DEEPFAKE; "
        "predicted columns: REAL, DEEPFAKE):\n"
        f"{matrix.tolist()}\n",
        encoding="utf-8",
    )
    roc_auc = _save_roc_curve(
        y_true, fake_probabilities, output_dir / "roc_curve.png"
    )

    metrics: dict[str, Any] = {
        "evaluation_dataset": "held-out test split only",
        "test_image_count": image_count,
        "test_class_counts": {
            "REAL": int(test_class_counts[0]),
            "DEEPFAKE": int(test_class_counts[1]),
        },
        **manifest_metadata,
        "class_names": list(CLASS_NAMES),
        "positive_class": "DEEPFAKE",
        "decision_threshold_fake_probability": 0.5,
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(
            precision_score(y_true, y_pred, pos_label=1, zero_division=0)
        ),
        "recall": float(recall_score(y_true, y_pred, pos_label=1, zero_division=0)),
        "f1_score": float(f1_score(y_true, y_pred, pos_label=1, zero_division=0)),
        "roc_auc": roc_auc,
        "confusion_matrix": {
            "labels": ["REAL", "DEEPFAKE"],
            "rows": "actual",
            "columns": "predicted",
            "counts": matrix.tolist(),
        },
        "true_real": true_real,
        "false_deepfake": false_deepfake,
        "false_real": false_real,
        "true_deepfake": true_deepfake,
        "false_positive_rate": false_positive_rate,
        "false_negative_rate": false_negative_rate,
        "average_inference_time_ms_per_image": (
            inference_seconds * 1000.0 / image_count
        ),
        "inference_timing": (
            "Average model forward-pass time per image over test batches; "
            "input decoding and one untimed warm-up pass are excluded."
        ),
        "per_class_report": report_data,
        "model_checkpoint": str(model_path) if model_path is not None else None,
        "model_checkpoint_sha256": (
            _sha256_file(model_path)
            if model_path is not None and model_path.is_file()
            else None
        ),
        "split_manifest": (
            str(split_manifest_path) if split_manifest_path is not None else None
        ),
        "roc_curve_file": "roc_curve.png" if roc_auc is not None else None,
    }
    metrics_path = output_dir / "metrics.json"
    metrics_path.write_text(
        json.dumps(metrics, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
    )

    print(f"Held-out test images evaluated: {image_count}")
    print(f"REAL -> predicted REAL: {true_real}; DEEPFAKE: {false_deepfake}")
    print(f"DEEPFAKE -> predicted REAL: {false_real}; DEEPFAKE: {true_deepfake}")
    print(f"Measured test accuracy: {metrics['accuracy']:.4f}")
    print(f"Measured test precision (DEEPFAKE): {metrics['precision']:.4f}")
    print(f"Measured test recall (DEEPFAKE): {metrics['recall']:.4f}")
    print(f"Measured test F1 (DEEPFAKE): {metrics['f1_score']:.4f}")
    print(
        "Measured test ROC-AUC: "
        f"{roc_auc:.4f}" if roc_auc is not None else "Test ROC-AUC unavailable: test set has one class."
    )
    print(
        "Measured average inference time: "
        f"{metrics['average_inference_time_ms_per_image']:.4f} ms/image"
    )
    print(f"Evaluation artifacts saved under: {output_dir}")
    return metrics


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Evaluate a trained classifier on its recorded held-out test split."
    )
    parser.add_argument(
        "--model",
        type=Path,
        default=TrainingConfig.model_dir / "best_model.keras",
        help="Path to the trained Keras checkpoint.",
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=TrainingConfig.data_dir,
        help="Dataset root used for the corresponding training run.",
    )
    parser.add_argument(
        "--split-manifest",
        type=Path,
        default=TrainingConfig.results_dir / "split_manifest.json",
        help="Exact split manifest written by the training run.",
    )
    parser.add_argument(
        "--results-dir",
        type=Path,
        default=RESULTS_DIR,
        help="Directory for metrics and evaluation plots.",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=TrainingConfig.batch_size,
        help="Inference batch size; does not alter the split.",
    )
    return parser.parse_args()


def main() -> None:
    args = _parse_args()
    if args.batch_size <= 0:
        raise ValueError("--batch-size must be a positive integer.")
    if not args.model.is_file():
        raise FileNotFoundError(f"Trained model checkpoint not found: {args.model}")

    config = TrainingConfig(data_dir=args.data_dir, batch_size=args.batch_size)
    test_records = load_test_records(args.split_manifest, config.data_dir)
    test_dataset = build_test_dataset(test_records, config)
    trained_model = tf.keras.models.load_model(args.model, compile=False)
    evaluate_model(
        trained_model,
        test_dataset,
        args.results_dir,
        model_path=args.model.resolve(),
        split_manifest_path=args.split_manifest.resolve(),
    )


if __name__ == "__main__":
    main()
