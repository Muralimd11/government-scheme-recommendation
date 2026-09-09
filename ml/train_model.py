"""
Top-level entry point to train the Tamil Nadu Farmer Scheme Recommendation Model.
"""
import sys
import os

# Ensure ml directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from ml.training.train import train_and_save_model

if __name__ == "__main__":
    train_and_save_model()
