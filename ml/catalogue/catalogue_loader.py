"""
Excel Scheme Catalogue Loader and Validator
Specialized for Farmers_Schemes_34_Columns.xlsx ('Structured Schemes' sheet)
"""
import os
import re
import html
import urllib.parse
from typing import Dict, List, Any, Tuple, Optional
import pandas as pd
import numpy as np

REQUIRED_34_COLUMNS = [
    "scheme_id",
    "scheme_name",
    "level",
    "department",
    "category",
    "benefit_summary",
    "benefit_amount",
    "eligibility",
    "min_age",
    "max_age",
    "annual_income_limit",
    "land_min_acres",
    "land_max_acres",
    "land_ownership_requirement",
    "eligible_gender",
    "eligible_social_categories",
    "eligible_crops",
    "eligible_farming_types",
    "eligible_districts",
    "irrigation_requirement",
    "livestock_requirement",
    "other_conditions",
    "exclusion_criteria",
    "required_documents",
    "application_process",
    "application_url",
    "official_url",
    "scheme_status",
    "validity_period",
    "source_type",
    "source_title",
    "last_verified_date",
    "verification_status",
    "additional_notes"
]

def is_valid_url(url: Any) -> bool:
    if not url or pd.isna(url):
        return False
    s = str(url).strip()
    if s.lower() in ["not specified", "nan", "none", "", "n/a"]:
        return False
    try:
        result = urllib.parse.urlparse(s)
        return bool(result.scheme in ["http", "https", "file", "ftp"] and result.netloc)
    except Exception:
        return False

def clean_unspecified(val: Any) -> Optional[Any]:
    """Returns None if value represents unspecified/unknown/NaN."""
    if val is None or pd.isna(val):
        return None
    s = str(val).strip()
    if s.lower() in [
        "not specified",
        "not specified in source workbook",
        "not separately specified in source workbook",
        "not separately structured; see benefit_summary",
        "not separately extracted; review eligibility text and source",
        "nan",
        "none",
        "",
        "n/a"
    ]:
        return None
    return val

def parse_number_or_none(val: Any) -> Optional[float]:
    """Converts a value to float, or None if missing or invalid."""
    if val is None or pd.isna(val):
        return None
    try:
        f = float(val)
        if np.isnan(f):
            return None
        return f
    except (ValueError, TypeError):
        return None

def load_excel_catalogue(excel_path: Optional[str] = None) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Loads 'Structured Schemes' from the Excel workbook.
    Validates columns, duplicates, and produces a data-quality audit.
    """
    if excel_path is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        excel_path = os.path.join(base_dir, "Farmers_Schemes_34_Columns.xlsx")

    if not os.path.exists(excel_path):
        raise FileNotFoundError(f"Excel catalogue not found at path: {excel_path}")

    # Read Structured Schemes sheet without modifying the original file
    df = pd.read_excel(excel_path, sheet_name="Structured Schemes")

    # Column name validation
    missing_cols = [col for col in REQUIRED_34_COLUMNS if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Excel sheet 'Structured Schemes' is missing required columns: {missing_cols}")

    # Ensure correct column order
    df = df[REQUIRED_34_COLUMNS].copy()

    total_records = len(df)
    duplicates = df[df.duplicated(subset=["scheme_id"], keep=False)]
    duplicate_count = len(duplicates)

    empty_names = df[df["scheme_name"].isna() | (df["scheme_name"].astype(str).str.strip() == "")]
    empty_name_count = len(empty_names)

    # URL validation
    invalid_official_urls = []
    invalid_app_urls = []
    for idx, row in df.iterrows():
        sid = row["scheme_id"]
        if not is_valid_url(row["official_url"]):
            invalid_official_urls.append({"scheme_id": sid, "url": str(row["official_url"])})
        if not is_valid_url(row["application_url"]):
            invalid_app_urls.append({"scheme_id": sid, "url": str(row["application_url"])})

    # Verification status audit
    requires_verification_count = int(
        (df["scheme_status"].astype(str).str.strip() == "Requires verification").sum()
    )
    verif_status_dist = df["verification_status"].value_counts(dropna=False).to_dict()

    # Field completeness audit
    missing_fields_report = {}
    for col in REQUIRED_34_COLUMNS:
        null_count = int(df[col].isna().sum())
        clean_missing = 0
        for val in df[col]:
            if clean_unspecified(val) is None:
                clean_missing += 1
        missing_fields_report[col] = {
            "strictly_null_count": null_count,
            "unspecified_or_null_count": clean_missing,
            "completeness_pct": round(((total_records - clean_missing) / total_records) * 100, 2)
        }

    report = {
        "catalogue_file": os.path.basename(excel_path),
        "sheet_name": "Structured Schemes",
        "total_records": total_records,
        "duplicate_scheme_ids": duplicate_count,
        "empty_scheme_names": empty_name_count,
        "invalid_official_urls_count": len(invalid_official_urls),
        "invalid_application_urls_count": len(invalid_app_urls),
        "records_requiring_verification": requires_verification_count,
        "verification_status_distribution": {str(k): int(v) for k, v in verif_status_dist.items()},
        "field_completeness": missing_fields_report
    }

    return df, report

def transform_record_for_mongo(row: pd.Series) -> Dict[str, Any]:
    """
    Transforms an Excel scheme row into the application's MongoDB Scheme schema.
    Preserves original scheme_id and all 34 fields without fabricating facts.
    """
    scheme_id = str(row["scheme_id"]).strip()
    scheme_name = str(row["scheme_name"]).strip()
    level_raw = str(row["level"]).strip()

    # Standardize governmentLevel
    if "central" in level_raw.lower():
        gov_level = "Central Government"
    elif "tamil" in level_raw.lower() or "state" in level_raw.lower():
        gov_level = "Tamil Nadu Government"
    else:
        gov_level = "Central Government" if "central" in level_raw.lower() else "Tamil Nadu Government"
    # Clean text and decode HTML entities (e.g. &amp; -> &)
    scheme_name = html.unescape(str(row["scheme_name"])).strip()
    department = html.unescape(str(row["department"])).strip() if pd.notna(row["department"]) else "Government Department"
    category = html.unescape(str(row["category"])).strip() if pd.notna(row["category"]) else "General"

    benefit_summary_raw = clean_unspecified(row["benefit_summary"]) or ""
    benefit_amount_raw = clean_unspecified(row["benefit_amount"]) or ""
    benefit_summary = html.unescape(str(benefit_summary_raw)).strip() if benefit_summary_raw else ""
    benefit_amount = html.unescape(str(benefit_amount_raw)).strip() if benefit_amount_raw else ""

    benefits_display = benefit_summary if benefit_summary else benefit_amount
    if not benefits_display:
        benefits_display = "Government scheme benefits as detailed in official guidelines."

    eligibility_raw = clean_unspecified(row["eligibility"]) or ""
    eligibility_text = html.unescape(str(eligibility_raw)).strip() if eligibility_raw else ""

    # Parse numerical eligibility conditions safely (None means unknown, not 0)
    min_age = parse_number_or_none(row["min_age"])
    max_age = parse_number_or_none(row["max_age"])
    annual_income_limit = parse_number_or_none(row["annual_income_limit"])
    land_min_acres = parse_number_or_none(row["land_min_acres"])
    land_max_acres = parse_number_or_none(row["land_max_acres"])

    gender_raw = str(row["eligible_gender"]).strip() if pd.notna(row["eligible_gender"]) else "All"
    if gender_raw.lower() in ["female", "women", "girl"]:
        gender = "Female"
    elif gender_raw.lower() in ["male", "men"]:
        gender = "Male"
    else:
        gender = "All"

    social_raw = clean_unspecified(row["eligible_social_categories"])
    if social_raw and str(social_raw).strip().lower() != "all":
        social_categories = [html.unescape(s.strip()) for s in re.split(r"[,/|;]+", str(social_raw)) if s.strip()]
    else:
        social_categories = ["All"]

    districts_raw = clean_unspecified(row["eligible_districts"])
    if districts_raw and str(districts_raw).strip().lower() not in ["all", "all tamil nadu"]:
        districts = [html.unescape(d.strip()) for d in re.split(r"[,/|;]+", str(districts_raw)) if d.strip()]
    else:
        districts = ["All"]

    crops_raw = clean_unspecified(row["eligible_crops"])
    if crops_raw and str(crops_raw).strip().lower() != "all":
        crop_types = [html.unescape(c.strip()) for c in re.split(r"[,/|;]+", str(crops_raw)) if c.strip()]
    else:
        crop_types = ["All"]

    farming_raw = clean_unspecified(row["eligible_farming_types"])
    if farming_raw and str(farming_raw).strip().lower() != "all":
        farming_types = [html.unescape(f.strip()) for f in re.split(r"[,/|;]+", str(farming_raw)) if f.strip()]
    else:
        farming_types = ["All"]

    irrigation_raw = clean_unspecified(row["irrigation_requirement"])
    if irrigation_raw and str(irrigation_raw).strip().lower() != "all":
        irrigation_reqs = [html.unescape(i.strip()) for i in re.split(r"[,/|;]+", str(irrigation_raw)) if i.strip()]
    else:
        irrigation_reqs = ["All"]

    # Documents: Cleanly parse bullet lines or newline items without breaking hyphens (e.g. government-issued)
    docs_raw = clean_unspecified(row["required_documents"])
    if docs_raw:
        unescaped_docs = html.unescape(str(docs_raw)).strip()
        parts = re.split(r'[\r\n]+|[•]+', unescaped_docs)
        docs = []
        for p in parts:
            item = re.sub(r'^[\s\-\*\–\—•]+', '', p).strip()
            item = re.sub(r'^\d+[\.\)]\s*', '', item).strip()
            if len(item) > 2:
                docs.append(item)
    else:
        docs = ["Aadhaar Card", "Bank Passbook", "Proof of Identity / Land Document"]

    # Specific boolean tags from additional_notes or source columns
    notes_raw = html.unescape(str(row["additional_notes"])) if pd.notna(row["additional_notes"]) else ""
    farmer_required = "farmer_required=False" not in notes_raw
    disability_required = "disability_required=True" in notes_raw

    # Official and application URLs
    official_website = str(row["official_url"]).strip() if pd.notna(row["official_url"]) else ""
    app_url = str(row["application_url"]).strip() if pd.notna(row["application_url"]) else ""

    # Parse last verified date
    last_verified = None
    if pd.notna(row["last_verified_date"]):
        try:
            last_verified = pd.to_datetime(row["last_verified_date"]).to_pydatetime()
        except Exception:
            last_verified = None

    mongo_doc = {
        "schemeId": scheme_id,
        "schemeName": scheme_name,
        "governmentLevel": gov_level,
        "department": department,
        "category": category,
        "description": benefit_summary or eligibility_text or scheme_name,
        "benefits": benefits_display,
        "eligibilityConditions": [e.strip() for e in re.split(r"[\n\r]+", str(eligibility_text)) if e.strip()][:10],
        "minimumAge": min_age if min_age is not None else 18,
        "maximumAge": max_age if max_age is not None else 80,
        "gender": gender,
        "incomeLimit": annual_income_limit,
        "socialCategory": social_categories,
        "applicableDistricts": districts,
        "landholdingMin": land_min_acres if land_min_acres is not None else 0,
        "landholdingMax": land_max_acres if land_max_acres is not None else 999,
        "cropTypes": crop_types,
        "farmingTypes": farming_types,
        "irrigationRequirements": irrigation_reqs,
        "applicableFarmerTypes": ["All"],
        "studentRequired": False,
        "farmerRequired": farmer_required,
        "disabilityRequired": disability_required,
        "livestockRequirement": False,
        "horticultureRequirement": False,
        "machineryRequirement": False,
        "requiredDocuments": docs,
        "applicationProcess": str(row["application_process"]) if pd.notna(row["application_process"]) else "Apply via official portal or designated district office.",
        "applicationDeadline": clean_unspecified(row["validity_period"]) or "Ongoing / Per Financial Year",
        "officialWebsite": official_website,
        "applicationUrl": app_url,
        "status": "ACTIVE",
        "lastVerifiedDate": last_verified,
        "isDemonstrationData": False,
        # Extended fields for full Excel catalogue fidelity
        "verificationStatus": str(row["verification_status"]) if pd.notna(row["verification_status"]) else "Requires verification",
        "schemeStatus": str(row["scheme_status"]) if pd.notna(row["scheme_status"]) else "Requires verification",
        "exclusionCriteria": clean_unspecified(row["exclusion_criteria"]),
        "otherConditions": clean_unspecified(row["other_conditions"]),
        "sourceType": clean_unspecified(row["source_type"]),
        "sourceTitle": clean_unspecified(row["source_title"]),
        "additionalNotes": notes_raw,
        "rawEligibilityText": eligibility_text,
        # Exact raw values retained so unknown is not confused with zero
        "rawMinAge": min_age,
        "rawMaxAge": max_age,
        "rawAnnualIncomeLimit": annual_income_limit,
        "rawLandMinAcres": land_min_acres,
        "rawLandMaxAcres": land_max_acres
    }

    return mongo_doc
