"""Train an EfficientNet-B0 REAL/DEEPFAKE classifier from local image folders."""

from __future__ import annotations

import argparse
import csv
from dataclasses import asdict
import json
import random
import shutil
from pathlib import Path
from typing import Any

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf

from config import TrainingConfig
from dataset import (
    DatasetSplits,
    build_datasets,
    discover_images,
    save_split_manifest,
    split_records,
    split_training_records,
)
from evaluate import evaluate_model
from huggingface_dataset import HuggingFaceDatasetInfo, load_huggingface_records
from model import build_model, configure_fine_tuning


def set_reproducible_seed(seed: int) -> None:
    """Seed Python, NumPy, and TensorFlow random number generators."""
    random.seed(seed)
    np.random.seed(seed)
    tf.keras.utils.set_random_seed(seed)
    tf.config.experimental.enable_op_determinism()


def _callbacks(checkpoint_path: Path) -> list[tf.keras.callbacks.Callback]:
    """Create checkpointing, early stopping, and learning-rate callbacks."""
    return [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=str(checkpoint_path),
            monitor="val_loss",
            mode="min",
            save_best_only=True,
            verbose=1,
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            mode="min",
            patience=5,
            restore_best_weights=True,
            verbose=1,
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            mode="min",
            factor=0.2,
            patience=2,
            min_lr=1e-7,
            verbose=1,
        ),
    ]


def _best_validation_loss(history: tf.keras.callbacks.History) -> float:
    values = history.history.get("val_loss")
    if not values:
        raise RuntimeError("Training completed without recording validation loss.")
    return float(min(values))


def _class_weights(
    records: tuple[tuple[Path, int], ...],
) -> dict[int, float]:
    """Calculate inverse-frequency weights from training records only."""
    counts = {
        label: sum(record_label == label for _, record_label in records)
        for label in (0, 1)
    }
    if any(count == 0 for count in counts.values()):
        raise ValueError("Training data must contain both REAL and FAKE classes.")
    total = len(records)
    weights = {
        label: total / (2.0 * count)
        for label, count in counts.items()
    }
    print(
        "Training-only class weights: "
        f"REAL={weights[0]:.6f} FAKE={weights[1]:.6f}"
    )
    return weights


def _write_training_metadata(
    config: TrainingConfig,
    splits: DatasetSplits,
    *,
    source: dict[str, str],
    source_info: HuggingFaceDatasetInfo | None,
    class_weights: dict[int, float],
) -> None:
    """Persist actual split counts, input size, class mapping, and run settings."""
    split_records = {
        "train": splits.train,
        "validation": splits.validation,
        "test": splits.test,
    }
    split_counts = {
        name: {
            "total": len(records),
            "real": sum(label == 0 for _, label in records),
            "fake": sum(label == 1 for _, label in records),
        }
        for name, records in split_records.items()
    }
    total_real = sum(item["real"] for item in split_counts.values())
    total_fake = sum(item["fake"] for item in split_counts.values())
    summary = {
        "source": source,
        "seed": config.seed,
        "total_samples": total_real + total_fake,
        "real_samples": total_real,
        "fake_samples": total_fake,
        "split_counts": split_counts,
        "class_mapping": {"REAL": 0, "FAKE/DEEPFAKE": 1},
        "model_input_dimensions": {
            "height": 224,
            "width": 224,
            "channels": 3,
            "color_order": "RGB",
            "pixel_range": "0..255",
        },
        "observed_source_image_dimensions": (
            source_info.image_dimensions if source_info is not None else {}
        ),
        "corrupted_files": (
            list(source_info.corrupted_files) if source_info is not None else []
        ),
        "exact_duplicates_removed": (
            source_info.exact_duplicates_removed if source_info is not None else 0
        ),
        "source_counts": (
            source_info.source_counts if source_info is not None else None
        ),
        "usable_source_counts": (
            source_info.usable_counts if source_info is not None else None
        ),
    }
    preparation_summary_path = config.data_dir / "preparation_summary.json"
    if preparation_summary_path.is_file():
        preparation_summary = json.loads(
            preparation_summary_path.read_text(encoding="utf-8")
        )
        summary["preparation_summary"] = preparation_summary
        summary["observed_source_image_dimensions"] = preparation_summary.get(
            "image_dimensions", {}
        )
        summary["corrupted_files"] = preparation_summary.get(
            "corrupted_files", []
        )
        summary["exact_duplicates_removed"] = preparation_summary.get(
            "exact_pixel_duplicates_removed", 0
        )
    config_data = asdict(config)
    config_data = {
        name: str(value) if isinstance(value, Path) else value
        for name, value in config_data.items()
    }
    config_data["class_mapping"] = {"REAL": 0, "FAKE/DEEPFAKE": 1}
    config_data["optimizer"] = "Adam"
    config_data["loss"] = "binary_crossentropy"
    config_data["backbone"] = "EfficientNetB0"
    config_data["pretrained_weights"] = "imagenet"
    config_data["pretrained_weights_source"] = (
        "KerasHub preset hf://keras/efficientnet_b0_ra_imagenet"
    )
    config_data["class_weights"] = {
        "0": class_weights[0],
        "1": class_weights[1],
    }

    config.results_dir.mkdir(parents=True, exist_ok=True)
    (config.results_dir / "dataset_summary.json").write_text(
        json.dumps(summary, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
    )
    (config.results_dir / "class_mapping.json").write_text(
        json.dumps(
            {
                "REAL": 0,
                "FAKE": 1,
                "DEEPFAKE": 1,
                "source_label_names": (
                    list(source_info.source_label_names)
                    if source_info is not None
                    else None
                ),
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    (config.results_dir / "training_config.json").write_text(
        json.dumps(config_data, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
    )


def _save_history(
    histories: list[tuple[str, tf.keras.callbacks.History]],
    csv_path: Path,
    plot_path: Path,
) -> None:
    """Save measured per-epoch history and a training-curve plot."""
    rows: list[dict[str, Any]] = []
    for phase, history in histories:
        for epoch_index, values in enumerate(
            zip(*history.history.values(), strict=True), start=1
        ):
            row: dict[str, Any] = {"phase": phase, "epoch": epoch_index}
            row.update(
                {
                    metric: float(value)
                    for metric, value in zip(history.history, values, strict=True)
                }
            )
            rows.append(row)

    if not rows:
        raise RuntimeError("No training history was recorded.")

    fieldnames = list(rows[0])
    with csv_path.open("w", newline="", encoding="utf-8") as history_file:
        writer = csv.DictWriter(history_file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    figure, axes = plt.subplots(1, 2, figsize=(12, 5))
    for phase, history in histories:
        epoch_numbers = range(1, len(history.history["loss"]) + 1)
        axes[0].plot(epoch_numbers, history.history["loss"], label=f"{phase} train")
        axes[0].plot(
            epoch_numbers,
            history.history["val_loss"],
            linestyle="--",
            label=f"{phase} validation",
        )
        axes[1].plot(
            epoch_numbers,
            history.history["accuracy"],
            label=f"{phase} train",
        )
        axes[1].plot(
            epoch_numbers,
            history.history["val_accuracy"],
            linestyle="--",
            label=f"{phase} validation",
        )

    axes[0].set_title("Loss")
    axes[1].set_title("Accuracy")
    for axis in axes:
        axis.set_xlabel("Epoch within phase")
        axis.grid(True, alpha=0.3)
        axis.legend()

    figure.tight_layout()
    figure.savefig(plot_path, dpi=160)
    plt.close(figure)
    print(f"Training history saved to: {csv_path}")
    print(f"Training plots saved to: {plot_path}")


def run_training(
    config: TrainingConfig,
    *,
    fine_tune: bool,
    huggingface_dataset_id: str | None = None,
) -> None:
    """Run the frozen-head stage, optional fine-tuning, and test evaluation."""
    config.validate()
    set_reproducible_seed(config.seed)
    config.model_dir.mkdir(parents=True, exist_ok=True)
    config.results_dir.mkdir(parents=True, exist_ok=True)

    manifest_source = {"kind": "folders"}
    source_info: HuggingFaceDatasetInfo | None = None
    if huggingface_dataset_id:
        source_train, source_test, source_info = load_huggingface_records(
            huggingface_dataset_id,
            config.data_dir,
        )
        train_records, validation_records = split_training_records(
            source_train,
            config,
        )
        splits = DatasetSplits(
            train=train_records,
            validation=validation_records,
            test=source_test,
        )
        manifest_source = {
            "kind": "huggingface",
            "dataset_id": huggingface_dataset_id,
            "source_train_split": "train",
            "source_test_split": "test",
        }
        print(
            "Hugging Face test split is held out unchanged; "
            "validation was sampled only from its train split."
        )
    else:
        records = discover_images(config.data_dir)
        splits = split_records(records, config)

    split_manifest_path = config.results_dir / "split_manifest.json"
    save_split_manifest(
        splits,
        config.data_dir,
        split_manifest_path,
        seed=config.seed,
        source=manifest_source,
    )
    class_weights = _class_weights(splits.train)
    _write_training_metadata(
        config,
        splits,
        source=manifest_source,
        source_info=source_info,
        class_weights=class_weights,
    )
    train_dataset, validation_dataset, test_dataset = build_datasets(
        splits, config
    )

    model = build_model(config)
    histories: list[tuple[str, tf.keras.callbacks.History]] = []

    head_checkpoint = config.model_dir / "head_best.keras"
    print("\nTraining classification head with the EfficientNet-B0 backbone frozen.")
    head_history = model.fit(
        train_dataset,
        validation_data=validation_dataset,
        epochs=config.head_epochs,
        callbacks=_callbacks(head_checkpoint),
        class_weight=class_weights,
        shuffle=False,
        verbose=1,
    )
    histories.append(("head", head_history))
    if not head_checkpoint.is_file():
        raise RuntimeError(
            "The frozen-backbone stage did not produce a valid model checkpoint."
        )
    best_checkpoint = head_checkpoint
    best_validation_loss = _best_validation_loss(head_history)

    if fine_tune:
        print(
            "\nFine-tuning the upper EfficientNet-B0 layers "
            f"(requested upper layers: {config.fine_tune_layers})."
        )
        model = tf.keras.models.load_model(head_checkpoint, compile=False)
        configure_fine_tuning(
            model,
            config,
            layers_to_unfreeze=config.fine_tune_layers,
        )

        fine_tune_checkpoint = config.model_dir / "fine_tuned_best.keras"
        fine_tune_history = model.fit(
            train_dataset,
            validation_data=validation_dataset,
            epochs=config.fine_tune_epochs,
            callbacks=_callbacks(fine_tune_checkpoint),
            class_weight=class_weights,
            shuffle=False,
            verbose=1,
        )
        histories.append(("fine_tune", fine_tune_history))
        if not fine_tune_checkpoint.is_file():
            raise RuntimeError(
                "Fine-tuning did not produce a valid model checkpoint."
            )

        fine_tune_validation_loss = _best_validation_loss(fine_tune_history)
        if fine_tune_validation_loss < best_validation_loss:
            best_checkpoint = fine_tune_checkpoint
            best_validation_loss = fine_tune_validation_loss
            print("Fine-tuning produced the lower measured validation loss.")
        else:
            print("Keeping the head-stage checkpoint with lower validation loss.")

    final_model_path = config.model_dir / "final_model.keras"
    model.save(final_model_path)

    best_model_path = config.model_dir / "best_model.keras"
    shutil.copy2(best_checkpoint, best_model_path)

    history_csv = config.results_dir / "training_history.csv"
    history_plot = config.results_dir / "training_curves.png"
    _save_history(histories, history_csv, history_plot)

    best_model = tf.keras.models.load_model(best_model_path)
    evaluate_model(
        best_model,
        test_dataset,
        config.results_dir,
        model_path=best_model_path,
        split_manifest_path=split_manifest_path,
    )
    print(f"Best validation loss observed: {best_validation_loss:.6f}")
    best_accuracy = max(
        float(value)
        for _, history in histories
        for value in history.history.get("val_accuracy", [])
    )
    epochs_completed = sum(len(history.history.get("loss", [])) for _, history in histories)
    print(f"Epochs completed across training stages: {epochs_completed}")
    print(f"Best observed validation accuracy: {best_accuracy:.6f}")
    print(f"Best trained model saved to: {best_model_path}")
    print(f"Final model saved separately to: {final_model_path}")


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Train an EfficientNet-B0 REAL vs DEEPFAKE image classifier."
    )
    parser.add_argument(
        "--fine-tune",
        action="store_true",
        help="After training the frozen-backbone head, fine-tune upper backbone layers.",
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=TrainingConfig.data_dir,
        help="Dataset root containing real/ and fake/ subdirectories.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=TrainingConfig.seed,
        help="Random seed used for splitting and training.",
    )
    parser.add_argument(
        "--huggingface-dataset",
        type=str,
        default=None,
        help=(
            "Optional Hugging Face dataset ID with train/test splits and image/label "
            "columns. Validation is derived from train only."
        ),
    )
    return parser.parse_args()


def main() -> None:
    args = _parse_args()
    config = TrainingConfig(data_dir=args.data_dir, seed=args.seed)
    run_training(
        config,
        fine_tune=args.fine_tune,
        huggingface_dataset_id=args.huggingface_dataset,
    )


if __name__ == "__main__":
    main()
