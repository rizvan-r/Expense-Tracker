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
      {/* Floating Trigger Button - Minimal & Clean */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 rounded-full shadow-lg backdrop-blur-md text-white transition-colors"
          >
            <Bot className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-semibold font-heading hidden sm:inline-block">AI Assistant</span>
            <Badge variant="indigo" className="ml-1 text-[10px]">SpendAI</Badge>
          </button>
        )}
      </div>

      {/* Minimal AI Assistant Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
          {/* Header */}
          <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white font-heading flex items-center gap-2">
                  SpendAI Financial Assistant
                </h3>
                <p className="text-[10px] text-slate-400">Synced with AI Financial Advisor</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Keywords Carousel */}
          <div className="px-3 py-2 bg-slate-900/50 border-b border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="whitespace-nowrap px-2.5 py-1 bg-slate-800 hover:bg-indigo-600/30 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-200 border border-slate-700/60 rounded-full text-[11px] font-medium transition-colors flex-shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Messages Stream (Integrated with Advisor history) */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
            {chatMessages.map((m, idx) => (
              <div
                key={m.id || idx}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none whitespace-pre-line'
                  }`}
                >
                  {m.text}
                  {m.timestamp && (
                    <div className={`text-[9px] mt-1 ${m.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-500'}`}>
                      {m.timestamp}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400">
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
            className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about SIPs, taxes, 50/30/20 rule, budget..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
