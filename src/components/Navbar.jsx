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
  ChevronDown,
  Settings,
  Bot,
  Check,
  Plus,
  Menu,
  X,
  Search,
  Grid
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';
import { IlluminatiLogo } from './UI/IlluminatiLogo';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const Navbar = ({ activeView, setActiveView, onOpenAuthModal }) => {
  const { user, activeProfile, profiles, switchProfile, logout } = useAuth();
  const { healthScoreData } = useExpense();
  const { theme, toggleTheme } = useTheme();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategoryMenu, setActiveCategoryMenu] = useState(null);
  const [menuSearchQuery, setMenuSearchQuery] = useState('');

  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
        setActiveCategoryMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuCategories = [
    {
      id: 'core',
      name: 'Overview & Ledger',
      items: [
        { id: 'dashboard', label: 'Dashboard', desc: 'Main Financial Overview & Key Metrics', icon: LayoutDashboard },
        { id: 'expenses', label: 'Expenses', desc: 'Full Ledger, Search & Category Filters', icon: Receipt },
        { id: 'ocr', label: 'Receipt OCR', desc: 'OpenAI Vision Receipt & Bill Extractor', icon: ScanText, badge: 'AI' }
      ]
    },
    {
      id: 'ai_tools',
      name: 'AI Intelligence & Tools',
      items: [
        { id: 'budget', label: 'Budget & ML', desc: 'Linear Regression Forecast Engine', icon: PieChart },
        { id: 'advisor', label: 'AI Advisor', desc: 'Safe Purchase Caps & 50/30/20 Rules', icon: Bot, badge: 'LIMITS' },
        { id: 'health', label: 'Health Score', desc: 'Multi-factor Wellness Index Diagnostic', icon: Activity, badge: healthScoreData?.overall_score || '85' },
        { id: 'simulator', label: 'Simulator', desc: 'What-If Compound Growth Scenario Tool', icon: Sliders },
        { id: 'savings', label: 'Savings Plan', desc: 'Personalized Goals & Milestone Vault', icon: Sparkles }
      ]
    },
    {
      id: 'account',
      name: 'Account & Settings',
      items: [
        { id: 'profile', label: 'Profile & Config', desc: 'Income, Expense Caps & Strategy', icon: User }
      ]
    }
  ];

  const allMenuItems = menuCategories.flatMap(c => c.items);
  const activeItemObj = allMenuItems.find(i => i.id === activeView) || allMenuItems[0];
  const ActiveIcon = activeItemObj.icon;

  const filteredCategories = menuCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.label.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(menuSearchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  const displayName = user?.full_name || activeProfile?.full_name || 'Richu Sharma';
  const displayEmail = user?.email || activeProfile?.email || 'user@example.com';
  const avatarUrl = user?.avatar_url;

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
      <div className="w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand with Illuminati Symbol */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <IlluminatiLogo className="w-9 h-9" />
            <div>
              <span className="text-xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
                SpendAI
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded ml-2 border border-emerald-200 dark:border-emerald-800">
                PRO
              </span>
            </div>
          </div>

          {/* Central Menu Bar (Replaces Tab Buttons) */}
          <div className="relative" ref={menuRef}>
            <div className="flex items-center gap-2">
              {/* Main Menu Bar Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border shadow-sm ${
                  isMenuOpen
                    ? 'bg-emerald-50 dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-emerald-600 dark:border-emerald-500'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Menu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-heading tracking-wide">Menu Bar</span>
                <span className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-0.5"></span>
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                  <ActiveIcon className="w-3.5 h-3.5" />
                  <span>{activeItemObj.label}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Quick Sub-Category Menu Bar (Desktop) */}
              <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                {menuCategories.map((cat) => {
                  const hasActive = cat.items.some(i => i.id === activeView);
                  const isCatOpen = activeCategoryMenu === cat.id;

                  return (
                    <div key={cat.id} className="relative">
                      <button
                        onClick={() => {
                          setActiveCategoryMenu(isCatOpen ? null : cat.id);
                          setIsMenuOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                          hasActive
                            ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Sub-Category Dropdown */}
                      {isCatOpen && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xl z-50 animate-fade-in space-y-1">
                          {cat.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeView === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setActiveView(item.id);
                                  setActiveCategoryMenu(null);
                                }}
                                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                                  isActive
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800'
                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`} />
                                  <span className="font-semibold">{item.label}</span>
                                </div>
                                {item.badge && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                                    {item.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Menu Bar Full Dropdown Overlay */}
            {isMenuOpen && (
              <div className="absolute top-full left-0 sm:left-1/2 sm:-translate-x-1/2 mt-3 w-80 sm:w-[540px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl z-50 animate-fade-in space-y-4 max-h-[85vh] overflow-y-auto">
                {/* Header & Search */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm font-heading">
                    <Grid className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Application Menu Bar</span>
                  </div>
                  <button onClick={() => setIsMenuOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search menus (e.g. OCR, Health, Simulator...)"
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Categorized Menus Grid */}
                <div className="space-y-4">
                  {filteredCategories.map((cat) => (
                    <div key={cat.id} className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block px-1">
                        {cat.name}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cat.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeView === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveView(item.id);
                                setIsMenuOpen(false);
                              }}
                              className={`p-3 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                                isActive
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300 shadow-sm'
                                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <div className={`p-2 rounded-xl border ${
                                isActive
                                  ? 'bg-emerald-600 text-white border-emerald-500'
                                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-bold truncate">{item.label}</span>
                                  {item.badge && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                  {item.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Bar: Theme Toggle & Multi-Profile Menu */}
          <div className="flex items-center gap-3">
            {/* Dark/Light Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:scale-105 transition-all"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Multi-Profile User Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-lg object-cover shadow-sm" />
                ) : (
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs font-heading shadow-sm"
                    style={{ backgroundColor: activeProfile?.avatar_color || '#059669' }}
                  >
                    {displayName.charAt(0)}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    ₹{Number(activeProfile?.monthly_income || 85000).toLocaleString('en-IN')}/mo
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu Card */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 p-3 z-50 animate-fade-in space-y-2 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
                  {/* Active Profile Info */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-xl object-cover shadow" />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow"
                        style={{ backgroundColor: activeProfile?.avatar_color || '#059669' }}
                      >
                        {displayName.charAt(0)}
                      </div>
                    )}
                    <div className="space-y-0.5 truncate">
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="truncate">{displayName}</span>
                        <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded-full border border-emerald-300 dark:border-emerald-800">Active</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{displayEmail}</div>
                    </div>
                  </div>

                  {/* Profile Switcher Section */}
                  <div className="space-y-1">
                    <div className="px-2 text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Switch Profile ({profiles.length})</span>
                      <button onClick={() => { onOpenAuthModal(); setIsDropdownOpen(false); }} className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-0.5">
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
                              isCur
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-[10px]"
                                style={{ backgroundColor: p.avatar_color || '#059669' }}
                              >
                                {p.full_name.charAt(0)}
                              </div>
                              <div className="text-left">
                                <div className="text-xs truncate max-w-[140px] font-semibold">{p.full_name}</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">₹{Number(p.monthly_income).toLocaleString('en-IN')}/mo</div>
                              </div>
                            </div>

                            {isCur && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>

                  {/* Actions */}
                  <button
                    onClick={() => {
                      setActiveView('profile');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold rounded-xl transition-colors"
                  >
                    <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Profile & Financial Details</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
