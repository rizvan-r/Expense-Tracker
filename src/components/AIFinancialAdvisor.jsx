import React, { useState, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { fetchPurchaseAdvisorLimits, fetchAIChatResponse } from '../services/apiService';
import { Card } from './UI/Card';
import { StatCard } from './UI/StatCard';
import { Badge } from './UI/Badge';
import { Button } from './UI/Button';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ShoppingBag,
  IndianRupee,
  Calendar,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Zap,
  Bot,
  Send
} from 'lucide-react';

export const AIFinancialAdvisor = () => {
  const { profile, totalSpent, chatMessages = [], setChatMessages } = useExpense();

  const [advisorData, setAdvisorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Purchase Affordability Evaluator Form State
  const [purchaseName, setPurchaseName] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const [inputPrompt, setInputPrompt] = useState('');

  const loadAdvisorLimits = async (itemName = '', itemAmt = 0) => {
    setIsLoading(true);
    try {
      const res = await fetchPurchaseAdvisorLimits({
        monthly_income: profile?.monthly_income || 85000,
        monthly_budget: profile?.monthly_budget || 55000,
        total_spent: totalSpent,
        intended_purchase_name: itemName,
        intended_purchase_amount: itemAmt
      });
      setAdvisorData(res);
      if (itemAmt > 0) {
        setEvaluationResult({
          verdict: res.affordability_verdict,
          details: res.affordability_details
        });
      }
    } catch (err) {
      console.warn('Advisor load error:', err);
    } finally {
      setIsLoading(false);
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    loadAdvisorLimits();
  }, [profile?.monthly_income, profile?.monthly_budget, totalSpent]);

  const handleEvaluatePurchase = (e) => {
    e.preventDefault();
    if (!purchaseAmount) return;
    setIsEvaluating(true);
    loadAdvisorLimits(purchaseName || 'Item', Number(purchaseAmount));
  };

  const [isSendingPrompt, setIsSendingPrompt] = useState(false);

  const handleSendPrompt = async (userText) => {
    const textToProcess = userText || inputPrompt;
    if (!textToProcess.trim() || isSendingPrompt) return;

    const updatedMessages = [...chatMessages, { sender: 'user', text: textToProcess }];
    setChatMessages(updatedMessages);
    setInputPrompt('');
    setIsSendingPrompt(true);

    try {
      const historyFormatted = chatMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetchAIChatResponse({
        message: textToProcess,
        history: historyFormatted,
        monthly_income: profile?.monthly_income || 85000,
        monthly_budget: profile?.monthly_budget || 55000,
        total_spent: totalSpent
      });

      setChatMessages([...updatedMessages, { sender: 'ai', text: res.reply || 'Analysis completed.' }]);
    } catch (err) {
      console.warn('AI chat error:', err);
      const inc = profile?.monthly_income || 85000;
      setChatMessages([
        ...updatedMessages,
        {
          sender: 'ai',
          text: `Based on your profile (Income: ₹${inc.toLocaleString('en-IN')}), keeping daily non-essential spend below ₹${advisorData?.safe_daily_purchase_limit?.toLocaleString('en-IN') || '1,450'}/day will help you save 20% comfortably.`
        }
      ]);
    } finally {
      setIsSendingPrompt(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-slate-900/50 p-6 rounded-3xl border border-violet-500/20 glass-panel">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">Smart Financial Assistant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">AI Purchase Limits & Savings Advisor</h1>
          <p className="text-sm text-slate-400 mt-1">
            Calculates safe daily purchase caps, single-item spending limits, 50/30/20 savings allocations, and purchase affordability.
          </p>
        </div>

        <Badge variant="cyan" className="self-start md:self-auto text-xs py-1.5 px-4">
          Interactive AI Active
        </Badge>
      </div>

      {/* Top 4 Metric Cards for Purchase & Savings Limits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Safe Daily Purchase Cap"
          value={`₹${(advisorData?.safe_daily_purchase_limit || 1450).toLocaleString('en-IN')}/day`}
          subtitle="Non-essential daily max"
          icon={IndianRupee}
          color="emerald"
        />

        <StatCard
          title="Single Purchase Cap"
          value={`₹${(advisorData?.max_one_time_purchase_limit || 17000).toLocaleString('en-IN')}`}
          subtitle="Max item price before cool-down"
          icon={ShoppingBag}
          color="indigo"
        />

        <StatCard
          title="Optimal 20% Monthly Savings"
          value={`₹${(advisorData?.recommended_monthly_savings || 17000).toLocaleString('en-IN')}/mo`}
          subtitle="50/30/20 Rule Target"
          icon={TrendingUp}
          color="purple"
        />

        <StatCard
          title="Wants Allocation (30%)"
          value={`₹${(advisorData?.allocation_50_30_20?.wants || advisorData?.['50_30_20_allocation']?.wants || 25500).toLocaleString('en-IN')}/mo`}
          subtitle="Discretionary ceiling"
          icon={Zap}
          color="amber"
        />
      </div>

      {/* Main Grid: Purchase Evaluator + Interactive AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: "Can I Afford This?" Purchase Evaluator */}
        <Card className="lg:col-span-1 p-6 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white font-heading">"Can I Afford This?" Evaluator</h3>
            </div>
            <p className="text-xs text-slate-400">
              Enter an intended item or purchase to evaluate if it fits safely within your remaining budget.
            </p>

            <form onSubmit={handleEvaluatePurchase} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Item / Planned Purchase Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sony TV, iPhone 15, Goa Trip"
                  value={purchaseName}
                  onChange={(e) => setPurchaseName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Cost Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 25000"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full" isLoading={isEvaluating} icon={Sparkles}>
                Evaluate Purchase Safety
              </Button>
            </form>
          </div>

          {/* Evaluation Result Box */}
          {evaluationResult && (
            <div className={`p-4 rounded-2xl border space-y-2 mt-4 ${
              evaluationResult.verdict === 'APPROVED'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : evaluationResult.verdict === 'CAUTION'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">AI Evaluation Verdict</span>
                <Badge variant={
                  evaluationResult.verdict === 'APPROVED' ? 'emerald' :
                  evaluationResult.verdict === 'CAUTION' ? 'amber' : 'rose'
                }>
                  {evaluationResult.verdict}
                </Badge>
              </div>
              <p className="text-xs leading-relaxed">{evaluationResult.details}</p>
            </div>
          )}
        </Card>

        {/* Right 2 Cols: Interactive AI Coaching Chat & Prompt Buttons */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400 border border-violet-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-heading">AI Financial Coach & Savings Advisor</h3>
                <p className="text-xs text-slate-400">Ask questions about purchase limits, savings benchmarks, or expense rules</p>
              </div>
            </div>
            <Badge variant="indigo">Live AI Assistant</Badge>
          </div>

          {/* Quick Trigger Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => handleSendPrompt("What is my safe daily purchase limit?")}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-indigo-300 border border-slate-700 rounded-xl whitespace-nowrap transition-colors"
            >
              💡 Daily Purchase Limit?
            </button>
            <button
              onClick={() => handleSendPrompt("Explain my 50/30/20 savings allocation")}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-emerald-300 border border-slate-700 rounded-xl whitespace-nowrap transition-colors"
            >
              💰 50/30/20 Savings Breakdown?
            </button>
            <button
              onClick={() => handleSendPrompt("What single purchase limit should I observe?")}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-amber-300 border border-slate-700 rounded-xl whitespace-nowrap transition-colors"
            >
              🏷️ Single Item Cap?
            </button>
          </div>

          {/* Chat Stream Area */}
          <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 h-64 overflow-y-auto space-y-3">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-violet-600 flex items-center justify-center text-white flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-md leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="flex items-center gap-3 pt-2"
          >
            <input
              type="text"
              placeholder="Ask AI about savings targets, purchase limits, or expense rules..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <Button type="submit" variant="primary" icon={Send}>
              Ask AI
            </Button>
          </form>
        </Card>
      </div>

      {/* Category Purchase Limit Caps Grid */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-bold text-white font-heading">Recommended Category Purchase Caps</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(advisorData?.category_purchase_caps || {
            "Food & Dining": 13750,
            "Shopping & Electronics": 11000,
            "Entertainment": 5500,
            "Housing & Utilities": 19250,
            "Subscriptions": 2750
          }).map(([cat, limit]) => (
            <div key={cat} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">{cat}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Recommended Ceiling</div>
              </div>
              <div className="text-sm font-extrabold text-emerald-400 font-heading">
                ₹{Number(limit).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
