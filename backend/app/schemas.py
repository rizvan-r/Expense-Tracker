from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# Expense Item Schema
class ExpenseItem(BaseModel):
    id: Optional[str] = None
    merchant: str
    amount: float
    date: str
    category: str
    payment_method: Optional[str] = "Credit Card"
    notes: Optional[str] = ""

# Itemized Order Detail Schema
class ReceiptOrderItem(BaseModel):
    item_name: str
    quantity: int = 1
    unit_price: float = 0.0
    total_price: float = 0.0

# OCR Scan Response
class OCRScanResponse(BaseModel):
    success: bool
    merchant: str
    amount: float
    date: str
    category: str
    payment_method: str = "UPI / GPay"
    payment_details: Optional[Dict[str, Any]] = None
    confidence: float = 0.95
    items: List[ReceiptOrderItem] = []
    raw_text: str = ""

# Budget Prediction Request & Response
class BudgetPredictRequest(BaseModel):
    monthly_budget: float = 55000.0
    current_spent: float = 0.0
    days_in_month: int = 30
    current_day: int = 15
    daily_history: List[float] = []

class BudgetPredictResponse(BaseModel):
    monthly_budget: float
    current_spent: float
    predicted_end_of_month: float
    projected_overrun: float
    daily_burn_rate: float
    recommended_daily_limit: float
    trend_status: str  # "ON_TRACK", "WARNING", "CRITICAL"
    confidence_score: float

# Financial Health Score Request & Response
class HealthScoreRequest(BaseModel):
    monthly_income: float = 85000.0
    monthly_budget: float = 55000.0
    total_spent: float = 0.0
    savings_rate: float = 20.0
    categories_over_budget: int = 0
    recurring_bills_count: int = 0
    category_spend_map: Dict[str, float] = Field(default_factory=dict)
    negative_spend: float = 0.0
    positive_spend: float = 0.0

class HealthScoreResponse(BaseModel):
    overall_score: int
    tier: str  # "EXCELLENT", "GOOD", "FAIR", "NEEDS_WORK"
    breakdown: Dict[str, int]
    recommendation_summary: str
    action_items: List[str]

# Recommendations Request
class RecommendationsRequest(BaseModel):
    expenses: List[Dict[str, Any]] = []
    monthly_budget: float = 55000.0
    monthly_income: float = 85000.0

# What-If Simulator Request & Response
class WhatIfRequest(BaseModel):
    current_monthly_spend: float = 0.0
    current_income: float = 85000.0
    reductions: Dict[str, float] = Field(default_factory=dict)
    timeframe_months: int = 12

class WhatIfResponse(BaseModel):
    original_monthly_savings: float
    simulated_monthly_savings: float
    monthly_savings_increase: float
    annual_projected_savings: float
    updated_health_score: int
    breakdown_by_category: Dict[str, float]
    compound_growth_projection: List[Dict[str, Any]]

# Savings Plan Request & Response
class SavingsPlanRequest(BaseModel):
    target_goal_name: str = "Savings Goal"
    target_amount: float = 50000.0
    target_months: int = 6
    current_income: float = 85000.0
    current_expenses: List[Dict[str, Any]] = []

class SavingsPlanResponse(BaseModel):
    goal_name: str
    monthly_target_savings: float
    feasible: bool
    ai_strategy_summary: str
    milestone_timeline: List[Dict[str, Any]]
    category_cutbacks: Dict[str, float]

# Purchase Limit & AI Advisor Request & Response
class PurchaseAdvisorRequest(BaseModel):
    monthly_income: float = 85000.0
    monthly_budget: float = 55000.0
    total_spent: float = 0.0
    intended_purchase_name: Optional[str] = ""
    intended_purchase_amount: Optional[float] = 0.0
    payment_terms_months: int = 1

class PurchaseAdvisorResponse(BaseModel):
    safe_daily_purchase_limit: float
    max_one_time_purchase_limit: float
    recommended_monthly_savings: float
    allocation_50_30_20: Dict[str, float] = Field(default_factory=dict, alias="50_30_20_allocation")
    affordability_verdict: str  # "APPROVED", "CAUTION", "NOT_RECOMMENDED"
    affordability_details: str
    category_purchase_caps: Dict[str, float]
    ai_coaching_insights: List[str]

    class Config:
        populate_by_name = True

# OpenAI Chat Request & Response
class AIChatMessage(BaseModel):
    role: str  # "user" or "assistant" or "system"
    content: str

class AIChatRequest(BaseModel):
    message: str
    history: List[AIChatMessage] = []
    monthly_income: float = 85000.0
    monthly_budget: float = 55000.0
    total_spent: float = 0.0
    expenses: List[Dict[str, Any]] = []

class AIChatResponse(BaseModel):
    reply: str
    source: str  # "openai" or "rule_engine"
    suggested_actions: List[str] = []
