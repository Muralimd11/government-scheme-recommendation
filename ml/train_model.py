"""
Top-level entry point to train the Tamil Nadu Farmer Scheme Recommendation Model.
Executes training, probability calibration, and comparative ranking evaluation (NDCG@5, P@5, R@5).
"""
import sys
import os
import argparse

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from ml.training.train import train_and_evaluate

def main():
    parser = argparse.ArgumentParser(description="Train Tamil Nadu Scheme Recommendation Model")
    parser.add_argument("--dataset", type=str, default=None, help="Path to CSV dataset (synthetic or reviewed)")
    args = parser.parse_args()

    train_and_evaluate(dataset_path=args.dataset)

if __name__ == "__main__":
    main()
