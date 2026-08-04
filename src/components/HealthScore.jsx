import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Card } from './UI/Card';
import { Badge } from './UI/Badge';
import { Button } from './UI/Button';
import {
  Activity,
  ShieldCheck,
  Award,
  Zap,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

export const HealthScore = ({ setActiveView }) => {
  const { healthScoreData, totalSpent, profile, savingsRate } = useExpense();

  const score = healthScoreData?.overall_score || 82;
  const tier = healthScoreData?.tier || 'EXCELLENT';
  const breakdown = healthScoreData?.breakdown || {
    savings_score: 28,
    budget_score: 26,
    category_score: 16,
    buffer_score: 12
  };

  const getScoreColor = (val) => {
    if (val >= 80) return { stroke: '#10b981', text: 'text-emerald-400', badge: 'emerald' };
    if (val >= 65) return { stroke: '#6366f1', text: 'text-indigo-400', badge: 'indigo' };
    if (val >= 50) return { stroke: '#f59e0b', text: 'text-amber-400', badge: 'amber' };
    return { stroke: '#f43f5e', text: 'text-rose-400', badge: 'rose' };
  };

  const scoreStyle = getScoreColor(score);

  // SVG Gauge calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-6 animate-fadeIn pb-12 w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Financial Wellness Index</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-heading">AI Financial Health Score</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
            Multi-factor diagnostic evaluation based on savings rate, budget velocity, and category risk ratios.
          </p>
        </div>

        <Badge variant={scoreStyle.badge} className="self-start md:self-auto text-sm py-1.5 px-4">
          Tier: {tier}
        </Badge>
      </div>

      {/* Main Score Gauge Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="relative w-48 h-48 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Progress Arc */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={scoreStyle.stroke}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-4xl font-black font-heading ${scoreStyle.text}`}>{score}</span>
              <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mt-0.5">Score</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">{tier} Financial Wellness</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-2 max-w-xs leading-relaxed">
            {healthScoreData?.recommendation_summary || "You are consistently living below your means and building strong wealth reserves."}
          </p>
        </Card>

        {/* Sub-Metric Factor Cards */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">Health Points Diagnostic Breakdown</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">Base: 70 pts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Factor 1: Discretionary Negative Impact (Food, Misc, Subscriptions, Entertainment) */}
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1">
                  🔻 Negative Deductions
                </span>
                <span className="text-rose-700 dark:text-rose-400 font-bold">-{breakdown.negative_deductions ?? breakdown.category_score ?? 4} pts</span>
              </div>
              <div className="w-full bg-rose-200 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${Math.min(100, ((breakdown.negative_deductions || 4) / 30) * 100)}%` }}></div>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                Food & Dining, Misc, Subscriptions, Entertainment (₹{(breakdown.negative_spend || 4099).toLocaleString('en-IN')})
              </p>
            </div>

            {/* Factor 2: Essential Positive Impact (Housing, Transport, Health, Education, Savings) */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  🟢 Positive Boosters
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">+{breakdown.positive_boost ?? breakdown.savings_score ?? 22} pts</span>
              </div>
              <div className="w-full bg-emerald-200 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(100, ((breakdown.positive_boost || 22) / 30) * 100)}%` }}></div>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                Housing, Transport, Health, Education, Savings (₹{(breakdown.positive_spend || 41449).toLocaleString('en-IN')})
              </p>
            </div>

            {/* Factor 3: Base Health Points Pool */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-200">Base Points Pool</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{breakdown.base_points || 70} / 70 pts</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Initial health pool score before category adjustments.</p>
            </div>

            {/* Factor 4: Net Health Formula */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-200">Net Health Points</span>
                <span className="text-amber-700 dark:text-amber-400 font-bold">{score} / 100 pts</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${score}%` }}></div>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Formula: Base (70) + Boost - Deductions</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Plan Checklist */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">AI Health Improvement Action Items</h3>
        </div>

        <div className="space-y-3">
          {(healthScoreData?.action_items || [
            "Maintain savings rate above 20%",
            "Cap food & dining to under 25% of total budget"
          ]).map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">{item}</p>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="primary" onClick={() => setActiveView('simulator')}>
            Simulate Score Boost in "What If?" Tool
          </Button>
        </div>
      </Card>
    </div>
  );
};
