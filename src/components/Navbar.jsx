import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Receipt,
  ScanText,
  PieChart,
  Activity,
  Sliders,
  Sparkles,
  User,
  LogOut,
  Database,
  ChevronDown,
  Settings,
  IndianRupee,
  ShieldCheck,
  Bot,
  Users,
  Check,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';

import { IlluminatiLogo } from './UI/IlluminatiLogo';

export const Navbar = ({ activeView, setActiveView, onOpenAuthModal }) => {
  const { user, activeProfile, profiles, switchProfile, logout } = useAuth();
  const { healthScoreData, profile } = useExpense();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'ocr', label: 'Receipt OCR', icon: ScanText, badge: 'AI' },
    { id: 'budget', label: 'Budget & ML', icon: PieChart },
    { id: 'advisor', label: 'AI Advisor', icon: Bot, badge: 'LIMITS' },
    { id: 'health', label: 'Health Score', icon: Activity, badge: healthScoreData?.overall_score || '85' },
    { id: 'simulator', label: 'Simulator', icon: Sliders },
    { id: 'savings', label: 'Savings Plan', icon: Sparkles },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const displayName = user?.full_name || activeProfile?.full_name || 'Richu Sharma';
  const displayEmail = user?.email || activeProfile?.email || 'user@example.com';
  const avatarUrl = user?.avatar_url;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand with Illuminati Symbol */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <IlluminatiLogo className="w-9 h-9" />
            <div>
              <span className="text-lg font-bold font-heading bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                SpendAI
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded ml-2 border border-indigo-500/20">
                PRO
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 relative ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/30 text-white border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Multi-Profile User Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-lg object-cover shadow-md" />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs font-heading shadow-md"
                  style={{ backgroundColor: activeProfile?.avatar_color || '#6366f1' }}
                >
                  {displayName.charAt(0)}
                </div>
              )}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">
                  ₹{Number(activeProfile?.monthly_income || 85000).toLocaleString('en-IN')}/mo
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu Card */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-2 z-50 animate-fadeIn space-y-2">
                {/* Active Profile Info */}
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-3">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-xl object-cover shadow" />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow"
                      style={{ backgroundColor: activeProfile?.avatar_color || '#6366f1' }}
                    >
                      {displayName.charAt(0)}
                    </div>
                  )}
                  <div className="space-y-0.5 truncate">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="truncate">{displayName}</span>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded-full border border-emerald-500/20">Active</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{displayEmail}</div>
                  </div>
                </div>

                {/* Profile Switcher Section */}
                <div className="space-y-1">
                  <div className="px-2 text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center justify-between">
                    <span>Switch Profile ({profiles.length})</span>
                    <button onClick={() => { onOpenAuthModal(); setIsDropdownOpen(false); }} className="text-indigo-400 hover:underline flex items-center gap-0.5">
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>

                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {profiles.map((p) => {
                      const isCur = p.id === activeProfile?.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            switchProfile(p.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                            isCur ? 'bg-indigo-600/20 text-white font-semibold border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-[10px]"
                              style={{ backgroundColor: p.avatar_color || '#6366f1' }}
                            >
                              {p.full_name.charAt(0)}
                            </div>
                            <div className="text-left">
                              <div className="text-xs truncate max-w-[140px]">{p.full_name}</div>
                              <div className="text-[10px] text-slate-400">₹{Number(p.monthly_income).toLocaleString('en-IN')}/mo</div>
                            </div>
                          </div>

                          {isCur && <Check className="w-4 h-4 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-800/80 my-1"></div>

                {/* Actions */}
                <button
                  onClick={() => {
                    setActiveView('profile');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-indigo-400" />
                  <span>Profile & Financial Details</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
