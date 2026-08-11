import os
import json
import urllib.request
import urllib.parse
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(root_dir, '.env')
load_dotenv(dotenv_path=env_path)
load_dotenv()

from fastapi import FastAPI, HTTPException, File, UploadFile, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional

from app.schemas import (
    OCRScanResponse, BudgetPredictRequest, BudgetPredictResponse,
    HealthScoreRequest, HealthScoreResponse, WhatIfRequest, WhatIfResponse,
    SavingsPlanRequest, SavingsPlanResponse, PurchaseAdvisorRequest, PurchaseAdvisorResponse,
    RecommendationsRequest, AIChatRequest, AIChatResponse,
    ExpenseItem, UserSchema, CategorySchema, SavingsGoalSchema
)
from app.ocr_engine import extract_ocr_data
from app.ml_predictor import predict_budget_trend, calculate_health_score, simulate_savings_what_if
from app.ai_insights import (
    generate_ai_recommendations,
    calculate_purchase_advisor_limits,
    generate_openai_chatbot_response,
    generate_savings_plan
)

app = FastAPI(
    title="SpendAI Personal Expense Tracker API",
    description="Unified Python FastAPI Backend for OCR Receipt Extraction, Stock Quotes, ML Budget Forecasting, and Financial AI Coaching",
    version="2.0.0"
)

# Enable CORS for React web app & mobile Expo apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory mock storage (mirrors Supabase for standalone Python API fallback)
db_users = {}
db_expenses = []
db_categories = [
  { "id": "cat-1", "name": "Food & Dining", "icon": "Utensils", "color": "#f59e0b", "monthly_limit": 15000.00 },
  { "id": "cat-2", "name": "Transportation", "icon": "Car", "color": "#3b82f6", "monthly_limit": 8000.00 },
  { "id": "cat-3", "name": "Housing & Utilities", "icon": "Home", "color": "#6366f1", "monthly_limit": 20000.00 },
  { "id": "cat-4", "name": "Shopping & Electronics", "icon": "ShoppingBag", "color": "#ec4899", "monthly_limit": 10000.00 },
  { "id": "cat-5", "name": "Entertainment", "icon": "Film", "color": "#8b5cf6", "monthly_limit": 5000.00 }
]
db_goals = []

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "SpendAI Unified Python FastAPI Backend",
        "openai_configured": bool(os.environ.get("OPENAI_API_KEY")),
        "groq_configured": bool(os.environ.get("GROQ_API_KEY")),
        "mindee_configured": bool(os.environ.get("MINDEE_API_KEY")),
        "finnhub_configured": bool(os.environ.get("FINNHUB_API_KEY")),
        "endpoints": [
            "/api/users",
            "/api/expenses",
            "/api/categories",
            "/api/savings-goals",
            "/api/stock/quote",
            "/api/ocr/scan",
            "/api/ocr/upload",
            "/api/ai/predict-budget",
            "/api/ai/health-score",
            "/api/ai/recommendations",
            "/api/ai/simulate",
            "/api/ai/savings-plan",
            "/api/ai/purchase-limit-advisor",
            "/api/ai/chat"
        ]
    }

# ==========================================
# 1. USER PROFILES API
# ==========================================
@app.get("/api/users")
def get_all_users():
    return list(db_users.values())

@app.get("/api/users/{user_id}")
def get_user_by_id(user_id: str):
    if user_id in db_users:
        return db_users[user_id]
    return {
        "id": user_id,
        "email": "user@example.com",
        "full_name": "User",
        "monthly_income": 85000.0,
        "monthly_budget": 55000.0,
        "currency": "₹",
        "occupation": "Professional",
        "financial_strategy": "Moderate Wealth Builder"
    }

@app.put("/api/users/{user_id}")
def update_user(user_id: str, user: UserSchema):
    db_users[user_id] = user.dict()
    return db_users[user_id]

# ==========================================
# 2. EXPENSES API
# ==========================================
@app.get("/api/expenses")
def get_expenses(user_id: Optional[str] = None):
    if user_id:
        return [e for e in db_expenses if e.get("user_id") == user_id]
    return []

@app.post("/api/expenses")
def create_expense(expense: ExpenseItem):
    exp_data = expense.dict()
    if not exp_data.get("id"):
        exp_data["id"] = f"exp-{len(db_expenses) + 1}"
    db_expenses.append(exp_data)
    return exp_data

@app.delete("/api/expenses/{expense_id}")
def delete_expense(expense_id: str):
    global db_expenses
    db_expenses = [e for e in db_expenses if e.get("id") != expense_id]
    return {"message": "Expense deleted successfully", "id": expense_id}

@app.get("/api/expenses/summary")
def get_expense_summary(user_id: Optional[str] = None):
    filtered = [e for e in db_expenses if not user_id or e.get("user_id") == user_id]
    total = sum(e.get("amount", 0.0) for e in filtered)
    return {
        "total_spent": total,
        "count": len(filtered),
        "user_id": user_id
    }

# ==========================================
# 3. CATEGORIES API
# ==========================================
@app.get("/api/categories")
def get_categories():
    return db_categories

@app.post("/api/categories")
def create_category(cat: CategorySchema):
    cat_data = cat.dict()
    if not cat_data.get("id"):
        cat_data["id"] = f"cat-{len(db_categories) + 1}"
    db_categories.append(cat_data)
    return cat_data

@app.delete("/api/categories/{category_id}")
def delete_category(category_id: str):
    global db_categories
    db_categories = [c for c in db_categories if c.get("id") != category_id]
    return {"message": "Category deleted successfully", "id": category_id}

# ==========================================
# 4. SAVINGS GOALS API
# ==========================================
@app.get("/api/savings-goals")
def get_savings_goals(user_id: Optional[str] = None):
    if user_id:
        return [g for g in db_goals if g.get("user_id") == user_id]
    return db_goals

@app.post("/api/savings-goals")
def create_savings_goal(goal: SavingsGoalSchema):
    goal_data = goal.dict()
    if not goal_data.get("id"):
        goal_data["id"] = f"goal-{len(db_goals) + 1}"
    db_goals.append(goal_data)
    return goal_data

@app.delete("/api/savings-goals/{goal_id}")
def delete_savings_goal(goal_id: str):
    global db_goals
    db_goals = [g for g in db_goals if g.get("id") != goal_id]
    return {"message": "Savings Goal deleted successfully", "id": goal_id}

# ==========================================
# 5. STOCK MARKET QUOTES API
# ==========================================
@app.get("/api/stock/quote")
def api_stock_quote(symbol: str = "AAPL"):
    finnhub_key = os.environ.get("FINNHUB_API_KEY", "").strip()
    if not finnhub_key:
        finnhub_key = "d9iqat1r01qvkt7dndggd9iqat1r01qvkt7dndh0"

    try:
        url = f"https://finnhub.io/api/v1/quote?symbol={symbol.upper()}&token={finnhub_key}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data and "c" in data and data["c"] > 0:
                return {
                    "symbol": symbol.upper(),
                    "currentPrice": data.get("c"),
                    "change": data.get("d"),
                    "percentChange": data.get("dp"),
                    "high": data.get("h"),
                    "low": data.get("l"),
                    "open": data.get("o"),
                    "previousClose": data.get("pc"),
                    "success": True
                }
            raise HTTPException(status_code=404, detail=f"Stock symbol '{symbol}' not found on Finnhub")
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Finnhub API error: {err}")

# ==========================================
# 6. OCR RECEIPT EXTRACTOR API
# ==========================================
@app.post("/api/ocr/scan", response_model=OCRScanResponse)
def api_ocr_scan(file_path: str):
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Receipt image file not found")
    return extract_ocr_data(file_path)

@app.post("/api/ocr/upload", response_model=OCRScanResponse)
@app.post("/api/ocr/scan-receipt", response_model=OCRScanResponse)
async def api_ocr_upload(file: UploadFile = File(...)):
    temp_dir = os.path.join(os.getcwd(), "tmp_receipts")
    os.makedirs(temp_dir, exist_ok=True)

    file_location = os.path.join(temp_dir, file.filename)
    with open(file_location, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    print(f"[FASTAPI OCR] Received upload file: {file.filename}")
    return extract_ocr_data(file_location)

# ==========================================
# 7. AI & MACHINE LEARNING INSIGHTS API
# ==========================================
@app.post("/api/ai/predict-budget", response_model=BudgetPredictResponse)
def api_predict_budget(req: BudgetPredictRequest):
    return predict_budget_trend(
        monthly_budget=req.monthly_budget,
        current_spent=req.current_spent,
        current_day=req.current_day,
        days_in_month=req.days_in_month
    )

@app.post("/api/ai/health-score", response_model=HealthScoreResponse)
def api_health_score(req: HealthScoreRequest):
    return calculate_health_score(
        monthly_income=req.monthly_income,
        monthly_budget=req.monthly_budget,
        total_spent=req.total_spent,
        savings_rate=req.savings_rate,
        categories_over_budget=req.categories_over_budget,
        category_spend_map=req.category_spend_map,
        negative_spend=req.negative_spend,
        positive_spend=req.positive_spend
    )

@app.post("/api/ai/recommendations")
def api_recommendations(req: RecommendationsRequest):
    recs = generate_ai_recommendations(req.expenses, req.monthly_budget, req.monthly_income)
    return {"recommendations": recs}

@app.post("/api/ai/simulate", response_model=WhatIfResponse)
def api_simulate(req: WhatIfRequest):
    return simulate_savings_what_if(
        current_income=req.current_income,
        current_monthly_spend=req.current_monthly_spend,
        reductions=req.reductions,
        timeframe_months=req.timeframe_months
    )

@app.post("/api/ai/savings-plan", response_model=SavingsPlanResponse)
def api_savings_plan(req: SavingsPlanRequest):
    return generate_savings_plan(
        target_goal_name=req.target_goal_name,
        target_amount=req.target_amount,
        target_months=req.target_months,
        current_income=req.current_income,
        current_expenses=req.current_expenses
    )

@app.post("/api/ai/purchase-limit-advisor", response_model=PurchaseAdvisorResponse)
def api_purchase_limit_advisor(req: PurchaseAdvisorRequest):
    return calculate_purchase_advisor_limits(
        monthly_income=req.monthly_income,
        monthly_budget=req.monthly_budget,
        total_spent=req.total_spent,
        intended_purchase_name=req.intended_purchase_name or "",
        intended_purchase_amount=req.intended_purchase_amount or 0.0
    )

@app.post("/api/ai/chat", response_model=AIChatResponse)
def api_ai_chat(req: AIChatRequest):
    history_dicts = [{"role": m.role, "content": m.content} for m in req.history]
    return generate_openai_chatbot_response(
        message=req.message,
        history=history_dicts,
        monthly_income=req.monthly_income,
        monthly_budget=req.monthly_budget,
        total_spent=req.total_spent,
        expenses=req.expenses
    )
