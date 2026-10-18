"""
Production Prediction Service for Farmer Government Scheme Recommendation
Features:
- Validates farmer profile inputs.
- Fetches active scheme records from MongoDB as the primary source of truth.
- Executes Stage A verified eligibility filtering (respecting unknown criteria).
- Evaluates Stage B ranking using trained ML model when available.
- Seamlessly falls back to transparent Rule-Based Baseline Ranker if model unavailable.
- Maps scores back to MongoDB scheme documents.
- Returns top 5 recommendations with benefits, URLs, required documents, verification status, and match score.
"""
import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Tuple

# Ensure project root is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from ml.eligibility.eligibility_engine import evaluate_scheme_eligibility
from ml.ranking.baseline_ranker import calculate_baseline_relevance

_model_cache = None
_model_failed = False

def get_trained_model():
    """Loads and caches pre-trained model. Returns None if unavailable."""
    global _model_cache, _model_failed
    if _model_failed:
        return None
    if _model_cache is None:
        model_path = os.path.join(project_root, "ml", "models", "random_forest_model.joblib")
        if not os.path.exists(model_path):
            return None
        try:
            _model_cache = joblib.load(model_path)
        except Exception as e:
            print(f"[Warning] Failed to load ML model from {model_path}: {e}", file=sys.stderr)
            _model_failed = True
            return None
    return _model_cache

def fetch_schemes_from_mongodb() -> List[Dict[str, Any]]:
    """
    Fetches active scheme records from MongoDB.
    Falls back to local validated catalogue JSON if MongoDB connection fails.
    """
    schemes = []
    mongo_uri = os.environ.get("MONGO_URI")

    # Try reading from .env if not in environment
    if not mongo_uri:
        env_file = os.path.join(project_root, ".env")
        if os.path.exists(env_file):
            with open(env_file, "r") as f:
                for line in f:
                    if line.strip().startswith("MONGO_URI="):
                        mongo_uri = line.strip().split("=", 1)[1].strip().strip('"').strip("'")
                        break

    if mongo_uri:
        try:
            from pymongo import MongoClient
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
            db = client["test"]
            coll = db["schemes"]
            cursor = coll.find({"status": {"$ne": "DISABLED"}})
            schemes = list(cursor)
            client.close()
            if schemes:
                return schemes
        except Exception as e:
            print(f"[Warning] Could not fetch schemes from MongoDB ({e}). Falling back to local validated catalogue snapshot.", file=sys.stderr)

    # Fallback to local validated catalogue snapshot
    json_path = os.path.join(project_root, "ml", "catalogue", "validated_schemes.json")
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            schemes = json.load(f)
            return schemes

    # Fallback to loading Excel catalogue directly
    excel_path = os.path.join(project_root, "Farmers_Schemes_34_Columns.xlsx")
    if os.path.exists(excel_path):
        from ml.catalogue.catalogue_loader import load_excel_catalogue, transform_record_for_mongo
        raw_df, _ = load_excel_catalogue(excel_path)
        schemes = [transform_record_for_mongo(row) for _, row in raw_df.iterrows()]
        return schemes

    return []

def validate_farmer_profile(farmer: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Validates farmer profile inputs. Returns normalized profile and any validation warnings.
    """
    warnings = []
    if not isinstance(farmer, dict):
        raise ValueError("Farmer profile must be a valid JSON dictionary.")

    # Validate or impute age
    raw_age = farmer.get("age")
    try:
        age = float(raw_age) if raw_age is not None else 45.0
        if age < 10 or age > 120:
            warnings.append(f"Age {age} is outside usual range; clamped to 18-100.")
            age = max(18.0, min(100.0, age))
    except (ValueError, TypeError):
        warnings.append("Invalid or missing age; defaulted to 45.")
        age = 45.0

    # Validate or impute income
    raw_inc = farmer.get("income", farmer.get("annualIncome"))
    try:
        income = float(raw_inc) if raw_inc is not None else 120000.0
        if income < 0:
            income = 0.0
    except (ValueError, TypeError):
        warnings.append("Invalid or missing income; defaulted to ₹1,20,000.")
        income = 120000.0

    # Validate or impute land size
    raw_land = farmer.get("landSize")
    try:
        land = float(raw_land) if raw_land is not None else 2.0
        if land < 0:
            land = 0.0
    except (ValueError, TypeError):
        warnings.append("Invalid or missing land size; defaulted to 2.0 acres.")
        land = 2.0

    normalized = {
        "age": age,
        "gender": str(farmer.get("gender", "Male")).capitalize(),
        "income": income,
        "annualIncome": income,
        "landSize": land,
        "landOwnership": farmer.get("landOwnership", "Owned"),
        "cropType": farmer.get("cropType", farmer.get("primaryCrop", "Paddy")),
        "farmingType": farmer.get("farmingType", "Conventional"),
        "district": str(farmer.get("district", "Thanjavur")).strip(),
        "irrigationType": farmer.get("irrigationType", farmer.get("irrigationSource", "Canal")),
        "farmerType": farmer.get("farmerType", "Marginal" if land <= 2.5 else "Small" if land <= 5.0 else "Medium"),
        "socialCategory": farmer.get("socialCategory", "OBC"),
        "livestock": "Yes" if str(farmer.get("livestock", farmer.get("livestockOwnership", "No"))).lower() in ["yes", "true", "1"] else "No",
        "cowCount": float(farmer.get("cowCount", 0)),
        "horticulture": "Yes" if str(farmer.get("horticulture", farmer.get("horticultureActivity", "No"))).lower() in ["yes", "true", "1"] else "No",
        "machinery": "Yes" if str(farmer.get("machinery", farmer.get("machineryOwnership", "No"))).lower() in ["yes", "true", "1"] else "No",
        "solarPumpInterest": bool(farmer.get("solarPumpInterest")),
        "assistanceRequired": farmer.get("assistanceRequired", [])
    }

    return normalized, warnings

def recommend_schemes_for_farmer(
    farmer_profile: Dict[str, Any],
    top_k: int = 5,
    custom_schemes: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    End-to-end recommendation function:
    1. Validates profile.
    2. Fetches schemes from MongoDB.
    3. Evaluates Stage A verified eligibility rules.
    4. Evaluates Stage B ranking using ML model (or Rule-Based Baseline fallback).
    5. Returns top 5 recommendations with full details.
    """
    farmer, validation_warnings = validate_farmer_profile(farmer_profile)

    # Step 2: Schemes from MongoDB (source of truth)
    all_schemes = custom_schemes if custom_schemes is not None else fetch_schemes_from_mongodb()

    if not all_schemes:
        return {
            "success": True,
            "totalEligible": 0,
            "recommendations": [],
            "message": "Scheme catalogue is empty. No candidate schemes available for evaluation."
        }

    # Step 3: Stage A Eligibility Filtering
    eligible_candidates = []
    ineligible_candidates = []

    for scheme in all_schemes:
        is_elig, status, reasons, inelig_reason = evaluate_scheme_eligibility(scheme, farmer)
        if is_elig:
            eligible_candidates.append({
                "scheme": scheme,
                "eligibilityStatus": status,
                "reasons": reasons
            })
        else:
            ineligible_candidates.append({
                "scheme": scheme,
                "eligibilityStatus": "Not Eligible",
                "ineligibleReason": inelig_reason or "Does not satisfy scheme eligibility criteria."
            })

    # Step 4: Stage B Ranking
    ml_model = get_trained_model()
    ranking_method = "Trained Calibrated ML Model (Random Forest)" if ml_model is not None else "Documented Rule-Based Baseline Ranker"
    ml_probabilities = {}

    if ml_model is not None:
        try:
            row_df = pd.DataFrame([{
                "age": farmer["age"],
                "gender": farmer["gender"],
                "income": farmer["income"],
                "landSize": farmer["landSize"],
                "landOwnership": farmer["landOwnership"],
                "cropType": farmer["cropType"],
                "farmingType": farmer["farmingType"],
                "district": farmer["district"],
                "irrigationType": farmer["irrigationType"],
                "farmerType": farmer["farmerType"],
                "socialCategory": farmer["socialCategory"],
                "livestock": farmer["livestock"],
                "horticulture": farmer["horticulture"],
                "machinery": farmer["machinery"]
            }])
            classes = list(ml_model.classes_)
            probs = ml_model.predict_proba(row_df)[0]
            for cls, pr in zip(classes, probs):
                ml_probabilities[str(cls)] = float(pr)
        except Exception as e:
            print(f"[Warning] ML model scoring error ({e}). Using rule-based baseline ranker.", file=sys.stderr)
            ranking_method = "Documented Rule-Based Baseline Ranker (ML Fallback)"
            ml_model = None

    # Step 5: Score each eligible candidate
    scored_recommendations = []
    max_prob = max(ml_probabilities.values()) if ml_probabilities else 0.05

    for item in eligible_candidates:
        scheme = item["scheme"]
        sid = scheme.get("schemeId") or str(scheme.get("_id", ""))
        legacy_id = scheme.get("legacySchemeId")
        aliases = scheme.get("aliases") or []
        rule_reasons = item["reasons"]

        matched_prob = None
        if ml_model is not None:
            if sid in ml_probabilities:
                matched_prob = ml_probabilities[sid]
            elif legacy_id and legacy_id in ml_probabilities:
                matched_prob = ml_probabilities[legacy_id]
            else:
                for a in aliases:
                    if a in ml_probabilities:
                        matched_prob = ml_probabilities[a]
                        break

        if matched_prob is not None:
            prob = matched_prob
            norm_prob = prob / max_prob if max_prob > 0 else 0.5
            match_score = min(99, int(round(70 + (norm_prob * 20) + min(6, len(rule_reasons) * 1.5))))
            confidence_rate = f"{prob * 100:.1f}%"
        else:
            # Baseline Rule Ranker Score
            base_rel = calculate_baseline_relevance(farmer, scheme)
            match_score = min(99, int(round(base_rel * 100)))
            confidence_rate = f"{match_score}%"

        # Verification status check
        status_tag = scheme.get("schemeStatus") or scheme.get("scheme_status")
        verif_tag = scheme.get("verificationStatus") or scheme.get("verification_status")
        is_unverified = (
            status_tag == "Requires verification"
            or "not independently verified" in str(verif_tag).lower()
            or scheme.get("isDemonstrationData") is True
        )

        why_rec = list(rule_reasons)
        if is_unverified:
            why_rec.append("Verification Flag: Source scheme record requires official departmental verification before formal disbursement")

        scored_recommendations.append({
            "schemeId": sid,
            "schemeName": scheme.get("schemeName") or "Government Scheme",
            "governmentLevel": scheme.get("governmentLevel") or "Tamil Nadu Government",
            "department": scheme.get("department") or "Department of Agriculture",
            "category": scheme.get("category") or "Agricultural Welfare",
            "matchScore": match_score,
            "isEligible": True,
            "eligibilityStatus": item["eligibilityStatus"],
            "verificationStatus": verif_tag or ("Requires verification" if is_unverified else "Verified"),
            "whyRecommended": why_rec,
            "benefits": scheme.get("benefits") or scheme.get("description") or "Subsidies and financial assistance under state norms.",
            "officialWebsite": scheme.get("officialWebsite") or scheme.get("official_url") or "https://tnagrisnet.tn.gov.in",
            "applicationUrl": scheme.get("applicationUrl") or scheme.get("application_url") or "",
            "requiredDocuments": scheme.get("requiredDocuments") if isinstance(scheme.get("requiredDocuments"), list) and scheme.get("requiredDocuments") else ["Aadhaar Card", "Patta / Chitta", "Bank Passbook"],
            "applicationDeadline": scheme.get("applicationDeadline") or "Ongoing / Per Financial Year",
            "isDemonstrationData": bool(scheme.get("isDemonstrationData", False))
        })

    # Sort descending by match score
    scored_recommendations.sort(key=lambda x: x["matchScore"], reverse=True)

    # Return top K
    top_recommendations = scored_recommendations[:top_k]

    return {
        "success": True,
        "rankingMethod": ranking_method,
        "totalEligible": len(scored_recommendations),
        "totalEvaluated": len(all_schemes),
        "topRecommendationsCount": len(top_recommendations),
        "recommendations": top_recommendations,
        "allEligibleCount": len(scored_recommendations),
        "validationWarnings": validation_warnings
    }
