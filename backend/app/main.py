import os
from dotenv import load_dotenv

# Load environment variables from .env file
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(root_dir, '.env')
load_dotenv(dotenv_path=env_path)
load_dotenv()

from fastapi import FastAPI, HTTPException, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from app.schemas import (
    OCRScanResponse, BudgetPredictRequest, BudgetPredictResponse,
    HealthScoreRequest, HealthScoreResponse, WhatIfRequest, WhatIfResponse,
    SavingsPlanRequest, SavingsPlanResponse, PurchaseAdvisorRequest, PurchaseAdvisorResponse,
    RecommendationsRequest, AIChatRequest, AIChatResponse
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
    title="AI Personal Expense Tracker API",
    description="FastAPI Backend for OCR Receipt Extraction, ML Budget Forecasting, and OpenAI Advice",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite port 3000 / 3001)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AI Personal Expense Tracker API",
        "openai_configured": bool(os.environ.get("OPENAI_API_KEY")),
        "groq_configured": bool(os.environ.get("GROQ_API_KEY")),
        "mindee_configured": bool(os.environ.get("MINDEE_API_KEY")),
        "endpoints": [
            "/api/ocr/scan",
            "/api/ocr/upload",
            "/api/ocr/scan-receipt",
            "/api/stock/quote",
            "/api/ai/predict-budget",
            "/api/ai/health-score",
            "/api/ai/recommendations",
            "/api/ai/simulate",
            "/api/ai/savings-plan",
            "/api/ai/purchase-limit-advisor",
            "/api/ai/chat"
        ]
    }

@app.get("/api/stock/quote")
def api_stock_quote(symbol: str = "AAPL"):
    """
    Fetches real-time stock market quote from Finnhub API using custom FINNHUB_API_KEY from .env
    """
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

@app.post("/api/ocr/scan", response_model=OCRScanResponse)
def api_ocr_scan(file_path: str):
    """
    Extracts merchant, amount, date, category, and payment details from receipt file path.
    """
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Receipt image file not found")
    
    extracted = extract_ocr_data(file_path)
    return extracted

@app.post("/api/ocr/upload", response_model=OCRScanResponse)
@app.post("/api/ocr/scan-receipt", response_model=OCRScanResponse)
async def api_ocr_upload(file: UploadFile = File(...)):
    """
    Uploads receipt/invoice file (PNG/JPG/JPEG/WebP/PDF) and extracts merchant, total amount (₹),
    payment details, and itemized order breakdown using Groq & OpenAI Vision OCR.
    """
    temp_dir = os.path.join(os.getcwd(), "tmp_receipts")
    os.makedirs(temp_dir, exist_ok=True)

    file_location = os.path.join(temp_dir, file.filename)
    with open(file_location, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    print(f"[FASTAPI OCR] Received upload file: {file.filename} saved to {file_location}")
    extracted = extract_ocr_data(file_location)
    return extracted

@app.post("/api/ocr/parse-json")
async def api_ocr_parse_json(request: Request):
    """
    Parses Azure Document Intelligence / Vision OCR JSON output directly into structured expense record.
    """
    ocr_json = await request.json()
    extracted_text = parse_azure_vision_ocr_response(ocr_json)

    groq_key = os.environ.get("GROQ_API_KEY", "").strip()
    openai_key = os.environ.get("OPENAI_API_KEY", "").strip()

    if groq_key:
        res = extract_ocr_with_groq_api("azure_ocr.json", extracted_text, groq_key)
        res["ocr_engine"] = "Azure Vision OCR + Groq Llama-3.3"
        return res
    elif openai_key:
        res = extract_ocr_with_groq_api("azure_ocr.json", extracted_text, openai_key)
        res["ocr_engine"] = "Azure Vision OCR + OpenAI"
        return res
    else:
        today_str = datetime.now().strftime("%Y-%m-%d")
        return {
            "success": True,
            "merchant": "Extracted OCR Document",
            "amount": 0.0,
            "date": today_str,
            "category": "General",
            "payment_method": "Credit Card",
            "raw_text": extracted_text,
            "ocr_engine": "Azure Vision OCR Parser"
        }

@app.post("/api/ai/predict-budget", response_model=BudgetPredictResponse)
def api_predict_budget(req: BudgetPredictRequest):
    """
    Predicts end-of-month expenditure using linear regression burn-rate model.
    """
    res = predict_budget_trend(
        monthly_budget=req.monthly_budget,
        current_spent=req.current_spent,
        current_day=req.current_day,
        days_in_month=req.days_in_month
    )
    return res

@app.post("/api/ai/health-score", response_model=HealthScoreResponse)
def api_health_score(req: HealthScoreRequest):
    """
    Calculates overall 0-100 financial health score based on category spending weights.
    """
    res = calculate_health_score(
        monthly_income=req.monthly_income,
        monthly_budget=req.monthly_budget,
        total_spent=req.total_spent,
        savings_rate=req.savings_rate,
        categories_over_budget=req.categories_over_budget,
        category_spend_map=req.category_spend_map,
        negative_spend=req.negative_spend,
        positive_spend=req.positive_spend
    )
    return res

@app.post("/api/ai/recommendations")
def api_recommendations(req: RecommendationsRequest):
    """
    Generates personalized cost-cutting action cards and flags spending patterns.
    """
    recs = generate_ai_recommendations(req.expenses, req.monthly_budget, req.monthly_income)
    return {"recommendations": recs}

@app.post("/api/ai/simulate", response_model=WhatIfResponse)
def api_simulate(req: WhatIfRequest):
    """
    Simulates impact of category spending cutbacks over 12 months.
    """
    res = simulate_savings_what_if(
        current_income=req.current_income,
        current_monthly_spend=req.current_monthly_spend,
        reductions=req.reductions,
        timeframe_months=req.timeframe_months
    )
    return res

@app.post("/api/ai/savings-plan", response_model=SavingsPlanResponse)
def api_savings_plan(req: SavingsPlanRequest):
    """
    Generates milestone timeline and category cutbacks for achieving a targeted savings goal.
    """
    res = generate_savings_plan(
        target_goal_name=req.target_goal_name,
        target_amount=req.target_amount,
        target_months=req.target_months,
        current_income=req.current_income,
        current_expenses=req.current_expenses
    )
    return res

@app.post("/api/ai/purchase-limit-advisor", response_model=PurchaseAdvisorResponse)
def api_purchase_limit_advisor(req: PurchaseAdvisorRequest):
    """
    Calculates safe daily purchase caps, 50/30/20 savings allocations, and purchase verdicts.
    """
    res = calculate_purchase_advisor_limits(
        monthly_income=req.monthly_income,
        monthly_budget=req.monthly_budget,
        total_spent=req.total_spent,
        intended_purchase_name=req.intended_purchase_name or "",
        intended_purchase_amount=req.intended_purchase_amount or 0.0
    )
    return res

@app.post("/api/ai/chat", response_model=AIChatResponse)
def api_ai_chat(req: AIChatRequest):
    """
    OpenAI-powered conversational chatbot endpoint for personal financial advice.
    """
    history_dicts = [{"role": m.role, "content": m.content} for m in req.history]
    res = generate_openai_chatbot_response(
        message=req.message,
        history=history_dicts,
        monthly_income=req.monthly_income,
        monthly_budget=req.monthly_budget,
        total_spent=req.total_spent,
        expenses=req.expenses
    )
    return res
