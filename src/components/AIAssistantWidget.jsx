import React, { useState, useRef, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Badge } from './UI/Badge';
import { fetchAIChatResponse } from '../services/apiService';
import {
  X,
  Send,
  Bot
} from 'lucide-react';

export const AIAssistantWidget = ({ activeView }) => {
  // Completely hide floating AI Assistant widget while in AI Advisor menu
  if (activeView === 'advisor') return null;

  const {
    totalSpent = 0,
    profile = {},
    expenses = [],
    chatMessages = [],
    setChatMessages
  } = useExpense();

  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const safeIncome = Number(profile?.monthly_income) || 85000;
  const safeBudget = Number(profile?.monthly_budget) || 55000;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    try {
      const formattedHistory = updated.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetchAIChatResponse({
        message: query,
        history: formattedHistory,
        monthly_income: safeIncome,
        monthly_budget: safeBudget,
        total_spent: totalSpent,
        expenses: expenses || []
      });

      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: res.reply || 'Recommendation calculated.',
          source: res.source,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `💡 **SpendAI Cap Advice**: Keep non-essential daily purchases under ₹${Math.max(300, Math.round((safeBudget - totalSpent) / 15)).toLocaleString('en-IN')}/day to maintain a steady savings rate.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickChips = [
    '📈 SIP Investments',
    '🏛️ Tax Savings (80C)',
    '💡 Daily Cap?',
    '📊 50/30/20 Rule',
    '💳 Credit & Debt'
  ];

  return (
    <>
      {/* Floating Trigger Button - Neumorphic Light Floating Pill */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-5 py-3.5 bg-white dark:bg-slate-900 border-1.5 border-emerald-600 dark:border-emerald-500 rounded-full shadow-[6px_6px_18px_#cbd5e1,-6px_-6px_18px_#ffffff] dark:shadow-[6px_6px_18px_#020617,-6px_-6px_18px_#1e293b] text-emerald-700 dark:text-emerald-400 transition-all transform hover:scale-105 animate-float"
          >
            <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold font-heading hidden sm:inline-block text-slate-900 dark:text-white">AI Assistant</span>
            <Badge variant="emerald" className="ml-1 text-[10px]">SpendAI</Badge>
          </button>
        )}
      </div>

      {/* Neumorphic AI Assistant Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md bg-white neu-card border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[520px] animate-slide-up">
          {/* Header */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 font-heading flex items-center gap-2">
                  SpendAI Financial Assistant
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">Synced with AI Financial Advisor</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Keywords Carousel */}
          <div className="px-3 py-2 bg-slate-50/70 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="whitespace-nowrap px-3 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300 hover:border-emerald-500 rounded-full text-[11px] font-semibold transition-all flex-shrink-0 shadow-sm"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/30">
            {chatMessages.map((m, idx) => (
              <div
                key={m.id || idx}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white font-medium rounded-br-none shadow-sm'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-sm whitespace-pre-line'
                  }`}
                >
                  {m.text}
                  {m.timestamp && (
                    <div className={`text-[9px] mt-1 ${m.sender === 'user' ? 'text-emerald-100 text-right' : 'text-slate-400'}`}>
                      {m.timestamp}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 shadow-sm font-medium">
                  Calculating response...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about SIPs, taxes, 50/30/20 rule, budget..."
              className="flex-1 bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all shadow-[inset_2px_2px_4px_#e2e8f0]"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
