"""
Rule-Based Baseline Ranking Engine for Tamil Nadu Government Schemes
Provides an interpretable, transparent relevance scoring baseline.
"""
from typing import Dict, Any, List

def calculate_baseline_relevance(farmer: Dict[str, Any], scheme: Dict[str, Any]) -> float:
    """
    Computes a transparent affinity score between 0.0 and 1.0 based on farmer attributes and scheme metadata.
    """
    score = 0.50  # Base eligibility qualification prior

    crop = str(farmer.get("cropType") or farmer.get("primaryCrop") or "").lower()
    district = str(farmer.get("district") or "").lower()
    farming_type = str(farmer.get("farmingType") or "").lower()
    farmer_type = str(farmer.get("farmerType") or "").lower()
    land = float(farmer.get("landSize") or 0.0)
    income = float(farmer.get("annualIncome") or farmer.get("income") or 120000)

    category = str(scheme.get("category") or "").lower()
    department = str(scheme.get("department") or "").lower()
    name = str(scheme.get("schemeName") or "").lower()
    desc = str(scheme.get("description") or "").lower()
    benefits = str(scheme.get("benefits") or "").lower()
    combined_text = f"{category} {department} {name} {desc} {benefits}"

    # 1. Need-based priority (lower income farmers get higher social welfare weight)
    if income < 100000:
        score += 0.12
    elif income < 200000:
        score += 0.06

    # 2. Farmer category alignment
    if farmer_type in ["marginal", "small"] or land <= 2.5:
        if "small" in combined_text or "marginal" in combined_text or "kisan" in combined_text:
            score += 0.10

    # 3. Crop and agriculture specific relevance
    if crop and crop in combined_text:
        score += 0.15
    elif "agriculture" in combined_text or "crop" in combined_text or "farmer" in combined_text:
        score += 0.05

    # 4. Allied farming activities
    has_livestock = (
        str(farmer.get("livestock") or farmer.get("livestockOwnership") or "No").lower() in ["yes", "true", "1"]
        or float(farmer.get("cowCount") or 0) > 0
    )
    if has_livestock and ("livestock" in combined_text or "animal husbandry" in combined_text or "dairy" in combined_text):
        score += 0.18

    has_horticulture = (
        str(farmer.get("horticulture") or farmer.get("horticultureActivity") or "No").lower() in ["yes", "true", "1"]
        or farmer.get("horticultureType") not in [None, "None", ""]
    )
    if has_horticulture and ("horticulture" in combined_text or "fruits" in combined_text or "vegetables" in combined_text):
        score += 0.18

    # 5. Irrigation & Solar
    irrigation = str(farmer.get("irrigationType") or farmer.get("irrigationSource") or "").lower()
    if irrigation in ["drip", "sprinkler"] and ("micro irrigation" in combined_text or "drip" in combined_text or "sprinkler" in combined_text):
        score += 0.15
    if farmer.get("solarPumpInterest") and ("solar" in combined_text or "pump" in combined_text):
        score += 0.15

    # 6. Organic / Natural farming
    if farming_type in ["organic", "natural"] and ("organic" in combined_text or "natural" in combined_text or "soil" in combined_text):
        score += 0.15

    # 7. Assistance intent match
    assistance_list = farmer.get("assistanceRequired") or []
    if isinstance(assistance_list, list):
        for req in assistance_list:
            if str(req).lower() in combined_text:
                score += 0.10
                break

    # 8. State priority / Central level bonus
    gov_level = str(scheme.get("governmentLevel") or "").lower()
    if "tamil nadu" in gov_level:
        score += 0.05  # State-specific direct delivery benefit

    # Normalize score between 0.10 and 0.99
    final_score = max(0.10, min(0.99, round(score, 4)))
    return final_score
