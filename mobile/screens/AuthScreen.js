import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Eye, Lock, Mail, User, ShieldCheck, Zap } from 'lucide-react-native';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { loginWithSupabase, signUpWithSupabase, loginWithGoogle, loginAsDemoUser } = useAuth();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Google login error:', err);
      setErrorMsg('Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const demoEmail = email.trim() || 'richu@spendai.app';
      const demoName = fullName.trim() || demoEmail.split('@')[0];
      await loginAsDemoUser(demoEmail, demoName);
    } catch (err) {
      console.error('Demo login error:', err);
      setErrorMsg('Demo sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    if (cleanPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithSupabase(cleanEmail, cleanPassword, fullName || cleanEmail.split('@')[0]);
      } else {
        await loginWithSupabase(cleanEmail, cleanPassword);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Pyramid Logo Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Eye size={36} color="#10b981" />
          </View>
          <Text style={styles.title}>SpendAI</Text>
          <Text style={styles.subtitle}>AI-Powered Personal Finance Coach</Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          {isSignUp && (
            <View style={styles.inputContainer}>
              <User size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#6b7280"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Mail size={20} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password (min 6 chars)"
              placeholderTextColor="#6b7280"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <View style={styles.googleBadge}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleDemoLogin}
            disabled={loading}
          >
            <Zap size={18} color="#10b981" style={{ marginRight: 8 }} />
            <Text style={styles.demoButtonText}>⚡ 1-Tap Quick Demo Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
          >
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerNotice}>
          <ShieldCheck size={16} color="#10b981" />
          <Text style={styles.footerText}> Secured with Supabase PostgreSQL & RLS</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#0f172a',
    fontSize: 15,
  },
  button: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#059669',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  googleBtn: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 8,
    height: 48,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  googleBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  googleG: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  googleBtnText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
  demoButton: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 8,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  demoButtonText: {
    color: '#059669',
    fontSize: 15,
    fontWeight: 'bold',
  },
  switchBtn: {
    marginTop: 18,
    alignItems: 'center',
  },
  switchText: {
    color: '#34d399',
    fontSize: 14,
  },
  footerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 12,
  },
});
