"""Dataset discovery, class-balance checks, splitting, and tf.data input pipeline."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
import hashlib
import json
from pathlib import Path
import re
import warnings

import numpy as np
from PIL import Image
import tensorflow as tf

from config import (
    CLASS_IMBALANCE_WARNING_RATIO,
    CLASS_NAMES,
    IMAGE_CHANNELS,
    IMAGE_HEIGHT,
    IMAGE_WIDTH,
    SUPPORTED_IMAGE_SUFFIXES,
    TrainingConfig,
)

ImageRecord = tuple[Path, int]


def source_group_id(image_path: Path) -> str:
    """Group shared real/fake source IDs and their filename-marked variants."""
    stem = image_path.stem.casefold()
    class_name = image_path.parent.name.casefold()
    augmented = re.fullmatch(r"(?:real|fake)_(\d+)_aug_\d+", stem)
    if augmented:
        return f"source:{int(augmented.group(1))}"
    if stem.isdecimal():
        return f"source:{int(stem)}"
    augmented_prefix = re.fullmatch(r"(.+)_aug_\d+", stem)
    if augmented_prefix:
        return f"{class_name}:{augmented_prefix.group(1)}"
    return f"{class_name}:{stem}"


def _sha256_file(path: Path) -> str:
    """Hash file bytes so exact duplicate images cannot straddle splits unnoticed."""
    digest = hashlib.sha256()
    with path.open("rb") as image_file:
        for chunk in iter(lambda: image_file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


@dataclass(frozen=True)
class DatasetSplits:
    """Image records separated into training, validation, and held-out test sets."""

    train: tuple[ImageRecord, ...]
    validation: tuple[ImageRecord, ...]
    test: tuple[ImageRecord, ...]


def save_split_manifest(
    splits: DatasetSplits,
    data_dir: Path,
    manifest_path: Path,
    *,
    seed: int,
    source: dict[str, str] | None = None,
) -> None:
    """Persist the exact path-based split used by training for later evaluation."""
    resolved_data_dir = data_dir.resolve()
    serialized_splits: dict[str, list[dict[str, int | str]]] = {}
    seen_paths: set[str] = set()
    hash_split: dict[str, str] = {}

    for split_name in ("train", "validation", "test"):
        records = getattr(splits, split_name)
        serialized_records: list[dict[str, int | str]] = []
        for image_path, label in records:
            resolved_path = image_path.resolve()
            try:
                relative_path = resolved_path.relative_to(resolved_data_dir)
            except ValueError as error:
                raise ValueError(
                    f"Dataset image is outside the data directory: {image_path}"
                ) from error

            identity = str(relative_path).casefold()
            if identity in seen_paths:
                raise ValueError(
                    f"Image occurs more than once across dataset splits: {image_path}"
                )
            seen_paths.add(identity)
            content_hash = _sha256_file(resolved_path)
            previous_split = hash_split.get(content_hash)
            if previous_split is not None and previous_split != split_name:
                raise ValueError(
                    "Byte-identical images occur in different splits "
                    f"({previous_split} and {split_name}); remove duplicates or "
                    "create a grouped split before training."
                )
            hash_split[content_hash] = split_name
            serialized_records.append(
                {
                    "path": relative_path.as_posix(),
                    "label": int(label),
                    "sha256": content_hash,
                    "group_id": source_group_id(image_path),
                }
            )
        serialized_splits[split_name] = serialized_records

    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(
        json.dumps(
            {
                "format_version": 1,
                "seed": seed,
                "source": source or {"kind": "folders"},
                "class_names": list(CLASS_NAMES),
                "splits": serialized_splits,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Training split manifest saved to: {manifest_path}")


def load_test_records(manifest_path: Path, data_dir: Path) -> tuple[ImageRecord, ...]:
    """Load only the recorded test split and reject overlapping or changed paths."""
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except FileNotFoundError as error:
        raise FileNotFoundError(
            f"Split manifest not found: {manifest_path}. Train the model with the "
            "current pipeline first so evaluation uses its exact held-out test split."
        ) from error
    except json.JSONDecodeError as error:
        raise ValueError(f"Invalid split manifest JSON: {manifest_path}") from error

    if (
        not isinstance(manifest, dict)
        or manifest.get("format_version") != 1
        or manifest.get("class_names") != list(CLASS_NAMES)
        or not isinstance(manifest.get("splits"), dict)
    ):
        raise ValueError(f"Unsupported or malformed split manifest: {manifest_path}")

    split_records = manifest["splits"]
    source = manifest.get("source", {"kind": "folders"})
    if not isinstance(source, dict) or source.get("kind") not in {
        "folders",
        "huggingface",
    }:
        raise ValueError(f"Unsupported dataset source in manifest: {source!r}")
    resolved_data_dir = data_dir.resolve()
    identities_by_split: dict[str, set[str]] = {}
    hashes_by_split: dict[str, set[str]] = {}
    groups_by_split: dict[str, set[str]] = {}

    for split_name in ("train", "validation", "test"):
        entries = split_records.get(split_name)
        if not isinstance(entries, list) or not entries:
            raise ValueError(
                f"Split manifest has no records for the {split_name!r} split."
            )

        identities: set[str] = set()
        content_hashes: set[str] = set()
        group_ids: set[str] = set()
        for entry in entries:
            if (
                not isinstance(entry, dict)
                or not isinstance(entry.get("path"), str)
                or entry.get("label") not in (0, 1)
                or not isinstance(entry.get("sha256"), str)
                or len(entry["sha256"]) != 64
            ):
                raise ValueError(
                    f"Malformed record in the {split_name!r} split manifest."
                )
            relative_path = Path(entry["path"])
            if relative_path.is_absolute():
                raise ValueError("Split manifest paths must be relative to data-dir.")

            image_path = (resolved_data_dir / relative_path).resolve()
            try:
                image_path.relative_to(resolved_data_dir)
            except ValueError as error:
                raise ValueError(
                    f"Split manifest path escapes data-dir: {entry['path']}"
                ) from error

            expected_class = CLASS_NAMES[int(entry["label"])]
            relative_parts = image_path.relative_to(resolved_data_dir).parts
            if source["kind"] == "folders":
                label_path_matches = bool(relative_parts) and (
                    relative_parts[0] == expected_class
                )
            else:
                dataset_id = source.get("dataset_id")
                expected_source_split = (
                    "test" if split_name == "test" else "train"
                )
                label_path_matches = (
                    isinstance(dataset_id, str)
                    and len(relative_parts) >= 5
                    and relative_parts[0] == "huggingface-cache"
                    and relative_parts[1]
                    == hashlib.sha256(dataset_id.encode("utf-8")).hexdigest()[:16]
                    and relative_parts[2] == expected_source_split
                    and relative_parts[3] == expected_class
                )
            if (
                not image_path.is_file()
                or image_path.suffix.lower() not in SUPPORTED_IMAGE_SUFFIXES
                or not label_path_matches
            ):
                raise ValueError(
                    "A recorded dataset image is missing, unsupported, or has a "
                    f"label inconsistent with its class directory: {image_path}"
                )
            identities.add(str(image_path).casefold())
            actual_group_id = source_group_id(image_path)
            recorded_group_id = entry.get("group_id")
            if (
                recorded_group_id is not None
                and recorded_group_id != actual_group_id
            ):
                raise ValueError(
                    f"Source group changed since the split was recorded: {image_path}"
                )
            group_ids.add(actual_group_id)
            actual_hash = _sha256_file(image_path)
            if actual_hash != entry["sha256"]:
                raise ValueError(
                    f"Test dataset image content changed since training: {image_path}"
                )
            content_hashes.add(actual_hash)
        identities_by_split[split_name] = identities
        hashes_by_split[split_name] = content_hashes
        groups_by_split[split_name] = group_ids

    for first_split, second_split in (
        ("train", "validation"),
        ("train", "test"),
        ("validation", "test"),
    ):
        overlap = identities_by_split[first_split] & identities_by_split[second_split]
        if overlap:
            raise ValueError(
                f"Split manifest has image path leakage between {first_split} "
                f"and {second_split}."
            )
        duplicate_content = hashes_by_split[first_split] & hashes_by_split[second_split]
        if duplicate_content:
            raise ValueError(
                f"Byte-identical images leak between {first_split} and {second_split}."
            )
        group_overlap = groups_by_split[first_split] & groups_by_split[second_split]
        if group_overlap:
            raise ValueError(
                f"Filename-linked image groups leak between {first_split} and "
                f"{second_split}: {sorted(group_overlap)[:5]}"
            )

    test_records: list[ImageRecord] = []
    for entry in split_records["test"]:
        label = int(entry["label"])
        image_path = (resolved_data_dir / entry["path"]).resolve()
        test_records.append((image_path, label))

    class_counts = Counter(label for _, label in test_records)
    print(
        "Held-out test images from training manifest: "
        f"total={len(test_records)} REAL={class_counts[0]} "
        f"DEEPFAKE={class_counts[1]}"
    )
    return tuple(test_records)


def discover_images(data_dir: Path) -> list[ImageRecord]:
    """Read files only from the explicit real/ and fake/ label directories."""
    records: list[ImageRecord] = []
    counts: dict[str, int] = {}

    for label, class_name in enumerate(CLASS_NAMES):
        class_dir = data_dir / class_name
        if not class_dir.is_dir():
            raise FileNotFoundError(
                f"Missing class directory: {class_dir}. "
                "Expected data/real/ and data/fake/."
            )

        paths = sorted(
            path
            for path in class_dir.rglob("*")
            if path.is_file() and path.suffix.lower() in SUPPORTED_IMAGE_SUFFIXES
        )
        counts[class_name] = len(paths)
        records.extend((path, label) for path in paths)

    print("Images found by class:")
    print(f"  REAL (label 0):     {counts['real']}")
    print(f"  DEEPFAKE (label 1): {counts['fake']}")

    if counts["real"] == 0 or counts["fake"] == 0:
        raise ValueError(
            "Both class folders must contain supported images before training."
        )

    check_class_balance(counts, CLASS_IMBALANCE_WARNING_RATIO)
    return records


def check_class_balance(
    counts: dict[str, int], warning_ratio: float
) -> None:
    """Report the observed imbalance and warn rather than altering the data."""
    smallest_class = min(counts.values())
    largest_class = max(counts.values())
    ratio = largest_class / smallest_class
    print(f"Observed largest-to-smallest class ratio: {ratio:.2f}:1")

    if ratio > warning_ratio:
        warnings.warn(
            "The dataset is class-imbalanced. Consider collecting more examples "
            "for the smaller class or documenting a justified balancing method.",
            stacklevel=2,
        )


def _allocate_split_counts(
    sample_count: int, fractions: tuple[float, float, float]
) -> tuple[int, int, int]:
    """Allocate each class across all splits while ensuring every split has it."""
    if sample_count < 3:
        raise ValueError(
            "At least 3 images per class are required to place that class in "
            "train, validation, and test splits."
        )

    ideal_counts = np.asarray(fractions, dtype=np.float64) * sample_count
    allocated = np.floor(ideal_counts).astype(np.int64)
    allocated[allocated == 0] = 1

    while int(allocated.sum()) < sample_count:
        differences = ideal_counts - allocated
        allocated[int(np.argmax(differences))] += 1

    while int(allocated.sum()) > sample_count:
        differences = allocated - ideal_counts
        differences[allocated <= 1] = -np.inf
        allocated[int(np.argmax(differences))] -= 1

    return tuple(int(count) for count in allocated)


def split_records(
    records: list[ImageRecord], config: TrainingConfig
) -> DatasetSplits:
    """Create deterministic class-balanced splits without separating source groups."""
    fractions = (
        config.train_fraction,
        config.validation_fraction,
        config.test_fraction,
    )
    rng = np.random.default_rng(config.seed)
    records_by_split: list[list[ImageRecord]] = [[], [], []]
    groups: dict[str, list[ImageRecord]] = {}
    for record in records:
        groups.setdefault(source_group_id(record[0]), []).append(record)

    groups_by_class = {
        label: {
            group_id
            for group_id, group_records in groups.items()
            if any(record_label == label for _, record_label in group_records)
        }
        for label in (0, 1)
    }
    for label, class_name in enumerate(CLASS_NAMES):
        if len(groups_by_class[label]) < 3:
            raise ValueError(
                f"Class {class_name!r} has fewer than three distinct source "
                "groups; a three-way leakage-resistant split is not possible."
            )

    group_items = list(groups.items())
    permutation = rng.permutation(len(group_items))
    shuffled_groups = [group_items[int(index)] for index in permutation]
    shuffled_groups.sort(key=lambda item: -len(item[1]))
    class_totals = np.asarray(
        [sum(label == class_id for _, label in records) for class_id in (0, 1)],
        dtype=np.float64,
    )
    target_counts = np.asarray(fractions, dtype=np.float64)[:, None] * class_totals
    split_counts = np.zeros((3, 2), dtype=np.float64)
    assigned_groups = np.zeros(3, dtype=np.int64)

    for _, group_records in shuffled_groups:
        group_counts = np.bincount(
            [label for _, label in group_records],
            minlength=2,
        ).astype(np.float64)
        scores: list[float] = []
        for split_index in range(3):
            candidate_counts = split_counts.copy()
            candidate_counts[split_index] += group_counts
            relative_errors = (candidate_counts - target_counts) / np.maximum(
                target_counts, 1.0
            )
            missing_class_penalty = np.count_nonzero(candidate_counts == 0) * 1000
            scores.append(
                float(np.square(relative_errors).sum()) + missing_class_penalty
            )

        best_score = min(scores)
        tied_splits = np.flatnonzero(
            np.isclose(scores, best_score, rtol=1e-12, atol=1e-12)
        )
        selected_split = int(rng.choice(tied_splits))
        records_by_split[selected_split].extend(group_records)
        split_counts[selected_split] += group_counts
        assigned_groups[selected_split] += 1

    if np.any(split_counts == 0):
        missing = [
            f"{CLASS_NAMES[class_id]} in {('train', 'validation', 'test')[split_id]}"
            for split_id, class_id in zip(*np.where(split_counts == 0), strict=True)
        ]
        raise ValueError(
            "Grouped splitting could not put every class in every split: "
            + ", ".join(missing)
        )
    print(
        f"  Shared source groups: {len(groups)}; "
        f"assigned train/validation/test={assigned_groups.tolist()}"
    )

    splits = DatasetSplits(
        train=tuple(records_by_split[0]),
        validation=tuple(records_by_split[1]),
        test=tuple(records_by_split[2]),
    )
    _print_split_counts(splits)
    return splits


def split_training_records(
    records: tuple[ImageRecord, ...], config: TrainingConfig
) -> tuple[tuple[ImageRecord, ...], tuple[ImageRecord, ...]]:
    """Create train/validation subsets from training data without using test data."""
    rng = np.random.default_rng(config.seed)
    train_records: list[ImageRecord] = []
    validation_records: list[ImageRecord] = []

    for label, class_name in enumerate(CLASS_NAMES):
        class_records = [record for record in records if record[1] == label]
        if len(class_records) < 2:
            raise ValueError(
                f"The provided training split needs at least 2 {class_name} "
                "images to create separate train and validation subsets."
            )

        indices = rng.permutation(len(class_records))
        validation_count = int(round(len(class_records) * config.validation_fraction))
        validation_count = min(max(validation_count, 1), len(class_records) - 1)
        validation_indices = indices[:validation_count]
        train_indices = indices[validation_count:]
        validation_records.extend(
            class_records[int(index)] for index in validation_indices
        )
        train_records.extend(class_records[int(index)] for index in train_indices)

    train = tuple(train_records)
    validation = tuple(validation_records)
    _print_split_counts(
        DatasetSplits(train=train, validation=validation, test=())
    )
    return train, validation


def _print_split_counts(splits: DatasetSplits) -> None:
    """Print actual per-class counts for all generated splits."""
    print("Image counts by split:")
    for split_name, split_records in (
        ("train", splits.train),
        ("validation", splits.validation),
        ("test", splits.test),
    ):
        counts = Counter(label for _, label in split_records)
        print(
            f"  {split_name:10} total={len(split_records):5} "
            f"REAL={counts[0]:5} DEEPFAKE={counts[1]:5}"
        )


def _decode_with_pillow(encoded: np.ndarray) -> np.ndarray:
    """Decode JPEG, PNG, or WEBP bytes to RGB while preserving pixel scale."""
    from io import BytesIO

    with Image.open(BytesIO(bytes(encoded))) as image:
        return np.asarray(image.convert("RGB"), dtype=np.uint8)


def _decode_and_resize(
    path: tf.Tensor, label: tf.Tensor
) -> tuple[tf.Tensor, tf.Tensor]:
    """Decode RGB pixels and resize without scaling away EfficientNet's 0..255 input."""
    contents = tf.io.read_file(path)
    image = tf.numpy_function(_decode_with_pillow, [contents], Tout=tf.uint8)
    image.set_shape([None, None, IMAGE_CHANNELS])
    image = tf.image.resize(
        image,
        [IMAGE_HEIGHT, IMAGE_WIDTH],
        method=tf.image.ResizeMethod.BILINEAR,
        antialias=True,
    )
    image = tf.ensure_shape(image, [IMAGE_HEIGHT, IMAGE_WIDTH, IMAGE_CHANNELS])
    return tf.cast(image, tf.float32), tf.cast(label, tf.int32)


def _make_dataset(
    records: tuple[ImageRecord, ...],
    config: TrainingConfig,
    *,
    training: bool,
) -> tf.data.Dataset:
    """Construct a batched data pipeline; shuffling is exclusive to training."""
    paths = [str(path) for path, _ in records]
    labels = [label for _, label in records]
    dataset = tf.data.Dataset.from_tensor_slices((paths, labels))

    if training:
        dataset = dataset.shuffle(
            buffer_size=len(records),
            seed=config.seed,
            reshuffle_each_iteration=True,
        )

    dataset = dataset.map(
        _decode_and_resize,
        num_parallel_calls=tf.data.AUTOTUNE,
        deterministic=True,
    )
    dataset = dataset.batch(config.batch_size, drop_remainder=False)
    dataset = dataset.prefetch(tf.data.AUTOTUNE)

    options = tf.data.Options()
    options.experimental_deterministic = True
    return dataset.with_options(options)


def build_datasets(
    splits: DatasetSplits, config: TrainingConfig
) -> tuple[tf.data.Dataset, tf.data.Dataset, tf.data.Dataset]:
    """Build train, validation, and test datasets from already-separated records."""
    return (
        _make_dataset(splits.train, config, training=True),
        _make_dataset(splits.validation, config, training=False),
        build_test_dataset(splits.test, config),
    )


def build_test_dataset(
    records: tuple[ImageRecord, ...], config: TrainingConfig
) -> tf.data.Dataset:
    """Build an unshuffled, unaugmented dataset containing only test records."""
    if not records:
        raise ValueError("The held-out test split is empty.")
    return _make_dataset(records, config, training=False)
