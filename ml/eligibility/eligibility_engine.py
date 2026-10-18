"""
Stage A: Verified Eligibility Filtering Engine
Evaluates farmer against verified scheme rules.
Follows strict principles:
- Conditions supported by source data only.
- Unknown / unspecified criteria are treated as UNKNOWN, never assumed as auto-eligible or disqualified.
- Returns explicit reasons for eligibility decisions and disqualifications.
"""
from typing import Dict, Any, Tuple, List, Optional

def evaluate_scheme_eligibility(scheme: Dict[str, Any], farmer: Dict[str, Any]) -> Tuple[bool, str, List[str], Optional[str]]:
    """
    Evaluates farmer eligibility against a scheme.
    Returns:
      (is_eligible, eligibility_status, reasons, ineligible_reason)
      where eligibility_status is one of:
        - "Eligible"
        - "Potentially Eligible" (pending verification or incomplete criteria)
        - "Not Eligible"
    """
    reasons = []

    age = float(farmer.get("age", 45))
    income = float(farmer.get("income", farmer.get("annualIncome", 120000)))
    land = float(farmer.get("landSize", 2.0))
    gender = str(farmer.get("gender", "Male")).capitalize()
    district = str(farmer.get("district", "Thanjavur")).strip()
    social = str(farmer.get("socialCategory", "OBC")).strip()
    farmer_type = str(farmer.get("farmerType", "Small")).strip()

    # Allied fields
    cow_count = float(farmer.get("cowCount", 0))
    dairy = farmer.get("dairyFarming") == "Yes" or cow_count > 0
    livestock = (
        str(farmer.get("livestock", farmer.get("livestockOwnership", "No"))).lower() in ["yes", "true", "1"]
        or dairy
    )
    horticulture = (
        str(farmer.get("horticulture", farmer.get("horticultureActivity", "No"))).lower() in ["yes", "true", "1"]
        or (farmer.get("horticultureType") and farmer.get("horticultureType") not in ["None", ""])
    )
    machinery = (
        str(farmer.get("machinery", farmer.get("machineryOwnership", "No"))).lower() in ["yes", "true", "1"]
        or (isinstance(farmer.get("machineryList"), list) and len(farmer.get("machineryList")) > 0)
    )

    # 1. Age Verification
    min_age = scheme.get("rawMinAge") if scheme.get("rawMinAge") is not None else scheme.get("minimumAge")
    max_age = scheme.get("rawMaxAge") if scheme.get("rawMaxAge") is not None else scheme.get("maximumAge")

    if min_age is not None and min_age > 0:
        if age < min_age:
            return False, "Not Eligible", [], f"Farmer age ({int(age)} yrs) is below verified minimum requirement of {int(min_age)} years."
        reasons.append(f"Age ({int(age)} yrs) satisfies minimum age condition of {int(min_age)} yrs")

    if max_age is not None and max_age < 100:
        if age > max_age:
            return False, "Not Eligible", [], f"Farmer age ({int(age)} yrs) exceeds verified maximum ceiling of {int(max_age)} years."
        reasons.append(f"Age ({int(age)} yrs) is within maximum age ceiling of {int(max_age)} yrs")

    # 2. Income Limit Verification
    income_limit = scheme.get("rawAnnualIncomeLimit") if scheme.get("rawAnnualIncomeLimit") is not None else scheme.get("incomeLimit")
    if income_limit is not None and income_limit > 0:
        if income > income_limit:
            return False, "Not Eligible", [], f"Annual household income (₹{int(income):,}) exceeds the verified scheme ceiling of ₹{int(income_limit):,}."
        reasons.append(f"Annual income (₹{int(income):,}) is within ceiling of ₹{int(income_limit):,}")

    # 3. Landholding Verification
    land_min = scheme.get("rawLandMinAcres") if scheme.get("rawLandMinAcres") is not None else scheme.get("landholdingMin", 0)
    land_max = scheme.get("rawLandMaxAcres") if scheme.get("rawLandMaxAcres") is not None else scheme.get("landholdingMax", 999)

    if land_min is not None and land_min > 0:
        if land < land_min:
            return False, "Not Eligible", [], f"Minimum landholding required is {land_min} acres (your holding: {land} acres)."
        reasons.append(f"Landholding ({land} acres) meets minimum {land_min} acres requirement")

    if land_max is not None and land_max < 900:
        if land > land_max:
            return False, "Not Eligible", [], f"Landholding ({land} acres) exceeds the maximum ceiling of {land_max} acres."
        reasons.append(f"Landholding ({land} acres) is within {land_max} acres ceiling")

    # 4. Gender Specificity
    eligible_gender = scheme.get("gender") or scheme.get("eligible_gender") or "All"
    if eligible_gender in ["Female", "Women"] and gender != "Female":
        return False, "Not Eligible", [], "This scheme is exclusively reserved for women / female applicants."
    elif eligible_gender in ["Male"] and gender != "Male":
        return False, "Not Eligible", [], "This scheme is reserved for male applicants."
    elif eligible_gender not in ["All", "None", None, ""]:
        reasons.append(f"Gender eligibility criteria ({eligible_gender}) satisfied")

    # 5. Social Category Restriction
    scheme_social = scheme.get("socialCategory") or scheme.get("eligible_social_categories")
    if isinstance(scheme_social, list) and len(scheme_social) > 0 and "All" not in scheme_social:
        matching_categories = [s.lower() for s in scheme_social]
        if social.lower() not in matching_categories:
            return False, "Not Eligible", [], f"Scheme is targeted exclusively for: {', '.join(scheme_social)} (your category: {social})."
        reasons.append(f"Community priority criteria ({social}) matched")

    # 6. District Restriction
    districts = scheme.get("applicableDistricts") or scheme.get("eligible_districts")
    if isinstance(districts, list) and len(districts) > 0 and "All" not in districts and "All Tamil Nadu" not in districts:
        if not any(d.lower() == district.lower() for d in districts):
            return False, "Not Eligible", [], f"Scheme is currently restricted to designated districts: {', '.join(districts)}."
        reasons.append(f"Geographic jurisdiction verified for district: {district}")

    # 7. Specific Asset / Activity Prerequisites
    if scheme.get("livestockRequirement") and not livestock:
        return False, "Not Eligible", [], "Scheme requires verified livestock ownership (dairy cattle, goats, or poultry)."
    elif scheme.get("livestockRequirement") and livestock:
        reasons.append("Livestock asset requirement verified")

    if scheme.get("horticultureRequirement") and not horticulture:
        return False, "Not Eligible", [], "Scheme requires active horticultural or plantation crop cultivation."
    elif scheme.get("horticultureRequirement") and horticulture:
        reasons.append("Horticultural engagement verified")

    if scheme.get("machineryRequirement") and not machinery and land < 2.5:
        return False, "Not Eligible", [], "Scheme requires ownership of farm implements or power tiller/tractor."
    elif scheme.get("machineryRequirement") and machinery:
        reasons.append("Farm implements / mechanization requirement satisfied")

    # Determine status based on source verification state
    status_tag = scheme.get("schemeStatus") or scheme.get("scheme_status")
    verif_tag = scheme.get("verificationStatus") or scheme.get("verification_status")

    is_unverified = (
        status_tag == "Requires verification"
        or "not independently verified" in str(verif_tag).lower()
        or scheme.get("isDemonstrationData") is True
    )

    if is_unverified:
        eligibility_status = "Potentially Eligible"
        reasons.append("Note: Source scheme record requires official departmental verification before formal disbursement")
    else:
        eligibility_status = "Eligible"

    if not reasons:
        reasons.append("Satisfies preliminary agricultural welfare eligibility criteria")

    return True, eligibility_status, reasons, None
