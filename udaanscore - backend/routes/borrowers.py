from fastapi import APIRouter, HTTPException
from models.borrower import RepayLoanInput
from services.data_generator import BORROWERS_DB, get_risk_band, get_loan_limit, get_confidence, get_nano_stage

router = APIRouter()

# GET all borrowers
@router.get("/")
def get_all_borrowers():
    return {
        "total": len(BORROWERS_DB),
        "borrowers": BORROWERS_DB
    }

# GET one borrower by name
@router.get("/{name}")
def get_borrower(name: str):
    for borrower in BORROWERS_DB:
        if borrower["name"].lower() == name.lower():
            return borrower
    raise HTTPException(status_code=404, detail=f"Borrower '{name}' not found")

# POST repay loan — increases score
@router.post("/repay-loan")
def repay_loan(data: RepayLoanInput):
    for borrower in BORROWERS_DB:
        if borrower["name"].lower() == data.borrower_name.lower():
            old_score = borrower["trust_score"]

            # Score increase based on loan amount
            if data.loan_amount <= 2000:
                boost = 15
            elif data.loan_amount <= 5000:
                boost = 25
            elif data.loan_amount <= 15000:
                boost = 40
            else:
                boost = 60

            new_score = min(old_score + boost, 980)
            borrower["trust_score"] = new_score
            borrower["risk_band"] = get_risk_band(new_score)
            borrower["loan_limit"] = get_loan_limit(new_score)
            borrower["confidence"] = get_confidence(new_score)
            borrower["nano_loan_stage"] = get_nano_stage(new_score)
            borrower["total_loans_repaid"] += 1

            return {
                "message": "Loan repaid successfully!",
                "borrower": data.borrower_name,
                "old_score": old_score,
                "new_score": new_score,
                "score_boost": boost,
                "new_risk_band": borrower["risk_band"],
                "new_loan_limit": borrower["loan_limit"]
            }

    raise HTTPException(status_code=404, detail=f"Borrower '{data.borrower_name}' not found")