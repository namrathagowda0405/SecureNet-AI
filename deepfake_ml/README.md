# Deepfake Image Classifier Training

This directory contains an independent TensorFlow/Keras training pipeline for a binary image classifier using an ImageNet-pretrained EfficientNet-B0 backbone. It does not import or modify the SecureNet Next.js app, and it does not include a dataset or claim model performance.

## Requirements

- Python 3.10 or newer.
- A machine that can install the TensorFlow version supported by its operating system and Python version. GPU training is optional; TensorFlow will use a supported GPU when available.
- Network access on the first run to retrieve the ImageNet EfficientNet-B0 weights, unless Keras already has them cached.

## Install dependencies

From the repository root, create and activate a virtual environment:

```powershell
py -3.11 -m venv deepfake_ml\.venv
.\deepfake_ml\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r deepfake_ml\requirements.txt
```

If PowerShell script activation is restricted, call the environment's Python executable directly:

```powershell
.\deepfake_ml\.venv\Scripts\python.exe -m pip install -r deepfake_ml\requirements.txt
```

## Prepare the dataset

Place image files in the two class folders. Labels are assigned by folder name:

```text
deepfake_ml/
└── data/
    ├── real/
    │   ├── image_001.jpg
    │   └── ...
    └── fake/
        ├── image_001.jpg
        └── ...
```

The folder loader accepts `.jpg`, `.jpeg`, `.png`, and `.webp` files (including files in nested subfolders). At least three images per class are required so each class can appear in training, validation, and test data. The script prints the actual image counts and split counts after discovering the dataset; it does not substitute sample data or invent statistics.

For folder datasets, the pipeline uses a reproducible source-group-aware split: filename-linked source variants stay together across the 70% train, 15% validation, and 15% test partitions. Exact byte hashes are also checked across splits. Augmentation runs only in Keras training mode; validation and test data are not augmented. Filename-derived grouping does not prove person/video independence when the source has no verified identity metadata.

### Hugging Face dataset source

The pipeline can optionally load `ARPAN2026/deepfake-detection-dataset-v3` directly. The loader uses only its `image` and `label` fields; CAM images, captions, confidence scores, and explanations are deliberately excluded from model inputs. The class-label names are checked and mapped to this project’s convention (`REAL=0`, `DEEPFAKE=1`), regardless of the source dataset's numeric label ordering.

The dataset repository currently declares `train` and `test` splits. The pipeline preserves the source test split untouched and derives validation only from the source train split. Cached image copies are stored under `data/huggingface-cache/`, are ignored by Git, and the split manifest records their hashes for later evaluation. If either split lacks one of the two declared classes or the schema differs, loading stops with an error.

Run using the dataset source:

```powershell
.\deepfake_ml\.venv\Scripts\python.exe deepfake_ml\train.py --huggingface-dataset ARPAN2026/deepfake-detection-dataset-v3
```

To also fine-tune the upper EfficientNet layers:

```powershell
.\deepfake_ml\.venv\Scripts\python.exe deepfake_ml\train.py --huggingface-dataset ARPAN2026/deepfake-detection-dataset-v3 --fine-tune
```

The repository metadata currently reports 474 train and 53 test examples, but its README also contains conflicting sample statistics and a usage example for a different dataset ID. Treat those metadata counts as unverified until the loader prints actual downloaded split counts; do not assume dataset integrity, provenance, or research representativeness from the repository metadata alone. For a research evaluation, inspect the actual examples and licensing/provenance, and determine whether the source test split is independent of train at the subject/source level. Exact byte duplicate checks do not detect re-encoded or semantically related images.

### Related research reference

arXiv:2309.02218, [“Robustness and Generalizability of Deepfake Detection: A Study with Diffusion Models”](https://arxiv.org/abs/2309.02218), introduces the DeepFakeFace (DFF) collection and evaluates cross-generator generalization and degraded-image robustness. The Hugging Face dataset card above instead cites “Deepfake Detection Dataset V3” (Gupta, 2024) and does not identify its data as DFF. Do not conflate the two datasets or cite this paper as the provenance of the Hugging Face dataset without verifying that relationship. The paper’s evaluation focus is relevant to future research evaluation: a single held-out split does not establish cross-generator or degraded-image robustness.

### Prepare the supplied ZIP archive

To prepare a local archive whose root contains `Final Dataset/Real`, `Final Dataset/Fake`, and `Final Dataset/dataset.csv`, run:

```powershell
.\deepfake_ml\.venv\Scripts\python.exe deepfake_ml\prepare_archive.py --archive C:\path\to\archive.zip
```

The preparation tool validates every CSV path and label against the class directory, fully decodes images, records corrupt files, removes exact pixel duplicates, and writes accepted images into `data/real/` and `data/fake/`. It does not download a dataset or create samples. It records source counts, image dimensions, duplicate removals, and errors in `data/preparation_summary.json`.

The supplied archive contains filenames with `_aug_N` suffixes. The split code groups sibling variants by their shared numeric source ID, including matching REAL and FAKE IDs, and groups `real_N_aug_M` with the corresponding numeric `N.jpg` REAL original when present. A group is assigned to exactly one split. Model-side random augmentation is applied only to training batches. The archive has no explicit subject/video/source metadata, so filename-derived groups reduce leakage risk but cannot guarantee person-level independence.

Run EfficientNet-B0 training on the prepared archive data with:

```powershell
.\deepfake_ml\.venv\Scripts\python.exe deepfake_ml\train.py
```

## Start training

From the repository root:

```powershell
.\deepfake_ml\.venv\Scripts\python.exe deepfake_ml\train.py
```

The default run trains the classifier head while EfficientNet-B0 is frozen. To perform a second optional stage that fine-tunes the upper EfficientNet layers:

```powershell
.\deepfake_ml\.venv\Scripts\python.exe deepfake_ml\train.py --fine-tune
```

The split seed defaults to `42`. Override it or provide a different dataset root with:

```powershell
.\deepfake_ml\.venv\Scripts\python.exe deepfake_ml\train.py --seed 123 --data-dir deepfake_ml\data
```

The run uses binary cross-entropy and Adam. Early stopping, best-validation-loss checkpoints, and learning-rate reduction are enabled for each training stage. If fine-tuning is requested, the pipeline selects the stage checkpoint with the lower *observed validation loss*; the held-out test set is only used for final evaluation. The exact train/validation/test image paths are saved to `results/split_manifest.json` so later evaluation cannot silently create a different split.

## Evaluate a trained model

Training automatically evaluates the selected best checkpoint on the held-out test set and writes the actual measured results. To rerun evaluation later without retraining:

```powershell
.\deepfake_ml\.venv\Scripts\python.exe deepfake_ml\evaluate.py
```

The evaluator loads `models/best_model.keras` and predicts only the test records listed in `results/split_manifest.json`. It verifies that the manifest has non-empty, path-disjoint train, validation, and test splits, checks SHA-256 hashes to reject byte-identical images across splits and detect changed dataset files, and confirms the recorded files are present. Evaluation stops with an error if the checkpoint or split manifest is missing; it does not regenerate a split or fabricate results. A one-class test set has no defined ROC-AUC, so that metric is saved as `null` and no ROC curve is generated.

The local archive split assigns filename-linked REAL and FAKE source families jointly to train, validation, or test. The manifest records those groups and SHA-256 hashes, and evaluation rejects cross-split group/path/hash overlap. Hashes catch byte-identical copies; they cannot detect re-encoded copies, adjacent video frames, or same-subject images whose filenames do not share an ID. The archive lacks verified subject/video metadata, so group separation is an inferred safeguard, not proof of subject-disjoint evaluation.

## Run the private inference service

Install `deepfake_ml/requirements.txt` in the Python environment that contains TensorFlow, then start the model service from the repository root:

```powershell
.\deepfake_ml\.venv\Scripts\python.exe -m uvicorn service:app --app-dir deepfake_ml --host 127.0.0.1 --port 8001
```

The service loads `models/best_model.keras` on first request. It returns HTTP 503 without predictions if the trained checkpoint is missing or cannot be loaded. The Next.js upload API proxies validated images or sampled JPEG frames to this loopback service; configure `DEEPFAKE_INFERENCE_URL` server-side if the service uses another private address. `DEEPFAKE_MODEL_PATH` can override the checkpoint location in the Python service without revealing it in API responses. This classifier performs image-level inference and does not detect faces.

The UI accepts MP4/WEBM clips up to 50 MB and 30 seconds. The browser decodes each clip locally, samples up to 15 frames, and sends only those frames (not the original video) to the local Python service. The service returns the arithmetic mean of the image classifier's sampled-frame probabilities. This is an exploratory frame-sampling feature only; the model was trained and evaluated on images, not videos, and video results must not be described as validated video-forensics predictions.

Evaluation artifacts in `results/`:

- `metrics.json`: measured test metrics, confusion counts, class-wise report, and model/split provenance.
- `confusion_matrix.png`: rows are actual labels and columns are predictions, ordered REAL then DEEPFAKE.
- `classification_report.txt`: precision, recall, F1, support, and the labeled confusion matrix.
- `roc_curve.png`: generated only when both labels occur in the test set.

## Outputs

- `models/best_model.keras`: selected best checkpoint.
- `models/head_best.keras`: best frozen-backbone stage checkpoint.
- `models/fine_tuned_best.keras`: created when `--fine-tune` is used.
- `results/split_manifest.json`: exact image membership for all three splits.
- `results/training_history.csv`: measured per-epoch training and validation metrics.
- `results/training_curves.png`: loss and accuracy plots from actual training history.
- `results/metrics.json`: metrics computed only on the held-out test split.

These data, model, and result artifacts are ignored by Git. Do not report metrics until a run has completed successfully, and describe the dataset, split methodology, seed, and evaluation protocol with any research results.

## Model input and class order

The dataset loader decodes RGB images, resizes them to `224 x 224`, and supplies float pixel values in the `[0, 255]` range. EfficientNet-B0 includes its expected input rescaling. The classifier returns one sigmoid probability for DEEPFAKE; REAL probability is its complement. The model file uses Keras' `.keras` format; deployment conversion or adaptation should happen separately from this training pipeline.

The current integration sends validated image files from the Next.js API to the local Python service. The service decodes RGB, resizes to `224 x 224`, loads `models/best_model.keras`, and returns the model's sigmoid DEEPFAKE probability and its REAL complement, along with the model fingerprint and inference time. It does not detect or crop faces. Video uploads are sampled locally in the browser and the service averages the same image model's scores over the sampled frames; this is not a video-trained or video-evaluated model. If the final checkpoint is missing or invalid, the service returns unavailable and generates no result.
