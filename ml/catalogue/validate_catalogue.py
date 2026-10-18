"""
Catalogue Validation Script
Executes data quality checks on Farmers_Schemes_34_Columns.xlsx and exports an audit report.
"""
import os
import sys
import json

# Ensure project root is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from ml.catalogue.catalogue_loader import load_excel_catalogue

def main():
    excel_path = os.path.join(project_root, "Farmers_Schemes_34_Columns.xlsx")
    print(f"[Catalogue Validation] Loading workbook: {excel_path}")

    try:
        df, report = load_excel_catalogue(excel_path)
    except Exception as e:
        print(f"[Error] Failed to load Excel catalogue: {e}")
        sys.exit(1)

    print("\n================ DATA QUALITY AUDIT REPORT ================")
    print(f"Catalogue File                   : {report['catalogue_file']}")
    print(f"Sheet Name                       : {report['sheet_name']}")
    print(f"Total Scheme Records             : {report['total_records']}")
    print(f"Duplicate Scheme IDs             : {report['duplicate_scheme_ids']}")
    print(f"Empty Scheme Names               : {report['empty_scheme_names']}")
    print(f"Invalid Official URLs            : {report['invalid_official_urls_count']}")
    print(f"Invalid Application URLs         : {report['invalid_application_urls_count']}")
    print(f"Records Requiring Verification   : {report['records_requiring_verification']} (100% flagged as required)")
    print("\nVerification Status Breakdown:")
    for status, count in report["verification_status_distribution"].items():
        print(f"  - {status}: {count} records")

    print("\nCritical Field Availability:")
    for col in [
        "scheme_id", "scheme_name", "department", "category",
        "min_age", "max_age", "annual_income_limit", "land_min_acres",
        "eligible_gender", "eligible_crops", "application_url", "official_url"
    ]:
        col_info = report["field_completeness"][col]
        print(f"  - {col:25}: {col_info['completeness_pct']}% complete ({col_info['unspecified_or_null_count']} missing/unspecified)")
    print("===========================================================\n")

    # Save JSON report to ml/catalogue/catalogue_data_quality_report.json
    out_json = os.path.join(current_dir, "catalogue_data_quality_report.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, default=str)
    print(f"[Catalogue Validation] Complete audit report saved to: {out_json}")

    # Export transformed records for MongoDB import
    from ml.catalogue.catalogue_loader import transform_record_for_mongo
    transformed_records = []
    for _, row in df.iterrows():
        doc = transform_record_for_mongo(row)
        transformed_records.append(doc)

    out_records = os.path.join(current_dir, "validated_schemes.json")
    with open(out_records, "w", encoding="utf-8") as f:
        json.dump(transformed_records, f, indent=2, default=str)
    print(f"[Catalogue Validation] Exported {len(transformed_records)} validated scheme records to: {out_records}")

if __name__ == "__main__":
    main()
