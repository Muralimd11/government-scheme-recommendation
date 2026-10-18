"""
CLI and Subprocess Entry Point for Machine Learning Predictions
Accepts JSON input either as a command-line argument or from standard input.
Returns top 5 recommendations with benefits, URLs, documents, and verification status.
"""
import sys
import os
import json

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from ml.prediction.predict_service import recommend_schemes_for_farmer

def main():
    raw_input = ""
    if len(sys.argv) > 1 and sys.argv[1].strip() != "--stdin":
        raw_input = sys.argv[1].strip()
    elif len(sys.argv) > 1 and sys.argv[1].strip() == "--stdin":
        try:
            raw_input = sys.stdin.read().strip()
        except Exception:
            raw_input = ""

    if not raw_input:
        # Default test payload for manual CLI execution
        payload = {
            "age": 45,
            "gender": "Male",
            "income": 120000,
            "landSize": 2.5,
            "landOwnership": "Owned",
            "cropType": "Paddy",
            "farmingType": "Conventional",
            "district": "Thanjavur",
            "irrigationType": "Canal",
            "farmerType": "Small",
            "socialCategory": "OBC",
            "livestock": "No",
            "horticulture": "No",
            "machinery": "No"
        }
    else:
        try:
            payload = json.loads(raw_input)
        except Exception as e:
            print(json.dumps({"success": False, "error": f"Invalid JSON input: {str(e)}"}))
            sys.exit(1)

    try:
        results = recommend_schemes_for_farmer(payload, top_k=10)
        recs = results.get("recommendations", [])
        predictions = [
            {
                "schemeId": r.get("schemeId"),
                "probability": round(float(r.get("matchScore", 75)) / 100.0, 3),
                "confidenceRate": f"{r.get('matchScore', 75)}%",
                "confidenceScore": r.get("matchScore", 75)
            }
            for r in recs
        ]
        output = {
            "success": True,
            "rankingMethod": results.get("rankingMethod", "Random Forest ML Model"),
            "totalEligible": results.get("totalEligible", len(recs)),
            "totalEvaluated": results.get("totalEvaluated", 0),
            "predictions": predictions,
            "recommendations": recs,
            "validationWarnings": results.get("validationWarnings", [])
        }
        # Ensure utf-8 output without encoding exceptions
        sys.stdout.reconfigure(encoding="utf-8")
        print(json.dumps(output, indent=2, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
