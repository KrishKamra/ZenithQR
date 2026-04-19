import tensorflow as tf
from keras import layers, models
import os

def build_model():
    """Builds a lightweight CNN optimized for binary classification."""
    model = models.Sequential([
        layers.Input(shape=(128, 128, 1)),
        # First Block: Captures basic edges and finder pattern corners
        layers.Conv2D(32, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        
        # Second Block: Captures complex geometric relationships
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        
        # Third Block: Global feature integration
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.Flatten(),
        
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.4),  # Slightly reduced dropout for faster convergence
        layers.Dense(1, activation='sigmoid') # 1 = Scannable, 0 = Unscannable
    ])
    
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    return model

def train():
    # 1. Data Pipeline with Validation Split (80/20)
    # This ensures we know how well it performs on 'unseen' data.
    train_ds = tf.keras.utils.image_dataset_from_directory(
        'dataset',
        validation_split=0.2,
        subset="training",
        seed=123,
        color_mode='grayscale',
        image_size=(128, 128),
        batch_size=32
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        'dataset',
        validation_split=0.2,
        subset="validation",
        seed=123,
        color_mode='grayscale',
        image_size=(128, 128),
        batch_size=32
    )

    # 2. Performance Optimization for Local Storage
    # Prefetching keeps the NPU/CPU fed with data while processing.
    train_ds = train_ds.prefetch(buffer_size=tf.data.AUTOTUNE)
    val_ds = val_ds.prefetch(buffer_size=tf.data.AUTOTUNE)

    # 3. Training with Callbacks
    model = build_model()
    
    # Stop training if validation loss hasn't improved for 3 epochs
    early_stop = tf.keras.callbacks.EarlyStopping(
        monitor='val_loss', 
        patience=3, 
        restore_best_weights=True
    )

    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=15,  # Increased epochs, but early_stop will prevent overkill
        callbacks=[early_stop]
    )
    
    # 4. Save and Export
    if not os.path.exists('models'):
        os.makedirs('models')
        
    model.save('models/qr_quality_model.keras')
    print("\n✅ Training Complete. Model saved to: models/qr_quality_model.keras")

if __name__ == "__main__":
    train()