#!/usr/bin/env python
"""
Pre-train and save the UdaanScore ML model.
Run once before starting the API server.

Usage:
  cd "udaanscore - backend"
  python train_model.py
"""
import sys, os, logging
logging.basicConfig(level=logging.INFO, format="%(message)s")

# Add backend root to path so 'services' package is found
sys.path.insert(0, os.path.dirname(__file__))
from services.ml_pipeline import train_and_save

if __name__ == "__main__":
    print("=" * 58)
    print("  UdaanScore -- ML Model Training")
    print("  GradientBoostingRegressor / scikit-learn")
    print("=" * 58)
    card = train_and_save()
    print()
    print("Model Card")
    print(f"   Type      : {card['model_type']}")
    print(f"   Samples   : {card['training_samples']} train / {card['test_samples']} test")
    print(f"   MAE       : {card['performance']['mae_pts']} pts")
    print(f"   R2        : {card['performance']['r2']}")
    print()
    print("Feature Importances (learned):")
    for feat, imp in sorted(card["feature_importances"].items(), key=lambda x: -x[1]):
        bar = "#" * int(imp * 28)
        print(f"   {feat:<12}  {bar:<28}  {imp:.1%}")
    print()
    print("Done. Start server: uvicorn main:app --reload")
