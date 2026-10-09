"""
Data Preprocessing Pipeline for Farmer Scheme Recommendation
Uses RobustScaler and SimpleImputer for resilient tabular feature engineering.
"""
import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder, RobustScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer

NUMERICAL_FEATURES = ["age", "income", "landSize"]
CATEGORICAL_FEATURES = [
    "gender", "landOwnership", "cropType", "farmingType",
    "district", "irrigationType", "farmerType", "socialCategory",
    "livestock", "horticulture", "machinery"
]

def create_preprocessor():
    """
    Constructs a scikit-learn ColumnTransformer with:
    - Median imputation + RobustScaler for numerical inputs (resistant to income/land outliers).
    - Constant imputation + OneHotEncoder for categorical inputs with unknown category tolerance.
    """
    num_pipeline = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", RobustScaler())
    ])

    cat_pipeline = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    transformer = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, NUMERICAL_FEATURES),
            ("cat", cat_pipeline, CATEGORICAL_FEATURES)
        ],
        remainder="drop"
    )
    return transformer

def prepare_data(csv_path):
    """
    Loads raw CSV dataset and separates features X and label y.
    """
    df = pd.read_csv(csv_path)

    X = df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES].copy()
    y = df["schemeId"].astype(str)

    return X, y

