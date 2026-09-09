"""
Data Preprocessing Pipeline for Farmer Scheme Recommendation
"""
import os
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer

NUMERICAL_FEATURES = ["age", "income", "landSize"]
CATEGORICAL_FEATURES = [
    "gender", "landOwnership", "cropType", "farmingType",
    "district", "irrigationType", "farmerType", "socialCategory",
    "livestock", "horticulture", "machinery"
]

def create_preprocessor():
    transformer = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERICAL_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES)
        ],
        remainder="drop"
    )
    return transformer

def prepare_data(csv_path):
    df = pd.read_csv(csv_path)
    
    # Handle any missing values
    df["age"] = df["age"].fillna(df["age"].median())
    df["income"] = df["income"].fillna(df["income"].median())
    df["landSize"] = df["landSize"].fillna(df["landSize"].median())
    for cat_col in CATEGORICAL_FEATURES:
        df[cat_col] = df[cat_col].fillna("Unknown")

    X = df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES]
    y = df["schemeId"]

    return X, y
