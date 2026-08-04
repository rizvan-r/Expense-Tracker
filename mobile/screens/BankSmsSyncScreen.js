import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { requestSmsPermission, checkSmsPermission, fetchAndParseBankSms, SAMPLE_BANK_SMS } from '../services/smsService';
import { parseBankSms, parseBulkBankSms } from '../services/smsParser';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Smartphone,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Database,
  ShieldAlert,
  Clipboard,
  Sparkles,
} from 'lucide-react-native';

const isValidUUID = (str) =>
  str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export default function BankSmsSyncScreen({ navigation }) {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [pastedSmsText, setPastedSmsText] = useState('');

  useEffect(() => {
    async function initPermission() {
      const permitted = await checkSmsPermission();
      setHasPermission(permitted);
      scanSms();
    }
    initPermission();
  }, []);

  const handleGrantPermission = async () => {
    const granted = await requestSmsPermission();
    setHasPermission(granted);
    if (granted) {
      scanSms();
    } else {
      Alert.alert(
        'Expo Go Notice',
        'Standard Expo Go limits native SMS inbox reading. You can use the Instant Bank SMS Parser below to parse any bank SMS message!'
      );
    }
  };

  const scanSms = async () => {
    setLoading(true);
    try {
      const parsedList = await fetchAndParseBankSms();
      setTransactions(parsedList);
    } catch (err) {
      console.error('SMS Scan Error:', err);
      Alert.alert('Scan Error', 'Could not parse SMS messages.');
    } finally {
      setLoading(false);
    }
  };

  const handleParseCustomSms = () => {
    if (!pastedSmsText.trim()) {
      Alert.alert('Empty Input', 'Please paste a bank SMS message text.');
      return;
    }

    const singleParsed = parseBankSms(pastedSmsText);
    if (!singleParsed) {
      Alert.alert('Parser Notice', 'Could not extract financial debit/credit details from this text. Ensure it contains bank terms like "debited", "credited", or "spent".');
      return;
    }

    setTransactions((prev) => [singleParsed, ...prev]);
    setPastedSmsText('');
    Alert.alert('Success!', `Parsed ${singleParsed.type === 'DEBIT' ? 'Debited' : 'Credited'} record for ₹${singleParsed.amount.toLocaleString('en-IN')}`);
  };

  const handleLoadSampleBankSms = () => {
    const samples = parseBulkBankSms(SAMPLE_BANK_SMS);
    setTransactions(samples);
  };

  // Compute summary metrics
  const totalDebits = transactions
    .filter((t) => t.type === 'DEBIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCredits = transactions
    .filter((t) => t.type === 'CREDIT')
    .reduce((sum, t) => sum + t.amount, 0);

  // 1-Tap Sync to Supabase
  const handleSyncToSupabase = async () => {
    if (transactions.length === 0) {
      Alert.alert('No Transactions', 'No bank SMS transactions found to sync.');
      return;
    }

    setSyncLoading(true);
    try {
      const validUserId = isValidUUID(user?.id) ? user.id : null;
      let successCount = 0;

      for (const t of transactions) {
        const record = {
          user_id: validUserId,
          amount: t.amount,
          merchant: t.merchant,
          category: t.category || (t.type === 'CREDIT' ? 'Income' : 'General'),
          payment_method: t.payment_method || 'Bank Transfer',
          type: t.type, // 'DEBIT' or 'CREDIT'
          date: t.date,
          notes: `Bank SMS Alert (${t.type === 'CREDIT' ? 'Credited' : 'Debited'} ${t.account_last4 ? 'A/C xx' + t.account_last4 : ''})`,
          created_at: new Date().toISOString(),
        };

        // Try 1: Full insertion
        let res = await supabase.from('expenses').insert([record]);

        // Try 2: If foreign key error, retry without user_id
        if (res.error && (res.error.message?.includes('expenses_user_id_fkey') || res.error.code === '23503')) {
          delete record.user_id;
          res = await supabase.from('expenses').insert([record]);
        }

        // Try 3: If category column missing, retry without category
        if (res.error && (res.error.message?.includes('category') || res.error.code === 'PGRST204')) {
          delete record.category;
          res = await supabase.from('expenses').insert([record]);
        }

        // Try 4: If type column missing in old schema, retry without type column
        if (res.error && (res.error.message?.includes('type') || res.error.code === 'PGRST204')) {
          delete record.type;
          res = await supabase.from('expenses').insert([record]);
        }

        if (!res.error) {
          successCount++;
        } else {
          console.warn('Bank SMS item sync warning:', res.error);
        }
      }

      Alert.alert(
        'Sync Complete!',
        `Successfully synced ${successCount} out of ${transactions.length} bank transactions to Supabase!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error('Supabase Bank Sync Error:', err);
      Alert.alert('Sync Failed', err.message || 'Error saving records to database.');
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bank SMS & Ledger Sync</Text>
        <TouchableOpacity onPress={scanSms} style={styles.backBtn}>
          <RefreshCw size={18} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Permission / Expo Go Notice Banner */}
        <View style={styles.permissionCard}>
          <ShieldAlert size={22} color="#d97706" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.permissionTitle}>Bank SMS Parser Ready</Text>
            <Text style={styles.permissionSub}>
              Detects bank debit alerts, UPI transfers, and salary credits automatically.
            </Text>
          </View>
          <TouchableOpacity style={styles.grantBtn} onPress={handleGrantPermission}>
            <Text style={styles.grantBtnText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>

        {/* Custom SMS Paste Box */}
        <View style={styles.pasteBoxCard}>
          <Text style={styles.pasteBoxTitle}>Paste Bank SMS Alert</Text>
          <TextInput
            style={styles.pasteInput}
            placeholder="e.g. Rs. 450.00 debited from A/C XX8901 on 30-07-26 to Swiggy..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={2}
            value={pastedSmsText}
            onChangeText={setPastedSmsText}
          />
          <View style={styles.pasteBtnRow}>
            <TouchableOpacity style={styles.parseBtn} onPress={handleParseCustomSms}>
              <Sparkles size={16} color="#059669" style={{ marginRight: 6 }} />
              <Text style={styles.parseBtnText}>Parse SMS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sampleBtn} onPress={handleLoadSampleBankSms}>
              <Clipboard size={16} color="#0284c7" style={{ marginRight: 6 }} />
              <Text style={styles.sampleBtnText}>Load Bank SMS Samples</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ledger Overview Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { borderColor: '#fecaca' }]}>
            <View style={styles.cardHeader}>
              <TrendingDown size={18} color="#dc2626" />
              <Text style={styles.cardLabel}>Debited (Spent)</Text>
            </View>
            <Text style={[styles.cardValue, { color: '#dc2626' }]}>
              ₹{totalDebits.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={[styles.summaryCard, { borderColor: '#a7f3d0' }]}>
            <View style={styles.cardHeader}>
              <TrendingUp size={18} color="#059669" />
              <Text style={styles.cardLabel}>Credited (Income)</Text>
            </View>
            <Text style={[styles.cardValue, { color: '#059669' }]}>
              ₹{totalCredits.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Sync Button */}
        <TouchableOpacity
          style={styles.syncBtn}
          onPress={handleSyncToSupabase}
          disabled={syncLoading || loading}
        >
          {syncLoading ? (
            <ActivityIndicator color="#059669" />
          ) : (
            <>
              <Database size={20} color="#059669" style={{ marginRight: 8 }} />
              <Text style={styles.syncBtnText}>
                Sync {transactions.length} Records to Supabase
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Transaction Ledger List */}
        <View style={styles.sectionHeader}>
          <Smartphone size={18} color="#059669" />
          <Text style={styles.sectionTitle}> Bank SMS Ledger ({transactions.length})</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#059669" style={{ marginVertical: 30 }} />
        ) : transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bank SMS transactions detected.</Text>
          </View>
        ) : (
          transactions.map((item) => (
            <View key={item.id} style={styles.txCard}>
              <View style={styles.txRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.typeBadgeRow}>
                    <View
                      style={[
                        styles.badge,
                        item.type === 'DEBIT' ? styles.debitBadge : styles.creditBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          item.type === 'DEBIT' ? styles.debitBadgeText : styles.creditBadgeText,
                        ]}
                      >
                        {item.type === 'DEBIT' ? 'DEBITED' : 'CREDITED'}
                      </Text>
                    </View>
                    {item.account_last4 ? (
                      <Text style={styles.accText}>A/C xx{item.account_last4}</Text>
                    ) : null}
                  </View>

                  <Text style={styles.merchantName}>{item.merchant}</Text>
                  <Text style={styles.txMeta}>
                    {item.category} • {item.date} • {item.payment_method}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.txAmount,
                    { color: item.type === 'DEBIT' ? '#dc2626' : '#059669' },
                  ]}
                >
                  {item.type === 'DEBIT' ? '-' : '+'} ₹{item.amount.toLocaleString('en-IN')}
                </Text>
              </View>

              <Text style={styles.rawSmsText} numberOfLines={2}>
                "{item.raw_sms}"
              </Text>
            </View>
          ))
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
    fontSize: 17,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  permissionTitle: {
    color: '#d97706',
    fontSize: 14,
    fontWeight: 'bold',
  },
  permissionSub: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  grantBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d97706',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  grantBtnText: {
    color: '#d97706',
    fontSize: 11,
    fontWeight: 'bold',
  },
  pasteBoxCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  pasteBoxTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pasteInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    color: '#0f172a',
    fontSize: 13,
    minHeight: 50,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  pasteBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  parseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  parseBtnText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  sampleBtnText: {
    color: '#0284c7',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardLabel: {
    color: '#64748b',
    fontSize: 12,
    marginLeft: 6,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  syncBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#059669',
    borderRadius: 8,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  syncBtnText: {
    color: '#059669',
    fontSize: 15,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  txCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  debitBadge: {
    backgroundColor: '#fef2f2',
  },
  creditBadge: {
    backgroundColor: '#ecfdf5',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  debitBadgeText: {
    color: '#dc2626',
  },
  creditBadgeText: {
    color: '#059669',
  },
  accText: {
    color: '#64748b',
    fontSize: 11,
  },
  merchantName: {
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
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rawSmsText: {
    color: '#64748b',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 8,
    backgroundColor: '#f1f5f9',
    padding: 6,
    borderRadius: 6,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
  },
});
