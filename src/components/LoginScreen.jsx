import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './UI/Button';
import { Badge } from './UI/Badge';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Users,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  IndianRupee,
  Activity,
  Plus,
  AlertCircle,
  Loader2
} from 'lucide-react';

import { IlluminatiLogo } from './UI/IlluminatiLogo';

export const LoginScreen = () => {
  const {
    profiles,
    loginWithProfile,
    loginWithGoogle,
    loginWithSupabase,
    signUpWithSupabase,
    createProfile,
    authError
  } = useAuth();

  const [authMethod, setAuthMethod] = useState('profiles'); // 'profiles' | 'email'
  const [isSignUp, setIsSignUp] = useState(false);

  // Email form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Custom Profile Creator
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileOccupation, setNewProfileOccupation] = useState('Product Manager');
  const [newProfileIncome, setNewProfileIncome] = useState('95000');
  const [newProfileBudget, setNewProfileBudget] = useState('60000');

  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLocalError('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setLocalError(err.message || 'Google OAuth Login failed. Please verify Supabase configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUpWithSupabase(email, password, fullName);
      } else {
        await loginWithSupabase(email, password);
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProfileSubmit = (e) => {
    e.preventDefault();
    if (!newProfileName) return;

    createProfile({
      full_name: newProfileName,
      occupation: newProfileOccupation,
      monthly_income: Number(newProfileIncome),
      monthly_budget: Number(newProfileBudget)
    });
  };

  const activeError = localError || authError;

  return (
    <div className="min-h-screen bg-[#070a12] text-white flex items-center justify-center p-4 sm:p-8 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Product Branding & Features Showcase */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-3">
            <IlluminatiLogo className="w-11 h-11" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold font-heading text-white tracking-tight">SpendAI</h1>
                <Badge variant="indigo">PRO EDITION</Badge>
              </div>
              <p className="text-xs text-indigo-300">AI-Powered Personal Expense & Financial Assistant</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
              Master Your Money with AI & Supabase OAuth.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Track daily expenses in Indian Rupees (₹), extract receipt data with OCR, predict budget overruns with machine learning, and sync securely with Supabase Authentication.
            </p>
          </div>

          {/* Value Proposition Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                <TrendingUp className="w-4 h-4" /> ML Budget Projections
              </div>
              <p className="text-[11px] text-slate-400">Linear regression spend forecasting</p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <IndianRupee className="w-4 h-4" /> Safe Daily Purchase Caps
              </div>
              <p className="text-[11px] text-slate-400">AI 50/30/20 purchase limits</p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                <Sparkles className="w-4 h-4" /> Instant Receipt OCR
              </div>
              <p className="text-[11px] text-slate-400">Auto-fill transactions from photos</p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4" /> Supabase OAuth & RLS
              </div>
              <p className="text-[11px] text-slate-400">Row Level Security data isolation</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="lg:col-span-6">
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            <div>
              <h3 className="text-xl font-bold font-heading text-white">Sign In to Your Account</h3>
              <p className="text-xs text-slate-400 mt-1">Authenticate using Google OAuth or your account credentials.</p>
            </div>

            {/* Error Alert Box */}
            {activeError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs rounded-2xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">{activeError}</div>
              </div>
            )}

            {/* Google OAuth Login Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white hover:bg-slate-100 disabled:opacity-70 text-slate-900 font-bold rounded-2xl text-xs transition-all shadow-xl active:scale-[0.99]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-slate-900 animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Sign in with Google</span>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 border-t border-slate-800"></div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">or sign in with</span>
              <div className="flex-1 border-t border-slate-800"></div>
            </div>

            {/* Toggle Tabs: Profiles Selector vs Manual Email */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setAuthMethod('profiles')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  authMethod === 'profiles' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Demo User Accounts
              </button>
              <button
                onClick={() => setAuthMethod('email')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  authMethod === 'email' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> Email Credentials
              </button>
            </div>

            {/* SECTION 1: Individual Profile Cards */}
            {authMethod === 'profiles' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Select Individual User Account:</span>
                  <button
                    onClick={() => setIsCreatingProfile(!isCreatingProfile)}
                    className="text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> {isCreatingProfile ? 'Cancel' : 'Create Custom User'}
                  </button>
                </div>

                {isCreatingProfile ? (
                  <form onSubmit={handleCreateProfileSubmit} className="p-4 bg-slate-900/90 rounded-2xl border border-indigo-500/30 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">New User Registration</h4>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Verma"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">Monthly Income (₹)</label>
                        <input
                          type="number"
                          required
                          value={newProfileIncome}
                          onChange={(e) => setNewProfileIncome(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">Target Budget (₹)</label>
                        <input
                          type="number"
                          required
                          value={newProfileBudget}
                          onChange={(e) => setNewProfileBudget(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>

                    <Button type="submit" variant="success" size="sm" className="w-full">
                      Register & Launch Dashboard
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {profiles.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => loginWithProfile(p.id)}
                        className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 text-slate-300 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm font-heading shadow-md"
                            style={{ backgroundColor: p.avatar_color || '#6366f1' }}
                          >
                            {p.full_name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                              {p.full_name}
                            </div>
                            <div className="text-[11px] text-slate-400">{p.occupation || 'User'} • {p.email}</div>
                            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                              Income: ₹{Number(p.monthly_income).toLocaleString('en-IN')}/mo
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Login</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: Manual Email Login / Signup */}
            {authMethod === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-3 pt-1">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Richu Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                  {isSignUp ? 'Register & Sign In' : 'Sign In with Email'}
                </Button>

                <div className="pt-2 text-center text-xs">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-indigo-400 hover:underline"
                  >
                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
