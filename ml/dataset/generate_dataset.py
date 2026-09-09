"""
Synthetic Dataset Generator for Tamil Nadu Farmer Scheme Recommendation
Generates training data reflecting real agricultural conditions and eligibility rules in Tamil Nadu.
"""
import os
import random
import pandas as pd
import numpy as np

random.seed(42)
np.random.seed(42)

DISTRICTS = [
    "Thanjavur", "Tiruvarur", "Nagapattinam", "Mayiladuthurai", "Madurai",
    "Tiruchirappalli", "Salem", "Coimbatore", "Erode", "Tirunelveli",
    "Dindigul", "Theni", "Cuddalore", "Villupuram", "Vellore",
    "Dharmapuri", "Krishnagiri", "Pudukkottai", "Ramanathapuram", "Sivaganga"
]

CROP_TYPES = [
    "Paddy", "Sugarcane", "Banana", "Cotton", "Groundnut",
    "Millets", "Vegetables", "Flowers", "Coconut", "Pulses"
]

IRRIGATION_TYPES = [
    "Canal", "Borewell", "Open Well", "Drip", "Sprinkler", "Rainfed"
]

FARMER_TYPES = ["Marginal", "Small", "Medium", "Large"]
SOCIAL_CATEGORIES = ["General", "OBC", "MBC", "SC", "ST"]

SCHEMES = [
    "TN-SCH-01",  # PM-KISAN (Central) - Small/Marginal farmers, income <= 250000, land <= 5 acres
    "TN-SCH-02",  # Tamil Nadu Free Electricity for Agriculture (Pumpsets/Wells)
    "TN-SCH-03",  # Tamil Nadu Micro Irrigation Scheme (Per Drop More Crop - Drip/Sprinkler)
    "TN-SCH-04",  # Kalaignarin All Village Integrated Agriculture Development Programme (KAVIADP)
    "TN-SCH-05",  # Kuruvai Special Package Scheme (Cauvery Delta: Thanjavur, Tiruvarur, Nagapattinam, etc., Paddy)
    "TN-SCH-06",  # Agricultural Mechanization Scheme (Subsidies on Tractors, Tillers)
    "TN-SCH-07",  # National Horticulture Mission Tamil Nadu (Fruits, Vegetables, Flowers)
    "TN-SCH-08",  # PM Fasal Bima Yojana (Crop Insurance TN)
    "TN-SCH-09",  # Chief Minister Solar Powered Pump Sets Scheme TN (Off-grid solar pumps)
    "TN-SCH-10",  # Sub-Mission on Agroforestry & Tree Cultivation (Private Lands)
    "TN-SCH-11",  # Dairy Cattle & Livestock Development Scheme for TN Small Farmers
    "TN-SCH-12",  # Soil Health Card & Organic Farming Promotion Scheme
]

def determine_primary_scheme(row):
    # Determine the most optimal scheme based on characteristics
    district = row["district"]
    crop = row["cropType"]
    irrigation = row["irrigationType"]
    farmer_type = row["farmerType"]
    income = row["income"]
    land_size = row["landSize"]
    social = row["socialCategory"]
    livestock = row["livestock"]
    horticulture = row["horticulture"]
    machinery = row["machinery"]

    # Kuruvai Delta package
    if district in ["Thanjavur", "Tiruvarur", "Nagapattinam", "Mayiladuthurai", "Cuddalore"] and crop == "Paddy":
        if random.random() < 0.40:
            return "TN-SCH-05"

    # Micro Irrigation
    if irrigation in ["Drip", "Sprinkler", "Borewell"] and (horticulture == "Yes" or crop in ["Vegetables", "Flowers", "Banana", "Sugarcane"]):
        if random.random() < 0.45:
            return "TN-SCH-03"

    # Solar Pump Scheme
    if irrigation in ["Borewell", "Open Well"] and farmer_type in ["Marginal", "Small"] and random.random() < 0.35:
        return "TN-SCH-09"

    # Horticulture Mission
    if horticulture == "Yes" or crop in ["Vegetables", "Flowers", "Banana", "Coconut"]:
        if random.random() < 0.50:
            return "TN-SCH-07"

    # Dairy / Livestock
    if livestock == "Yes" and farmer_type in ["Marginal", "Small"] and random.random() < 0.50:
        return "TN-SCH-11"

    # Agricultural Mechanization
    if machinery == "Yes" or land_size >= 2.5:
        if random.random() < 0.40:
            return "TN-SCH-06"

    # Free Electricity
    if irrigation in ["Borewell", "Open Well", "Canal"]:
        if random.random() < 0.40:
            return "TN-SCH-02"

    # KAVIADP (State Village Integrated Scheme)
    if social in ["SC", "ST", "MBC"] and farmer_type in ["Marginal", "Small"]:
        if random.random() < 0.45:
            return "TN-SCH-04"

    # PM Fasal Bima Yojana
    if crop in ["Paddy", "Cotton", "Groundnut", "Sugarcane", "Millets"] and random.random() < 0.35:
        return "TN-SCH-08"

    # PM-KISAN
    if land_size <= 5.0 and income <= 250000:
        return "TN-SCH-01"

    # Default fallback to Soil Health Card or Free Electricity
    return random.choice(["TN-SCH-12", "TN-SCH-02", "TN-SCH-01"])

def generate_samples(n=1500):
    records = []
    for _ in range(n):
        age = int(np.random.normal(48, 12))
        age = max(18, min(80, age))

        farmer_type = random.choices(FARMER_TYPES, weights=[0.40, 0.35, 0.18, 0.07])[0]

        if farmer_type == "Marginal":
            land_size = round(random.uniform(0.2, 2.4), 2)
            income = int(random.uniform(30000, 150000))
        elif farmer_type == "Small":
            land_size = round(random.uniform(2.5, 4.9), 2)
            income = int(random.uniform(70000, 240000))
        elif farmer_type == "Medium":
            land_size = round(random.uniform(5.0, 9.9), 2)
            income = int(random.uniform(150000, 450000))
        else:
            land_size = round(random.uniform(10.0, 25.0), 2)
            income = int(random.uniform(300000, 900000))

        district = random.choice(DISTRICTS)
        crop_type = random.choice(CROP_TYPES)
        irrigation_type = random.choice(IRRIGATION_TYPES)
        social_category = random.choices(SOCIAL_CATEGORIES, weights=[0.10, 0.45, 0.25, 0.18, 0.02])[0]
        gender = random.choices(["Male", "Female"], weights=[0.75, 0.25])[0]
        land_ownership = random.choices(["Owned", "Leased", "Shared"], weights=[0.80, 0.15, 0.05])[0]
        farming_type = random.choices(["Conventional", "Organic", "Integrated", "Natural"], weights=[0.65, 0.15, 0.15, 0.05])[0]

        livestock = "Yes" if random.random() < 0.45 else "No"
        horticulture = "Yes" if crop_type in ["Vegetables", "Flowers", "Banana", "Coconut"] or random.random() < 0.25 else "No"
        machinery = "Yes" if land_size > 3.0 and random.random() < 0.55 else ("Yes" if random.random() < 0.20 else "No")

        row = {
            "age": age,
            "gender": gender,
            "income": income,
            "landSize": land_size,
            "landOwnership": land_ownership,
            "cropType": crop_type,
            "farmingType": farming_type,
            "district": district,
            "irrigationType": irrigation_type,
            "farmerType": farmer_type,
            "socialCategory": social_category,
            "livestock": livestock,
            "horticulture": horticulture,
            "machinery": machinery,
        }

        row["schemeId"] = determine_primary_scheme(row)
        records.append(row)

    df = pd.DataFrame(records)
    out_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(out_dir, "farmer_schemes_dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"Generated {len(df)} samples saved to {csv_path}")
    print("Class distribution:")
    print(df["schemeId"].value_counts())

if __name__ == "__main__":
    generate_samples()
