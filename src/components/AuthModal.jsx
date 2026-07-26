import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal } from './UI/Modal';
import { Button } from './UI/Button';
import { Badge } from './UI/Badge';
import {
  Lock,
  Mail,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const {
    user,
    activeProfile,
    profiles,
    switchProfile,
    createProfile,
    loginWithGoogle,
    loginWithSupabase,
    signUpWithSupabase,
    logout
  } = useAuth();

  const [activeTab, setActiveTab] = useState('profiles'); // 'profiles' | 'google' | 'email'
  const [isSignUp, setIsSignUp] = useState(false);

  // Email form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // New Profile Form fields
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileOccupation, setNewProfileOccupation] = useState('Product Manager');
  const [newProfileIncome, setNewProfileIncome] = useState('95000');
  const [newProfileBudget, setNewProfileBudget] = useState('60000');

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await signUpWithSupabase(email, password, fullName);
      } else {
        await loginWithSupabase(email, password);
      }
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setErrorMessage('');
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Google OAuth Login failed');
    }
  };

  const handleCreateNewProfile = (e) => {
    e.preventDefault();
    if (!newProfileName) return;

    createProfile({
      full_name: newProfileName,
      occupation: newProfileOccupation,
      monthly_income: Number(newProfileIncome),
      monthly_budget: Number(newProfileBudget)
    });

    setIsCreatingProfile(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Login & Multi-Profile Switcher" maxWidth="max-w-lg">
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'profiles' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Profiles ({profiles.length})
          </button>

          <button
            onClick={() => setActiveTab('google')}
            className={`py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'google' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Google OAuth
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'email' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> Email Login
          </button>
        </div>

        {/* TAB 1: Multi-Profile Switcher Grid */}
        {activeTab === 'profiles' && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Select Active User Profile:</span>
              <button
                onClick={() => setIsCreatingProfile(!isCreatingProfile)}
                className="text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> {isCreatingProfile ? 'Cancel' : 'New Profile'}
              </button>
            </div>

            {isCreatingProfile ? (
              <form onSubmit={handleCreateNewProfile} className="p-4 bg-slate-900/80 rounded-2xl border border-indigo-500/30 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Create Custom User Profile</h4>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Nair"
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
                    <label className="block text-[11px] text-slate-300 mb-1">Budget Cap (₹)</label>
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
                  Create & Switch Profile
                </Button>
              </form>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {profiles.map((p) => {
                  const isActive = p.id === activeProfile?.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        switchProfile(p.id);
                        onClose();
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isActive
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm font-heading shadow"
                          style={{ backgroundColor: p.avatar_color || '#6366f1' }}
                        >
                          {p.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            {p.full_name}
                            {isActive && <Badge variant="emerald">Active</Badge>}
                          </div>
                          <div className="text-[11px] text-slate-400">{p.occupation || 'User'} • {p.email}</div>
                          <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                            Income: ₹{Number(p.monthly_income).toLocaleString('en-IN')}/mo
                          </div>
                        </div>
                      </div>

                      <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isActive ? 'text-indigo-400' : 'text-slate-600'}`} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Google OAuth Login */}
        {activeTab === 'google' && (
          <div className="space-y-4 py-4 text-center">
            <p className="text-xs text-slate-300 leading-relaxed">
              Sign in with your Google Account to automatically sync your personal expense ledger across devices.
            </p>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl text-sm transition-all shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Authenticate with Google</span>
            </button>
          </div>
        )}

        {/* TAB 3: Manual Email Login */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-3 pt-1">
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

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

            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              {isSignUp ? 'Register Account' : 'Sign In with Email'}
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
    </Modal>
  );
};
