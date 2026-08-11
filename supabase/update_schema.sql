-- ====================================================================
-- COMPREHENSIVE SUPABASE SCHEMA UPDATE & TABLE ADJUSTMENT MIGRATION
-- Run this script in your Supabase SQL Editor to update all tables & constraints
-- ====================================================================

-- 1. Ensure UNIQUE constraint on public.categories(name) to support ON CONFLICT
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'categories_name_key'
    ) THEN
        -- Remove duplicates if any exist before adding unique constraint
        DELETE FROM public.categories a USING public.categories b
        WHERE a.id < b.id AND a.name = b.name;

        ALTER TABLE public.categories ADD CONSTRAINT categories_name_key UNIQUE (name);
    END IF;
END $$;

-- 2. Update public.users Table Columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT '₹';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS occupation TEXT DEFAULT 'Professional';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS financial_strategy TEXT DEFAULT 'Moderate Wealth Builder';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS savings_goal_target NUMERIC(12,2) DEFAULT 200000.00;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_fund_target NUMERIC(12,2) DEFAULT 150000.00;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_color TEXT DEFAULT '#6366f1';

-- 3. Update public.expenses Table Columns
ALTER TABLE public.expenses ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS payment_details JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS line_items JSONB DEFAULT '[]'::jsonb;

-- 4. Update public.savings_goals Table Columns
ALTER TABLE public.savings_goals ALTER COLUMN user_id DROP NOT NULL;

-- 5. Update Row Level Security (RLS) Permissive Policies
DROP POLICY IF EXISTS "Allow authenticated and anon expense management" ON public.expenses;
CREATE POLICY "Allow authenticated and anon expense management"
  ON public.expenses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow category access" ON public.categories;
CREATE POLICY "Allow category access"
  ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow savings goal management" ON public.savings_goals;
CREATE POLICY "Allow savings goal management"
  ON public.savings_goals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow user profile access" ON public.users;
CREATE POLICY "Allow user profile access"
  ON public.users FOR ALL USING (true) WITH CHECK (true);

-- Summary Notification
SELECT 'Supabase comprehensive schema update completed successfully!' AS status;
