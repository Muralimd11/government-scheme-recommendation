
import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

EXCEL_FILE = "Tamil_Nadu_Farmer_Schemes_Cleaned.xlsx"
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI is missing from .env")

if not os.path.exists(EXCEL_FILE):
    raise FileNotFoundError(f"Excel file not found: {EXCEL_FILE}")

df = pd.read_excel(EXCEL_FILE, sheet_name="Structured Schemes")
df = df.astype(object).where(pd.notna(df), None)

if not {"scheme_id", "scheme_name"}.issubset(df.columns):
    raise ValueError("Missing scheme_id or scheme_name columns")

if df["scheme_id"].duplicated().any():
    raise ValueError("Duplicate scheme IDs found")

records = df.to_dict(orient="records")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)

try:
    client.admin.command("ping")
    print("MongoDB connected")

    db = client["tn_scheme_db"]
    staging = db["schemes_staging"]

    # Clear only the temporary staging collection.
    staging.delete_many({})

    if records:
        staging.insert_many(records)

    print(f"Staged {len(records)} scheme records")
    print("Live scheme collections were not modified.")

finally:
    client.close()
