import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { generateSavingsPlan } from '../services/apiService';
import { Card } from './UI/Card';
import { StatCard } from './UI/StatCard';
import { Badge } from './UI/Badge';
import { Button } from './UI/Button';
import { Modal } from './UI/Modal';
import {
  Sparkles,
  Target,
  Calendar,
  CheckCircle2,
  Plus,
  Compass,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const SavingsPlan = () => {
  const { savingsGoals, addSavingsGoal, profile, expenses } = useExpense();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalMonths, setGoalMonths] = useState('6');
  const [goalCategory, setGoalCategory] = useState('General');

  const [aiPlanResult, setAiPlanResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAIPlan = async (e) => {
    e.preventDefault();
    if (!goalTitle || !goalAmount) return;

    setIsGenerating(true);
    try {
      const plan = await generateSavingsPlan({
        target_goal_name: goalTitle,
        target_amount: Number(goalAmount),
        target_months: Number(goalMonths),
        current_income: profile?.monthly_income || 85000,
        current_expenses: expenses
      });

      setAiPlanResult(plan);

      // Add to goal list
      addSavingsGoal({
        title: goalTitle,
        target_amount: Number(goalAmount),
        current_amount: 0,
        target_date: new Date(Date.now() + Number(goalMonths) * 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
        category: goalCategory
      });
    } catch (err) {
      console.error('Savings plan generation failed:', err);
    } finally {
      setIsGenerating(false);
      setIsGoalModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">AI Wealth Roadmap</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-heading">Personalized Savings Plan</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
            Set custom financial goals and let AI build step-by-step milestone timelines and cutback targets in Rupees (₹).
          </p>
        </div>

        <Button variant="success" icon={Plus} onClick={() => setIsGoalModalOpen(true)}>
          Create Savings Goal
        </Button>
      </div>

      {/* Active Savings Goals Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">Active Savings Vault Goals</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {savingsGoals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
            return (
              <Card key={goal.id} className="p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="emerald">{goal.category || 'General'}</Badge>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Target: {goal.target_date}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white font-heading">{goal.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                    ₹{goal.current_amount.toLocaleString('en-IN')} saved of ₹{goal.target_amount.toLocaleString('en-IN')} goal
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Progress</span>
                    <span className="text-emerald-700 dark:text-emerald-400">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-600 dark:text-slate-400">Remaining: ₹{(goal.target_amount - goal.current_amount).toLocaleString('en-IN')}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer">View Roadmap →</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Generated AI Strategy & Milestone Roadmap */}
      {aiPlanResult && (
        <Card className="p-6 space-y-6 bg-slate-900/80 border-indigo-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading">
                  AI Plan Strategy for "{aiPlanResult.goal_name}"
                </h3>
                <p className="text-xs text-slate-400">
                  Required Monthly Target: <span className="text-emerald-400 font-bold">₹{aiPlanResult.monthly_target_savings.toLocaleString('en-IN')}/mo</span>
                </p>
              </div>
            </div>

            <Badge variant="emerald">Feasible Strategy</Badge>
          </div>

          <p className="text-xs text-slate-300 bg-slate-950/80 p-4 rounded-xl border border-slate-800 leading-relaxed">
            {aiPlanResult.ai_strategy_summary.replace(/\$/g, '₹')}
          </p>

          {/* Milestone Timeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white font-heading">Milestone Progression Schedule</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {aiPlanResult.milestone_timeline.map((m) => (
                <div key={m.month} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-indigo-400">{m.target_date}</span>
                    <span className="text-emerald-400">{m.completion_percentage}%</span>
                  </div>
                  <p className="text-xs font-bold text-white">{m.milestone_title.replace(/\$/g, '₹')}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Goal Creation Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Build New AI Savings Goal"
      >
        <form onSubmit={handleGenerateAIPlan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Goal Name / Target
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Emergency Reserve Vault, Goa Trip"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Amount (₹)
              </label>
              <input
                type="number"
                required
                placeholder="50000"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Timeframe
              </label>
              <select
                value={goalMonths}
                onChange={(e) => setGoalMonths(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsGoalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="success" isLoading={isGenerating} icon={Sparkles}>
              Generate AI Savings Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
