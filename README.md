# 👁️ SpendAI — AI Personal Expense Tracker & Financial Assistant

A state-of-the-art, AI-powered personal finance, expense management, and wealth advice application built with **React (Vite)**, **React Native (Expo Mobile App)**, **Unified Python FastAPI Backend**, **Supabase Auth & PostgreSQL Persistence**, and **Groq (Llama-3.3-70b) & OpenAI LLM Engines**.

---

## ✨ Key Features & Architectural Highlights

### 🔒 100% Strict Per-User Data Isolation
- **Private User Databases**: All expenses, savings goals, categories, and AI insights are strictly filtered by user ID (`user_id`). Every user has an isolated, private financial workspace.
- **Supabase Row Level Security (RLS)**: PostgreSQL policies enforce user data ownership across Web and Mobile clients.

### 📱 Multi-Platform Experience (Web App & Mobile App)
- **Web App**: Built with React 18, Vite, Tailwind CSS, Glassmorphic UI design, and **Collapsible Left Sidebar Navigation**.
- **Mobile App**: Built with React Native (Expo SDK 54), Supabase Auth, In-App Browser OAuth, Camera Receipt Scanner, Bank SMS Auto-Sync, and native charts.

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
- Full-document keyword scanner and PDF raw text stream parser for accurate merchant extraction (e.g. Educational Institutions, Velalar College, Retailers).
- Pre-fills Merchant Name, Amount (₹), Date, Category, Payment Method, and Reference IDs directly into your ledger.

### 🔮 Machine Learning & Predictive Analytics
- **ML Burn-Rate Budget Predictor**: Linear regression model forecasting end-of-month spend and budget overruns.
- **0–100 Financial Health Score**: Diagnostic index analyzing productive vs. discretionary spend.
- **What-If Scenario Simulator**: 12-month compound interest savings projection tool.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Web Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios |
| **Mobile App** | React Native, Expo SDK 54, React Navigation, AsyncStorage, Expo WebBrowser |
| **Unified Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 |
| **AI & LLM Services** | Groq Cloud LPU (`llama-3.3-70b-versatile`), OpenAI API (`gpt-4o-mini`) |
| **OCR Engines** | PyPDF, Mindee V5, OCR.space, Base64 Vision Engine |
| **Database & Auth** | Supabase PostgreSQL, Supabase Auth (Google OAuth 2.0 & Email/Password) |
| **Market Data API** | Finnhub Stock Quote API |

---

## 💻 Commands to Run the Application

### 🚀 1. Run Web App + Python Backend Together (Recommended)

From the project root:

```bash
npm run dev:all
```
> 🌐 Web App: **`http://localhost:3000`** (or `http://localhost:3001`)  
> ⚙️ FastAPI Backend: **`http://localhost:8000`**

---

### 💻 2. Run Web Application Only

```bash
npm run dev
```

---

### 🐍 3. Run FastAPI Python Backend Only

```bash
python backend/run.py
```

---

### 📱 4. Run Mobile App (Expo Metro)

```bash
cd mobile
npm start
```
> 💡 *To start with cleared Metro cache*: `npx expo start -c`  
> 💡 *To run over secure tunnel (Wi-Fi/Cellular)*: `npx expo start --tunnel`

---

## 🔨 Commands to Build the Application

### 🌐 Build Production Web Bundle

```bash
npm run build
```
> Output: Generates optimized static build inside the **`dist/`** directory.

---

### 🤖 Build Android APK Locally on Your Laptop

```bash
# Step 1: Prebuild native android folder
cd mobile
npx expo prebuild --platform android

# Step 2: Build APK via Gradle
cd android
./gradlew assembleDebug       # For Debug APK
./gradlew assembleRelease     # For Release APK
```

📍 **Local APK File Locations:**
- Debug APK: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `mobile/android/app/build/outputs/apk/release/app-release-unsigned.apk`

---

### ☁️ Build Mobile App via Expo Cloud (EAS)

```bash
cd mobile

# Build Android APK / Bundle
npx eas-cli build --platform android --profile preview

# Build iOS IPA
npx eas-cli build --platform ios --profile production
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
│   │   ├── ocr_engine.py     # Multi-provider Vision OCR & PDF parser
│   │   └── schemas.py        # Pydantic data schemas
│   ├── requirements.txt
│   └── run.py
├── mobile/                   # React Native (Expo) Mobile Application
│   ├── screens/              # HomeScreen, ReceiptScanner, AIChat, BankSmsSync, Profile, Auth
│   ├── services/             # API client & Bank SMS parsing engine
│   ├── context/              # AuthContext with WebBrowser Google OAuth & AsyncStorage session persistence
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
│   │   ├── ExpenseContext.jsx# Isolated Expense CRUD & Supabase DB Sync
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

Run the SQL script in [`supabase/schema.sql`](file:///i:/Richu/Projects/Expense%20Tracker/supabase/schema.sql) in your **Supabase SQL Editor** to initialize the database tables & Row Level Security:

- `public.users`: User profiles, avatar URLs, income, budget, and strategy preferences.
- `public.expenses`: Transactions, categories, amounts, dates, payment methods, and user ownership (`user_id`).
- `public.categories`: Spending categories and monthly limits.
- `public.savings_goals`: Goal vaults and milestone progress.

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for details.
