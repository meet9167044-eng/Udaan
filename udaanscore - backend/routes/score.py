from fastapi import APIRouter
from pydantic import BaseModel
from services.score_engine import calculate_trust_score

router = APIRouter()

# This defines what data the API expects to receive
class ScoreInput(BaseModel):
    bills: float
    upi: float
    cashflow: float
    savings: float
    location: float
    quiz: float

@router.post("/calculate")
def get_score(data: ScoreInput):
    result = calculate_trust_score(
        data.bills,
        data.upi,
        data.cashflow,
        data.savings,
        data.location,
        data.quiz
    )
    return result