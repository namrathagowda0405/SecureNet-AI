"""EfficientNet-B0 transfer-learning model and compilation helpers."""

from __future__ import annotations

import tensorflow as tf
import keras_hub

from config import (
    FINE_TUNE_LAYERS,
    IMAGE_CHANNELS,
    IMAGE_HEIGHT,
    IMAGE_WIDTH,
    TrainingConfig,
)

IMAGENET_PRESET = "hf://keras/efficientnet_b0_ra_imagenet"


def build_model(config: TrainingConfig) -> tf.keras.Model:
    """Build a binary REAL/DEEPFAKE classifier with a frozen ImageNet backbone."""
    backbone = keras_hub.models.EfficientNetBackbone.from_preset(
        IMAGENET_PRESET,
        input_shape=(IMAGE_HEIGHT, IMAGE_WIDTH, IMAGE_CHANNELS),
        name="efficientnetb0_backbone",
    )
    backbone.trainable = False
    preprocessing = (
        keras_hub.models.EfficientNetImageClassifierPreprocessor.from_preset(
            IMAGENET_PRESET,
            name="efficientnetb0_imagenet_preprocessing",
        )
    )

    inputs = tf.keras.Input(
        shape=(IMAGE_HEIGHT, IMAGE_WIDTH, IMAGE_CHANNELS),
        dtype=tf.float32,
        name="image_pixels_0_255",
    )

    # Augmentation layers are active only when Keras runs the model in training
    # mode; validation, testing, and inference use the original resized image.
    augmented = tf.keras.Sequential(
        [
            tf.keras.layers.RandomFlip("horizontal", seed=config.seed),
            tf.keras.layers.RandomRotation(0.05, seed=config.seed + 1),
            tf.keras.layers.RandomZoom(0.10, seed=config.seed + 2),
        ],
        name="training_only_augmentation",
    )(inputs)

    # Use the exact resize/crop and ImageNet normalization shipped with the
    # pretrained KerasHub preset before feeding pixels to its backbone.
    normalized = preprocessing(augmented)
    features = backbone(normalized, training=False)
    features = tf.keras.layers.GlobalAveragePooling2D(name="global_average_pool")(
        features
    )
    features = tf.keras.layers.Dropout(
        config.dropout_rate, name="classifier_dropout"
    )(features)
    outputs = tf.keras.layers.Dense(
        1,
        activation="sigmoid",
        name="fake_probability",
    )(features)

    model = tf.keras.Model(inputs=inputs, outputs=outputs, name="deepfake_efficientnetb0")
    compile_model(model, config.head_learning_rate)
    return model


def configure_fine_tuning(
    model: tf.keras.Model,
    config: TrainingConfig,
    *,
    layers_to_unfreeze: int = FINE_TUNE_LAYERS,
) -> None:
    """Unfreeze only the upper backbone layers and recompile at a low learning rate."""
    backbone = model.get_layer("efficientnetb0_backbone")
    backbone.trainable = True

    if layers_to_unfreeze <= 0:
        raise ValueError("layers_to_unfreeze must be a positive integer.")

    first_trainable_index = max(0, len(backbone.layers) - layers_to_unfreeze)
    for index, layer in enumerate(backbone.layers):
        # Batch normalization statistics are sensitive to small batches and are
        # therefore kept frozen during fine-tuning.
        layer.trainable = index >= first_trainable_index and not isinstance(
            layer, tf.keras.layers.BatchNormalization
        )

    compile_model(model, config.fine_tune_learning_rate)


def compile_model(model: tf.keras.Model, learning_rate: float) -> None:
    """Compile with the binary cross-entropy objective and Adam optimizer."""
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss=tf.keras.losses.BinaryCrossentropy(),
        metrics=[
            tf.keras.metrics.BinaryAccuracy(name="accuracy", threshold=0.5),
        ],
    )
