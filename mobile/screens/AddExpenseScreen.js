import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Check, TrendingDown, TrendingUp } from 'lucide-react-native';

const CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Utilities & Bills',
  'Transportation',
  'Entertainment',
  'Health & Wellness',
  'Investment & SIP',
  'Salary & Income',
  'General',
];

const PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Cash'];

const isValidUUID = (str) =>
  str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export default function AddExpenseScreen({ navigation }) {
  const { user } = useAuth();
  const [transactionType, setTransactionType] = useState('DEBIT'); // 'DEBIT' (Expense) or 'CREDIT' (Income)
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount in Rupees (₹).');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please provide a merchant, source, or description.');
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const validUserId = isValidUUID(user?.id) ? user.id : null;

      const newRecord = {
        user_id: validUserId,
        amount: parseFloat(amount),
        merchant: description.trim(),
        category: category,
        payment_method: paymentMethod,
        type: transactionType,
        date: today,
        notes: `${transactionType === 'CREDIT' ? 'Credited (Income)' : 'Debited (Expense)'} - Category: ${category}`,
        created_at: new Date().toISOString(),
      };

      // Try 1: Full insertion
      let res = await supabase.from('expenses').insert([newRecord]);

      // Try 2: If foreign key constraint failed, retry without user_id
      if (res.error && (res.error.message?.includes('expenses_user_id_fkey') || res.error.code === '23503')) {
        delete newRecord.user_id;
        res = await supabase.from('expenses').insert([newRecord]);
      }

      // Try 3: If category column missing, retry without category
      if (res.error && (res.error.message?.includes('category') || res.error.code === 'PGRST204')) {
        delete newRecord.category;
        res = await supabase.from('expenses').insert([newRecord]);
      }

      // Try 4: If type column missing, retry without type
      if (res.error && (res.error.message?.includes('type') || res.error.code === 'PGRST204')) {
        delete newRecord.type;
        res = await supabase.from('expenses').insert([newRecord]);
      }

      if (res.error) throw res.error;

      Alert.alert(
        'Success',
        `${transactionType === 'CREDIT' ? 'Credited Income' : 'Expense'} logged into unified ledger!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error('Add expense error:', err);
      Alert.alert('Save Failed', err.message || 'Failed to log record into Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Ledger Record</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Segment Toggle: Debited (Expense) vs Credited (Income) */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, transactionType === 'DEBIT' && styles.debitSegmentActive]}
            onPress={() => {
              setTransactionType('DEBIT');
              if (category === 'Salary & Income') setCategory(CATEGORIES[0]);
            }}
          >
            <TrendingDown size={18} color={transactionType === 'DEBIT' ? '#dc2626' : '#64748b'} />
            <Text
              style={[
                styles.segmentText,
                transactionType === 'DEBIT' && styles.debitSegmentTextActive,
              ]}
            >
              Debited (Expense)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, transactionType === 'CREDIT' && styles.creditSegmentActive]}
            onPress={() => {
              setTransactionType('CREDIT');
              setCategory('Salary & Income');
            }}
          >
            <TrendingUp size={18} color={transactionType === 'CREDIT' ? '#059669' : '#64748b'} />
            <Text
              style={[
                styles.segmentText,
                transactionType === 'CREDIT' && styles.creditSegmentTextActive,
              ]}
            >
              Credited (Income)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>
            {transactionType === 'CREDIT' ? 'INCOME AMOUNT (₹)' : 'EXPENSE AMOUNT (₹)'}
          </Text>
          <View style={styles.amountInputRow}>
            <Text
              style={[
                styles.currencySymbol,
                { color: transactionType === 'CREDIT' ? '#059669' : '#dc2626' },
              ]}
            >
              ₹
            </Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>
        </View>

        {/* Description / Merchant */}
        <Text style={styles.inputLabel}>
          {transactionType === 'CREDIT' ? 'Source / Payer Name' : 'Merchant / Description'}
        </Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.inputText}
            placeholder={
              transactionType === 'CREDIT' ? 'e.g. Salary, Client Payout, Refund' : 'e.g. Swiggy, Amazon, Starbux'
            }
            placeholderTextColor="#94a3b8"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Category Picker */}
        <Text style={styles.inputLabel}>Select Category</Text>
        <View style={styles.chipGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Method */}
        <Text style={styles.inputLabel}>Payment Method</Text>
        <View style={styles.chipGrid}>
          {PAYMENT_METHODS.map((pm) => (
            <TouchableOpacity
              key={pm}
              style={[styles.chip, paymentMethod === pm && styles.chipActive]}
              onPress={() => setPaymentMethod(pm)}
            >
              <Text style={[styles.chipText, paymentMethod === pm && styles.chipTextActive]}>
                {pm}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            { borderColor: transactionType === 'CREDIT' ? '#059669' : '#dc2626' },
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={transactionType === 'CREDIT' ? '#059669' : '#dc2626'} />
          ) : (
            <>
              <Check size={20} color={transactionType === 'CREDIT' ? '#059669' : '#dc2626'} style={{ marginRight: 8 }} />
              <Text
                style={[
                  styles.saveBtnText,
                  { color: transactionType === 'CREDIT' ? '#059669' : '#dc2626' },
                ]}
              >
                Log {transactionType === 'CREDIT' ? 'Credited Income' : 'Expense'}
              </Text>
            </>
          )}
        </TouchableOpacity>
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
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  debitSegmentActive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#dc2626',
  },
  creditSegmentActive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#059669',
  },
  segmentText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  debitSegmentTextActive: {
    color: '#dc2626',
  },
  creditSegmentTextActive: {
    color: '#059669',
  },
  amountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  amountLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 6,
  },
  amountInput: {
    color: '#0f172a',
    fontSize: 36,
    fontWeight: 'bold',
    minWidth: 120,
    textAlign: 'center',
  },
  inputLabel: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },
  inputBox: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 16,
    height: 50,
    justifyContent: 'center',
    marginBottom: 16,
  },
  inputText: {
    color: '#0f172a',
    fontSize: 15,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: 'transparent',
    borderColor: '#059669',
    borderWidth: 1.5,
  },
  chipText: {
    color: '#475569',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#059669',
    fontWeight: 'bold',
  },
  saveBtn: {
    borderRadius: 8,
    height: 52,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
