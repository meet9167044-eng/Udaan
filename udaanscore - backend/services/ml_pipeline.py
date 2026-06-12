"""
UdaanScore — ML Pipeline
========================
GradientBoostingRegressor trained on 6,000 synthetic alternative-data profiles.

Features (0–100 scale):
  bills     – Utility bill payment consistency
  upi       – UPI transaction activity & velocity
  cashflow  – Bank cash-flow stability
  savings   – Savings consistency
  location  – Geo/residential stability
  quiz      – Psychometric assessment score

Output: Trust Score 0–1000 with feature importances.
"""

import os, json, logging
import numpy as np
import joblib
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import MinMaxScaler
from sklearn.pipeline import Pipeline

logger = logging.getLogger(__name__)

SERVICES_DIR   = os.path.dirname(__file__)
MODEL_PATH     = os.path.join(SERVICES_DIR, "udaanscore_model.pkl")
CARD_PATH      = os.path.join(SERVICES_DIR, "model_card.json")

FEATURE_NAMES  = ["bills", "upi", "cashflow", "savings", "location", "quiz"]
EXPERT_WEIGHTS = [0.20,    0.20,  0.20,       0.15,      0.10,       0.15]

# ─── Synthetic data generation ─────────────────────────────────────────────

def generate_training_data(n: int = 6000, seed: int = 42):
    rng = np.random.default_rng(seed)

    n_good = int(n * 0.60)   # 60 % "reliable" borrowers
    n_bad  = n - n_good

    def good(size): return np.clip(rng.normal(72, 16, size), 0, 100)
    def bad(size):  return np.clip(rng.normal(36, 20, size), 0, 100)

    rows = []
    for _ in range(n_good):
        f = [good(1)[0] for _ in FEATURE_NAMES]
        # bills & upi are correlated for good borrowers
        f[0] = float(np.clip(f[0] * 0.55 + f[1] * 0.45, 0, 100))
        rows.append(f)
    for _ in range(n_bad):
        rows.append([bad(1)[0] for _ in FEATURE_NAMES])

    X = np.array(rows)
    rng.shuffle(X)

    # Target: weighted sum + non-linear interactions + noise
    weights = np.array(EXPERT_WEIGHTS)
    base    = X @ weights   # 0-100 range

    # Bonus: both bills AND upi high → compound creditworthiness signal
    bonus = np.where((X[:,0] > 75) & (X[:,1] > 75),
                     rng.uniform(2, 7, n), 0.0)
    # Penalty: very low location stability
    penalty = np.where(X[:,4] < 20, rng.uniform(1, 5, n), 0.0)

    raw = np.clip((base + bonus - penalty) * 10, 0, 1000)
    y   = np.clip(raw + rng.normal(0, 14, n), 0, 1000)
    return X, y


# ─── Train & save ──────────────────────────────────────────────────────────

def train_and_save() -> dict:
    logger.info("Generating training data …")
    X, y = generate_training_data(6000)
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.20, random_state=42)

    pipeline = Pipeline([
        ("scaler", MinMaxScaler()),
        ("gbr",    GradientBoostingRegressor(
            n_estimators=200,
            learning_rate=0.07,
            max_depth=4,
            subsample=0.85,
            min_samples_leaf=10,
            random_state=42,
        )),
    ])

    logger.info("Training GradientBoostingRegressor …")
    pipeline.fit(X_tr, y_tr)

    y_pred = pipeline.predict(X_te)
    mae    = float(mean_absolute_error(y_te, y_pred))
    r2     = float(r2_score(y_te, y_pred))
    logger.info(f"Done — MAE: {mae:.1f} pts | R²: {r2:.4f}")

    raw_imp = pipeline.named_steps["gbr"].feature_importances_
    imp_dict = {n: round(float(v), 4) for n, v in zip(FEATURE_NAMES, raw_imp)}

    joblib.dump(pipeline, MODEL_PATH)

    card = {
        "model_name":   "UdaanScore Trust Scorer",
        "model_type":   "GradientBoostingRegressor (scikit-learn)",
        "version":      "1.0.0",
        "features":     FEATURE_NAMES,
        "training_samples": 4800,
        "test_samples":     1200,
        "performance":  {"mae_pts": round(mae, 2), "r2": round(r2, 4)},
        "feature_importances": imp_dict,
        "expert_weights":      dict(zip(FEATURE_NAMES, EXPERT_WEIGHTS)),
        "output_range": "0–1000",
        "disclosure":   "Trained on synthetic data. Hackathon MVP — not a regulated credit-scoring model.",
    }
    with open(CARD_PATH, "w") as f:
        json.dump(card, f, indent=2)

    logger.info(f"Model saved → {MODEL_PATH}")
    return card


# ─── Lazy singleton loader ──────────────────────────────────────────────────

_pipeline = None

def _load() -> Pipeline:
    global _pipeline
    if _pipeline is not None:
        return _pipeline
    if not os.path.exists(MODEL_PATH):
        logger.warning("Model not found — training now (first run) …")
        train_and_save()
    _pipeline = joblib.load(MODEL_PATH)
    logger.info("UdaanScore ML model loaded ✓")
    return _pipeline


def get_model_card() -> dict:
    if os.path.exists(CARD_PATH):
        with open(CARD_PATH) as f:
            return json.load(f)
    return {}


# ─── Prediction ────────────────────────────────────────────────────────────

def ml_predict(bills: float, upi: float, cashflow: float,
               savings: float, location: float, quiz: float) -> dict:
    pipe = _load()
    X    = np.array([[bills, upi, cashflow, savings, location, quiz]])

    raw   = float(pipe.predict(X)[0])
    score = int(np.clip(round(raw), 0, 1000))

    raw_imp = pipe.named_steps["gbr"].feature_importances_

    # Percentage importance (sums to 100)
    importance_pct = {
        n: round(float(v) * 100, 1)
        for n, v in zip(FEATURE_NAMES, raw_imp)
    }

    # Per-signal contribution = importance × normalised input value
    inputs = [bills, upi, cashflow, savings, location, quiz]
    contributions = {
        n: round(float(raw_imp[i]) * (inputs[i] / 100) * 100, 1)
        for i, n in enumerate(FEATURE_NAMES)
    }

    return {
        "ml_score":            score,
        "feature_importances": importance_pct,
        "signal_contributions": contributions,
        "model_type":          "GradientBoostingRegressor",
        "model_version":       "1.0.0",
        "engine":              "scikit-learn",
    }
