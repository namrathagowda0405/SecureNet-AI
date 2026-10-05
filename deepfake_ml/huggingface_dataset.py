"""Download and cache labeled images from a Hugging Face image dataset."""

from __future__ import annotations

import hashlib
from numbers import Integral
from pathlib import Path
from typing import Any
from collections import Counter
from dataclasses import dataclass

from PIL import Image

from config import CLASS_IMBALANCE_WARNING_RATIO, CLASS_NAMES
from dataset import ImageRecord, check_class_balance


@dataclass(frozen=True)
class HuggingFaceDatasetInfo:
    """Observed source and usable sample counts from a dataset load."""

    dataset_id: str
    source_counts: dict[str, dict[str, int]]
    usable_counts: dict[str, dict[str, int]]
    image_dimensions: dict[str, int]
    corrupted_files: tuple[str, ...]
    exact_duplicates_removed: int
    source_label_names: tuple[str, ...]


def _internal_label(raw_label: Any, label_names: list[str]) -> int:
    """Map dataset labels to 0=REAL and 1=DEEPFAKE using declared class names."""
    if isinstance(raw_label, str):
        class_name = raw_label.casefold()
    elif isinstance(raw_label, Integral) and not isinstance(raw_label, bool):
        if raw_label < 0 or raw_label >= len(label_names):
            raise ValueError(f"Dataset label index is out of range: {raw_label}")
        class_name = label_names[int(raw_label)].casefold()
    else:
        raise ValueError(f"Unsupported Hugging Face label value: {raw_label!r}")

    if class_name == "real":
        return 0
    if class_name in {"fake", "deepfake"}:
        return 1
    raise ValueError(
        "Expected label names to identify REAL and FAKE/DEEPFAKE classes; "
        f"received {label_names!r}."
    )


def load_huggingface_records(
    dataset_id: str, data_dir: Path
) -> tuple[
    tuple[ImageRecord, ...],
    tuple[ImageRecord, ...],
    HuggingFaceDatasetInfo,
]:
    """Load the dataset's train/test splits and cache only its image column.

    The dataset's declared test split is returned unchanged. Validation is
    intentionally created later from the returned training records only.
    """
    if not dataset_id.strip():
        raise ValueError("A non-empty Hugging Face dataset ID is required.")

    try:
        from datasets import load_dataset
    except ImportError as error:
        raise RuntimeError(
            "Hugging Face dataset support requires the 'datasets' package. "
            "Install deepfake_ml/requirements.txt."
        ) from error

    dataset = load_dataset(dataset_id)
    required_splits = {"train", "test"}
    missing_splits = required_splits - set(dataset.keys())
    if missing_splits:
        raise ValueError(
            f"Dataset {dataset_id!r} is missing required splits: "
            f"{', '.join(sorted(missing_splits))}."
        )

    training_split = dataset["train"].select_columns(["image", "label"])
    test_split = dataset["test"].select_columns(["image", "label"])
    for split_name, split in (("train", training_split), ("test", test_split)):
        missing_columns = {"image", "label"} - set(split.column_names)
        if missing_columns:
            raise ValueError(
                f"Dataset {dataset_id!r} {split_name} split is missing required "
                f"columns: {', '.join(sorted(missing_columns))}."
            )

    label_feature = training_split.features.get("label")
    label_names = getattr(label_feature, "names", None)
    if not isinstance(label_names, list) or not label_names:
        raise ValueError(
            "The Hugging Face 'label' feature must declare class names so label "
            "mapping can be verified safely."
        )
    test_label_names = getattr(test_split.features.get("label"), "names", None)
    if test_label_names != label_names:
        raise ValueError(
            "The Hugging Face train and test splits declare different label classes."
        )

    dataset_key = hashlib.sha256(dataset_id.encode("utf-8")).hexdigest()[:16]
    cache_root = data_dir / "huggingface-cache" / dataset_key
    cache_root.mkdir(parents=True, exist_ok=True)
    dimensions: Counter[str] = Counter()
    corrupted_files: list[str] = []
    duplicate_count = 0
    source_counts: dict[str, dict[str, int]] = {}
    usable_counts: dict[str, dict[str, int]] = {}
    hashes_per_split: dict[str, dict[str, Path]] = {}

    def cache_split(split: Any, split_name: str) -> tuple[ImageRecord, ...]:
        nonlocal duplicate_count
        records: list[ImageRecord] = []
        source_class_counts = {0: 0, 1: 0}
        class_counts = {0: 0, 1: 0}
        seen_hashes: dict[str, tuple[int, Path]] = {}
        for index in range(len(split)):
            try:
                row = split[index]
            except (OSError, ValueError, Image.DecompressionBombError) as error:
                corrupted_files.append(
                    f"{split_name}[{index}]: {type(error).__name__}: {error}"
                )
                continue

            label = _internal_label(row["label"], label_names)
            source_class_counts[label] += 1
            image = row["image"]
            if not hasattr(image, "convert") or not hasattr(image, "save"):
                corrupted_files.append(
                    f"{split_name}[{index}]: image decoder returned no image"
                )
                continue

            class_dir = cache_root / split_name / CLASS_NAMES[label]
            class_dir.mkdir(parents=True, exist_ok=True)
            image_path = class_dir / f"{index:08d}.png"
            try:
                image.load()
                dimensions[f"{image.width}x{image.height}"] += 1
                image.convert("RGB").save(image_path, format="PNG")
            except (OSError, ValueError, Image.DecompressionBombError) as error:
                corrupted_files.append(
                    f"{split_name}[{index}]: {type(error).__name__}: {error}"
                )
                image_path.unlink(missing_ok=True)
                continue

            image_hash = hashlib.sha256(image_path.read_bytes()).hexdigest()
            previous = seen_hashes.get(image_hash)
            if previous is not None:
                previous_label, _ = previous
                if previous_label != label:
                    raise ValueError(
                        "Identical image content has conflicting REAL/FAKE labels "
                        f"in the source {split_name} split (row {index})."
                    )
                duplicate_count += 1
                image_path.unlink(missing_ok=True)
                continue
            seen_hashes[image_hash] = (label, image_path)
            records.append((image_path, label))
            class_counts[label] += 1

        source_counts[split_name] = {
            "real": source_class_counts[0],
            "fake": source_class_counts[1],
        }
        usable_counts[split_name] = {
            "real": class_counts[0],
            "fake": class_counts[1],
        }
        hashes_per_split[split_name] = {
            digest: path for digest, (_, path) in seen_hashes.items()
        }
        print(
            f"Hugging Face {split_name} split from {dataset_id}: "
            f"source={len(split)} usable={len(records)} "
            f"REAL={class_counts[0]} DEEPFAKE={class_counts[1]}"
        )
        if not records or any(count == 0 for count in class_counts.values()):
            raise ValueError(
                f"Dataset {dataset_id!r} {split_name} split must contain "
                "at least one image from both REAL and DEEPFAKE classes."
            )
        check_class_balance(
            {"real": class_counts[0], "fake": class_counts[1]},
            warning_ratio=CLASS_IMBALANCE_WARNING_RATIO,
        )
        return tuple(records)

    train_records = cache_split(training_split, "train")
    test_records = cache_split(test_split, "test")
    test_hashes = set(hashes_per_split["test"])
    overlapping_train_paths = {
        path
        for digest, path in hashes_per_split["train"].items()
        if digest in test_hashes
    }
    if overlapping_train_paths:
        train_records = tuple(
            record for record in train_records if record[0] not in overlapping_train_paths
        )
        for path in overlapping_train_paths:
            path.unlink(missing_ok=True)
        duplicate_count += len(overlapping_train_paths)
        print(
            "Removed byte-identical training images also present in the held-out "
            f"test split: {len(overlapping_train_paths)}"
        )
        usable_counts["train"] = {
            "real": sum(label == 0 for _, label in train_records),
            "fake": sum(label == 1 for _, label in train_records),
        }
        if not all(usable_counts["train"].values()):
            raise ValueError(
                "Removing exact train/test duplicates left a training class empty."
            )

    info = HuggingFaceDatasetInfo(
        dataset_id=dataset_id,
        source_counts=source_counts,
        usable_counts=usable_counts,
        image_dimensions=dict(dimensions),
        corrupted_files=tuple(corrupted_files),
        exact_duplicates_removed=duplicate_count,
        source_label_names=tuple(label_names),
    )
    return train_records, test_records, info
