import React from 'react';
import {
  Menu,
  LayoutDashboard,
  Receipt,
  ScanText,
  PieChart,
  Bot,
  Activity,
  Sliders,
  Sparkles,
  User,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';

export const TopHeader = ({
  activeView,
  setActiveView,
  onOpenMobileSidebar,
  onOpenAddModal
}) => {
  const { activeProfile } = useAuth();
  const { healthScoreData } = useExpense();

  const viewTitles = {
    dashboard: { label: 'Financial Dashboard', icon: LayoutDashboard, desc: 'Real-time financial analytics & expense summaries' },
    expenses: { label: 'Expense Ledger', icon: Receipt, desc: 'Detailed transaction history & category filters' },
    ocr: { label: 'Receipt OCR Extractor', icon: ScanText, desc: 'AI Vision receipt scanning & order itemization' },
    budget: { label: 'Budget & ML Forecast', icon: PieChart, desc: 'Linear regression velocity & trajectory predictions' },
    advisor: { label: 'AI Purchase Advisor', icon: Bot, desc: 'Safe daily purchase limits & affordability evaluator' },
    health: { label: 'Financial Health Score', icon: Activity, desc: 'Multi-factor financial wellness diagnostic index' },
    simulator: { label: '"What If?" Simulator', icon: Sliders, desc: 'Interactive compound savings scenario planner' },
    savings: { label: 'Personalized Savings Plan', icon: Sparkles, desc: 'Goal vaults & milestone roadmap strategy' },
    profile: { label: 'Profile & Financial Config', icon: User, desc: 'Income, expense caps & strategy preferences' }
  };

  const currentView = viewTitles[activeView] || viewTitles.dashboard;
  const ActiveIcon = currentView.icon;

  return (
    <header className="sticky top-0 z-20 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
      <div className="w-full px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Hamburger & Active Page Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Drawer Trigger */}
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Open Side Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Active View Icon & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl hidden sm:flex">
              <ActiveIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-2">
                <span>{currentView.label}</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden md:block">
                {currentView.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Bar: Add Expense Quick Shortcut & Profile Indicator */}
        <div className="flex items-center gap-3">
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Expense</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{activeProfile?.full_name || 'Richu Sharma'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
