import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { fetchBudgetTrend } from '../services/api';
import { TrendingUp, PieChart, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react-native';

export default function AnalyticsScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [monthlyBudget] = useState(45000);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('expenses').select('*');
      if (!error && data) {
        setExpenses(data);
        // Call ML Budget Predictor endpoint
        try {
          const mlRes = await fetchBudgetTrend(monthlyBudget, data);
          if (mlRes) {
            setPrediction(mlRes);
          }
        } catch (apiErr) {
          console.log('FastAPI ML predictor offline:', apiErr.message);
        }
      }
    } catch (err) {
      console.warn('Analytics data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute category breakdown
  const categoryTotals = expenses.reduce((acc, curr) => {
    const cat = curr.category || 'General';
    acc[cat] = (acc[cat] || 0) + (Number(curr.amount) || 0);
    return acc;
  }, {});

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ML Analytics & Insights</Text>
        <TouchableOpacity onPress={loadData} style={styles.backBtn}>
          <RefreshCw size={18} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ML Burn-Rate Predictor Card */}
        <View style={styles.mlCard}>
          <View style={styles.mlHeader}>
            <TrendingUp size={20} color="#0284c7" />
            <Text style={styles.mlTitle}>ML Burn-Rate Forecast</Text>
          </View>

          {loading ? (
            <ActivityIndicator color="#0284c7" style={{ marginVertical: 14 }} />
          ) : prediction ? (
            <View>
              <Text style={styles.predictAmount}>
                Forecasted EOM: ₹{Number(prediction.predicted_end_of_month_spend || totalSpent * 1.2).toLocaleString('en-IN')}
              </Text>
              <View style={styles.statusRow}>
                <AlertTriangle size={16} color={prediction.over_budget ? '#dc2626' : '#059669'} />
                <Text
                  style={[
                    styles.statusText,
                    { color: prediction.over_budget ? '#dc2626' : '#059669' },
                  ]}
                >
                  {prediction.over_budget
                    ? `Warning: Projecting budget overrun of ₹${Number(prediction.projected_overrun || 0).toLocaleString('en-IN')}`
                    : 'Budget On Track: Spending velocity is within safe limits.'}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.mlDesc}>
              Linear regression analysis predicting end-of-month spend based on daily velocity.
            </Text>
          )}
        </View>

        {/* Category Breakdown */}
        <View style={styles.sectionHeader}>
          <PieChart size={18} color="#059669" />
          <Text style={styles.sectionTitle}> Category Breakdown</Text>
        </View>

        {Object.keys(categoryTotals).length === 0 ? (
          <Text style={styles.emptyText}>No category data available yet.</Text>
        ) : (
          Object.entries(categoryTotals).map(([cat, amt]) => {
            const percent = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
            return (
              <View key={cat} style={styles.catRow}>
                <View style={styles.catInfo}>
                  <Text style={styles.catName}>{cat}</Text>
                  <Text style={styles.catPercent}>{percent}% of total</Text>
                </View>
                <Text style={styles.catAmt}>₹{amt.toLocaleString('en-IN')}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  mlCard: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  mlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  mlTitle: {
    color: '#0284c7',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  predictAmount: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  mlDesc: {
    color: '#64748b',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: 'bold',
  },
  catRow: {
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
  catInfo: {
    flex: 1,
  },
  catName: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '500',
  },
  catPercent: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  catAmt: {
    color: '#059669',
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginVertical: 20,
  },
});
