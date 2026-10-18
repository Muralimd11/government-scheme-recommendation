"""
Model Training and Comparative Ranking Evaluation Module
Features:
- Robust scaling and imputation preprocessing pipeline.
- Calibrated Random Forest Classifier for probabilistic scheme scores.
- Comparative evaluation: ML Ranker vs Transparent Rule-Based Baseline.
- Information Retrieval Metrics: Precision@5, Recall@5, NDCG@5.
- Complete metadata export with explicit data provenance tracking (synthetic vs reviewed).
"""
import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    top_k_accuracy_score
)

# Ensure project root is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from ml.preprocessing.preprocessor import create_preprocessor, NUMERICAL_FEATURES, CATEGORICAL_FEATURES
from ml.ranking.baseline_ranker import calculate_baseline_relevance
from ml.ranking.evaluator import precision_at_k, recall_at_k, ndcg_at_k
from ml.catalogue.catalogue_loader import load_excel_catalogue, transform_record_for_mongo

def train_and_evaluate(dataset_path: str = None) -> dict:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    if dataset_path is None:
        reviewed_path = os.path.join(base_dir, "dataset", "farmer_reviewed_labels.csv")
        benchmark_path = os.path.join(base_dir, "dataset", "synthetic_farmer_benchmark.csv")
        legacy_path = os.path.join(base_dir, "dataset", "farmer_schemes_dataset.csv")

        if os.path.exists(reviewed_path):
            dataset_path = reviewed_path
            is_synthetic = False
        elif os.path.exists(benchmark_path):
            dataset_path = benchmark_path
            is_synthetic = True
        else:
            dataset_path = legacy_path
            is_synthetic = True
    else:
        is_synthetic = "synthetic" in dataset_path.lower()

    print(f"\n================ MODEL TRAINING & BENCHMARKING ================")
    print(f"Dataset path       : {dataset_path}")
    print(f"Data provenance    : {'SYNTHETIC PIPELINE BENCHMARK (For algorithm testing)' if is_synthetic else 'REVIEWED FARMER-SCHEME LABELS'}")

    df = pd.read_csv(dataset_path)
    X = df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES].copy()
    y = df["schemeId"].astype(str)

    # Train-test split (80-20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    print(f"Training samples   : {len(X_train)}")
    print(f"Test samples       : {len(X_test)}")
    print(f"Target classes     : {y.nunique()} schemes represented")

    preprocessor = create_preprocessor()

    base_rf = RandomForestClassifier(
        n_estimators=160,
        max_depth=16,
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

    print("Fitting model and calibrating probabilities (Platt Scaling)...")
    try:
        calibrated_model = CalibratedClassifierCV(estimator=base_pipeline, method="sigmoid", cv=3)
    except TypeError:
        calibrated_model = CalibratedClassifierCV(base_estimator=base_pipeline, method="sigmoid", cv=3)

    calibrated_model.fit(X_train, y_train)

    classes = list(calibrated_model.classes_)
    y_pred = calibrated_model.predict(X_test)
    y_probs = calibrated_model.predict_proba(X_test)

    # Standard Classification Metrics
    acc = float(accuracy_score(y_test, y_pred))
    top3_acc = float(top_k_accuracy_score(y_test, y_probs, k=min(3, len(classes)), labels=classes))
    top5_acc = float(top_k_accuracy_score(y_test, y_probs, k=min(5, len(classes)), labels=classes))
    prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1_w = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
    f1_m = float(f1_score(y_test, y_pred, average="macro", zero_division=0))

    # Load catalogue for Baseline Comparison and IR Metrics
    excel_path = os.path.join(project_root, "Farmers_Schemes_34_Columns.xlsx")
    raw_cat, _ = load_excel_catalogue(excel_path)
    catalogue_list = [transform_record_for_mongo(row) for _, row in raw_cat.iterrows()]

    print("\nEvaluating Information Retrieval Ranking Metrics (Precision@5, Recall@5, NDCG@5)...")
    ml_p5, ml_r5, ml_ndcg5 = [], [], []
    base_p5, base_r5, base_ndcg5 = [], [], []

    test_indices = X_test.index
    for idx_pos, row_idx in enumerate(test_indices):
        true_primary = y_test.iloc[idx_pos]
        # Multi-label ground truth if available in dataset
        if "top5TargetSchemes" in df.columns and pd.notna(df["top5TargetSchemes"].iloc[row_idx]):
            try:
                relevant_set = set(json.loads(df["top5TargetSchemes"].iloc[row_idx]))
            except Exception:
                relevant_set = {true_primary}
        else:
            relevant_set = {true_primary}

        # 1. ML Ranking on this test farmer
        probs = y_probs[idx_pos]
        ml_ranked = [cls for _, cls in sorted(zip(probs, classes), reverse=True)]

        ml_p5.append(precision_at_k(relevant_set, ml_ranked, k=5))
        ml_r5.append(recall_at_k(relevant_set, ml_ranked, k=5))
        ml_ndcg5.append(ndcg_at_k(relevant_set, ml_ranked, k=5))

        # 2. Rule-Based Baseline Ranking on this test farmer
        farmer_data = X_test.iloc[idx_pos].to_dict()
        base_scores = []
        for s in catalogue_list:
            score = calculate_baseline_relevance(farmer_data, s)
            base_scores.append((s["schemeId"], score))
        base_scores.sort(key=lambda x: x[1], reverse=True)
        base_ranked = [s[0] for s in base_scores]

        base_p5.append(precision_at_k(relevant_set, base_ranked, k=5))
        base_r5.append(recall_at_k(relevant_set, base_ranked, k=5))
        base_ndcg5.append(ndcg_at_k(relevant_set, base_ranked, k=5))

    n_queries = max(1, len(test_indices))
    ml_metrics = {
        "precision@5": round(float(np.mean(ml_p5)), 4),
        "recall@5": round(float(np.mean(ml_r5)), 4),
        "ndcg@5": round(float(np.mean(ml_ndcg5)), 4)
    }
    baseline_metrics = {
        "precision@5": round(float(np.mean(base_p5)), 4),
        "recall@5": round(float(np.mean(base_r5)), 4),
        "ndcg@5": round(float(np.mean(base_ndcg5)), 4)
    }

    print("\n---------------- RANKING COMPARISON RESULTS ----------------")
    print(f"Metric        | Calibrated ML Model | Rule-Based Baseline")
    print(f"------------- | ------------------- | -------------------")
    print(f"Precision@5   | {ml_metrics['precision@5']:.4f}              | {baseline_metrics['precision@5']:.4f}")
    print(f"Recall@5      | {ml_metrics['recall@5']:.4f}              | {baseline_metrics['recall@5']:.4f}")
    print(f"NDCG@5        | {ml_metrics['ndcg@5']:.4f}              | {baseline_metrics['ndcg@5']:.4f}")
    print("------------------------------------------------------------")
    print(f"Top-1 Accuracy          : {acc * 100:.2f}%")
    print(f"Top-3 Multi-Scheme Acc  : {top3_acc * 100:.2f}%")
    print(f"Top-5 Multi-Scheme Acc  : {top5_acc * 100:.2f}%")
    print(f"Weighted F1 Score       : {f1_w * 100:.2f}%")
    print("============================================================\n")

    # Persist model artifact
    model_path = os.path.join(models_dir, "random_forest_model.joblib")
    joblib.dump(calibrated_model, model_path)
    print(f"[Model Saved] Saved trained pipeline to: {model_path}")

    # Export comprehensive metadata
    metadata = {
        "modelName": "CalibratedRandomForestClassifier",
        "algorithm": "Random Forest Ensemble with Sigmoid Platt Calibration",
        "dataset": {
            "sourcePath": os.path.basename(dataset_path),
            "isSynthetic": is_synthetic,
            "disclaimer": (
                "Trained on synthetic pipeline benchmark data for algorithm verification. "
                "The 227-scheme catalogue describes scheme rules; it does not by itself constitute "
                "a supervised historical interaction dataset. Supervised production accuracy should "
                "be verified against officially reviewed farmer application histories."
                if is_synthetic else "Trained on reviewed farmer-scheme application records."
            ),
            "trainingSamples": len(X_train),
            "testSamples": len(X_test)
        },
        "classes": classes,
        "standardClassificationMetrics": {
            "top1Accuracy": round(acc, 4),
            "top3Accuracy": round(top3_acc, 4),
            "top5Accuracy": round(top5_acc, 4),
            "precisionWeighted": round(prec, 4),
            "recallWeighted": round(rec, 4),
            "f1ScoreWeighted": round(f1_w, 4),
            "f1ScoreMacro": round(f1_m, 4)
        },
        "rankingEvaluation": {
            "evaluatedQueries": n_queries,
            "mlModel": ml_metrics,
            "baselineRuleRanker": baseline_metrics,
            "deltaNDCG@5": round(ml_metrics["ndcg@5"] - baseline_metrics["ndcg@5"], 4)
        },
        "targetJurisdiction": "Tamil Nadu"
    }

    meta_path = os.path.join(models_dir, "model_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[Metadata Saved] Exported model metadata to: {meta_path}")

    return metadata

if __name__ == "__main__":
    train_and_evaluate()
