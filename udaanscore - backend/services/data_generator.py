import random

INDIAN_NAMES = [
    "Raju Sharma", "Priya Patel", "Arjun Mehta", "Sunita Verma",
    "Vikram Singh", "Kavitha Nair", "Mohan Das", "Anjali Gupta",
    "Rahul Yadav", "Deepa Iyer", "Suresh Kumar", "Lakshmi Reddy",
    "Amit Joshi", "Pooja Mishra", "Rajesh Tiwari", "Meena Pillai",
    "Sanjay Bhat", "Rekha Shetty", "Arun Pandey", "Divya Naik"
]

OCCUPATIONS = [
    "Kirana Store Owner", "Gig Worker", "Freelancer", "Street Vendor",
    "Auto Driver", "Tailor", "Electrician", "Vegetable Seller",
    "Plumber", "Domestic Worker", "Carpenter", "Tea Stall Owner"
]

CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad",
    "Pune", "Kolkata", "Jaipur", "Lucknow", "Ahmedabad"
]

def get_risk_band(score):
    if score >= 800:
        return "Very Low Risk"
    elif score >= 700:
        return "Low Risk"
    elif score >= 600:
        return "Medium Risk"
    elif score >= 500:
        return "High Risk"
    else:
        return "Rejected"

def get_loan_limit(score):
    if score >= 800:
        return 100000
    elif score >= 700:
        return 50000
    elif score >= 600:
        return 15000
    elif score >= 500:
        return 5000
    else:
        return 0

def get_confidence(score):
    if score >= 700:
        return "High"
    elif score >= 550:
        return "Medium"
    else:
        return "Low"

def get_nano_stage(score):
    if score >= 800:
        return 4
    elif score >= 700:
        return 3
    elif score >= 600:
        return 2
    else:
        return 1

def generate_borrowers():
    borrowers = []
    for i, name in enumerate(INDIAN_NAMES):
        bills = round(random.uniform(50, 100), 1)
        upi = round(random.uniform(40, 100), 1)
        cashflow = round(random.uniform(45, 100), 1)
        savings = round(random.uniform(40, 95), 1)
        location = round(random.uniform(50, 100), 1)
        quiz = round(random.uniform(45, 100), 1)

        raw = (
            bills * 0.20 +
            upi * 0.20 +
            cashflow * 0.20 +
            savings * 0.15 +
            location * 0.10 +
            quiz * 0.15
        )
        score = int(raw * 10)
        score = max(300, min(score, 980))  # keep score realistic

        borrowers.append({
            "id": i + 1,
            "name": name,
            "age": random.randint(21, 55),
            "occupation": random.choice(OCCUPATIONS),
            "city": random.choice(CITIES),
            "trust_score": score,
            "risk_band": get_risk_band(score),
            "loan_limit": get_loan_limit(score),
            "confidence": get_confidence(score),
            "bills_score": bills,
            "upi_score": upi,
            "cashflow_score": cashflow,
            "savings_score": savings,
            "location_score": location,
            "quiz_score": quiz,
            "nano_loan_stage": get_nano_stage(score),
            "total_loans_repaid": random.randint(0, 5),
            "monthly_income": random.randint(8000, 60000)
        })

    return borrowers

# Generate once when the server starts
BORROWERS_DB = generate_borrowers()