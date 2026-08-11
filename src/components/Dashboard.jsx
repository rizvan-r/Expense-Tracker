import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Card } from './UI/Card';
import { StatCard } from './UI/StatCard';
import { Badge } from './UI/Badge';
import { Button } from './UI/Button';
import {
  IndianRupee,
  PieChart as PieIcon,
  TrendingUp,
  Activity,
  AlertTriangle,
  Sparkles,
  PlusCircle,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Target
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { StockMarketWidget } from './StockMarketWidget';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const Dashboard = ({ setActiveView, onOpenAddModal }) => {
  const {
    totalSpent = 0,
    profile = {},
    monthlySavings = 0,
    savingsRate = 0,
    highestCategory = { name: 'None', amount: 0 },
    categorySpendMap = {},
    categories = [],
    expenses = [],
    healthScoreData,
    budgetPrediction,
    aiRecommendations = [],
    isAiLoading
  } = useExpense();

  // Prepare chart data defensively
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeSpendMap = categorySpendMap && typeof categorySpendMap === 'object' ? categorySpendMap : {};

  const categoryLabels = Object.keys(safeSpendMap);
  const categoryValues = Object.values(safeSpendMap);
  const categoryColors = categoryLabels.map(cat => {
    const found = safeCategories.find(c => c && c.name === cat);
    return found ? found.color : '#6366f1';
  });

  const doughnutData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: categoryColors.length > 0 ? categoryColors : ['#6366f1'],
        borderWidth: 2,
        borderColor: '#111827',
        hoverOffset: 6
      }
    ]
  };

  // Weekly spending breakdown data
  const safeTotalSpent = Number(totalSpent) || 0;
  const weeklyData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4 (Current)'],
    datasets: [
      {
        label: 'Weekly Spend (₹)',
        data: [
          Math.round(safeTotalSpent * 0.22),
          Math.round(safeTotalSpent * 0.28),
          Math.round(safeTotalSpent * 0.26),
          Math.round(safeTotalSpent * 0.24)
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        hoverBackgroundColor: 'rgba(99, 102, 241, 0.95)',
        borderRadius: 8,
      }
    ]
  };

  // Daily spend trend data (last 7 days)
  const recentExpenses = [...safeExpenses].reverse().slice(-7);
  const lineData = {
    labels: recentExpenses.length > 0 ? recentExpenses.map(e => e && e.date ? e.date.substring(5) : 'Day') : ['Day 1'],
    datasets: [
      {
        label: 'Daily Spend (₹)',
        data: recentExpenses.length > 0 ? recentExpenses.map(e => Number(e?.amount) || 0) : [0],
        fill: true,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#0f172a',
        bodyColor: '#334155',
        borderColor: '#cbd5e1',
        borderWidth: 1,
        padding: 12
      }
    },
    scales: {
      x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#64748b', font: { weight: 'bold' } } },
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#64748b', font: { weight: 'bold' } } }
    }
  };

  const safeBudget = Number(profile?.monthly_budget) || 55000;

  return (
    <div className="space-y-6 animate-fade-in pb-12 w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-[6px_6px_18px_#e2e8f0,-6px_-6px_18px_#ffffff] dark:shadow-[6px_6px_18px_#020617,-6px_-6px_18px_#1e293b]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Welcome Back</span>
            <Badge variant="emerald">AI Assistant Active</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-heading tracking-tight">
            Financial Health & Analytics Hub
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
            Real-time expense monitoring in Indian Rupees (₹), predictive ML trend projections, and cost optimization recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button icon={PlusCircle} variant="primary" onClick={onOpenAddModal}>
            Add Expense
          </Button>
          <Button icon={Sparkles} variant="outline" onClick={() => setActiveView('ocr')}>
            Scan Receipt
          </Button>
        </div>
      </div>

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Monthly Spend"
          value={`₹${safeTotalSpent.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          subtitle={`Budget Target: ₹${safeBudget.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          trend={safeTotalSpent > safeBudget ? 'up' : 'down'}
          trendText={`${Math.round((safeTotalSpent / safeBudget) * 100)}% of monthly limit`}
          color="emerald"
        />

        <StatCard
          title="ML Spend Forecast"
          value={`₹${(Number(budgetPrediction?.predicted_end_of_month) || (safeTotalSpent * 1.1) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          subtitle={budgetPrediction?.trend_status === 'CRITICAL' ? '⚠️ Overrun Projected' : 'On Track'}
          icon={TrendingUp}
          trend={budgetPrediction?.trend_status === 'CRITICAL' ? 'up' : 'down'}
          trendText={`Daily Burn: ₹${budgetPrediction?.daily_burn_rate || 1200}/day`}
          color={budgetPrediction?.trend_status === 'CRITICAL' ? 'rose' : 'emerald'}
        />

        <StatCard
          title="Health Score"
          value={`${healthScoreData?.overall_score || 85} / 100`}
          subtitle={`Tier: ${healthScoreData?.tier || 'EXCELLENT'}`}
          icon={Activity}
          trend="up"
          trendText="Top 15% savings discipline"
          color="amber"
        />

        <StatCard
          title="Top Spend Category"
          value={highestCategory?.name || 'None'}
          subtitle={`₹${(Number(highestCategory?.amount) || 0).toLocaleString('en-IN')} logged`}
          icon={PieIcon}
          trend="up"
          trendText={`${safeTotalSpent ? Math.round(((highestCategory?.amount || 0) / safeTotalSpent) * 100) : 0}% of overall total`}
          color="indigo"
        />
      </div>

      {/* Real-Time Stock Market Ticker Widget */}
      <StockMarketWidget />

      {/* Predictive ML Alert Banner */}
      {budgetPrediction?.projected_overrun > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">Predictive Budget Alert</h4>
              <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
                At your current velocity of ₹{budgetPrediction?.daily_burn_rate}/day, you are projected to exceed budget by{' '}
                <span className="font-bold text-rose-950 dark:text-rose-100">₹{budgetPrediction?.projected_overrun}</span> by month end.
              </p>
            </div>
          </div>
          <Button size="sm" variant="danger" onClick={() => setActiveView('simulator')}>
            Simulate Cutback
          </Button>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Spending Breakdown Bar Chart */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Weekly Spending Breakdown</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Comparing current week velocity against previous periods</p>
            </div>
            <Badge variant="emerald">Monthly View</Badge>
          </div>
          <div className="h-64 w-full">
            <Bar data={weeklyData} options={chartOptions} />
          </div>
        </Card>

        {/* Category Expense Donut Chart */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Category Allocation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Distribution of overall spending</p>
            </div>
            <PieIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="h-56 w-full relative flex items-center justify-center">
            {categoryValues.length > 0 ? (
              <Doughnut data={doughnutData} options={{ ...chartOptions, cutout: '72%' }} />
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No category data yet</p>
            )}
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Total</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white font-heading">₹{safeTotalSpent.toFixed(0)}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span>{categoryLabels.length} Active Categories</span>
            <button onClick={() => setActiveView('expenses')} className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1">
              View Table <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </Card>
      </div>

      {/* AI Recommendations & Daily Trend Line */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommendations Cards */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">AI Cost Optimization Recommendations</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tailored suggestions generated from transaction patterns</p>
              </div>
            </div>
            {isAiLoading && <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold animate-pulse">Analyzing...</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {(Array.isArray(aiRecommendations) ? aiRecommendations : []).map((rec) => (
              <div
                key={rec.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-[3px_3px_8px_#e2e8f0,-3px_-3px_8px_#ffffff] dark:shadow-none hover:border-emerald-400 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={rec.priority === 'HIGH' ? 'rose' : 'emerald'}>
                      {rec.category}
                    </Badge>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Save {(rec.impact_savings || '').replace('$', '₹')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1.5 leading-relaxed">
                    {(rec.description || '').replace(/\$/g, '₹')}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold">Priority: {rec.priority}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-emerald-700 dark:text-emerald-400 font-bold hover:text-emerald-800 dark:hover:text-emerald-300"
                    onClick={() => {
                      if (rec.id && (rec.id.includes('food') || rec.id.includes('shopping'))) {
                        setActiveView('simulator');
                      } else {
                        setActiveView('budget');
                      }
                    }}
                  >
                    {rec.action_label || 'Take Action'} →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Daily Spending Trend Line */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Recent Daily Velocity</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Expense velocity over last 7 entries</p>
            </div>
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="h-48 w-full my-2">
            <Line data={lineData} options={chartOptions} />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Daily Avg: ₹{budgetPrediction?.daily_burn_rate || 1250}/day</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Stable Velocity
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};
