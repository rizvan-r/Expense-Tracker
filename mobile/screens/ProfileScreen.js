import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Shield,
  Wallet,
  Target,
  LogOut,
  Sliders,
  Sparkles,
  CheckCircle,
  Database,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, userProfile, updateProfile, logout } = useAuth();

  const [monthlyIncome, setMonthlyIncome] = useState(
    String(userProfile?.monthly_income || 85000)
  );
  const [monthlyBudget, setMonthlyBudget] = useState(
    String(userProfile?.monthly_budget || 55000)
  );
  const [savingsTarget, setSavingsTarget] = useState(
    String(userProfile?.savings_goal_target || 200000)
  );
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleSaveProfile = async () => {
    try {
      await updateProfile?.({
        monthly_income: Number(monthlyIncome),
        monthly_budget: Number(monthlyBudget),
        savings_goal_target: Number(savingsTarget),
      });
      setIsEditing(false);
      Alert.alert('Profile Updated', 'Your financial preferences have been saved.');
    } catch (e) {
      Alert.alert('Update Failed', e.message || 'Could not update profile.');
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      logout();
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out of SpendAI?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>User Profile</Text>
        <Text style={styles.headerSubtitle}>Account & Financial Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <User size={36} color="#10b981" />
          </View>
          <Text style={styles.userName}>{user?.full_name || 'SpendAI User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@spendai.app'}</Text>
          <View style={styles.badge}>
            <Sparkles size={14} color="#10b981" style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>Moderate Wealth Builder</Text>
          </View>
        </View>

        {/* Financial Preferences Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Sliders size={20} color="#10b981" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Budget & Targets</Text>
            </View>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Text style={styles.editBtnText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Monthly Income (₹)</Text>
            <View style={styles.inputBox}>
              <Wallet size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={monthlyIncome}
                onChangeText={setMonthlyIncome}
                keyboardType="numeric"
                editable={isEditing}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Monthly Spending Limit (₹)</Text>
            <View style={styles.inputBox}>
              <Target size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={monthlyBudget}
                onChangeText={setMonthlyBudget}
                keyboardType="numeric"
                editable={isEditing}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Savings Goal Target (₹)</Text>
            <View style={styles.inputBox}>
              <Shield size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={savingsTarget}
                onChangeText={setSavingsTarget}
                keyboardType="numeric"
                editable={isEditing}
              />
            </View>
          </View>

          {isEditing && (
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
              <CheckCircle size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.saveBtnText}>Save Preferences</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Backend & Security Card */}
        <View style={styles.sectionCard}>
          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Database size={20} color="#38bdf8" style={{ marginRight: 10 }} />
              <View>
                <Text style={styles.rowTitle}>Database Sync</Text>
                <Text style={styles.rowSubtitle}>PostgreSQL & Supabase Realtime</Text>
              </View>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>CONNECTED</Text>
            </View>
          </View>

          <View style={[styles.rowItem, { borderBottomWidth: 0 }]}>
            <View style={styles.rowLeft}>
              <Mail size={20} color="#a855f7" style={{ marginRight: 10 }} />
              <View>
                <Text style={styles.rowTitle}>Smart Alerts</Text>
                <Text style={styles.rowSubtitle}>Budget overrun notifications</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#334155', true: '#10b981' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutBtnText}>Sign Out of SpendAI</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>SpendAI Mobile App v1.0.0 • Java Backend API</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topHeader: {
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 12,
  },
  badgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  editBtnText: {
    color: '#0284c7',
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#0f172a',
    fontSize: 15,
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#059669',
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#059669',
    fontSize: 15,
    fontWeight: 'bold',
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0f172a',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  statusPill: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillText: {
    color: '#0284c7',
    fontSize: 11,
    fontWeight: 'bold',
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 8,
    height: 50,
    borderWidth: 1.5,
    borderColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutBtnText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
  },
});
