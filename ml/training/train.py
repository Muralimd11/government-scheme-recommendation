"""
Model Training Module using Calibrated Random Forest Classifier.
Features:
- Robust scaling and imputation preprocessing pipeline.
- Random Forest Ensemble with balanced class weights.
- CalibratedClassifierCV (Sigmoid / Platt scaling) for true confidence probabilities.
- Multi-metric evaluation: Top-1, Top-3, Top-5 Accuracy, Log-Loss, Macro & Weighted F1.
- Joblib model persistence & detailed metadata export.
"""
import os
import json
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    top_k_accuracy_score,
    log_loss
)
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

    base_rf = RandomForestClassifier(
        n_estimators=150,
        max_depth=14,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )

    base_pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", base_rf)
    ])

    print("Training and Calibrating Random Forest (5-Fold Sigmoid Platt Scaling)...")
    try:
        calibrated_model = CalibratedClassifierCV(estimator=base_pipeline, method="sigmoid", cv=5)
    except TypeError:
        # Backward compatibility for scikit-learn < 1.2
        calibrated_model = CalibratedClassifierCV(base_estimator=base_pipeline, method="sigmoid", cv=5)

    calibrated_model.fit(X_train, y_train)

    # Evaluation
    classes = list(calibrated_model.classes_)
    y_pred = calibrated_model.predict(X_test)
    y_probs = calibrated_model.predict_proba(X_test)

    acc = float(accuracy_score(y_test, y_pred))
    top3_acc = float(top_k_accuracy_score(y_test, y_probs, k=min(3, len(classes)), labels=classes))
    top5_acc = float(top_k_accuracy_score(y_test, y_probs, k=min(5, len(classes)), labels=classes))
    prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1_weighted = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
    f1_macro = float(f1_score(y_test, y_pred, average="macro", zero_division=0))

    try:
        loss = float(log_loss(y_test, y_probs, labels=classes))
    except Exception:
        loss = None

    print("\n================ Model Evaluation Results ================")
    print(f"Top-1 Primary Accuracy    : {acc * 100:.2f}%")
    print(f"Top-3 Multi-Scheme Acc    : {top3_acc * 100:.2f}%")
    print(f"Top-5 Multi-Scheme Acc    : {top5_acc * 100:.2f}%")
    print(f"Weighted Precision        : {prec * 100:.2f}%")
    print(f"Weighted Recall           : {rec * 100:.2f}%")
    print(f"Weighted F1 Score         : {f1_weighted * 100:.2f}%")
    print(f"Macro F1 Score            : {f1_macro * 100:.2f}%")
    if loss is not None:
        print(f"Calibrated Log-Loss       : {loss:.4f}")
    print("=========================================================\n")

    print("Detailed Classification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    model_path = os.path.join(models_dir, "random_forest_model.joblib")
    joblib.dump(calibrated_model, model_path)
    print(f"Trained calibrated model saved to: {model_path}")

    # Save comprehensive metadata
    metadata = {
        "modelName": "CalibratedRandomForestClassifier",
        "algorithm": "Random Forest Ensemble with Platt Sigmoid Probability Calibration",
        "calibrationMethod": "sigmoid",
        "crossValidationFolds": 5,
        "trainingSamples": len(X_train),
        "testSamples": len(X_test),
        "classes": classes,
        "metrics": {
            "top1Accuracy": round(acc, 4),
            "top3Accuracy": round(top3_acc, 4),
            "top5Accuracy": round(top5_acc, 4),
            "precisionWeighted": round(prec, 4),
            "recallWeighted": round(rec, 4),
            "f1ScoreWeighted": round(f1_weighted, 4),
            "f1ScoreMacro": round(f1_macro, 4),
            "logLoss": round(loss, 4) if loss is not None else None
        },
        "targetState": "Tamil Nadu",
        "notes": "Probability scores are calibrated empirical posteriors suitable for direct confidence percentage display."
    }

    meta_path = os.path.join(models_dir, "model_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Model metadata saved to: {meta_path}")

    return metadata

if __name__ == "__main__":
    train_and_save_model()

