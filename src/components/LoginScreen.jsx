import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './UI/Button';
import { Badge } from './UI/Badge';
import {
  Sparkles,
  Mail,
  ShieldCheck,
  TrendingUp,
  IndianRupee,
  AlertCircle,
  Loader2,
  Lock,
  User
} from 'lucide-react';
import { IlluminatiLogo } from './UI/IlluminatiLogo';

export const LoginScreen = () => {
  const {
    loginWithGoogle,
    loginWithSupabase,
    signUpWithSupabase,
    authError
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

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

  const activeError = localError || authError;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a12] text-slate-900 dark:text-white flex items-center justify-center p-4 sm:p-8 selection:bg-emerald-500 selection:text-white transition-colors duration-300 animate-fade-in">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Product Branding & Features Showcase */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-3">
            <IlluminatiLogo className="w-11 h-11" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">SpendAI</h1>
                <Badge variant="emerald">PRO EDITION</Badge>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">AI-Powered Personal Expense & Financial Assistant</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading leading-tight text-slate-900 dark:text-white">
              Master Your Money with AI & Supabase Security.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Track daily expenses in Indian Rupees (₹), extract receipt data with OCR, predict budget overruns with machine learning, and save all user profile details securely in Supabase.
            </p>
          </div>

          {/* Value Proposition Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                <TrendingUp className="w-4 h-4" /> ML Budget Projections
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Linear regression spend forecasting</p>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                <IndianRupee className="w-4 h-4" /> Safe Daily Purchase Caps
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">AI 50/30/20 purchase limits</p>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                <Sparkles className="w-4 h-4" /> Instant Receipt OCR
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Auto-fill transactions from photos</p>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" /> Supabase Profile Sync
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Direct PostgreSQL cloud persistence</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-6">
          <div className="bg-white dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                {isSignUp ? 'Create Your Account' : 'Sign In to Your Account'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                {isSignUp ? 'Register below to store your profile and expenses in Supabase.' : 'Authenticate using Google OAuth or email credentials.'}
              </p>
            </div>

            {/* Error Alert Box */}
            {activeError && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-medium rounded-2xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">{activeError}</div>
              </div>
            )}

            {/* Google OAuth Login Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 disabled:opacity-70 text-slate-900 dark:text-white font-bold rounded-2xl text-xs transition-all shadow-sm active:scale-[0.99]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-slate-900 dark:text-white animate-spin" />
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
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">or sign in with email</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            {/* Email Authentication Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Richu Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 neu-input text-sm text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 neu-input text-sm text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 neu-input text-sm text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full py-3" isLoading={isLoading}>
                {isSignUp ? 'Register Account & Launch Dashboard' : 'Sign In with Email'}
              </Button>

              <div className="pt-2 text-center text-xs">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Register now"}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
