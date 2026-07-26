import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  INITIAL_CATEGORIES,
  INITIAL_EXPENSES_BY_USER,
  INITIAL_SAVINGS_GOALS_BY_USER,
  INITIAL_PROFILE
} from '../services/mockData';
import { fetchBudgetPrediction, fetchHealthScore, fetchAIRecommendations } from '../services/apiService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext();

// Static fallback constant to avoid allocating new array references on render
const EMPTY_ARRAY = [];

export const ExpenseProvider = ({ children }) => {
  const { activeProfile, user: authUser, updateProfile } = useAuth();
  const userId = authUser?.id || activeProfile?.id || 'user-richu-101';

  // Scoped state per active user profile
  const [userExpensesMap, setUserExpensesMap] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_tracker_all_user_expenses');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES_BY_USER;
    } catch (e) {
      return INITIAL_EXPENSES_BY_USER;
    }
  });

  const [userGoalsMap, setUserGoalsMap] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_tracker_all_user_goals');
      return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS_BY_USER;
    } catch (e) {
      return INITIAL_SAVINGS_GOALS_BY_USER;
    }
  });

  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [supabaseExpenses, setSupabaseExpenses] = useState(EMPTY_ARRAY);
  const [supabaseGoals, setSupabaseGoals] = useState(EMPTY_ARRAY);

  // Fetch real-time data from Supabase PostgreSQL database if user is logged in
  useEffect(() => {
    let isMounted = true;

    async function fetchSupabaseData() {
      if (!isSupabaseConfigured || !authUser?.id) return;

      try {
        const { data: dbExpenses, error: expErr } = await supabase
          .from('expenses')
          .select('*, categories(name)')
          .order('date', { ascending: false });

        if (!expErr && dbExpenses && isMounted) {
          const formatted = dbExpenses.map(e => ({
            ...e,
            category: e.category || e.categories?.name || 'Miscellaneous'
          }));
          setSupabaseExpenses(formatted);
        }

        const { data: dbGoals, error: goalErr } = await supabase
          .from('savings_goals')
          .select('*')
          .order('created_at', { ascending: false });

        if (!goalErr && dbGoals && isMounted) {
          setSupabaseGoals(dbGoals);
        }
      } catch (err) {
        console.warn('Supabase fetch error, fallback to local state:', err);
      }
    }

    fetchSupabaseData();

    return () => {
      isMounted = false;
    };
  }, [authUser?.id, isSupabaseConfigured]);

  // Sync maps to local storage
  useEffect(() => {
    try {
      localStorage.setItem('ai_tracker_all_user_expenses', JSON.stringify(userExpensesMap));
    } catch (e) {}
  }, [userExpensesMap]);

  useEffect(() => {
    try {
      localStorage.setItem('ai_tracker_all_user_goals', JSON.stringify(userGoalsMap));
    } catch (e) {}
  }, [userGoalsMap]);

  // Current active profile expenses & goals memoized with stable references
  const expenses = useMemo(() => {
    if (isSupabaseConfigured && authUser?.id && supabaseExpenses.length > 0) {
      return supabaseExpenses;
    }
    return userExpensesMap[userId] || INITIAL_EXPENSES_BY_USER[userId] || EMPTY_ARRAY;
  }, [isSupabaseConfigured, authUser?.id, supabaseExpenses, userExpensesMap, userId]);

  const savingsGoals = useMemo(() => {
    if (isSupabaseConfigured && authUser?.id && supabaseGoals.length > 0) {
      return supabaseGoals;
    }
    return userGoalsMap[userId] || INITIAL_SAVINGS_GOALS_BY_USER[userId] || EMPTY_ARRAY;
  }, [isSupabaseConfigured, authUser?.id, supabaseGoals, userGoalsMap, userId]);

  const [healthScoreData, setHealthScoreData] = useState(null);
  const [budgetPrediction, setBudgetPrediction] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(EMPTY_ARRAY);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Global Chatbot & AI Advisor Shared Message History
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello ${activeProfile?.full_name || 'Richu'}! I am SpendAI. Ask me any question about SIP investments, 80C tax savings, 50/30/20 rule, emergency funds, daily caps, or credit cards!`,
      timestamp: 'Just now'
    }
  ]);

  // Safe numeric evaluations
  const safeIncome = Number(activeProfile?.monthly_income) || 85000;
  const safeBudget = Number(activeProfile?.monthly_budget) || 55000;

  // Compute derived financial metrics
  const totalSpent = useMemo(() => {
    if (!Array.isArray(expenses)) return 0;
    return expenses.reduce((sum, exp) => sum + (Number(exp?.amount) || 0), 0);
  }, [expenses]);

  const monthlySavings = useMemo(() => {
    return Math.max(0, safeIncome - totalSpent);
  }, [safeIncome, totalSpent]);

  const savingsRate = useMemo(() => {
    if (!safeIncome) return 0;
    return Math.round(((safeIncome - totalSpent) / safeIncome) * 100);
  }, [safeIncome, totalSpent]);

  const categorySpendMap = useMemo(() => {
    const map = {};
    if (Array.isArray(expenses)) {
      expenses.forEach(exp => {
        if (!exp) return;
        const cat = exp.category || 'Miscellaneous';
        map[cat] = (map[cat] || 0) + (Number(exp.amount) || 0);
      });
    }
    return map;
  }, [expenses]);

  const highestCategory = useMemo(() => {
    let topCat = 'None';
    let maxAmt = 0;
    Object.entries(categorySpendMap).forEach(([cat, amt]) => {
      if (amt > maxAmt) {
        maxAmt = amt;
        topCat = cat;
      }
    });
    return { name: topCat, amount: maxAmt };
  }, [categorySpendMap]);

  // Ref guard to prevent redundant background API re-fetches
  const lastFetchedParamsRef = useRef('');

  // Recalculate AI Health Score & Predictions ONLY when financial parameters change
  const refreshAiInsights = async (force = false) => {
    const currentParamKey = `${userId}_${expenses.length}_${totalSpent}_${safeBudget}_${safeIncome}`;
    
    if (!force && lastFetchedParamsRef.current === currentParamKey) {
      return; // Skip redundant API calls
    }

    lastFetchedParamsRef.current = currentParamKey;
    setIsAiLoading(true);

    try {
      const today = new Date();
      const currentDay = today.getDate();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

      const negCats = ["food", "miscellaneous", "subscriptions", "entertainment"];
      let calcNeg = 0;
      let calcPos = 0;
      Object.entries(categorySpendMap || {}).forEach(([cat, amt]) => {
        if (negCats.some(n => cat.toLowerCase().includes(n))) {
          calcNeg += Number(amt) || 0;
        } else {
          calcPos += Number(amt) || 0;
        }
      });

      const [pred, health, recs] = await Promise.all([
        fetchBudgetPrediction({
          monthly_budget: safeBudget,
          current_spent: totalSpent,
          current_day: currentDay,
          days_in_month: daysInMonth
        }),
        fetchHealthScore({
          monthly_income: safeIncome,
          monthly_budget: safeBudget,
          total_spent: totalSpent,
          savings_rate: savingsRate,
          category_spend_map: categorySpendMap || {},
          negative_spend: calcNeg,
          positive_spend: calcPos,
          categories_over_budget: Object.keys(categorySpendMap).filter(cat => {
            const catObj = (categories || []).find(c => c.name === cat);
            return catObj && Number(catObj.monthly_limit) > 0 && categorySpendMap[cat] > catObj.monthly_limit;
          }).length
        }),
        fetchAIRecommendations(expenses || [], safeBudget, safeIncome)
      ]);

      setBudgetPrediction(pred);
      setHealthScoreData(health);
      setAiRecommendations(Array.isArray(recs) ? recs : EMPTY_ARRAY);
    } catch (err) {
      console.warn('AI insight calculation error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    refreshAiInsights();
  }, [userId, expenses.length, totalSpent, safeBudget, safeIncome]);

  // Actions with Supabase DB Sync
  const addExpense = async (newExp) => {
    const item = {
      id: `exp-${Date.now()}`,
      merchant: newExp.merchant || 'Market',
      amount: Number(newExp.amount) || 0,
      date: newExp.date || new Date().toISOString().split('T')[0],
      category: newExp.category || 'Miscellaneous',
      payment_method: newExp.payment_method || 'Credit Card',
      notes: newExp.notes || '',
      receipt_url: newExp.receipt_url || null,
      ocr_extracted: Boolean(newExp.ocr_extracted)
    };

    if (isSupabaseConfigured && authUser?.id) {
      try {
        const { data, error } = await supabase.from('expenses').insert([{
          user_id: authUser.id,
          merchant: item.merchant,
          amount: item.amount,
          date: item.date,
          category: item.category,
          payment_method: item.payment_method,
          notes: item.notes,
          receipt_url: item.receipt_url,
          ocr_extracted: item.ocr_extracted
        }]).select().single();

        if (!error && data) {
          setSupabaseExpenses(prev => [data, ...prev]);
        }
      } catch (err) {
        console.warn('Supabase expense insert error:', err);
      }
    }

    setUserExpensesMap(prev => {
      const curList = prev[userId] || [];
      return { ...prev, [userId]: [item, ...curList] };
    });
  };

  const updateExpense = async (id, updatedFields) => {
    if (isSupabaseConfigured && authUser?.id) {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .update(updatedFields)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          setSupabaseExpenses(prev => prev.map(e => e.id === id ? data : e));
        }
      } catch (err) {
        console.warn('Supabase expense update error:', err);
      }
    }

    setUserExpensesMap(prev => {
      const curList = prev[userId] || [];
      return {
        ...prev,
        [userId]: curList.map(e => e.id === id ? { ...e, ...updatedFields } : e)
      };
    });
  };

  const deleteExpense = async (id) => {
    if (isSupabaseConfigured && authUser?.id) {
      try {
        await supabase.from('expenses').delete().eq('id', id);
        setSupabaseExpenses(prev => prev.filter(e => e.id !== id));
      } catch (err) {
        console.warn('Supabase expense delete error:', err);
      }
    }

    setUserExpensesMap(prev => {
      const curList = prev[userId] || [];
      return {
        ...prev,
        [userId]: curList.filter(e => e.id !== id)
      };
    });
  };

  const addSavingsGoal = async (newGoal) => {
    const goalObj = {
      id: `goal-${Date.now()}`,
      title: newGoal.title || 'Goal',
      target_amount: Number(newGoal.target_amount) || 10000,
      current_amount: Number(newGoal.current_amount || 0),
      target_date: newGoal.target_date || new Date().toISOString().split('T')[0],
      category: newGoal.category || 'General'
    };

    if (isSupabaseConfigured && authUser?.id) {
      try {
        const { data, error } = await supabase.from('savings_goals').insert([{
          user_id: authUser.id,
          title: goalObj.title,
          target_amount: goalObj.target_amount,
          current_amount: goalObj.current_amount,
          target_date: goalObj.target_date,
          category: goalObj.category
        }]).select().single();

        if (!error && data) {
          setSupabaseGoals(prev => [data, ...prev]);
        }
      } catch (err) {
        console.warn('Supabase savings goal insert error:', err);
      }
    }

    setUserGoalsMap(prev => {
      const curGoals = prev[userId] || [];
      return { ...prev, [userId]: [...curGoals, goalObj] };
    });
  };

  return (
    <ExpenseContext.Provider value={{
      expenses: expenses || EMPTY_ARRAY,
      categories: categories || EMPTY_ARRAY,
      profile: activeProfile || INITIAL_PROFILE,
      savingsGoals: savingsGoals || EMPTY_ARRAY,
      totalSpent: totalSpent || 0,
      monthlySavings: monthlySavings || 0,
      savingsRate: savingsRate || 0,
      categorySpendMap: categorySpendMap || {},
      highestCategory: highestCategory || { name: 'None', amount: 0 },
      healthScoreData,
      budgetPrediction,
      aiRecommendations: aiRecommendations || EMPTY_ARRAY,
      isAiLoading,
      chatMessages: chatMessages || EMPTY_ARRAY,
      setChatMessages,
      updateProfile,
      addExpense,
      updateExpense,
      deleteExpense,
      addSavingsGoal,
      refreshAiInsights
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => useContext(ExpenseContext);
