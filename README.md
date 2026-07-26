# 👁️ SpendAI — AI Personal Expense Tracker

A state-of-the-art, AI-powered personal finance and expense tracking web application featuring **Illuminati Pyramid Branding**, **OpenAI & Groq Conversational Financial Assistant**, **Multi-Provider PDF & Receipt OCR Scanner**, **ML Spending Predictor**, **Supabase Authentication**, and **PostgreSQL Database Persistence**.

---

## ✨ Features

- 👁️ **Illuminati Eye of Providence Branding**: Glowing pyramid logo with a sleek, modern glassmorphic dark-mode interface.
- 🤖 **SpendAI Conversational Assistant**: Floating AI chatbot powered by **Groq (`llama-3.3-70b-versatile`)** and **OpenAI (`gpt-4o-mini`)** providing real-time financial coaching, SIP/investing advice, tax savings (80C), and affordability checks.
- 📄 **PDF & Receipt OCR Order Extractor**:
  - Drag-and-drop support for **PDF Invoices, Bank Statements & Photo Receipts**.
  - Powered by **Groq Llama-3.3-70b**, **OpenAI Vision**, **Mindee V5**, and **OCR.space APIs**.
  - Extracts **Merchant Name**, **Total Amount in Rupees (₹)**, **Date**, **Category**, **Payment Method & Reference Specs** (*UPI Ref ID*, *Card Last 4*, *Status*), and an **Itemized Order Details Table**.
- 🔮 **ML Burn-Rate Budget Predictor**: Linear regression model forecasting end-of-month expenditure and budget overruns.
- 📊 **0-100 Financial Health Score Card**: Evaluates savings rates, category caps, and 50/30/20 rule discipline.
- 🛍️ **Safe Daily Cap & Purchase Limit Advisor**: Instant affordability verdicts (*APPROVED*, *CAUTION*, *REJECTED*) for intended purchases.
- 🔮 **What-If Savings Simulator**: Compound interest projection tool simulating 12-month savings from category cutbacks.
- 🔐 **Supabase Authentication & Multi-Profile Support**:
  - **Google OAuth 2.0** and **Email/Password Sign-In**.
  - Automated user profile syncing into Supabase `public.users` table.
  - Multi-profile selector to test with individual user personas.
- 🗄️ **Supabase PostgreSQL Persistence**: Row-Level Security (RLS) policies protecting `expenses`, `categories`, and `savings_goals`.

---

## 🛠️ Technology Stack

### Frontend:
- **Framework**: React 18, Vite
- **Styling**: Tailwind CSS, Glassmorphism, CSS Modules
- **Icons**: Lucide React Icons
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Authentication & Database**: Supabase JS SDK (`@supabase/supabase-js`)

### Backend:
- **Framework**: Python 3.10+, FastAPI, Uvicorn
- **AI Models**: Groq Cloud API (`llama-3.3-70b-versatile`), OpenAI API (`gpt-4o-mini`)
- **OCR Engine**: PyPDF, Mindee V5, OCR.space API, Base64 Vision Engine
- **Data Schemas**: Pydantic v2

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18 or higher)
- Python (v3.10 or higher)

### 2. Environment Setup
Create a `.env` file in the project root:

```env
# Groq Cloud API Key (For Llama-3.3-70b PDF & Receipt OCR Extraction)
GROQ_API_KEY=gsk_your_groq_api_key_here

# OpenAI API Key Configuration
OPENAI_API_KEY=sk-proj-your_openai_api_key_here

# Specialized OCR API Keys (Optional)
OCR_SPACE_API_KEY=helloworld
MINDEE_API_KEY=

# Supabase Credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Backend Setup & Run
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server (Runs on http://localhost:8000)
python run.py
```

### 4. Frontend Setup & Run
```bash
# Install Node dependencies
npm install

# Start Vite dev server (Runs on http://localhost:3001)
npm run dev
```

### 5. Run Both Concurrently
```bash
npm run dev:all
```

---

## 🗄️ Supabase Database Setup

Run the SQL script in [`supabase/schema.sql`](file:///i:/Richu/Projects/Expense%20Tracker/supabase/schema.sql) in your **Supabase SQL Editor** to initialize the tables and security policies:

```sql
-- Creates users, categories, expenses, and savings_goals tables with RLS and automated user trigger
```

---

## 📂 Project Structure

```
Expense Tracker/
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI app & endpoint routes
│   │   ├── ocr_engine.py       # Groq, OpenAI Vision, Mindee OCR pipeline
│   │   ├── ai_insights.py      # OpenAI/Groq Chatbot & purchase advisor
│   │   ├── ml_predictor.py     # Linear regression budget burn-rate model
│   │   └── schemas.py          # Pydantic models
│   └── run.py                  # Uvicorn server launcher
├── src/
│   ├── components/
│   │   ├── AIAssistantWidget.jsx # Floating AI Assistant Chatbot
│   │   ├── ReceiptOCR.jsx       # PDF & Receipt Scanner & Order Itemizer
│   │   ├── Navbar.jsx           # Top Navigation with Illuminati Logo
│   │   ├── LoginScreen.jsx      # Google OAuth & Email Login Screen
│   │   ├── DashboardOverview.jsx# Financial Summary & Analytics
│   │   └── UI/
│   │       └── IlluminatiLogo.jsx # Glowing Eye of Providence SVG Logo
│   ├── context/
│   │   ├── AuthContext.jsx      # Supabase Auth & Multi-Profile State
│   │   └── ExpenseContext.jsx   # Expense CRUD & Supabase DB Sync
│   └── services/
│       ├── apiService.js        # FastAPI Client
│       └── supabaseClient.js    # Supabase Client & URL Sanitizer
├── supabase/
│   └── schema.sql              # Supabase PostgreSQL Database Schema
├── .env                        # Environment variables
└── package.json
```

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for details.
