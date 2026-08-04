import React, { useState, useEffect } from 'react';
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
  Database,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

export const ProfileView = () => {
  const { profile, updateProfile, totalSpent, healthScoreData } = useExpense();
  const { user, isSupabaseConfigured } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || 'Richu Sharma');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || user?.avatar_url || '');
  const [occupation, setOccupation] = useState(profile?.occupation || 'Software Engineer');
  const [income, setIncome] = useState(profile?.monthly_income?.toString() || '85000');
  const [budget, setBudget] = useState(profile?.monthly_budget?.toString() || '55000');
  const [emergencyTarget, setEmergencyTarget] = useState(profile?.emergency_fund_target?.toString() || '150000');
  const [savingsGoalTarget, setSavingsGoalTarget] = useState(profile?.savings_goal_target?.toString() || '200000');
  const [strategy, setStrategy] = useState(profile?.financial_strategy || 'Moderate Wealth Builder');
  const [currency, setCurrency] = useState(profile?.currency || '₹');

  const [isSavedToast, setIsSavedToast] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || 'Richu Sharma');
      setAvatarUrl(profile.avatar_url || user?.avatar_url || '');
      setOccupation(profile.occupation || 'Software Engineer');
      setIncome(profile.monthly_income?.toString() || '85000');
      setBudget(profile.monthly_budget?.toString() || '55000');
      setEmergencyTarget(profile.emergency_fund_target?.toString() || '150000');
      setSavingsGoalTarget(profile.savings_goal_target?.toString() || '200000');
      setStrategy(profile.financial_strategy || 'Moderate Wealth Builder');
      setCurrency(profile.currency || '₹');
    }
  }, [profile, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({
      full_name: fullName,
      avatar_url: avatarUrl,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex items-center gap-4">
          {/* Profile Picture Avatar */}
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-md flex-shrink-0 border-2 border-emerald-500/80"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}

            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 p-0.5 shadow-md flex-shrink-0 ${
                avatarUrl ? 'hidden' : 'flex'
              }`}
            >
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-2xl sm:text-3xl font-bold font-heading">
                {fullName.charAt(0)}
              </div>
            </div>

            <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 text-white rounded-lg shadow-md border border-white dark:border-slate-900">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">User Profile & Financial Config</span>
              <Badge variant={isSupabaseConfigured ? 'emerald' : 'amber'}>
                {isSupabaseConfigured ? 'Supabase Cloud Sync' : 'Local Persistence'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-heading tracking-tight">{fullName}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-0.5">{occupation} • {user?.email || profile?.email || 'user@example.com'}</p>
          </div>
        </div>

        {isSavedToast && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Profile Details & Photo Updated!</span>
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
          title="Target Monthly Savings"
          value={`₹${monthlySurplus.toLocaleString('en-IN')}`}
          subtitle={`Savings Rate: ${savingsRatePct}%`}
          icon={TrendingUp}
          color="emerald"
        />

        <StatCard
          title="Emergency Fund Vault"
          value={`₹${Number(emergencyTarget).toLocaleString('en-IN')}`}
          subtitle={`${emergencyCoverageMonths} months of expenses`}
          icon={ShieldCheck}
          color="rose"
        />
      </div>

      {/* Main Settings Form */}
      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Personal Details & Avatar */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-700 dark:text-emerald-400" /> Personal Profile Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 neu-input text-sm text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Occupation / Industry
                </label>
                <input
                  type="text"
                  required
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-4 py-2.5 neu-input text-sm text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || profile?.email || 'user@example.com'}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
                />
              </div>

              {/* Profile Avatar Image URL Input */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" /> Profile Picture Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/my-photo.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-2.5 neu-input text-sm text-slate-900 dark:text-white font-medium"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Paste a direct link to your photo or use your default Google / Supabase profile picture.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800"></div>

          {/* Section 2: Core Financial Details */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading mb-4 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-emerald-700 dark:text-emerald-400" /> Core Income & Budget Targets
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Monthly Take-Home Income (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full px-4 py-2.5 neu-input text-sm text-emerald-700 dark:text-emerald-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Monthly Expense Cap (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-2.5 neu-input text-sm text-amber-700 dark:text-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Emergency Fund Target (₹)
                </label>
                <input
                  type="number"
                  value={emergencyTarget}
                  onChange={(e) => setEmergencyTarget(e.target.value)}
                  className="w-full px-4 py-2.5 neu-input text-sm text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Savings Goal Target (₹)
                </label>
                <input
                  type="number"
                  value={savingsGoalTarget}
                  onChange={(e) => setSavingsGoalTarget(e.target.value)}
                  className="w-full px-4 py-2.5 neu-input text-sm text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800"></div>

          {/* Section 3: Financial Persona Strategy */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-700 dark:text-emerald-400" /> Wealth Strategy Persona
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  id: 'Conservative Saver',
                  title: 'Conservative Saver',
                  desc: 'Focus on emergency reserves, fixed deposits & zero-debt safety caps.'
                },
                {
                  id: 'Moderate Wealth Builder',
                  title: 'Moderate Wealth Builder',
                  desc: 'Balanced 50/30/20 budget allocation with mutual fund SIP investments.'
                },
                {
                  id: 'Aggressive Accumulator',
                  title: 'Aggressive Accumulator',
                  desc: 'High savings rate (35%+), equity compounding & rapid goal velocity.'
                }
              ].map((s) => (
                <div
                  key={s.id}
                  onClick={() => setStrategy(s.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    strategy === s.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-slate-900 dark:text-white font-bold shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between mb-1">
                    <span>{s.title}</span>
                    {strategy === s.id && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Form Action Button */}
          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="success" size="lg" className="flex items-center gap-2 px-8">
              <Save className="w-5 h-5" /> Save Configuration & Sync Supabase
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
