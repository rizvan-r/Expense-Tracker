import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Card } from './UI/Card';
import { StatCard } from './UI/StatCard';
import { Badge } from './UI/Badge';
import { Button } from './UI/Button';
import {
  PieChart,
  TrendingUp,
  AlertOctagon,
  CheckCircle,
  Zap,
  Edit2,
  IndianRupee,
  Sliders
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS modules to avoid scale errors
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const BudgetPredictor = () => {
  const {
    profile,
    updateProfile,
    totalSpent,
    categories,
    categorySpendMap,
    budgetPrediction
  } = useExpense();

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState((profile?.monthly_budget || 55000).toString());
  const [tempIncome, setTempIncome] = useState((profile?.monthly_income || 85000).toString());

  const handleSaveBudget = (e) => {
    e.preventDefault();
    updateProfile({
      monthly_budget: Number(tempBudget),
      monthly_income: Number(tempIncome)
    });
    setIsEditingBudget(false);
  };

  // Trajectory forecast chart data
  const daysInMonth = 30;
  const currentDay = new Date().getDate();
  
  const actualDays = Array.from({ length: currentDay }, (_, i) => `Day ${i + 1}`);
  const futureDays = Array.from({ length: daysInMonth - currentDay }, (_, i) => `Day ${currentDay + i + 1}`);
  const allDays = [...actualDays, ...futureDays];

  // Actual cumulative spending up to today
  const dailyAvg = totalSpent / Math.max(1, currentDay);
  const actualCumulative = actualDays.map((_, i) => Math.round(dailyAvg * (i + 1)));

  // Projected trajectory from today to month end
  const projectedEnd = budgetPrediction?.predicted_end_of_month || (totalSpent * 1.15);
  const projectedSlope = (projectedEnd - totalSpent) / Math.max(1, daysInMonth - currentDay);
  
  const projectedCumulative = [
    ...Array(currentDay - 1).fill(null),
    totalSpent,
    ...futureDays.map((_, i) => Math.round(totalSpent + projectedSlope * (i + 1)))
  ];

  // Flat budget limit line
  const budgetCapLine = Array(daysInMonth).fill(profile.monthly_budget);

  const lineChartData = {
    labels: allDays,
    datasets: [
      {
        label: 'Actual Cumulative Spend (₹)',
        data: actualCumulative,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderWidth: 3,
        pointRadius: 3,
        tension: 0.3
      },
      {
        label: 'ML Projected Trajectory (₹)',
        data: projectedCumulative,
        borderColor: budgetPrediction?.trend_status === 'CRITICAL' ? '#f43f5e' : '#10b981',
        borderDash: [6, 6],
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.2
      },
      {
        label: 'Monthly Budget Limit (₹)',
        data: budgetCapLine,
        borderColor: 'rgba(239, 68, 68, 0.6)',
        borderWidth: 1.5,
        pointRadius: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#cbd5e1', font: { size: 11 } }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">ML Forecast Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-heading">Budgeting & Predictive Analysis</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
            Machine learning linear regression projects your month-end total spend based on current velocity.
          </p>
        </div>

        <Button variant="secondary" icon={Edit2} onClick={() => setIsEditingBudget(true)}>
          Adjust Monthly Budget
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Target Budget"
          value={`₹${profile.monthly_budget.toLocaleString('en-IN')}`}
          subtitle={`Monthly Net Income: ₹${profile.monthly_income.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="indigo"
        />

        <StatCard
          title="Current Spend"
          value={`₹${totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          subtitle={`Remaining: ₹${Math.max(0, profile.monthly_budget - totalSpent).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          icon={PieChart}
          color="amber"
        />

        <StatCard
          title="ML Forecasted Month-End"
          value={`₹${(budgetPrediction?.predicted_end_of_month || totalSpent * 1.1).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          subtitle={budgetPrediction?.projected_overrun > 0 ? `Overrun: +₹${budgetPrediction?.projected_overrun}` : 'Within Budget'}
          icon={TrendingUp}
          color={budgetPrediction?.projected_overrun > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Trajectory Forecast Chart */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">Spending Trajectory vs Target Budget</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Solid line represents actual spend to date; dashed curve represents ML projection.
            </p>
          </div>

          <Badge variant={budgetPrediction?.trend_status === 'CRITICAL' ? 'rose' : 'emerald'}>
            Status: {budgetPrediction?.trend_status || 'ON_TRACK'}
          </Badge>
        </div>

        <div className="h-72 w-full">
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </Card>

      {/* Category Budget Caps & Progress Bars */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">Category Budget Cap Performance</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tracking spending vs individual category limits</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {categories.map((cat) => {
            const spent = categorySpendMap[cat.name] || 0;
            const limit = cat.monthly_limit || 8000;
            const pct = Math.min(100, Math.round((spent / limit) * 100));
            const isOver = spent > limit;

            return (
              <div key={cat.id} className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    {cat.name}
                  </span>
                  <span className={isOver ? 'text-rose-700 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-400'}>
                    ₹{spent.toLocaleString('en-IN')} / ₹{limit.toLocaleString('en-IN')} ({pct}%)
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Modal to edit budget */}
      {isEditingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">Set Target Monthly Budget</h3>
            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Monthly Net Income (₹)
                </label>
                <input
                  type="number"
                  required
                  value={tempIncome}
                  onChange={(e) => setTempIncome(e.target.value)}
                  className="w-full px-4 py-2.5 neu-input text-sm text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Monthly Expense Budget (₹)
                </label>
                <input
                  type="number"
                  required
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  className="w-full px-4 py-2.5 neu-input text-sm text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <Button type="button" variant="secondary" onClick={() => setIsEditingBudget(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
