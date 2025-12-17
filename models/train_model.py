import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import os

# === Load dataset ===
df = pd.read_csv('Crop_recommendation.csv')

# === Features and target ===
X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
y = df['label']

# === Encode target labels ===
unique_labels = sorted(y.unique())
targets = {idx: label for idx, label in enumerate(unique_labels)}
reverse_targets = {label: idx for idx, label in enumerate(unique_labels)}
y_encoded = y.map(reverse_targets)

# === Split data ===
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42)

# === Scale features ===
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# === Train model ===
clf = RandomForestClassifier(random_state=42)
clf.fit(X_train_scaled, y_train)

# === Print accuracy ===
print("✅ RF Accuracy on training set:", round(clf.score(X_train_scaled, y_train), 2))
print("✅ RF Accuracy on test set:", round(clf.score(X_test_scaled, y_test), 2))

# === Save model, scaler, and targets ===
model_dir = '/home/mittie/Desktop/crop_recommendation/models'
os.makedirs(model_dir, exist_ok=True)

joblib.dump(clf, os.path.join(model_dir, 'random_forest.pkl'))
joblib.dump(scaler, os.path.join(model_dir, 'scaler.pkl'))
joblib.dump(targets, os.path.join(model_dir, 'targets.pkl'))
