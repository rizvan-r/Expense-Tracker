import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { fetchHealthScore } from '../services/api';
import {
  PlusCircle,
  Camera,
  Bot,
  User,
  Sparkles,
  Smartphone,
} from 'lucide-react-native';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthScore, setHealthScore] = useState(85);
  const [monthlyBudget] = useState(45000);

  const loadExpenses = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error && data) {
        setExpenses(data);
        // Try fetching AI Health Score from FastAPI
        try {
          const healthData = await fetchHealthScore(monthlyBudget, data);
          if (healthData && healthData.health_score !== undefined) {
            setHealthScore(healthData.health_score);
          }
        } catch (apiErr) {
          console.log('FastAPI score fetch:', apiErr.message);
        }
      }
    } catch (err) {
      console.warn('Error loading expenses from Supabase:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [monthlyBudget]);

  // Re-fetch expenses automatically every time the HomeScreen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadExpenses();
  };

  const totalSpent = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const budgetPercent = Math.min(Math.round((totalSpent / monthlyBudget) * 100), 100);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
    >
      {/* Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.full_name || 'SpendAI User'}</Text>
        </View>
        <TouchableOpacity style={styles.profileHeaderBtn} onPress={() => navigation.navigate('Profile')}>
          <User size={20} color="#10b981" />
        </TouchableOpacity>
      </View>

      {/* Main Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Monthly Expenditure</Text>
          <View style={styles.currencyBadge}>
            <Text style={styles.currencyText}>₹ INR</Text>
          </View>
        </View>
        <Text style={styles.balanceAmount}>₹{totalSpent.toLocaleString('en-IN')}</Text>

        {/* Budget Progress Bar */}
        <View style={styles.budgetRow}>
          <Text style={styles.budgetLabel}>Budget Cap: ₹{monthlyBudget.toLocaleString('en-IN')}</Text>
          <Text style={styles.budgetPercent}>{budgetPercent}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${budgetPercent}%`,
                backgroundColor: budgetPercent > 85 ? '#ef4444' : '#10b981',
              },
            ]}
          />
        </View>
      </View>

      {/* Financial Health Card */}
      <View style={styles.healthCard}>
        <View style={styles.healthHeader}>
          <Sparkles size={20} color="#34d399" />
          <Text style={styles.healthTitle}>Financial Health Score</Text>
        </View>
        <View style={styles.healthBody}>
          <Text style={styles.healthScoreText}>{healthScore}/100</Text>
          <View style={styles.healthStatusBadge}>
            <Text style={styles.healthStatusText}>
              {healthScore >= 80 ? 'EXCELLENT' : healthScore >= 60 ? 'STABLE' : 'NEEDS ATTENTION'}
            </Text>
          </View>
        </View>
        <Text style={styles.healthDesc}>
          Based on 50/30/20 rule discipline and burn-rate metrics evaluated by SpendAI ML models.
        </Text>
      </View>

      {/* Quick Action Grid */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('AddExpense')}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <PlusCircle size={24} color="#10b981" />
          </View>
          <Text style={styles.actionText}>Add Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('ReceiptScanner')}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
            <Camera size={24} color="#3b82f6" />
          </View>
          <Text style={styles.actionText}>Scan Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('BankSmsSync')}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Smartphone size={24} color="#f59e0b" />
          </View>
          <Text style={styles.actionText}>Bank SMS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('AIChat')}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
            <Bot size={24} color="#a855f7" />
          </View>
          <Text style={styles.actionText}>Ask SpendAI</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <Text style={styles.txCount}>{expenses.length} Records</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#10b981" style={{ marginVertical: 20 }} />
      ) : expenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions logged yet.</Text>
        </View>
      ) : (
        expenses.map((item) => {
          const isCredit = item.type === 'CREDIT' || (item.notes && item.notes.toLowerCase().includes('credited'));
          return (
            <View key={item.id || Math.random().toString()} style={styles.txItem}>
              <View style={styles.txLeft}>
                <View
                  style={[
                    styles.txCategoryDot,
                    { backgroundColor: isCredit ? '#10b981' : '#ef4444' },
                  ]}
                />
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.txMerchant} numberOfLines={1}>
                    {item.merchant || item.description || 'Transaction'}
                  </Text>
                  <Text style={styles.txMeta}>
                    {isCredit ? 'Income / Credit' : (item.category || item.notes || 'General')} • {item.date || 'Today'}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  { color: isCredit ? '#10b981' : '#ef4444' },
                ]}
              >
                {isCredit ? '+' : '-'} ₹{Number(item.amount).toLocaleString('en-IN')}
              </Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: '#64748b',
    fontSize: 13,
  },
  userName: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: 'bold',
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    color: '#64748b',
    fontSize: 13,
  },
  currencyBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currencyText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  balanceAmount: {
    color: '#0f172a',
    fontSize: 34,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 6,
  },
  budgetLabel: {
    color: '#64748b',
    fontSize: 12,
  },
  budgetPercent: {
    color: '#059669',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  healthCard: {
    backgroundColor: '#ffffff',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthTitle: {
    color: '#047857',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  healthBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthScoreText: {
    color: '#064e3b',
    fontSize: 28,
    fontWeight: 'bold',
  },
  healthStatusBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  healthStatusText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: 'bold',
  },
  healthDesc: {
    color: '#047857',
    fontSize: 12,
    marginTop: 6,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  profileHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  txCount: {
    color: '#64748b',
    fontSize: 12,
  },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txCategoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    marginRight: 12,
  },
  txMerchant: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
  txMeta: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
  },
});
