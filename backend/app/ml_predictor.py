import numpy as np
from sklearn.linear_model import LinearRegression
from typing import List, Dict, Any

def predict_budget_trend(monthly_budget: float, current_spent: float, current_day: int, days_in_month: int = 30, daily_history: List[float] = None) -> Dict[str, Any]:
    """
    Uses Linear Regression & daily velocity models to project month-end total spending.
    """
    current_day = max(1, min(current_day, days_in_month))
    
    if daily_history and len(daily_history) >= 3:
        days = np.array(range(1, len(daily_history) + 1)).reshape(-1, 1)
        cumulative = np.cumsum(daily_history).reshape(-1, 1)
        
        model = LinearRegression()
        model.fit(days, cumulative)
        
        # Predict day 30
        predicted_end = float(model.predict([[days_in_month]])[0][0])
        daily_burn_rate = float(model.coef_[0][0])
    else:
        # Simple velocity model
        daily_burn_rate = current_spent / current_day
        predicted_end = daily_burn_rate * days_in_month

    predicted_end = max(current_spent, round(predicted_end, 2))
    projected_overrun = max(0.0, round(predicted_end - monthly_budget, 2))
    
    remaining_days = max(1, days_in_month - current_day)
    remaining_budget = max(0.0, monthly_budget - current_spent)
    recommended_daily = round(remaining_budget / remaining_days, 2)
    
    # Status evaluation
    if predicted_end <= monthly_budget:
        status = "ON_TRACK"
    elif predicted_end <= monthly_budget * 1.15:
        status = "WARNING"
    else:
        status = "CRITICAL"

    return {
        "monthly_budget": monthly_budget,
        "current_spent": current_spent,
        "predicted_end_of_month": predicted_end,
        "projected_overrun": projected_overrun,
        "daily_burn_rate": round(daily_burn_rate, 2),
        "recommended_daily_limit": recommended_daily,
        "trend_status": status,
        "confidence_score": 0.88 if len(daily_history or []) >= 5 else 0.78
    }

def calculate_health_score(
    monthly_income: float,
    monthly_budget: float,
    total_spent: float,
    savings_rate: float = 20.0,
    categories_over_budget: int = 0,
    category_spend_map: Dict[str, float] = None,
    negative_spend: float = 0.0,
    positive_spend: float = 0.0
) -> Dict[str, Any]:
    """
    Computes Health Points based on category spending impact:
    - Negative Impact: Food & Dining, Miscellaneous, Subscriptions, Entertainment
    - Positive Impact: Housing, Transportation, Health, Education, Wealth/Savings & Others
    """
    income = max(100.0, monthly_income)
    
    if category_spend_map:
        neg_cats = ["Food & Dining", "Food", "Miscellaneous", "Subscriptions", "Entertainment"]
        calc_neg = sum(amt for cat, amt in category_spend_map.items() if any(n.lower() in cat.lower() for n in neg_cats))
        calc_pos = sum(amt for cat, amt in category_spend_map.items() if not any(n.lower() in cat.lower() for n in neg_cats))
        negative_spend = max(negative_spend, calc_neg)
        positive_spend = max(positive_spend, calc_pos)

    if negative_spend == 0.0 and positive_spend == 0.0:
        negative_spend = total_spent * 0.45
        positive_spend = total_spent * 0.55

    # Base Health Points Pool
    base_score = 70.0

    # Positive Impact Booster (+30 max for productive/essential spending and savings)
    pos_ratio = positive_spend / income if income > 0 else 0.0
    positive_boost = min(30.0, pos_ratio * 55.0)

    # Negative Impact Penalty (deducts points for discretionary food, misc, subscriptions, entertainment)
    neg_ratio = negative_spend / income if income > 0 else 0.0
    negative_penalty = neg_ratio * 65.0

    # Total Health Score calculation
    raw_score = base_score + positive_boost - negative_penalty
    total_score = int(round(max(10.0, min(99.0, raw_score))))

    pos_pts = int(round(positive_boost))
    neg_pts = int(round(negative_penalty))
    base_pts = int(round(base_score))

    if total_score >= 80:
        tier = "EXCELLENT"
        summary = f"Outstanding health score! Productive spend (+{pos_pts} pts) far outweighs discretionary deductions (-{neg_pts} pts)."
    elif total_score >= 65:
        tier = "GOOD"
        summary = f"Solid financial health. Discretionary food, entertainment & subscriptions deduct -{neg_pts} pts from your base score."
    elif total_score >= 50:
        tier = "FAIR"
        summary = f"Moderate health score. High spend on dining out, misc & subscriptions is penalizing your score (-{neg_pts} pts)."
    else:
        tier = "NEEDS_WORK"
        summary = f"Budget pressure alert! Non-essential category spend is severely impacting your score (-{neg_pts} pts deduction)."

    action_items = []
    if negative_spend > income * 0.20:
        action_items.append(f"Cut back on Food & Dining, Subscriptions, and Entertainment (currently ₹{negative_spend:,.0f}/mo) to eliminate -{neg_pts} penalty points.")
    if positive_spend < income * 0.30:
        action_items.append("Allocate more towards essential categories (Health, Education, Housing) and wealth savings to earn up to +30 positive points.")
    if categories_over_budget > 0:
        action_items.append(f"{categories_over_budget} categories are exceeding target caps. Reallocate funds to avoid overruns.")
    if not action_items:
        action_items.append("Maintain low discretionary food/entertainment spend to keep health points in the EXCELLENT tier.")

    return {
        "overall_score": total_score,
        "tier": tier,
        "breakdown": {
            "base_points": base_pts,
            "positive_boost": pos_pts,
            "negative_deductions": neg_pts,
            "negative_spend": int(round(negative_spend)),
            "positive_spend": int(round(positive_spend))
        },
        "recommendation_summary": summary,
        "action_items": action_items
    }

def simulate_savings_what_if(current_monthly_spend: float, current_income: float, reductions: Dict[str, float], timeframe_months: int = 12) -> Dict[str, Any]:
    """
    Simulates category percentage cutbacks and calculates compound 5% APY savings.
    """
    total_monthly_reduction = 0.0
    category_breakdown = {}

    for cat, amount_or_pct in reductions.items():
        if amount_or_pct <= 1.0: # percentage
            # Estimate default category base if not specified
            est_cat_spend = current_monthly_spend * 0.25 if "Food" in cat else current_monthly_spend * 0.10
            cut = est_cat_spend * amount_or_pct
        else: # absolute dollar value
            cut = amount_or_pct
            
        category_breakdown[cat] = round(cut, 2)
        total_monthly_reduction += cut

    orig_monthly_savings = max(0.0, current_income - current_monthly_spend)
    simulated_monthly_spend = max(0.0, current_monthly_spend - total_monthly_reduction)
    simulated_monthly_savings = current_income - simulated_monthly_spend

    # Compound growth model (assuming 5% APY annual yield)
    monthly_interest = 0.05 / 12
    compound_growth = []
    accumulated = 0.0

    for m in range(1, timeframe_months + 1):
        accumulated = (accumulated + total_monthly_reduction) * (1 + monthly_interest)
        compound_growth.append({
            "month": m,
            "principal_saved": round(total_monthly_reduction * m, 2),
            "total_with_interest": round(accumulated, 2)
        })

    # Updated health score
    new_health = calculate_health_score(
        monthly_income=current_income,
        monthly_budget=simulated_monthly_spend * 1.1,
        total_spent=simulated_monthly_spend,
        savings_rate=(simulated_monthly_savings / current_income) * 100
    )

    return {
        "original_monthly_savings": round(orig_monthly_savings, 2),
        "simulated_monthly_savings": round(simulated_monthly_savings, 2),
        "monthly_savings_increase": round(total_monthly_reduction, 2),
        "annual_projected_savings": round(compound_growth[-1]["total_with_interest"], 2),
        "updated_health_score": new_health["overall_score"],
        "breakdown_by_category": category_breakdown,
        "compound_growth_projection": compound_growth
    }
