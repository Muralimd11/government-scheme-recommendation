"""
CLI Entry Point for Machine Learning Predictions
Accepts JSON input either as an argument or from standard input.
"""
import sys
import os
import json

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from ml.prediction.predict_service import predict_scheme_probabilities

def main():
    raw_input = ""
    if len(sys.argv) > 1:
        raw_input = sys.argv[1]
    else:
        raw_input = sys.stdin.read().strip()

    if not raw_input:
        # Default test payload
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
            print(json.dumps({"error": f"Invalid JSON: {str(e)}"}))
            sys.exit(1)

    try:
        rankings = predict_scheme_probabilities(payload)
        print(json.dumps({"success": True, "predictions": rankings}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
