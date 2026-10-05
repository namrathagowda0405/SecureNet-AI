"""Validate and prepare the supplied labeled image ZIP for training."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from collections import Counter
from io import BytesIO, TextIOWrapper
from pathlib import Path, PurePosixPath
import re
from zipfile import BadZipFile, ZipFile

from PIL import Image


EXPECTED_ROOT = PurePosixPath("Final Dataset")
LABEL_DIRECTORIES = {"Real": "real", "Fake": "fake"}
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}


def _pixel_hash(image: Image.Image) -> str:
    rgb = image.convert("RGB")
    digest = hashlib.sha256()
    digest.update(f"{rgb.width}x{rgb.height}:".encode("ascii"))
    digest.update(rgb.tobytes())
    return digest.hexdigest()


def _csv_path_key(value: str) -> str:
    parts = PurePosixPath(value.replace("\\", "/")).parts
    try:
        root_index = parts.index(EXPECTED_ROOT.name)
    except ValueError as error:
        raise ValueError(f"CSV image path is outside {EXPECTED_ROOT}: {value}") from error
    tail = PurePosixPath(*parts[root_index:]).as_posix()
    if len(PurePosixPath(tail).parts) != 3:
        raise ValueError(f"Unexpected CSV image path structure: {value}")
    return tail


def prepare_archive(archive_path: Path, data_dir: Path) -> dict[str, object]:
    """Extract readable, labeled, pixel-deduplicated images without network access."""
    try:
        archive = ZipFile(archive_path)
    except (OSError, BadZipFile) as error:
        raise ValueError(f"Could not open dataset archive: {archive_path}") from error

    with archive:
        files = [item for item in archive.infolist() if not item.is_dir()]
        csv_files = [
            item
            for item in files
            if PurePosixPath(item.filename).name.casefold() == "dataset.csv"
        ]
        if len(csv_files) != 1:
            raise ValueError(
                "Expected exactly one dataset.csv metadata file in the archive."
            )

        with archive.open(csv_files[0]) as raw_csv:
            rows = list(csv.DictReader(TextIOWrapper(raw_csv, encoding="utf-8-sig")))
        if not rows or not {"path", "label"}.issubset(rows[0]):
            raise ValueError("dataset.csv must contain path and label columns.")

        csv_entries: dict[str, str] = {}
        for row_number, row in enumerate(rows, start=2):
            label = row["label"].strip().casefold()
            if label not in {"real", "fake", "deepfake"}:
                raise ValueError(
                    f"Unsupported label {row['label']!r} on CSV row {row_number}."
                )
            label = "fake" if label == "deepfake" else label
            key = _csv_path_key(row["path"])
            if key in csv_entries:
                raise ValueError(f"Duplicate CSV path: {key}")
            csv_entries[key] = label

        image_items = [
            item
            for item in files
            if PurePosixPath(item.filename).suffix.casefold() in IMAGE_SUFFIXES
        ]
        if not image_items:
            raise ValueError("No supported image files were found in the archive.")

        expected_keys: set[str] = set()
        for item in image_items:
            path = PurePosixPath(item.filename)
            if (
                len(path.parts) != 3
                or path.parts[0] != EXPECTED_ROOT.name
                or path.parts[1] not in LABEL_DIRECTORIES
            ):
                raise ValueError(f"Unexpected image path in archive: {item.filename}")
            key = path.as_posix()
            expected_keys.add(key)
            csv_label = csv_entries.get(key)
            directory_label = LABEL_DIRECTORIES[path.parts[1]]
            if csv_label != directory_label:
                raise ValueError(
                    f"CSV label does not match class folder for {item.filename}: "
                    f"{csv_label!r} vs {directory_label!r}"
                )

        if expected_keys != set(csv_entries):
            missing_in_csv = sorted(expected_keys - set(csv_entries))
            missing_in_archive = sorted(set(csv_entries) - expected_keys)
            raise ValueError(
                "CSV and archive image paths differ. "
                f"Missing CSV rows: {missing_in_csv[:5]}; "
                f"missing archive files: {missing_in_archive[:5]}."
            )

        source_counts = Counter(csv_entries.values())
        seen_pixels: dict[str, tuple[str, str]] = {}
        kept_counts: Counter[str] = Counter()
        dimensions: Counter[str] = Counter()
        corrupted_files: list[str] = []
        duplicate_files: list[str] = []

        for index, item in enumerate(image_items, start=1):
            archive_path_key = PurePosixPath(item.filename).as_posix()
            label = csv_entries[archive_path_key]
            try:
                encoded = archive.read(item)
                with Image.open(BytesIO(encoded)) as image:
                    image.verify()
                with Image.open(BytesIO(encoded)) as image:
                    image.load()
                    dimensions[f"{image.width}x{image.height}"] += 1
                    digest = _pixel_hash(image)
                    converted = image.convert("RGB")
            except (OSError, ValueError, Image.DecompressionBombError) as error:
                corrupted_files.append(
                    f"{item.filename}: {type(error).__name__}: {error}"
                )
                continue

            previous = seen_pixels.get(digest)
            if previous is not None:
                previous_label, _ = previous
                if previous_label != label:
                    raise ValueError(
                        "Pixel-identical images have conflicting labels: "
                        f"{previous[1]} and {item.filename}"
                    )
                duplicate_files.append(item.filename)
                continue

            output_dir = data_dir / label
            output_dir.mkdir(parents=True, exist_ok=True)
            output_path = output_dir / PurePosixPath(item.filename).name
            if output_path.exists():
                with Image.open(output_path) as existing:
                    if _pixel_hash(existing) != digest:
                        raise FileExistsError(
                            f"Refusing to overwrite a different image: {output_path}"
                        )
            else:
                converted.save(output_path, format="JPEG", quality=95, subsampling=0)
            seen_pixels[digest] = (label, item.filename)
            kept_counts[label] += 1
            if index % 1000 == 0:
                print(f"Validated {index}/{len(image_items)} archive images.")

        if not kept_counts["real"] or not kept_counts["fake"]:
            raise ValueError(
                "Preparation yielded no readable images for one or both classes."
            )

    summary: dict[str, object] = {
        "source_archive": str(archive_path.resolve()),
        "archive_root": EXPECTED_ROOT.as_posix(),
        "label_source": "dataset.csv label, cross-checked against class directory",
        "class_mapping": {"REAL": 0, "FAKE": 1, "DEEPFAKE": 1},
        "source_sample_count": len(image_items),
        "source_class_counts": {
            "real": source_counts["real"],
            "fake": source_counts["fake"],
        },
        "prepared_sample_count": kept_counts["real"] + kept_counts["fake"],
        "prepared_class_counts": {
            "real": kept_counts["real"],
            "fake": kept_counts["fake"],
        },
        "image_dimensions": dict(dimensions),
        "corrupted_files": corrupted_files,
        "corrupted_count": len(corrupted_files),
        "exact_pixel_duplicate_files_removed": duplicate_files,
        "exact_pixel_duplicates_removed": len(duplicate_files),
        "seed_for_later_split": 42,
        "note": (
            "Archive-provided augmentation variants are kept as source samples; "
            "training splits must group filename-linked variants together. "
            "Model augmentation is applied only on training batches."
        ),
    }
    data_dir.mkdir(parents=True, exist_ok=True)
    summary_path = data_dir / "preparation_summary.json"
    summary_path.write_text(
        json.dumps(summary, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(summary, indent=2))
    print(f"Preparation summary saved to: {summary_path}")
    return summary


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Prepare an existing labeled JPG ZIP without downloading data."
    )
    parser.add_argument("--archive", type=Path, required=True)
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=Path(__file__).resolve().parent / "data",
    )
    return parser.parse_args()


def main() -> None:
    args = _parse_args()
    prepare_archive(args.archive, args.data_dir)


if __name__ == "__main__":
    main()
