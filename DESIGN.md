---
name: SpendAI Pro Glassmorphism
colors:
  background: '#070a12'
  on-background: '#f8fafc'
  surface: '#0f172a'
  surface-dim: '#070a12'
  surface-bright: '#1e293b'
  surface-container-lowest: '#04070d'
  surface-container-low: '#0a0f1d'
  surface-container: '#0f172a'
  surface-container-high: '#182238'
  surface-container-highest: '#1e293b'
  on-surface: '#f8fafc'
  on-surface-variant: '#94a3b8'
  inverse-surface: '#f8fafc'
  inverse-on-surface: '#0f172a'
  outline: '#334155'
  outline-variant: '#1e293b'
  primary: '#10b981'
  on-primary: '#ffffff'
  primary-container: '#064e3b'
  on-primary-container: '#a7f3d0'
  secondary: '#6366f1'
  on-secondary: '#ffffff'
  secondary-container: '#312e81'
  on-secondary-container: '#c7d2fe'
  tertiary: '#f59e0b'
  on-tertiary: '#ffffff'
  tertiary-container: '#78350f'
  on-tertiary-container: '#fde68a'
  error: '#ef4444'
  on-error: '#ffffff'
  error-container: '#7f1d1d'
  on-error-container: '#fecaca'
typography:
  display:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.375rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1.0rem
  xl: 1.25rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1400px
  gutter: 24px
  margin-mobile: 16px
  section-gap: 32px
---

# 👁️ SpendAI — AI Personal Finance & Expense Tracker UI Context & Design System

## 1. Executive Summary & Brand Direction
**SpendAI** is a premium, AI-powered personal finance, expense tracking, and wealth management platform tailored for modern professionals, students, and businesses. The UI design strategy balances high-end financial precision with an approachable, intelligent user experience.

The design language embodies **"Sleek Glassmorphic Fintech"**—featuring deep nocturnal backgrounds, vibrant emerald accents for wealth growth, subtle violet secondary tones for AI intelligence, precision typography, and rich micro-interactions.

---

## 2. Core Color Architecture & Token System
The color system operates on dual dark/light modes anchored by high-contrast emerald and slate tones.

- **Primary Accent (Emerald Green - `#10b981`):** Represents financial growth, savings, safe spending, and positive balance. Used for primary CTA buttons, positive trend badges, active tabs, and budget dials.
- **Secondary Accent (Electric Indigo - `#6366f1`):** Represents AI intelligence, ML forecasting, automated OCR extraction, and scenario simulations.
- **Warning / Overrun (Amber/Orange - `#f59e0b`):** Highlights budget thresholds, high discretionary spending alerts, and tax warnings.
- **Danger / Alert (Rose Red - `#ef4444`):** Indicates budget overruns, deletion actions, and negative cash flows.
- **Nocturnal Base (Dark `#070a12`, Surface `#0f172a`):** Deep charcoal slate background providing high contrast for bright charts, badges, and monetary text in Indian Rupees (₹).

---

## 3. Typography Hierarchy & Rules
- **Headings & Financial Numbers (`Outfit`):** Geometric, bold, modern, and confident. Used for main dashboard headings, hero spending stats, card titles, and monetary figures (₹).
- **Body & Controls (`Inter`):** Neutral, clean, highly legibile for transaction ledgers, AI chat responses, form inputs, table data, and metadata labels.

---

## 4. Application Architecture & Screen Breakdown

### 📱 A. Collapsible Sidebar & Top Header Navigation
- **Collapsible Rail (Expanded 260px / Mini Rail 80px):**
  - Brand header with glowing `IlluminatiLogo` icon.
  - Three distinct navigation sections:
    1. **Main Overview:** Dashboard, Expense Ledger, Vision OCR
    2. **AI Intelligence:** ML Budget Predictor, AI Coach, Financial Health Score, Scenario Simulator, Savings Vault
    3. **Account:** User Profile & Preferences
  - Interactive Dark/Light mode toggle switch and sidebar collapse button.
- **Top Header Bar:**
  - Active page title & subtitle description.
  - Quick "+ Add Expense" trigger CTA button.
  - User avatar thumbnail with profile dropdown and notification badge.

---

### 📊 B. Main Overview Dashboard (`Dashboard.jsx`)
- **Metric Cards Grid (4 Top Cards):**
  1. *Total Spending (₹)* - Current month aggregate with percentage MoM trend badge.
  2. *Monthly Budget (₹)* - Total budget cap with remaining balance indicator.
  3. *Budget Burn Rate (%)* - Pace of spending vs days elapsed in month.
  4. *Daily Safe Limit (₹)* - AI-computed safe daily allowance remaining.
- **Interactive Analytics Panels:**
  - Expense Category Breakdown (Doughnut / Pie Chart).
  - Monthly Spend Velocity Bar Chart.
  - Recent Transactions Ledger Feed (quick view of last 5 items).
  - Quick OCR Receipt Uploader Dropzone Widget.

---

### 💸 C. Expense Ledger & Manager (`ExpenseManager.jsx`)
- **Header & Filter Bar:** Search query input, Category dropdown filter, Date Range selector, Export to CSV trigger.
- **Transactions Data Table:**
  - Rows featuring Category Icon Badge, Merchant / Payee Name, Date, Payment Method (UPI, Bank Transfer, Card), Amount (₹), and Edit/Delete Actions.
- **Add / Edit Expense Modal:**
  - Inputs: Amount (₹), Merchant Name, Category dropdown, Date picker, Payment Method, Description notes.

---

### 📄 D. Vision OCR Receipt & Invoice Extractor (`ReceiptOCR.jsx`)
- **Upload Zone:** Drag-and-drop target accepting PDF invoices, bank statements, PNG, and JPG receipts.
- **Document Extraction Pane:**
  - Itemized table parsing item names, quantities, unit prices, and total prices.
  - Pre-filled form showing extracted Merchant, Date, Total Amount (₹), Category, and Payment Method.
  - Direct 1-tap "Save to Ledger" action button.

---

### 🔮 E. ML Budget Predictor (`BudgetPredictor.jsx`)
- Linear regression spending forecast card.
- Projected end-of-month spend calculation.
- Budget overrun alert banner with suggested daily spending adjustment.

---

### 🤖 F. AI Financial Coach & Advisor (`AIFinancialAdvisor.jsx` & `AIAssistantWidget.jsx`)
- **Purchase Feasibility Evaluator:** "Can I afford this item?" calculator taking price input and analyzing current cash flow impact.
- **Groq Llama-3.3 & OpenAI Assistant:** Floating AI chat drawer offering financial advice tailored to Indian financial rules (50/30/20 rule, Section 80C/80D tax rules, NPS, SIPs).

---

### 🎯 G. Savings Vault & Goals (`SavingsPlan.jsx`)
- Vault cards (Emergency Fund, New Laptop, Vehicle Purchase).
- Radial progress rings, target amount vs saved amount, and deposit modal.

---

### 📈 H. Scenario Simulator (`Simulator.jsx`)
- Interactive compound interest sliders: Initial Amount, Monthly SIP Deposit, Expected Return %, Horizon Years.
- Interactive wealth accumulation growth chart.

---

### 💚 I. Financial Health Diagnostic (`HealthScore.jsx`)
- Radial 0–100 Health Score Dial.
- Sub-diagnostics for Savings Rate, Emergency Fund, Discretionary Spend %, and Actionable Recommendations.

---

### 👤 J. User Profile & Preferences (`ProfileView.jsx`)
- Full Name, Email, Avatar Selector, Occupation, Monthly Income (₹), Monthly Budget (₹), and Financial Strategy preferences.

---

### 🔐 K. Authentication Screen (`LoginScreen.jsx`)
- Glassmorphic card featuring Google OAuth 2.0 ("Continue with Google") and Email/Password Sign-In / Sign-Up.

---

## 5. UI Redesign Goals for Stitch
When generating UI variants and screens in Stitch:
1. **Glassmorphism & Depth:** Use subtle backdrop-blurs (`backdrop-blur-md`), 1px slate borders (`#1e293b`), and clean card surfaces (`#0f172a`).
2. **Vibrant Accents:** Highlight primary actions in Emerald (`#10b981`) and AI features in Indigo (`#6366f1`).
3. **Data Clarity:** Present monetary numbers in `Outfit` font with currency symbol `₹`.
4. **Responsive Layouts:** Maintain seamless desktop 1400px container grid and mobile drawer navigation.
