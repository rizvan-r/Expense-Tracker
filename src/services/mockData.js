export const MULTI_PROFILES = [
  {
    id: 'user-richu-101',
    full_name: 'Richu Sharma',
    email: 'richu.sharma@example.com',
    monthly_income: 85000.00,
    monthly_budget: 55000.00,
    currency: '₹',
    savings_goal_target: 200000.00,
    emergency_fund_target: 150000.00,
    occupation: 'Software Engineer',
    financial_strategy: 'Moderate Wealth Builder',
    avatar_color: '#6366f1'
  },
  {
    id: 'user-ananya-102',
    full_name: 'Ananya Patel',
    email: 'ananya.patel@example.com',
    monthly_income: 120000.00,
    monthly_budget: 75000.00,
    currency: '₹',
    savings_goal_target: 350000.00,
    emergency_fund_target: 250000.00,
    occupation: 'Senior Product Manager',
    financial_strategy: 'Aggressive Accumulator',
    avatar_color: '#10b981'
  },
  {
    id: 'user-vikram-103',
    full_name: 'Vikram Malhotra',
    email: 'vikram.m@example.com',
    monthly_income: 65000.00,
    monthly_budget: 40000.00,
    currency: '₹',
    savings_goal_target: 150000.00,
    emergency_fund_target: 100000.00,
    occupation: 'Business Analyst',
    financial_strategy: 'Conservative Saver',
    avatar_color: '#8b5cf6'
  },
  {
    id: 'user-rizvan-google',
    full_name: 'Rizvan R',
    email: 'rizvan.r@gmail.com',
    monthly_income: 110000.00,
    monthly_budget: 65000.00,
    currency: '₹',
    savings_goal_target: 300000.00,
    emergency_fund_target: 200000.00,
    occupation: 'Tech Lead & AI Engineer',
    financial_strategy: 'Aggressive Wealth Accumulator',
    avatar_color: '#10b981'
  }
];

export const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Food & Dining', icon: 'Utensils', color: '#f59e0b', monthly_limit: 15000.00 },
  { id: 'cat-2', name: 'Transportation', icon: 'Car', color: '#3b82f6', monthly_limit: 8000.00 },
  { id: 'cat-3', name: 'Housing & Utilities', icon: 'Home', color: '#6366f1', monthly_limit: 20000.00 },
  { id: 'cat-4', name: 'Shopping & Electronics', icon: 'ShoppingBag', color: '#ec4899', monthly_limit: 10000.00 },
  { id: 'cat-5', name: 'Entertainment', icon: 'Film', color: '#8b5cf6', monthly_limit: 5000.00 },
  { id: 'cat-6', name: 'Health & Fitness', icon: 'HeartPulse', color: '#10b981', monthly_limit: 4000.00 },
  { id: 'cat-7', name: 'Subscriptions', icon: 'CreditCard', color: '#06b6d4', monthly_limit: 2500.00 },
  { id: 'cat-8', name: 'Education & Self Care', icon: 'BookOpen', color: '#f97316', monthly_limit: 5000.00 },
  { id: 'cat-9', name: 'Miscellaneous', icon: 'MoreHorizontal', color: '#64748b', monthly_limit: 3000.00 },
];

export const INITIAL_EXPENSES_BY_USER = {
  'user-richu-101': [
    {
      id: 'exp-101',
      merchant: 'BigBasket Supermarket',
      amount: 3450.00,
      date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
      category: 'Food & Dining',
      payment_method: 'UPI / GPay',
      notes: 'Weekly grocery restock & fresh produce',
      receipt_url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60',
      ocr_extracted: true
    },
    {
      id: 'exp-102',
      merchant: 'Indian Oil Fuel Station',
      amount: 2200.00,
      date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
      category: 'Transportation',
      payment_method: 'Debit Card',
      notes: 'Petrol refill',
      receipt_url: null,
      ocr_extracted: false
    },
    {
      id: 'exp-103',
      merchant: 'Netflix India',
      amount: 649.00,
      date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
      category: 'Subscriptions',
      payment_method: 'Credit Card',
      notes: 'Premium 4K monthly plan',
      receipt_url: null,
      ocr_extracted: false
    },
    {
      id: 'exp-104',
      merchant: 'Croma Electronics',
      amount: 14999.00,
      date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
      category: 'Shopping & Electronics',
      payment_method: 'Credit Card',
      notes: 'Wireless Headphones',
      receipt_url: null,
      ocr_extracted: true
    }
  ],
  'user-ananya-102': [
    {
      id: 'exp-201',
      merchant: 'IKEA Furniture',
      amount: 18500.00,
      date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
      category: 'Housing & Utilities',
      payment_method: 'Credit Card',
      notes: 'Ergonomic Desk & Lamp',
      receipt_url: null,
      ocr_extracted: false
    },
    {
      id: 'exp-202',
      merchant: 'Cult.fit Studio',
      amount: 4500.00,
      date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
      category: 'Health & Fitness',
      payment_method: 'UPI',
      notes: 'Quarterly membership',
      receipt_url: null,
      ocr_extracted: false
    },
    {
      id: 'exp-203',
      merchant: 'Starbucks Coffee',
      amount: 620.00,
      date: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString().split('T')[0],
      category: 'Food & Dining',
      payment_method: 'Apple Pay',
      notes: 'Client meeting coffee',
      receipt_url: null,
      ocr_extracted: false
    }
  ],
  'user-vikram-103': [
    {
      id: 'exp-301',
      merchant: 'Amazon India Books',
      amount: 1250.00,
      date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
      category: 'Education & Self Care',
      payment_method: 'UPI',
      notes: 'Financial Analysis textbooks',
      receipt_url: null,
      ocr_extracted: false
    },
    {
      id: 'exp-302',
      merchant: 'Zomato Daily',
      amount: 450.00,
      date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
      category: 'Food & Dining',
      payment_method: 'UPI',
      notes: 'Lunch thali',
      receipt_url: null,
      ocr_extracted: false
    }
  ],
  'user-rizvan-google': [
    {
      id: 'exp-riz-1',
      merchant: 'Velalar College of Engineering and Technology',
      amount: 115000.00,
      date: new Date().toISOString().split('T')[0],
      category: 'Education & Self Care',
      payment_method: 'Bank Transfer',
      notes: 'Txn Ref: Receipt #622 | Payment Mode: Bank Transfer | Line Items: TUITION FEES (x1)',
      receipt_url: null,
      ocr_extracted: true
    },
    {
      id: 'exp-riz-2',
      merchant: 'Apple Store India',
      amount: 42900.00,
      date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
      category: 'Shopping & Electronics',
      payment_method: 'Credit Card',
      notes: 'MacBook Air M3 Development Laptop Upgrade',
      receipt_url: null,
      ocr_extracted: true
    },
    {
      id: 'exp-riz-3',
      merchant: 'Swiggy Gourmet',
      amount: 1450.00,
      date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
      category: 'Food & Dining',
      payment_method: 'UPI / GPay',
      notes: 'Team dinner & beverages',
      receipt_url: null,
      ocr_extracted: false
    },
    {
      id: 'exp-riz-4',
      merchant: 'Zerodha Mutual Fund SIP',
      amount: 15000.00,
      date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
      category: 'Subscriptions',
      payment_method: 'Net Banking',
      notes: 'Monthly Nifty 50 Index Fund SIP',
      receipt_url: null,
      ocr_extracted: false
    },
    {
      id: 'exp-riz-5',
      merchant: 'Shell Fuel Station',
      amount: 3200.00,
      date: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString().split('T')[0],
      category: 'Transportation',
      payment_method: 'Debit Card',
      notes: 'V-Power Petrol refill',
      receipt_url: null,
      ocr_extracted: false
    }
  ]
};

export const INITIAL_PROFILE = MULTI_PROFILES[0];

export const INITIAL_SAVINGS_GOALS_BY_USER = {
  'user-richu-101': [
    { id: 'goal-1', title: 'Emergency Reserve Vault', target_amount: 150000.00, current_amount: 95000.00, target_date: '2026-12-31', category: 'Security' },
    { id: 'goal-2', title: 'Goa & Ladakh Trip', target_amount: 60000.00, current_amount: 32000.00, target_date: '2026-10-15', category: 'Travel' }
  ],
  'user-ananya-102': [
    { id: 'goal-201', title: 'Stock Portfolio Fund', target_amount: 300000.00, current_amount: 180000.00, target_date: '2026-12-31', category: 'Investment' },
    { id: 'goal-202', title: 'Europe Vacation', target_amount: 250000.00, current_amount: 140000.00, target_date: '2026-09-30', category: 'Travel' }
  ],
  'user-vikram-103': [
    { id: 'goal-301', title: 'Bike Downpayment', target_amount: 100000.00, current_amount: 55000.00, target_date: '2026-08-31', category: 'Vehicle' }
  ],
  'user-rizvan-google': [
    { id: 'goal-riz-1', title: 'AI Research & Tech Equipment Vault', target_amount: 300000.00, current_amount: 185000.00, target_date: '2026-12-31', category: 'Tech' },
    { id: 'goal-riz-2', title: 'Emergency Wealth Fund', target_amount: 200000.00, current_amount: 140000.00, target_date: '2026-10-31', category: 'Security' },
    { id: 'goal-riz-3', title: 'International Conference Travel', target_amount: 150000.00, current_amount: 85000.00, target_date: '2026-11-15', category: 'Travel' }
  ]
};

export const INITIAL_SAVINGS_GOALS = INITIAL_SAVINGS_GOALS_BY_USER['user-richu-101'];
export const INITIAL_EXPENSES = INITIAL_EXPENSES_BY_USER['user-richu-101'];
