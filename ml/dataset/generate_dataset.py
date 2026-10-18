"""
Synthetic Dataset Generator for ML Pipeline Testing and Benchmarking
IMPORTANT DISCLAIMER:
This module generates synthetic data explicitly for pipeline verification, algorithm testing,
and development benchmarking. It does NOT represent real-world farmer interaction records or
ground-truth official application data. Real-world evaluation should ingest verified historical
farmer-scheme applications.
"""
import os
import sys
import random
import json
import pandas as pd
import numpy as np

# Ensure project root is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from ml.catalogue.catalogue_loader import load_excel_catalogue
from ml.eligibility.eligibility_engine import evaluate_scheme_eligibility
from ml.ranking.baseline_ranker import calculate_baseline_relevance

random.seed(42)
np.random.seed(42)

TN_DISTRICTS = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
    "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
    "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
    "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
    "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
    "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
    "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
    "Vellore", "Viluppuram", "Virudhunagar"
]

CROPS = [
    "Paddy", "Sugarcane", "Banana", "Cotton", "Groundnut",
    "Millets", "Vegetables", "Flowers", "Coconut", "Pulses",
    "Turmeric", "Maize", "Tea", "Coffee", "Pepper"
]

IRRIGATION_SOURCES = ["Canal", "Borewell", "Open Well", "Drip", "Sprinkler", "Rainfed"]
FARMER_TYPES = ["Marginal", "Small", "Medium", "Large"]
SOCIAL_CATEGORIES = ["General", "OBC", "MBC", "SC", "ST"]
LAND_OWNERSHIPS = ["Owned", "Leased", "Shared"]
FARMING_TYPES = ["Conventional", "Organic", "Integrated", "Natural"]

ASSISTANCE_AREAS = [
    "Drip Irrigation", "Organic Seeds", "Tractor Subsidy",
    "Solar Pump", "Crop Insurance", "Dairy Farming", "Horticulture", "Soil Health"
]

def generate_synthetic_benchmark(n_samples: int = 1500, catalogue_schemes: list = None) -> pd.DataFrame:
    """
    Generates synthetic farmer benchmark records annotated with Stage A verified eligibility
    and Stage B baseline ranking targets.
    """
    if catalogue_schemes is None:
        # Load directly from Excel catalogue
        excel_path = os.path.join(project_root, "Farmers_Schemes_34_Columns.xlsx")
        from ml.catalogue.catalogue_loader import transform_record_for_mongo
        raw_df, _ = load_excel_catalogue(excel_path)
        catalogue_schemes = [transform_record_for_mongo(row) for _, row in raw_df.iterrows()]

    records = []

    for idx in range(n_samples):
        age = int(np.random.normal(48, 12))
        age = max(18, min(80, age))

        farmer_type = random.choices(FARMER_TYPES, weights=[0.42, 0.35, 0.16, 0.07])[0]

        if farmer_type == "Marginal":
            land_size = round(random.uniform(0.2, 2.4), 2)
            income = int(random.uniform(30000, 160000))
        elif farmer_type == "Small":
            land_size = round(random.uniform(2.5, 4.9), 2)
            income = int(random.uniform(80000, 250000))
        elif farmer_type == "Medium":
            land_size = round(random.uniform(5.0, 9.9), 2)
            income = int(random.uniform(180000, 480000))
        else:
            land_size = round(random.uniform(10.0, 25.0), 2)
            income = int(random.uniform(350000, 950000))

        district = random.choice(TN_DISTRICTS)
        crop = random.choice(CROPS)
        irrigation = random.choice(IRRIGATION_SOURCES)
        social = random.choices(SOCIAL_CATEGORIES, weights=[0.10, 0.45, 0.25, 0.18, 0.02])[0]
        gender = random.choices(["Male", "Female"], weights=[0.72, 0.28])[0]
        land_ownership = random.choices(LAND_OWNERSHIPS, weights=[0.80, 0.15, 0.05])[0]
        farming_type = random.choices(FARMING_TYPES, weights=[0.65, 0.15, 0.15, 0.05])[0]

        livestock = "Yes" if random.random() < 0.45 else "No"
        cow_count = random.randint(1, 5) if livestock == "Yes" else 0
        horticulture = "Yes" if crop in ["Vegetables", "Flowers", "Banana", "Coconut"] or random.random() < 0.25 else "No"
        machinery = "Yes" if land_size > 3.0 and random.random() < 0.55 else ("Yes" if random.random() < 0.20 else "No")
        solar_interest = random.random() < 0.30

        assistance = random.sample(ASSISTANCE_AREAS, k=random.randint(1, 2))

        farmer_dict = {
            "age": age,
            "gender": gender,
            "income": income,
            "annualIncome": income,
            "landSize": land_size,
            "landOwnership": land_ownership,
            "cropType": crop,
            "farmingType": farming_type,
            "district": district,
            "irrigationType": irrigation,
            "farmerType": farmer_type,
            "socialCategory": social,
            "livestock": livestock,
            "cowCount": cow_count,
            "horticulture": horticulture,
            "machinery": machinery,
            "solarPumpInterest": solar_interest,
            "assistanceRequired": assistance
        }

        # Stage A: Find eligible candidates among catalogue
        eligible_candidates = []
        for scheme in catalogue_schemes:
            is_elig, status, reasons, inelig_reason = evaluate_scheme_eligibility(scheme, farmer_dict)
            if is_elig:
                rel_score = calculate_baseline_relevance(farmer_dict, scheme)
                eligible_candidates.append({
                    "schemeId": scheme["schemeId"],
                    "relevance": rel_score
                })

        if eligible_candidates:
            # Sort by relevance descending
            eligible_candidates.sort(key=lambda x: x["relevance"], reverse=True)
            primary_scheme = eligible_candidates[0]["schemeId"]
            top_schemes = [c["schemeId"] for c in eligible_candidates[:5]]
        else:
            primary_scheme = "kvyoj"
            top_schemes = ["kvyoj"]

        row = {
            "age": age,
            "gender": gender,
            "income": income,
            "landSize": land_size,
            "landOwnership": land_ownership,
            "cropType": crop,
            "farmingType": farming_type,
            "district": district,
            "irrigationType": irrigation,
            "farmerType": farmer_type,
            "socialCategory": social,
            "livestock": livestock,
            "horticulture": horticulture,
            "machinery": machinery,
            "schemeId": primary_scheme,
            "top5TargetSchemes": json.dumps(top_schemes),
            "isSynthetic": True
        }
        records.append(row)

    df = pd.DataFrame(records)
    return df

def main():
    print("[Synthetic Generator] Generating benchmark dataset for pipeline validation...")
    df = generate_synthetic_benchmark(n_samples=1800)

    dataset_dir = os.path.join(project_root, "ml", "dataset")
    os.makedirs(dataset_dir, exist_ok=True)

    # Save dedicated synthetic benchmark file
    benchmark_path = os.path.join(dataset_dir, "synthetic_farmer_benchmark.csv")
    df.to_csv(benchmark_path, index=False)
    print(f"[Synthetic Generator] Saved {len(df)} synthetic benchmark samples to: {benchmark_path}")

    # Also update farmer_schemes_dataset.csv for backward compatibility
    legacy_path = os.path.join(dataset_dir, "farmer_schemes_dataset.csv")
    df.to_csv(legacy_path, index=False)
    print(f"[Synthetic Generator] Updated legacy dataset path: {legacy_path}")
    print(f"[Synthetic Generator] Unique schemes represented: {df['schemeId'].nunique()}")

if __name__ == "__main__":
    main()
