"""
UdaanScore — Score Engine (ML-Powered)
=======================================
Primary:  GradientBoostingRegressor via ml_pipeline.py
Fallback: Weighted formula (if model unavailable)

Both paths return the same response shape — zero breaking changes.
New fields: feature_importances, signal_contributions, model_info
"""

from services.ml_pipeline import ml_predict


# ─── Helpers ────────────────────────────────────────────────────────────────

def _risk(score: int) -> str:
    if score >= 800: return "Very Low Risk"
    if score >= 700: return "Low Risk"
    if score >= 600: return "Medium Risk"
    if score >= 500: return "High Risk"
    return "Rejected"

def _loan(score: int) -> int:
    if score >= 800: return 100000
    if score >= 700: return 50000
    if score >= 600: return 15000
    if score >= 500: return 5000
    return 0

def _conf(params: list) -> str:
    filled = sum(1 for p in params if p > 0)
    return "High" if filled >= 6 else "Medium" if filled >= 4 else "Low"

def _reasons(bills, upi, cashflow, savings, location, quiz) -> list:
    checks = [
        (bills,    80, "✅ Bills paid consistently on time",       "❌ Irregular bill payment history"),
        (upi,      80, "✅ Stable and regular UPI usage",          "❌ Low or inconsistent UPI activity"),
        (cashflow, 80, "✅ Consistent monthly income flow",        "❌ Unstable cash flow detected"),
        (savings,  80, "✅ Good savings habit maintained",         "❌ Low savings balance observed"),
        (location, 80, "✅ Stable residential location",           "❌ Frequent location changes detected"),
        (quiz,     80, "✅ Strong psychometric assessment",        "❌ Psychometric score needs improvement"),
    ]
    return [ok if v >= th else bad for v, th, ok, bad in checks]


# ─── Main entry point ────────────────────────────────────────────────────────

def calculate_trust_score(bills: float, upi: float, cashflow: float,
                          savings: float, location: float, quiz: float) -> dict:
    """
    Score a borrower. Returns:
        trust_score          int   0-1000
        risk_band            str
        loan_limit           int   INR
        confidence           str   High / Medium / Low
        reasons              list  explainability bullets
        feature_importances  dict  signal -> % importance (from ML model)
        signal_contributions dict  signal -> weighted contribution score
        model_info           dict  metadata
    """
    params = [bills, upi, cashflow, savings, location, quiz]

    try:
        ml    = ml_predict(bills, upi, cashflow, savings, location, quiz)
        score = ml["ml_score"]

        return {
            "trust_score":          score,
            "risk_band":            _risk(score),
            "loan_limit":           _loan(score),
            "confidence":           _conf(params),
            "reasons":              _reasons(bills, upi, cashflow, savings, location, quiz),
            "feature_importances":  ml["feature_importances"],
            "signal_contributions": ml["signal_contributions"],
            "model_info": {
                "type":    ml["model_type"],
                "version": ml["model_version"],
                "engine":  ml["engine"],
                "trained_on": "6,000 synthetic borrower profiles",
                "note":    "GradientBoostingRegressor - alternative data scorer. Hackathon prototype.",
                "signals": ["bills", "upi", "cashflow", "savings", "location", "quiz"],
            },
        }

    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning(f"ML model unavailable ({exc}), using formula fallback")

        raw   = (bills*0.20 + upi*0.20 + cashflow*0.20 +
                 savings*0.15 + location*0.10 + quiz*0.15)
        score = int(raw * 10)

        return {
            "trust_score":          score,
            "risk_band":            _risk(score),
            "loan_limit":           _loan(score),
            "confidence":           _conf(params),
            "reasons":              _reasons(bills, upi, cashflow, savings, location, quiz),
            "feature_importances":  {n: w*100 for n, w in zip(
                ["bills","upi","cashflow","savings","location","quiz"],
                [0.20, 0.20, 0.20, 0.15, 0.10, 0.15])},
            "signal_contributions": {},
            "model_info": {
                "type":    "Weighted Formula (fallback)",
                "version": "fallback-v1",
                "engine":  "python",
                "note":    "ML model unavailable - using deterministic weighted formula.",
                "signals": ["bills","upi","cashflow","savings","location","quiz"],
            },
        }