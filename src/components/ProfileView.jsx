import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { Card } from './UI/Card';
import { StatCard } from './UI/StatCard';
import { Badge } from './UI/Badge';
import { Button } from './UI/Button';
import {
  User,
  IndianRupee,
  Briefcase,
  Target,
  ShieldCheck,
  CheckCircle2,
  Save,
  Zap,
  PieChart,
  Sparkles,
  TrendingUp,
  Database
} from 'lucide-react';

export const ProfileView = () => {
  const { profile, updateProfile, totalSpent, healthScoreData } = useExpense();
  const { user, isDemoMode, logout, isSupabaseConfigured } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || 'Richu Sharma');
  const [occupation, setOccupation] = useState(profile?.occupation || 'Software Engineer');
  const [income, setIncome] = useState(profile.monthly_income?.toString() || '85000');
  const [budget, setBudget] = useState(profile.monthly_budget?.toString() || '55000');
  const [emergencyTarget, setEmergencyTarget] = useState(profile.emergency_fund_target?.toString() || '150000');
  const [savingsGoalTarget, setSavingsGoalTarget] = useState(profile.savings_goal_target?.toString() || '200000');
  const [strategy, setStrategy] = useState(profile.financial_strategy || 'Moderate Wealth Builder');
  const [currency, setCurrency] = useState(profile.currency || '₹');

  const [isSavedToast, setIsSavedToast] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || 'Richu Sharma');
      setOccupation(profile.occupation || 'Software Engineer');
      setIncome(profile.monthly_income?.toString() || '85000');
      setBudget(profile.monthly_budget?.toString() || '55000');
      setEmergencyTarget(profile.emergency_fund_target?.toString() || '150000');
      setSavingsGoalTarget(profile.savings_goal_target?.toString() || '200000');
      setStrategy(profile.financial_strategy || 'Moderate Wealth Builder');
      setCurrency(profile.currency || '₹');
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({
      full_name: fullName,
      occupation: occupation,
      monthly_income: Number(income),
      monthly_budget: Number(budget),
      emergency_fund_target: Number(emergencyTarget),
      savings_goal_target: Number(savingsGoalTarget),
      financial_strategy: strategy,
      currency: currency
    });

    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  const numIncome = Number(income) || 0;
  const numBudget = Number(budget) || 0;
  const monthlySurplus = Math.max(0, numIncome - numBudget);
  const savingsRatePct = numIncome > 0 ? Math.round((monthlySurplus / numIncome) * 100) : 0;
  const emergencyCoverageMonths = numBudget > 0 ? (Number(emergencyTarget) / numBudget).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 animate-fadeIn pb-12 w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/50 p-6 rounded-3xl border border-indigo-500/20 glass-panel">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-0.5 shadow-lg shadow-indigo-500/30 flex-shrink-0">
            <div className="w-full h-full bg-[#0d1322] rounded-[14px] flex items-center justify-center text-white text-2xl font-bold font-heading">
              {fullName.charAt(0)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">User Profile & Financial Config</span>
              <Badge variant={isDemoMode ? 'amber' : 'emerald'}>
                {isDemoMode ? 'Demo Session' : 'Supabase Sync'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">{fullName}</h1>
            <p className="text-sm text-slate-400 mt-0.5">{occupation} • {user?.email || 'richu@example.com'}</p>
          </div>
        </div>

        {isSavedToast && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Profile Details & Financial Metrics Updated!</span>
          </div>
        )}
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Monthly Net Income"
          value={`₹${numIncome.toLocaleString('en-IN')}`}
          subtitle="Primary Cash Flow"
          icon={IndianRupee}
          color="indigo"
        />

        <StatCard
          title="Monthly Expense Budget"
          value={`₹${numBudget.toLocaleString('en-IN')}`}
          subtitle={`Current Spend: ₹${totalSpent.toLocaleString('en-IN')}`}
          icon={PieChart}
          color="amber"
        />

        <StatCard
          title="Projected Monthly Savings"
          value={`₹${monthlySurplus.toLocaleString('en-IN')}`}
          subtitle={`${savingsRatePct}% Target Savings Rate`}
          icon={TrendingUp}
          color="emerald"
        />

        <StatCard
          title="Emergency Runway"
          value={`${emergencyCoverageMonths} Months`}
          subtitle={`Goal: ₹${Number(emergencyTarget).toLocaleString('en-IN')}`}
          icon={ShieldCheck}
          color="purple"
        />
      </div>

      {/* Main Profile & Financial Edit Form */}
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Personal & Professional */}
          <div>
            <h3 className="text-base font-bold text-white font-heading mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" /> Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Occupation / Industry
                </label>
                <input
                  type="text"
                  required
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'richu.sharma@example.com'}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800"></div>

          {/* Section 2: Core Financial Details */}
          <div>
            <h3 className="text-base font-bold text-white font-heading mb-4 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-emerald-400" /> Core Income & Budget Targets
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Monthly Take-Home Income (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Monthly Expense Cap (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Emergency Reserve Goal (₹)
                </label>
                <input
                  type="number"
                  required
                  value={emergencyTarget}
                  onChange={(e) => setEmergencyTarget(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Long-Term Wealth Target (₹)
                </label>
                <input
                  type="number"
                  required
                  value={savingsGoalTarget}
                  onChange={(e) => setSavingsGoalTarget(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800"></div>

          {/* Section 3: Financial Strategy & Risk Profile */}
          <div>
            <h3 className="text-base font-bold text-white font-heading mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> Wealth Building Strategy & Preferences
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Financial Growth Strategy
                </label>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Conservative Saver">Conservative Saver (Low Risk, High Cash Buffer)</option>
                  <option value="Moderate Wealth Builder">Moderate Wealth Builder (Balanced 50/30/20 Rule)</option>
                  <option value="Aggressive Accumulator">Aggressive Accumulator (High Savings Rate, Investment Heavy)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Preferred Currency Symbol
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="₹">₹ (INR - Indian Rupee)</option>
                  <option value="$">$ (USD - US Dollar)</option>
                  <option value="€">€ (EUR - Euro)</option>
                  <option value="£">£ (GBP - British Pound)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Changes automatically recalculate all AI metrics across the dashboard</span>
            </div>

            <Button type="submit" variant="primary" size="lg" icon={Save}>
              Save Profile & Financial Details
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
