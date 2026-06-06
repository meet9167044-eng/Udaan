from fastapi import APIRouter
from services.data_generator import BORROWERS_DB
from services.explainability import explain_score
from services.fraud_detection import detect_fraud
from services.credit_builder import get_credit_builder

router = APIRouter()

@router.get("/raju-story")
def get_raju_demo_story():
    """
    Full demo story for hackathon judges.
    Shows Raju's complete journey from rejection to ₹50,000 eligibility.
    """
    raju = None
    for b in BORROWERS_DB:
        if b["name"] == "Raju Sharma":
            raju = b
            break

    explanation = explain_score(raju)
    fraud = detect_fraud(raju)
    builder = get_credit_builder(raju)

    return {
        "demo_title": "UdaanScore — Raju's Journey",
        "tagline": "From Bank Rejected to Loan Approved",

        "scene_1": {
            "title": "Bank Rejects Raju",
            "problem": "No CIBIL score. No credit history. No loan.",
            "bank_response": "REJECTED — Insufficient credit history"
        },

        "scene_2": {
            "title": "Raju Opens UdaanScore",
            "action": "Shares UPI, Bills, and Bank Data",
            "data_shared": ["UPI Transactions", "Utility Bills", "Bank Account"]
        },

        "scene_3": {
            "title": "AI Calculates Trust Score",
            "trust_score": raju["trust_score"],
            "risk_band": raju["risk_band"],
            "confidence": raju["confidence"],
            "score_breakdown": explanation["score_breakdown"],
            "positives": explanation["positive_factors"],
            "negatives": explanation["negative_factors"]
        },

        "scene_4": {
            "title": "Credit Builder Journey Appears",
            "current_score": raju["trust_score"],
            "milestone_target": builder["milestone_target"],
            "tasks": builder["tasks"][:3]
        },

        "scene_5": {
            "title": "₹2,000 Nano Loan Approved",
            "loan_amount": 2000,
            "action": "Raju repays the loan on time",
            "score_before": raju["trust_score"],
            "score_after": raju["trust_score"] + 15,
            "new_risk_band": "Medium Risk"
        },

        "scene_6": {
            "title": "Score Simulator Predicts Future",
            "current_score": raju["trust_score"] + 15,
            "predicted_score": 710,
            "predicted_in_days": 60,
            "actions": [
                "Pay bills on time",
                "Maintain ₹3,000 balance",
                "Complete assessment"
            ]
        },

        "scene_7": {
            "title": "Success — ₹50,000 Eligibility Unlocked",
            "final_score": 710,
            "loan_limit": 50000,
            "risk_band": "Low Risk",
            "message": "Raju is now creditworthy. From zero to ₹50,000 in 60 days."
        },

        "fraud_check": {
            "status": fraud["risk_level"],
            "verified": fraud["verified"]
        },

        "closing_statement": (
            "UdaanScore replaces traditional credit history with AI-based trust scoring "
            "using consented alternative data, helping thin-file individuals and MSMEs "
            "build credit, access loans, and improve financial inclusion through "
            "explainable, privacy-first lending."
        )
    }


@router.get("/all-endpoints")
def list_all_endpoints():
    """Quick reference for all API endpoints"""
    return {
        "base_url": "http://localhost:8000",
        "docs": "http://localhost:8000/docs",
        "modules": {
            "Trust Score Engine": {
                "POST /score/calculate": "Calculate trust score from raw data"
            },
            "Borrower Profiles": {
                "GET /borrowers/": "Get all 20 borrowers",
                "GET /borrowers/{name}": "Get one borrower",
                "POST /borrowers/repay-loan": "Repay loan and boost score"
            },
            "Features": {
                "GET /features/nano-ladder/{name}": "View loan ladder stages",
                "GET /features/credit-builder/{name}": "Get improvement tasks",
                "POST /features/simulate-score": "Predict future score"
            },
            "Consent Vault": {
                "GET /vault/consent/{name}": "View consent status",
                "POST /vault/consent/update": "Grant or revoke consent",
                "DELETE /vault/consent/revoke/{name}": "Revoke all consent",
                "GET /vault/explain/{name}": "Explain score in detail",
                "GET /vault/fraud-check/{name}": "Run fraud detection"
            },
            "Lender Reports": {
                "GET /lender/report/{name}": "Full masked lender report",
                "GET /lender/eligible-borrowers?min_score=600": "Filter eligible borrowers"
            },
            "Demo": {
                "GET /demo/raju-story": "Full hackathon demo story",
                "GET /demo/all-endpoints": "This endpoint list"
            }
        }
    }