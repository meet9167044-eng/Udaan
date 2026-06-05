def calculate_trust_score(bills, upi, cashflow, savings, location, quiz):
    
    # Step 1: Calculate raw score using weighted formula
    raw = (
        bills    * 0.20 +
        upi      * 0.20 +
        cashflow * 0.20 +
        savings  * 0.15 +
        location * 0.10 +
        quiz     * 0.15
    )

    # Step 2: Scale to 0-1000
    score = int(raw * 10)

    # Step 3: Determine Risk Band
    if score >= 800:
        risk = "Very Low Risk"
        loan_limit = 100000
    elif score >= 700:
        risk = "Low Risk"
        loan_limit = 50000
    elif score >= 600:
        risk = "Medium Risk"
        loan_limit = 15000
    elif score >= 500:
        risk = "High Risk"
        loan_limit = 5000
    else:
        risk = "Rejected"
        loan_limit = 0

    # Step 4: Confidence Score
    # Based on how many parameters have data (above 0)
    params = [bills, upi, cashflow, savings, location, quiz]
    filled = sum(1 for p in params if p > 0)

    if filled >= 6:
        confidence = "High"
    elif filled >= 4:
        confidence = "Medium"
    else:
        confidence = "Low"

    # Step 5: Explainability
    reasons = []

    if bills >= 80:
        reasons.append("✅ Bills paid consistently on time")
    else:
        reasons.append("❌ Irregular bill payment history")

    if upi >= 80:
        reasons.append("✅ Stable and regular UPI usage")
    else:
        reasons.append("❌ Low or inconsistent UPI activity")

    if cashflow >= 80:
        reasons.append("✅ Consistent monthly income flow")
    else:
        reasons.append("❌ Unstable cash flow detected")

    if savings >= 80:
        reasons.append("✅ Good savings habit maintained")
    else:
        reasons.append("❌ Low savings balance observed")

    if location >= 80:
        reasons.append("✅ Stable residential location")
    else:
        reasons.append("❌ Frequent location changes detected")

    if quiz >= 80:
        reasons.append("✅ Strong psychometric assessment")
    else:
        reasons.append("❌ Psychometric score needs improvement")

    return {
        "trust_score": score,
        "risk_band": risk,
        "loan_limit": loan_limit,
        "confidence": confidence,
        "reasons": reasons
    }