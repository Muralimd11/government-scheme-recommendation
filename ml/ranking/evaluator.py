"""
Ranking Evaluation Module
Computes Information Retrieval and Recommendation metrics:
- Precision@K
- Recall@K
- NDCG@K (Normalized Discounted Cumulative Gain)
"""
import math
from typing import List, Set, Any

def precision_at_k(actual_relevant: Set[Any], predicted_ranked: List[Any], k: int = 5) -> float:
    """
    Fraction of top-k recommended items that are truly relevant.
    """
    if k <= 0 or not predicted_ranked:
        return 0.0
    top_k = predicted_ranked[:k]
    hits = sum(1 for item in top_k if item in actual_relevant)
    return hits / float(k)

def recall_at_k(actual_relevant: Set[Any], predicted_ranked: List[Any], k: int = 5) -> float:
    """
    Fraction of truly relevant items successfully captured in top-k recommendations.
    """
    if not actual_relevant:
        return 1.0  # Vacuously true if nothing was relevant
    top_k = predicted_ranked[:k]
    hits = sum(1 for item in top_k if item in actual_relevant)
    return hits / float(len(actual_relevant))

def dcg_at_k(relevance_scores: List[float], k: int = 5) -> float:
    """
    Discounted Cumulative Gain at rank K.
    DCG@K = sum_{i=1}^k (rel_i / log2(i + 1))
    """
    dcg = 0.0
    for i, rel in enumerate(relevance_scores[:k]):
        dcg += (2.0 ** rel - 1.0) / math.log2(i + 2)
    return dcg

def ndcg_at_k(actual_relevant: Set[Any], predicted_ranked: List[Any], k: int = 5) -> float:
    """
    Normalized Discounted Cumulative Gain at rank K.
    """
    if not actual_relevant or not predicted_ranked:
        return 0.0

    # Binary relevance (1 if in actual_relevant, else 0)
    relevance_scores = [1.0 if item in actual_relevant else 0.0 for item in predicted_ranked[:k]]
    actual_dcg = dcg_at_k(relevance_scores, k)

    # Ideal relevance: all 1s up to min(len(actual_relevant), k)
    ideal_scores = [1.0] * min(len(actual_relevant), k)
    ideal_dcg = dcg_at_k(ideal_scores, k)

    if ideal_dcg <= 0.0:
        return 0.0

    return actual_dcg / ideal_dcg

def evaluate_ranker_recommendations(
    test_cases: List[dict],
    ranker_fn,
    k: int = 5
) -> dict:
    """
    Runs ranker_fn on test_cases where each case has:
    - 'farmer': dict
    - 'relevant_schemes': set of scheme_ids
    Returns average Precision@K, Recall@K, and NDCG@K.
    """
    precisions = []
    recalls = []
    ndcgs = []

    for case in test_cases:
        farmer = case["farmer"]
        actual_relevant = set(case["relevant_schemes"])
        if not actual_relevant:
            continue

        predicted_ranked = ranker_fn(farmer)  # List of scheme_ids in descending rank order

        precisions.append(precision_at_k(actual_relevant, predicted_ranked, k))
        recalls.append(recall_at_k(actual_relevant, predicted_ranked, k))
        ndcgs.append(ndcg_at_k(actual_relevant, predicted_ranked, k))

    count = max(1, len(precisions))
    return {
        f"precision@{k}": round(sum(precisions) / count, 4),
        f"recall@{k}": round(sum(recalls) / count, 4),
        f"ndcg@{k}": round(sum(ndcgs) / count, 4),
        "evaluated_queries": len(precisions)
    }
