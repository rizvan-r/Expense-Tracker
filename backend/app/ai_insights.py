import os
import json
import urllib.request
import urllib.parse
import urllib.error
from typing import List, Dict, Any

def generate_ai_recommendations(
    expenses: List[Dict[str, Any]],
    monthly_budget: float,
    monthly_income: float
) -> List[Dict[str, Any]]:
    """
    Generates intelligent cost-cutting recommendation cards based on expense history.
    """
    total_spent = sum(e.get("amount", 0) for e in expenses)
    recs = []

    # Category totals
    cat_totals: Dict[str, float] = {}
    for e in expenses:
        cat = e.get("category", "Uncategorized")
        cat_totals[cat] = cat_totals.get(cat, 0) + e.get("amount", 0)

    # 1. Flag high spending categories
    food_spend = cat_totals.get("Food & Dining", 0)
    if food_spend > 0:
        est_save = round(food_spend * 0.25)
        pct = round((food_spend / max(1, monthly_budget)) * 100)
        recs.append({
            "id": "rec_food",
            "title": "Food & Dining Outlay Optimization",
            "category": "Food & Dining",
            "impact_savings": f"₹{est_save:,.0f}/mo",
            "description": f"Dining & delivery total ₹{food_spend:,.0f} ({pct}% of target budget). Meal prepping 3 days a week saves ₹{est_save:,.0f} monthly.",
            "priority": "HIGH" if food_spend > monthly_budget * 0.30 else "MEDIUM",
            "action_label": "Set Dining Cap"
        })
    else:
        recs.append({
            "id": "rec_food_default",
            "title": "Smart Meal Prep Savings",
            "category": "Food & Dining",
            "impact_savings": "₹2,500/mo",
            "description": "Limiting restaurant takeaways to weekends can unlock up to ₹2,500 in monthly cash flow.",
            "priority": "MEDIUM",
            "action_label": "Set Food Cap"
        })

    sub_spend = cat_totals.get("Subscriptions", 0)
    if sub_spend > 0:
        est_save = round(sub_spend * 0.35)
        recs.append({
            "id": "rec_sub",
            "title": "Subscription Audit & Consolidation",
            "category": "Subscriptions",
            "impact_savings": f"₹{est_save:,.0f}/mo",
            "description": f"You spend ₹{sub_spend:,.0f}/month on recurring subscriptions. Pausing one unused app saves ~₹{est_save * 12:,.0f}/year.",
            "priority": "MEDIUM",
            "action_label": "Audit Subscriptions"
        })
    else:
        recs.append({
            "id": "rec_sub_default",
            "title": "Streaming & Digital Subscriptions Audit",
            "category": "Subscriptions",
            "impact_savings": "₹850/mo",
            "description": "Audit duplicate digital entertainment apps to reclaim recurring subscription funds.",
            "priority": "LOW",
            "action_label": "Audit Subscriptions"
        })

    # 2. 50/30/20 Savings Goal Check
    target_savings = monthly_income * 0.20
    actual_savings = max(0, monthly_income - total_spent)
    if actual_savings < target_savings:
        deficit = target_savings - actual_savings
        recs.append({
            "id": "rec_savings",
            "title": "50/30/20 Wealth Building Deficit",
            "category": "Savings & Vaults",
            "impact_savings": f"₹{deficit:,.0f} Deficit",
            "description": f"Current monthly savings (₹{actual_savings:,.0f}) fall short of your 20% target (₹{target_savings:,.0f}/mo). Adjust discretionary caps.",
            "priority": "HIGH",
            "action_label": "Adjust Monthly Cap"
        })
    else:
        recs.append({
            "id": "rec_wealth",
            "title": "20% Wealth Builder Target Met!",
            "category": "Wealth Building",
            "impact_savings": f"Saved ₹{actual_savings:,.0f}",
            "description": f"Saved ₹{actual_savings:,.0f} ({round((actual_savings/max(1, monthly_income))*100)}% of income). Consider investing in SIPs or Index Funds.",
            "priority": "MEDIUM",
            "action_label": "Explore SIP Options"
        })

    return recs

def calculate_purchase_advisor_limits(
    monthly_income: float,
    monthly_budget: float,
    total_spent: float,
    intended_purchase_name: str = "",
    intended_purchase_amount: float = 0.0
) -> Dict[str, Any]:
    """
    Calculates 50/30/20 budget allocations, safe daily purchase limits, and instant purchase verdicts.
    """
    rem_budget = monthly_budget - total_spent
    daily_cap = max(300.0, float(round(rem_budget / 15.0))) if rem_budget > 0 else 0.0
    max_one_time = round(monthly_budget * 0.25, 2)
    rec_savings = round(monthly_income * 0.20, 2)

    needs = round(monthly_income * 0.50, 2)
    wants = round(monthly_income * 0.30, 2)

    verdict = "APPROVED"
    details = f"This purchase fits comfortably within your remaining discretionary budget (₹{rem_budget:,.0f})."
    
    if intended_purchase_amount > 0:
        if total_spent + intended_purchase_amount > monthly_budget:
            verdict = "NOT_RECOMMENDED"
            details = f"Warning: Buying '{intended_purchase_name or 'Item'}' (₹{intended_purchase_amount:,.0f}) will exceed your target budget by ₹{(total_spent + intended_purchase_amount - monthly_budget):,.0f}."
        elif total_spent + intended_purchase_amount > monthly_budget * 0.90:
            verdict = "CAUTION"
            details = f"Caution: '{intended_purchase_name or 'Item'}' leaves very little cushion for the rest of the month."

    category_caps = {
        "Food & Dining": round(monthly_budget * 0.25, 2),
        "Shopping & Electronics": round(monthly_budget * 0.20, 2),
        "Entertainment": round(monthly_budget * 0.10, 2),
        "Housing & Utilities": round(monthly_budget * 0.35, 2),
        "Subscriptions": round(monthly_budget * 0.05, 2)
    }

    insights = [
        f"Recommended Daily Purchase Cap: Keep non-essential daily spend below ₹{daily_cap:,.0f}/day.",
        f"50/30/20 Rule: Allocate ₹{needs:,.0f} for Needs, ₹{wants:,.0f} for Wants, and ₹{rec_savings:,.0f} for Savings.",
        f"Single Item Cap: Avoid individual purchases exceeding ₹{max_one_time:,.0f} without a 48-hour cool-down period."
    ]

    return {
        "safe_daily_purchase_limit": daily_cap,
        "max_one_time_purchase_limit": max_one_time,
        "recommended_monthly_savings": rec_savings,
        "allocation_50_30_20": {
            "needs": needs,
            "wants": wants,
            "savings": rec_savings
        },
        "affordability_verdict": verdict,
        "affordability_details": details,
        "category_purchase_caps": category_caps,
        "ai_coaching_insights": insights
    }

def generate_savings_plan(
    target_goal_name: str,
    target_amount: float,
    target_months: int,
    current_income: float,
    current_expenses: List[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generates structured milestone timeline and category cutback strategy for savings goal.
    """
    months = max(1, target_months)
    monthly_target = round(target_amount / months, 2)
    feasible = monthly_target <= (current_income * 0.4)

    milestones = []
    accum = 0.0
    for m in range(1, months + 1):
        accum += monthly_target
        milestones.append({
            "month": m,
            "target_date": f"Month {m}",
            "accumulated_target": round(min(target_amount, accum), 2),
            "completion_percentage": min(100, int(round((accum / target_amount) * 100))),
            "milestone_title": f"Goal Achieved! (₹{target_amount:,.0f})" if m == months else f"Milestone {m}: ₹{accum:,.0f}"
        })

    cutbacks = {
        "Food & Dining": round(monthly_target * 0.45, 2),
        "Entertainment": round(monthly_target * 0.35, 2),
        "Shopping": round(monthly_target * 0.20, 2)
    }

    strategy = (
        f"Targeting ₹{monthly_target:,.0f}/month across {months} months for '{target_goal_name}'. "
        f"Trimming non-essential dining out and shopping delivers this milestone effortlessly."
    )

    return {
        "goal_name": target_goal_name,
        "monthly_target_savings": monthly_target,
        "feasible": feasible,
        "ai_strategy_summary": strategy,
        "milestone_timeline": milestones,
        "category_cutbacks": cutbacks
    }

def generate_openai_chatbot_response(
    message: str,
    history: List[Dict[str, str]],
    monthly_income: float,
    monthly_budget: float,
    total_spent: float,
    expenses: List[Dict[str, Any]] = []
) -> Dict[str, Any]:
    """
    Intelligent Conversational Financial Assistant using Groq (Llama-3.3-70b) and OpenAI (gpt-4o-mini).
    Provides detailed, contextual financial advice, purchase advice, SIP/tax tips, and budget insights.
    """
    groq_key = os.environ.get("GROQ_API_KEY", "").strip()
    openai_key = os.environ.get("OPENAI_API_KEY", "").strip()

    rem_budget = monthly_budget - total_spent
    daily_cap = max(300, round(rem_budget / 15)) if rem_budget > 0 else 0

    # Top expense summary for context
    exp_summary = ""
    if expenses:
        top_exps = sorted(expenses, key=lambda x: x.get("amount", 0), reverse=True)[:5]
        exp_summary = "Recent Top Expenses:\n" + "\n".join(
            [f"- {e.get('merchant', 'Expense')}: ₹{e.get('amount', 0):,.0f} ({e.get('category', 'General')})" for e in top_exps]
        )

    system_prompt = (
        f"You are SpendAI, an intelligent financial advisor for Indian users managing expenses in Indian Rupees (₹).\n"
        f"User Financial Profile:\n"
        f"- Monthly Income: ₹{monthly_income:,.0f}\n"
        f"- Monthly Budget: ₹{monthly_budget:,.0f}\n"
        f"- Total Spent This Month: ₹{total_spent:,.0f}\n"
        f"- Remaining Budget: ₹{rem_budget:,.0f}\n"
        f"- Recommended Daily Cap: ₹{daily_cap:,.0f}/day\n"
        f"{exp_summary}\n\n"
        f"Instructions:\n"
        f"1. Directly, accurately, and thoughtfully answer the user's specific question.\n"
        f"2. Use formatted markdown with bullet points, bold key terms, and exact ₹ amounts.\n"
        f"3. Offer practical advice tailored to Indian personal finance (SIP, Mutual Funds, Tax 80C, 50/30/20 rule, budget management).\n"
        f"4. Be encouraging, concise, and helpful. Keep responses under 200 words."
    )

    # 1. TRY GROQ CLOUD API (Llama-3.3-70b-versatile)
    if groq_key:
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            api_messages = [{"role": "system", "content": system_prompt}]

            if history:
                for h in history[-8:]:
                    role = "user" if h.get("role") in ["user", "human"] else "assistant"
                    api_messages.append({"role": role, "content": h.get("content", "")})

            api_messages.append({"role": "user", "content": message})

            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": api_messages,
                "temperature": 0.6,
                "max_tokens": 400
            }

            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {groq_key}",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
                method="POST"
            )

            with urllib.request.urlopen(req, timeout=12) as resp:
                res_data = json.loads(resp.read().decode("utf-8"))
                reply_text = res_data["choices"][0]["message"]["content"]
                print(f"[GROQ CHATBOT] Generated response for query: '{message}'")
                return {
                    "reply": reply_text,
                    "source": "groq_llama3",
                    "suggested_actions": ["💡 Safe Daily Cap?", "🔮 Spending Projection", "📊 50/30/20 Breakdown"]
                }
        except Exception as err:
            print(f"[GROQ CHATBOT Error]: {err}")

    # 2. TRY OPENAI CHAT API (gpt-4o-mini)
    if openai_key:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            api_messages = [{"role": "system", "content": system_prompt}]

            if history:
                for h in history[-8:]:
                    role = "user" if h.get("role") in ["user", "human"] else "assistant"
                    api_messages.append({"role": role, "content": h.get("content", "")})

            api_messages.append({"role": "user", "content": message})

            payload = {
                "model": "gpt-4o-mini",
                "messages": api_messages,
                "temperature": 0.7,
                "max_tokens": 400
            }

            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {openai_key}"
                },
                method="POST"
            )

            with urllib.request.urlopen(req, timeout=12) as resp:
                res_data = json.loads(resp.read().decode("utf-8"))
                reply_text = res_data["choices"][0]["message"]["content"]
                print(f"[OPENAI CHATBOT] Generated response for query: '{message}'")
                return {
                    "reply": reply_text,
                    "source": "openai",
                    "suggested_actions": ["💡 Safe Daily Cap?", "🔮 Spending Projection", "📊 50/30/20 Breakdown"]
                }
        except Exception as err:
            print(f"[OPENAI CHATBOT Error]: {err}")

    # 3. COMPREHENSIVE KEYWORD-BASED FINANCIAL AI KNOWLEDGE ENGINE
    msg_lower = message.lower()
    reply = get_keyword_financial_response(
        msg_lower,
        income=monthly_income,
        budget=monthly_budget,
        spent=total_spent,
        rem_budget=rem_budget,
        daily_cap=daily_cap
    )

    return {
        "reply": reply,
        "source": "keyword_engine",
        "suggested_actions": ["💡 Daily Cap?", "📈 SIP Investments", "🏛️ Tax Savings (80C)", "📊 50/30/20 Rule"]
    }

def get_keyword_financial_response(
    msg_lower: str,
    income: float,
    budget: float,
    spent: float,
    rem_budget: float,
    daily_cap: float
) -> str:
    target_savings = round(income * 0.20)
    needs = round(income * 0.50)
    wants = round(income * 0.30)
    emergency = round(budget * 3)

    if any(k in msg_lower for k in ["sip", "invest", "mutual fund", "stock", "equity", "nifty", "portfolio", "wealth", "cagr", "sensex", "elss"]):
        return (
            f"📈 **Investment & Wealth Growth Strategy**:\n"
            f"• **Target Monthly SIP**: Based on your ₹{income:,.0f} income, invest at least **₹{target_savings:,.0f}/month** (20% rule).\n"
            f"• **Recommended Vehicles**: Low-cost Nifty 50 Index Funds, Flexi-Cap Mutual Funds, and ELSS for 80C tax benefits.\n"
            f"• **Compounding Power**: Investing ₹{target_savings:,.0f}/mo at a 12% CAGR yields **~₹25+ Lakhs** in 10 years!\n"
            f"• **Rule**: Build an emergency buffer first before allocating to long-term equity market funds."
        )

    elif any(k in msg_lower for k in ["tax", "80c", "80d", "nps", "deduction", "income tax", "hra", "regime", "tds", "standard deduction"]):
        return (
            f"🏛️ **Tax Saving & Optimization Guide**:\n"
            f"• **Section 80C**: Save up to ₹1.5 Lakh/year via ELSS Mutual Funds (3-yr lock-in), PPF, or EPF.\n"
            f"• **Section 80D**: Claim up to ₹25,000 deduction for personal & family health insurance premiums.\n"
            f"• **Section 80CCD (1B)**: Invest up to ₹50,000 in NPS (National Pension System) for an exclusive additional deduction.\n"
            f"• **HRA & Standard Deduction**: Claim HRA rent receipts under Old Regime, or enjoy ₹75,000 standard deduction under New Regime."
        )

    elif any(k in msg_lower for k in ["food", "swiggy", "zomato", "dining", "restaurant", "grocery", "groceries", "eat"]):
        return (
            f"🍕 **Food & Dining Expense Control**:\n"
            f"• **Current Situation**: Dining out and online food deliveries represent one of the highest discretionary spend categories.\n"
            f"• **Optimization Rule**: Cap monthly food delivery apps (Swiggy/Zomato) to 15% of your wants budget (**₹{round(wants * 0.15):,.0f}/mo**).\n"
            f"• **Actionable Tip**: Replacing 2 takeaway orders a week with home-cooked meal prep saves **~₹3,500/month**."
        )

    elif any(k in msg_lower for k in ["emergency", "liquid", "rainy day", "buffer", "fd", "fixed deposit"]):
        return (
            f"🛡️ **Emergency Fund Strategy**:\n"
            f"• **Target Vault**: Maintain **₹{emergency:,.0f}** (3 to 6 months of essential living expenses).\n"
            f"• **Where to Keep It**: Split 50% in a High-Yield Savings Account and 50% in a Liquid Mutual Fund or sweep-in FD for instant 24/7 liquidity."
        )

    elif any(k in msg_lower for k in ["50/30/20", "rule", "allocation", "ratio", "split"]):
        return (
            f"📊 **50/30/20 Budget Breakdown (For ₹{income:,.0f} Income)**:\n"
            f"• **Needs (50%)**: **₹{needs:,.0f}** (Rent, utilities, groceries, health insurance)\n"
            f"• **Wants (30%)**: **₹{wants:,.0f}** (Dining out, shopping, hobbies, travel)\n"
            f"• **Savings (20%)**: **₹{target_savings:,.0f}** (SIPs, emergency vault, wealth investments)"
        )

    elif any(k in msg_lower for k in ["daily", "cap", "limit", "velocity", "burn", "spend rate"]):
        return (
            f"💡 **Safe Daily Spending Cap**:\n"
            f"• **Current Cap**: **₹{daily_cap:,.0f}/day** for non-essential spending.\n"
            f"• **Status**: You have spent **₹{spent:,.0f}** of your **₹{budget:,.0f}** monthly budget (**₹{rem_budget:,.0f}** remaining).\n"
            f"• **Tip**: Keeping daily discretionary purchases below ₹{daily_cap:,.0f} guarantees you finish the month under budget!"
        )

    elif any(k in msg_lower for k in ["afford", "buy", "purchase", "laptop", "phone", "iphone", "trip", "can i", "cost"]):
        safe_single_item = round(budget * 0.25)
        return (
            f"🛍️ **Affordability Evaluator**:\n"
            f"• **Remaining Budget**: **₹{rem_budget:,.0f}**\n"
            f"• **Safe Single-Item Limit**: **₹{safe_single_item:,.0f}** without cool-down.\n"
            f"• **Advice**: If your intended item costs more than ₹{safe_single_item:,.0f}, apply the **48-Hour Rule** before buying to prevent impulse purchases."
        )

    elif any(k in msg_lower for k in ["credit card", "debt", "emi", "loan", "cibil", "interest", "score"]):
        return (
            f"💳 **Credit & Debt Optimization**:\n"
            f"• **Credit Card Rule**: Always pay 100% of the total bill amount before the due date to avoid 36-42% annual interest.\n"
            f"• **CIBIL Boost**: Keep total credit utilization below 30% of your limit to maintain a 750+ CIBIL score.\n"
            f"• **Debt Payoff Strategy**: Use the Avalanche method (pay highest interest debt first) or Snowball method (pay smallest balance first)."
        )

    elif any(k in msg_lower for k in ["save", "saving", "how to save", "reduce", "cut", "lower"]):
        return (
            f"💰 **3 Quick Money-Saving Moves**:\n"
            f"1. **Automate Payday Transfer**: Auto-debit ₹{target_savings:,.0f} to your savings SIP on the 1st of every month.\n"
            f"2. **Audit Subscriptions**: Cancel unused streaming/app subscriptions to save ₹850-₹1,500/month.\n"
            f"3. **Cap Daily Outflows**: Keep non-essential purchases below your safe daily cap of ₹{daily_cap:,.0f}/day."
        )

    elif any(k in msg_lower for k in ["insurance", "health", "life", "term"]):
        return (
            f"🩺 **Protection & Insurance Checklist**:\n"
            f"• **Term Life Insurance**: Get coverage equal to 10-15x your annual income if you have dependents.\n"
            f"• **Health Insurance**: Maintain a comprehensive health plan of at least ₹5-10 Lakhs independent of employer coverage.\n"
            f"• **Avoid**: Blending investment with insurance (ULIPs/Endowment plans). Keep them strictly separate!"
        )

    elif any(k in msg_lower for k in ["retire", "pension", "pf", "epf", "ppf"]):
        return (
            f"🏖️ **Retirement Planning Blueprint**:\n"
            f"• **EPF / VPF**: Excellent risk-free compounding backed by government guaranteed yields.\n"
            f"• **NPS**: Great long-term retirement vehicle with additional tax savings under 80CCD (1B).\n"
            f"• **Rule of Thumb**: Aim for a retirement target of 25-30x your annual expenses."
        )

    elif any(k in msg_lower for k in ["ocr", "scan", "receipt", "bill", "invoice"]):
        return (
            f"📄 **AI Receipt OCR Scanner**:\n"
            f"• **How to use**: Click on **Receipt OCR** in the top navigation.\n"
            f"• **Features**: Upload any grocery receipt, petrol bill, or invoice (JPG, PNG, PDF). SpendAI extracts the merchant, total amount (₹), items, and payment mode automatically!"
        )

    elif any(k in msg_lower for k in ["health score", "score", "rating", "rank"]):
        return (
            f"⚡ **Financial Health Score**:\n"
            f"• **Evaluation**: SpendAI analyzes your savings rate, budget usage, category caps, and income buffers.\n"
            f"• **Boost Score**: Keep your savings rate above 20% and avoid overshooting category limits to achieve an EXCELLENT (85+) score!"
        )

    else:
        return (
            f"💡 **SpendAI Personal Financial Assistant**:\n"
            f"Here is your real-time financial snapshot:\n"
            f"• **Monthly Income**: ₹{income:,.0f}\n"
            f"• **Spent So Far**: ₹{spent:,.0f} ({round((spent/max(1, budget))*100)}% of ₹{budget:,.0f} budget)\n"
            f"• **Remaining Balance**: ₹{rem_budget:,.0f}\n"
            f"• **Safe Daily Cap**: ₹{daily_cap:,.0f}/day\n\n"
            f"Ask me about **SIPs**, **Tax Savings (80C/80D)**, **50/30/20 Rule**, **Emergency Funds**, **Credit Cards**, **Food Caps**, or **Receipt OCR**!"
        )
