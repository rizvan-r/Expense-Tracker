-- ====================================================================
-- MASTER SUPABASE MOCK DATA SEEDER SCRIPT (1-Click Insert)
-- Paste and run this script in your Supabase SQL Editor to populate sample data
-- ====================================================================

-- 1. Ensure UNIQUE constraint on public.categories(name)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'categories_name_key'
    ) THEN
        DELETE FROM public.categories a USING public.categories b
        WHERE a.id < b.id AND a.name = b.name;

        ALTER TABLE public.categories ADD CONSTRAINT categories_name_key UNIQUE (name);
    END IF;
END $$;

-- 2. Insert All 9 Application Categories (Safe ON CONFLICT)
INSERT INTO public.categories (name, icon, color, monthly_limit) VALUES
('Food & Dining', 'Utensils', '#f59e0b', 15000.00),
('Transportation', 'Car', '#3b82f6', 8000.00),
('Housing & Utilities', 'Home', '#6366f1', 20000.00),
('Shopping & Electronics', 'ShoppingBag', '#ec4899', 10000.00),
('Entertainment', 'Film', '#8b5cf6', 5000.00),
('Health & Fitness', 'HeartPulse', '#10b981', 4000.00),
('Subscriptions', 'CreditCard', '#06b6d4', 2500.00),
('Education & Self Care', 'BookOpen', '#f97316', 5000.00),
('Miscellaneous', 'MoreHorizontal', '#64748b', 3000.00)
ON CONFLICT (name) DO UPDATE SET
  monthly_limit = EXCLUDED.monthly_limit,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- 3. Insert Sample Expenses Across All Categories
INSERT INTO public.expenses (merchant, amount, date, category, payment_method, notes, ocr_extracted, payment_details, line_items) VALUES
('BigBasket Supermarket', 3450.00, '2026-07-22', 'Food & Dining', 'UPI / GPay', 'Weekly grocery staples & fresh organic vegetables', true, '{"mode": "UPI / GPay", "reference_no": "UPI/328409182390", "status": "PAID"}'::jsonb, '[{"item_name": "Organic Whole Milk 1L", "quantity": 2, "unit_price": 75.00, "total_price": 150.00}, {"item_name": "Basmati Rice 5kg", "quantity": 1, "unit_price": 650.00, "total_price": 650.00}]'::jsonb),
('Indian Oil Fuel Station', 2200.00, '2026-07-21', 'Transportation', 'Debit Card', 'Full tank petrol refill XP95', true, '{"mode": "Debit Card", "card_last_4": "4129", "status": "PAID"}'::jsonb, '[{"item_name": "XP95 High Octane Petrol Fuel", "quantity": 21, "unit_price": 104.76, "total_price": 2200.00}]'::jsonb),
('Swiggy Food Delivery', 680.00, '2026-07-20', 'Food & Dining', 'UPI / PhonePe', 'Weekend dinner ordering', false, '{}'::jsonb, '[]'::jsonb),
('Croma Digital Store', 14999.00, '2026-07-18', 'Shopping & Electronics', 'Credit Card', 'Sony Wireless Noise Cancelling Headphones', true, '{"mode": "Credit Card", "card_last_4": "8821", "status": "PAID"}'::jsonb, '[{"item_name": "Sony Wireless Headphones", "quantity": 1, "unit_price": 14999.00, "total_price": 14999.00}]'::jsonb),
('PVR Cinemas IMAX', 1400.00, '2026-07-16', 'Entertainment', 'UPI / GPay', 'IMAX 3D Movie tickets & snacks', false, '{}'::jsonb, '[]'::jsonb),
('Electricity Utility Bill', 4250.00, '2026-07-15', 'Housing & Utilities', 'Net Banking', 'Monthly electricity bill payment', false, '{}'::jsonb, '[]'::jsonb),
('Amazon India Order', 1850.00, '2026-07-12', 'Shopping & Electronics', 'UPI / GPay', 'Books & home organizer items', false, '{}'::jsonb, '[]'::jsonb),
('Cult.fit Gym Membership', 2500.00, '2026-07-10', 'Health & Fitness', 'Credit Card', 'Monthly gym subscription fee', false, '{}'::jsonb, '[]'::jsonb),
('Udemy Online Course', 1299.00, '2026-07-08', 'Education & Self Care', 'Credit Card', 'AI & Machine Learning Certification', false, '{}'::jsonb, '[]'::jsonb),
('Netflix Premium 4K', 649.00, '2026-07-05', 'Subscriptions', 'Credit Card', 'Auto-debit monthly streaming plan', false, '{}'::jsonb, '[]'::jsonb),
('Zomato Gourmet', 1240.00, '2026-07-03', 'Food & Dining', 'UPI / GPay', 'Team lunch treat', false, '{}'::jsonb, '[]'::jsonb),
('Uber Auto & Cab', 420.00, '2026-07-01', 'Transportation', 'UPI / PhonePe', 'Office commute travel', false, '{}'::jsonb, '[]'::jsonb),
('Starbucks Coffee', 580.00, '2026-06-28', 'Food & Dining', 'UPI / GPay', 'Coffee meeting', true, '{}'::jsonb, '[]'::jsonb),
('Reliance Trends Outlet', 3200.00, '2026-06-25', 'Shopping & Electronics', 'Credit Card', 'Casual apparel purchase', false, '{}'::jsonb, '[]'::jsonb),
('Apollo Pharmacy', 1150.00, '2026-06-20', 'Health & Fitness', 'UPI / PhonePe', 'Monthly wellness supplements', false, '{}'::jsonb, '[]'::jsonb),
('Airtel Fiber Broadband', 1179.00, '2026-06-15', 'Housing & Utilities', 'UPI / GPay', '200Mbps fiber internet bill', false, '{}'::jsonb, '[]'::jsonb),
('Apple iCloud 200GB', 219.00, '2026-06-05', 'Subscriptions', 'Credit Card', 'Cloud storage monthly subscription', false, '{}'::jsonb, '[]'::jsonb);

-- 4. Insert Savings Goals
INSERT INTO public.savings_goals (title, target_amount, current_amount, target_date, category) VALUES
('Emergency Cushion Fund', 150000.00, 95000.00, '2026-12-31', 'General'),
('Goa Year-End Vacation', 45000.00, 28000.00, '2026-11-15', 'Travel'),
('MacBook M3 Workstation', 135000.00, 60000.00, '2027-03-31', 'Tech'),
('Diwali Gift & Festive Fund', 30000.00, 12000.00, '2026-10-25', 'Festive'),
('House Down-payment SIP', 500000.00, 210000.00, '2028-06-30', 'Investment');

-- Summary Confirmation Output
SELECT 
  (SELECT COUNT(*) FROM public.categories) AS total_categories,
  (SELECT COUNT(*) FROM public.expenses) AS total_expenses,
  (SELECT COUNT(*) FROM public.savings_goals) AS total_savings_goals;
