import tensorflow as tf
from tensorflow.keras import layers, models
import os

model = models.Sequential([
    layers.Input(shape=(128, 128, 3)),
    layers.Conv2D(32, (3, 3), activation='relu'),
    layers.Flatten(),
    layers.Dense(3, activation='softmax')
])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy')

if not os.path.exists('model'):
    os.makedirs('model')

model.save('model/waste_model.h5')
print("Model 'waste_model.h5' created successfully in the /model folder!")
