-- ====================================================================
-- MASTER SUPABASE DATABASE SCHEMA FOR AI EXPENSE TRACKER
-- ====================================================================

-- 1. Create Public Users Table (mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  monthly_income NUMERIC(12,2) DEFAULT 85000.00,
  monthly_budget NUMERIC(12,2) DEFAULT 55000.00,
  currency TEXT DEFAULT '₹',
  occupation TEXT DEFAULT 'Professional',
  financial_strategy TEXT DEFAULT 'Moderate Wealth Builder',
  savings_goal_target NUMERIC(12,2) DEFAULT 200000.00,
  emergency_fund_target NUMERIC(12,2) DEFAULT 150000.00,
  avatar_color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow user profile access" ON public.users;
CREATE POLICY "Allow user profile access"
  ON public.users FOR ALL USING (true) WITH CHECK (true);

-- 2. Trigger Function to Create User Record on Login
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, avatar_url, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  monthly_limit NUMERIC(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow category access" ON public.categories;
CREATE POLICY "Allow category access"
  ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- 4. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  merchant TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT DEFAULT 'Miscellaneous',
  payment_method TEXT DEFAULT 'Credit Card',
  payment_details JSONB DEFAULT '{}'::jsonb,
  line_items JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  receipt_url TEXT,
  ocr_extracted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure category text column exists on existing expenses table
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Miscellaneous';
-- Ensure type text column exists on existing expenses table (DEBIT vs CREDIT)
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'DEBIT';

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated and anon expense management" ON public.expenses;
CREATE POLICY "Allow authenticated and anon expense management"
  ON public.expenses FOR ALL USING (true) WITH CHECK (true);

-- 5. Savings Goals Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount NUMERIC(12,2) NOT NULL,
  current_amount NUMERIC(12,2) DEFAULT 0.00,
  target_date DATE,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow savings goal management" ON public.savings_goals;
CREATE POLICY "Allow savings goal management"
  ON public.savings_goals FOR ALL USING (true) WITH CHECK (true);
