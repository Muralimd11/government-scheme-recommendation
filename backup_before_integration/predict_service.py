"""
Prediction Service for Farmer Government Scheme Recommendation
Loads pre-trained Random Forest model and produces probability scores for schemes.
"""
import os
import sys
import json
import joblib
import pandas as pd

_model_cache = None

def get_model():
    global _model_cache
    if _model_cache is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, "models", "random_forest_model.joblib")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at: {model_path}")
        _model_cache = joblib.load(model_path)
    return _model_cache

def predict_scheme_probabilities(farmer_data):
    """
    farmer_data: dict containing:
      age, gender, income, landSize, landOwnership,
      cropType, farmingType, district, irrigationType,
      farmerType, socialCategory, livestock, horticulture, machinery
    """
    pipeline = get_model()

    # Normalize defaults with backward compatibility and new structured fields
    has_livestock = (
        str(farmer_data.get("livestock", farmer_data.get("livestockOwnership", "No"))).lower() in ["yes", "true", "1"]
        or farmer_data.get("dairyFarming") == "Yes"
        or farmer_data.get("goatSheepFarming") == "Yes"
        or farmer_data.get("poultryFarming") == "Yes"
        or float(farmer_data.get("cowCount", 0)) > 0
        or float(farmer_data.get("goatCount", 0)) > 0
    )

    has_horticulture = (
        str(farmer_data.get("horticulture", farmer_data.get("horticultureActivity", "No"))).lower() in ["yes", "true", "1"]
        or (farmer_data.get("horticultureType") and farmer_data.get("horticultureType") != "None")
        or float(farmer_data.get("horticultureArea", 0)) > 0
    )

    machinery_list = farmer_data.get("machineryList", [])
    has_machinery = (
        str(farmer_data.get("machinery", farmer_data.get("machineryOwnership", "No"))).lower() in ["yes", "true", "1"]
        or (isinstance(machinery_list, list) and len(machinery_list) > 0)
    )

    land_ownership = farmer_data.get("landOwnership", "Owned")
    if farmer_data.get("landOwnershipType") in ["Leased Land", "Tenant Farmer"]:
        land_ownership = "Leased"
    elif farmer_data.get("landOwnershipType") == "Sharecropper":
        land_ownership = "Shared"

    row = {
        "age": float(farmer_data.get("age", 45)),
        "gender": farmer_data.get("gender", "Male"),
        "income": float(farmer_data.get("income", farmer_data.get("annualIncome", 120000))),
        "landSize": float(farmer_data.get("landSize", 2.0)),
        "landOwnership": land_ownership,
        "cropType": farmer_data.get("cropType", farmer_data.get("primaryCrop", "Paddy")),
        "farmingType": farmer_data.get("farmingType", "Conventional"),
        "district": farmer_data.get("district", "Thanjavur"),
        "irrigationType": farmer_data.get("irrigationType", farmer_data.get("irrigationSource", "Canal")),
        "farmerType": farmer_data.get("farmerType", "Small"),
        "socialCategory": farmer_data.get("socialCategory", "OBC"),
        "livestock": "Yes" if has_livestock else "No",
        "horticulture": "Yes" if has_horticulture else "No",
        "machinery": "Yes" if has_machinery else "No",
    }

    df = pd.DataFrame([row])
    classes = list(pipeline.classes_)
    probabilities = pipeline.predict_proba(df)[0]

    results = []
    for scheme_id, prob in zip(classes, probabilities):
        prob_val = float(prob)
        results.append({
            "schemeId": scheme_id,
            "probability": round(prob_val, 4),
            "confidenceRate": f"{prob_val * 100:.1f}%",
            "confidenceScore": round(prob_val * 100, 1)
        })

    # Sort descending by probability
    results.sort(key=lambda x: x["probability"], reverse=True)
    return results

