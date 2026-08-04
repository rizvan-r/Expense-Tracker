import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Card } from './UI/Card';
import { StatCard } from './UI/StatCard';
import { Badge } from './UI/Badge';
import { Button } from './UI/Button';
import {
  Sliders,
  IndianRupee,
  TrendingUp,
  Sparkles,
  Zap,
  Activity,
  RotateCcw,
  Plus
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

export const Simulator = () => {
  const { totalSpent, profile, healthScoreData } = useExpense();

  // Sliders percentage state (0% to 50%)
  const [diningCut, setDiningCut] = useState(20);
  const [subCut, setSubCut] = useState(40);
  const [shoppingCut, setShoppingCut] = useState(25);
  const [entCut, setEntCut] = useState(30);

  // Timeframe choice
  const [timeframeMonths, setTimeframeMonths] = useState(12);

  // Calculated reductions
  const estFoodSpend = Math.max(2000, totalSpent * 0.30);
  const estSubSpend = Math.max(1000, totalSpent * 0.08);
  const estShoppingSpend = Math.max(3000, totalSpent * 0.20);
  const estEntSpend = Math.max(1500, totalSpent * 0.12);

  const monthlyFoodSaved = Math.round((estFoodSpend * diningCut) / 100);
  const monthlySubSaved = Math.round((estSubSpend * subCut) / 100);
  const monthlyShoppingSaved = Math.round((estShoppingSpend * shoppingCut) / 100);
  const monthlyEntSaved = Math.round((estEntSpend * entCut) / 100);

  const totalMonthlySavings = monthlyFoodSaved + monthlySubSaved + monthlyShoppingSaved + monthlyEntSaved;

  // Compound 7% APY growth model
  const compoundData = useMemo(() => {
    const monthlyRate = 0.07 / 12;
    const points = [];
    let accumulated = 0;

    for (let m = 1; m <= timeframeMonths; m++) {
      accumulated = (accumulated + totalMonthlySavings) * (1 + monthlyRate);
      points.push({
        month: m,
        saved: Math.round(accumulated)
      });
    }
    return points;
  }, [totalMonthlySavings, timeframeMonths]);

  // Projected updated score
  const updatedHealthScore = Math.min(99, (healthScoreData?.overall_score || 85) + Math.round(totalMonthlySavings / 500));

  const chartData = {
    labels: compoundData.map(p => `Month ${p.month}`),
    datasets: [
      {
        label: 'Compound Savings with 7% APY (₹)',
        data: compoundData.map(p => p.saved),
        fill: true,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.4,
        pointBackgroundColor: '#10b981'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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

  const applyPreset = (type) => {
    if (type === 'aggressive') {
      setDiningCut(35);
      setSubCut(60);
      setShoppingCut(40);
      setEntCut(40);
    } else if (type === 'moderate') {
      setDiningCut(20);
      setSubCut(30);
      setShoppingCut(20);
      setEntCut(20);
    } else if (type === 'reset') {
      setDiningCut(0);
      setSubCut(0);
      setShoppingCut(0);
      setEntCut(0);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Interactive Scenario Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-heading">"What If?" Savings Simulator</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
            Adjust category expense cutbacks and observe real-time projected compound savings growth in Rupees (₹).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => applyPreset('moderate')}>
            Moderate Cut
          </Button>
          <Button size="sm" variant="primary" onClick={() => applyPreset('aggressive')}>
            Aggressive Mode
          </Button>
          <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => applyPreset('reset')}>
            Reset
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Extra Monthly Savings"
          value={`+₹${totalMonthlySavings.toLocaleString('en-IN')}/mo`}
          subtitle="Direct cutback total"
          icon={IndianRupee}
          color="emerald"
        />

        <StatCard
          title={`${timeframeMonths}-Month Projected Savings`}
          value={`₹${compoundData[compoundData.length - 1]?.saved.toLocaleString('en-IN') || 0}`}
          subtitle="Includes 7% APY yield"
          icon={TrendingUp}
          color="indigo"
        />

        <StatCard
          title="Projected Health Score"
          value={`${updatedHealthScore} / 100`}
          subtitle={`+${updatedHealthScore - (healthScoreData?.overall_score || 85)} pts score boost`}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Main Grid: Sliders on left, Chart on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Sliders Panel */}
        <Card className="lg:col-span-1 p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">Adjust Cutback Percentages</h3>

          {/* Slider 1: Food & Dining */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-900 dark:text-slate-200">Food & Dining Cutback</span>
              <span className="text-emerald-700 dark:text-emerald-400">-{diningCut}% (₹{monthlyFoodSaved}/mo)</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={diningCut}
              onChange={(e) => setDiningCut(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Slider 2: Subscriptions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-900 dark:text-slate-200">Subscriptions Cutback</span>
              <span className="text-emerald-700 dark:text-indigo-400">-{subCut}% (₹{monthlySubSaved}/mo)</span>
            </div>
            <input
              type="range"
              min="0"
              max="75"
              value={subCut}
              onChange={(e) => setSubCut(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Slider 3: Shopping */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-900 dark:text-slate-200">Shopping Cutback</span>
              <span className="text-pink-700 dark:text-pink-400">-{shoppingCut}% (₹{monthlyShoppingSaved}/mo)</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={shoppingCut}
              onChange={(e) => setShoppingCut(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>

          {/* Slider 4: Entertainment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-900 dark:text-slate-200">Entertainment Cutback</span>
              <span className="text-purple-700 dark:text-purple-400">-{entCut}% (₹{monthlyEntSaved}/mo)</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={entCut}
              onChange={(e) => setEntCut(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Time Horizon Selector */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-2">
              Time Horizon
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[6, 12, 24].map((m) => (
                <button
                  key={m}
                  onClick={() => setTimeframeMonths(m)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    timeframeMonths === m
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {m} Months
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Compound Growth Chart */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">Compound Wealth Accumulation Curve</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Assuming monthly extra savings reinvested at 7% APY yield
              </p>
            </div>
            <Badge variant="emerald">7% APY Yield</Badge>
          </div>

          <div className="h-72 w-full">
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
            <span>By Month {timeframeMonths}, you accumulate ₹{compoundData[compoundData.length - 1]?.saved.toLocaleString('en-IN')}</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Ready to Lock Plan</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
