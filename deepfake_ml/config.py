"""Central configuration for the standalone deepfake training pipeline."""

from dataclasses import dataclass
from pathlib import Path


PROJECT_DIR = Path(__file__).resolve().parent
DATA_DIR = PROJECT_DIR / "data"
MODEL_DIR = PROJECT_DIR / "models"
RESULTS_DIR = PROJECT_DIR / "results"

# EfficientNet-B0 uses 224 x 224 RGB images.
IMAGE_HEIGHT = 224
IMAGE_WIDTH = 224
IMAGE_CHANNELS = 3
CLASS_NAMES = ("real", "fake")
SUPPORTED_IMAGE_SUFFIXES = frozenset(
    {".jpg", ".jpeg", ".png", ".webp"}
)

SEED = 42
TRAIN_FRACTION = 0.70
VALIDATION_FRACTION = 0.15
TEST_FRACTION = 0.15

BATCH_SIZE = 32
HEAD_EPOCHS = 20
FINE_TUNE_EPOCHS = 10
FINE_TUNE_LAYERS = 20
HEAD_LEARNING_RATE = 1e-3
FINE_TUNE_LEARNING_RATE = 1e-5
DROPOUT_RATE = 0.30
CLASS_IMBALANCE_WARNING_RATIO = 2.0


@dataclass(frozen=True)
class TrainingConfig:
    """Runtime configuration, with defaults kept in this module for reproducibility."""

    data_dir: Path = DATA_DIR
    model_dir: Path = MODEL_DIR
    results_dir: Path = RESULTS_DIR
    seed: int = SEED
    train_fraction: float = TRAIN_FRACTION
    validation_fraction: float = VALIDATION_FRACTION
    test_fraction: float = TEST_FRACTION
    batch_size: int = BATCH_SIZE
    head_epochs: int = HEAD_EPOCHS
    fine_tune_epochs: int = FINE_TUNE_EPOCHS
    fine_tune_layers: int = FINE_TUNE_LAYERS
    head_learning_rate: float = HEAD_LEARNING_RATE
    fine_tune_learning_rate: float = FINE_TUNE_LEARNING_RATE
    dropout_rate: float = DROPOUT_RATE
    class_imbalance_warning_ratio: float = CLASS_IMBALANCE_WARNING_RATIO

    def validate(self) -> None:
        fractions = (
            self.train_fraction,
            self.validation_fraction,
            self.test_fraction,
        )
        if any(fraction <= 0 or fraction >= 1 for fraction in fractions):
            raise ValueError("Each split fraction must be greater than 0 and less than 1.")
        if abs(sum(fractions) - 1.0) > 1e-8:
            raise ValueError("Train, validation, and test fractions must sum to 1.")
        if self.batch_size <= 0:
            raise ValueError("Batch size must be a positive integer.")
        if self.head_epochs <= 0 or self.fine_tune_epochs <= 0:
            raise ValueError("Epoch counts must be positive integers.")
        if self.fine_tune_layers <= 0:
            raise ValueError("The number of fine-tuned layers must be positive.")
