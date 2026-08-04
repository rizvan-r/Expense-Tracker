# 👁️ SpendAI — AI Personal Expense Tracker & Financial Assistant

A state-of-the-art, AI-powered personal finance, expense management, and wealth advice application built with **React (Vite)**, **React Native (Expo Mobile App)**, **Unified Python FastAPI Backend**, **Supabase Auth & PostgreSQL Persistence**, and **Groq (Llama-3.3-70b) & OpenAI LLM Engines**.

---

## ✨ Key Features & Architectural Highlights

### 📱 Multi-Platform Experience (Web App & Mobile App)
- **Web App**: Built with React 18, Vite, Tailwind CSS, Glassmorphic UI design, and **Collapsible Left Sidebar Navigation**.
- **Mobile App**: Built with React Native (Expo), Supabase Auth, Camera Receipt Scanner, Bank SMS Auto-Sync, and native charts.

### 🧭 Collapsible Left Sidebar Navigation
- **Expanded & Compact Rail Modes**: Switch between full 260px sidebar and 80px mini-rail icon mode.
- **Categorized Sections**:
  - 📊 **Main Overview**: Dashboard, Expense Ledger, Receipt OCR
  - 🤖 **AI Intelligence**: Budget & ML, AI Advisor, Financial Health Score, Scenario Simulator, Savings Plan
  - ⚙️ **Account**: Profile & Financial Configuration
- **Mobile Drawer Menu**: Slide-over drawer overlay for smartphones and tablets.

### 🤖 SpendAI Conversational Financial Coach
- Powered by **Groq Cloud (`llama-3.3-70b-versatile`)** and **OpenAI (`gpt-4o-mini`)**.
- Contextual understanding of your income, current month spend, and Indian financial rules (50/30/20 rule, Section 80C/80D tax deductions, NPS, SIP compounding).
- Client-side & backend keyword AI engine fallback when offline.

### 📄 Vision OCR Receipt & Invoice Extractor
- Drag-and-drop support for **PDF Invoices, Bank Statements & Photo Receipts**.
- Extracts Merchant Name, Total Amount (₹), Date, Category, Payment Method, Reference IDs, and an **Itemized Order Breakdown Table**.

### 🔮 Machine Learning & Predictive Analytics
- **ML Burn-Rate Budget Predictor**: Linear regression model forecasting end-of-month spend and budget overruns.
- **0–100 Financial Health Score**: Diagnostic index analyzing productive vs. discretionary spend.
- **What-If Scenario Simulator**: 12-month compound interest savings projection tool.

### 🔐 Supabase Auth & Direct Profile Sync
- **Google OAuth 2.0 & Email/Password Sign-In**.
- Profile information (`monthly_income`, `monthly_budget`, `occupation`, `financial_strategy`, `avatar_url`) is saved persistently in Supabase `public.users` table.
- Display and edit custom Profile Avatar pictures in the **Profile & Financial Config** view.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Web Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios |
| **Mobile App** | React Native, Expo SDK 54, React Navigation, AsyncStorage |
| **Unified Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 |
| **AI & LLM Services** | Groq Cloud LPU (`llama-3.3-70b-versatile`), OpenAI API (`gpt-4o-mini`) |
| **OCR Engines** | PyPDF, Mindee V5, OCR.space, Base64 Vision Engine |
| **Database & Auth** | Supabase PostgreSQL, Supabase Auth (OAuth & RLS Policies) |
| **Market Data API** | Finnhub Stock Quote API |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10.0 or higher

---

### 2. Environment Configuration
Create a `.env` file in the project root:

```env
# Groq Cloud API Key (For Llama-3.3-70b Receipt OCR & AI Chat)
GROQ_API_KEY=gsk_your_groq_api_key_here

# OpenAI API Key Configuration
OPENAI_API_KEY=sk-proj-your_openai_api_key_here

# Finnhub Stock Market API Key
FINNHUB_API_KEY=your_finnhub_key_here

# Supabase Credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

### 3. Backend Setup (Python FastAPI)

```bash
# Navigate to the backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server (Runs on http://localhost:8000)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

### 4. Web Frontend Setup (React + Vite)

```bash
# Install Node dependencies
npm install

# Start Vite dev server (Runs on http://localhost:3000)
npm run dev
```

---

### 5. Mobile App Setup (React Native + Expo)

```bash
# Navigate to the mobile directory
cd mobile

# Install dependencies
npm install

# Start Expo development server
npm start
```

---

## 📂 Project Structure

```
Expense Tracker/
├── backend/                  # Unified Python FastAPI Backend
│   ├── app/
│   │   ├── main.py           # FastAPI REST routes (Users, Expenses, Categories, OCR, AI)
│   │   ├── ai_insights.py    # Groq & OpenAI LLM Chatbot & Advisor
│   │   ├── ml_predictor.py   # Linear regression budget burn-rate model
│   │   ├── ocr_engine.py     # Multi-provider Vision OCR pipeline
│   │   └── schemas.py        # Pydantic data schemas
│   ├── requirements.txt
│   └── run.py
├── mobile/                   # React Native (Expo) Mobile Application
│   ├── screens/              # HomeScreen, ReceiptScanner, AIChat, BankSmsSync, Profile
│   ├── services/             # API client & Bank SMS parsing engine
│   ├── lib/                  # Supabase client adapter
│   └── package.json
├── src/                      # React Web Application
│   ├── components/
│   │   ├── Sidebar.jsx       # Collapsible Left Navigation Bar
│   │   ├── TopHeader.jsx     # Header with active view title & quick action button
│   │   ├── Dashboard.jsx     # Financial Dashboard & Analytics
│   │   ├── ExpenseManager.jsx# Expense Ledger & Filtering
│   │   ├── ReceiptOCR.jsx    # PDF & Receipt Vision OCR Extractor
│   │   ├── AIFinancialAdvisor.jsx # AI Safe Daily Cap & Purchase Advisor
│   │   ├── HealthScore.jsx   # 0-100 Financial Health Diagnostic Card
│   │   ├── ProfileView.jsx   # Profile & Photo Avatar Config
│   │   ├── LoginScreen.jsx   # Supabase Google OAuth & Email Sign-In
│   │   └── UI/               # Reusable Glassmorphism Cards, Badges, Logos
│   ├── context/
│   │   ├── AuthContext.jsx   # Supabase Auth & Profile Persistence
│   │   ├── ExpenseContext.jsx# Expense CRUD & Supabase DB Sync
│   │   └── ThemeContext.jsx  # Dark / Light Theme State
│   └── services/
│       ├── apiService.js     # FastAPI HTTP client
│       └── supabaseClient.js # Supabase client
├── supabase/
│   └── schema.sql            # Master PostgreSQL schema & RLS policies
├── .env                      # Environment variables
├── package.json
└── README.md
```

---

## 🗄️ Supabase PostgreSQL Database Setup

Run the SQL script in [`supabase/schema.sql`](file:///i:/Richu/Projects/Expense%20Tracker/supabase/schema.sql) in your **Supabase SQL Editor** to initialize the database tables:

- `public.users`: User profiles, avatar URLs, income, budget, and strategy preferences.
- `public.expenses`: Transactions, categories, amounts, dates, and payment methods.
- `public.categories`: Spending categories and monthly limits.
- `public.savings_goals`: Goal vaults and milestone progress.

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for details.
