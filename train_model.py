import tensorflow as tf
import pandas as pd
from sklearn.model_selection import train_test_split

# Load dataset
df = pd.read_csv("ransomware_dataset.csv")

# Convert labels to numeric (safe = 0, malware = 1)
df["label"] = df["label"].map({"safe": 0, "malware": 1})

# Split data into features (X) and labels (y)
X = df.drop(columns=["label"])
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Build AI model
model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(16, activation="relu", input_shape=(X_train.shape[1],)),
    tf.keras.layers.Dense(8, activation="relu"),
    tf.keras.layers.Dense(1, activation="sigmoid")
])

model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])

# Train the model
model.fit(X_train, y_train, epochs=10, batch_size=16, validation_data=(X_test, y_test))

# Save model
model.save("ransomware_model")
