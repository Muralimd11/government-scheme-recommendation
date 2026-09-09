"""
Model Training Module using Random Forest Classifier
Evaluates Accuracy, Precision, Recall, F1 Score and saves model with Joblib.
"""
import os
import json
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from ml.preprocessing.preprocessor import create_preprocessor, prepare_data

def train_and_save_model():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_dir, "dataset", "farmer_schemes_dataset.csv")
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    print(f"Loading dataset from: {csv_path}")
    X, y = prepare_data(csv_path)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    preprocessor = create_preprocessor()

    rf_classifier = RandomForestClassifier(
        n_estimators=120,
        max_depth=14,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", rf_classifier)
    ])

    print("Training Random Forest Classifier on Farmer Dataset...")
    pipeline.fit(X_train, y_train)

    # Evaluation
    y_pred = pipeline.predict(X_test)
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

    print("\n--- Model Evaluation Results ---")
    print(f"Accuracy : {acc * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall   : {rec * 100:.2f}%")
    print(f"F1 Score : {f1 * 100:.2f}%")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    model_path = os.path.join(models_dir, "random_forest_model.joblib")
    joblib.dump(pipeline, model_path)
    print(f"Trained model saved to: {model_path}")

    # Save metadata
    metadata = {
        "modelName": "RandomForestClassifier",
        "algorithm": "Random Forest Ensemble",
        "trainingSamples": len(X_train),
        "testSamples": len(X_test),
        "classes": list(pipeline.classes_),
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1Score": round(f1, 4)
        },
        "targetState": "Tamil Nadu"
    }

    meta_path = os.path.join(models_dir, "model_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Model metadata saved to: {meta_path}")

    return metadata

if __name__ == "__main__":
    train_and_save_model()
