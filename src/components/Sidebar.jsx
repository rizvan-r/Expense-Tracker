import React, { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Settings,
  Bot,
  Check,
  Plus,
  Sun,
  Moon,
  ChevronDown,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { IlluminatiLogo } from './UI/IlluminatiLogo';

export const Sidebar = ({
  activeView,
  setActiveView,
  isMobileOpen,
  setIsMobileOpen,
  onOpenAuthModal
}) => {
  const { user, activeProfile, profiles, switchProfile, logout } = useAuth();
  const { healthScoreData } = useExpense();
  const { theme, toggleTheme } = useTheme();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const displayName = user?.full_name || activeProfile?.full_name || 'Richu Sharma';
  const displayEmail = user?.email || activeProfile?.email || 'user@example.com';
  const avatarUrl = user?.avatar_url;

  const menuCategories = [
    {
      id: 'core',
      name: 'Main Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'expenses', label: 'Expenses', icon: Receipt },
        { id: 'ocr', label: 'Receipt OCR', icon: ScanText, badge: 'AI' }
      ]
    },
    {
      id: 'ai_tools',
      name: 'AI Intelligence',
      items: [
        { id: 'budget', label: 'Budget & ML', icon: PieChart },
        { id: 'advisor', label: 'AI Advisor', icon: Bot, badge: 'LIMITS' },
        { id: 'health', label: 'Health Score', icon: Activity, badge: healthScoreData?.overall_score || '85' },
        { id: 'simulator', label: 'Simulator', icon: Sliders },
        { id: 'savings', label: 'Savings Plan', icon: Sparkles }
      ]
    },
    {
      id: 'account',
      name: 'Account',
      items: [
        { id: 'profile', label: 'Profile Config', icon: User }
      ]
    }
  ];

  const handleSelectTab = (id) => {
    setActiveView(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 select-none">
      {/* Sidebar Header: Brand Logo & Collapse Toggle */}
      <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 h-16">
        <div
          className="flex items-center gap-3 cursor-pointer overflow-hidden"
          onClick={() => handleSelectTab('dashboard')}
        >
          <IlluminatiLogo className="w-8 h-8 flex-shrink-0" />
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center gap-2 truncate">
              <span className="text-lg font-bold font-heading text-slate-900 dark:text-white tracking-tight">
                SpendAI
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                PRO
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {menuCategories.map((cat) => (
          <div key={cat.id} className="space-y-1">
            {(!isCollapsed || isMobileOpen) && (
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                {cat.name}
              </span>
            )}

            {cat.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  title={isCollapsed && !isMobileOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 relative group ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-l-4 border-emerald-600 dark:border-emerald-500 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border-l-4 border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                  
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}

                  {item.badge && (!isCollapsed || isMobileOpen) && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer: Theme Toggle & User Profile */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {/* Dark / Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
        >
          <div className="flex items-center gap-2.5">
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            {(!isCollapsed || isMobileOpen) && (
              <span>{theme === 'light' ? 'Dark Theme' : 'Light Theme'}</span>
            )}
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <span className="text-[10px] uppercase font-bold text-slate-400">Toggle</span>
          )}
        </button>

        {/* Profile Card & Account Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all text-left"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-lg object-cover flex-shrink-0 shadow-sm" />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs font-heading flex-shrink-0 shadow-sm"
                style={{ backgroundColor: activeProfile?.avatar_color || '#059669' }}
              >
                {displayName.charAt(0)}
              </div>
            )}

            {(!isCollapsed || isMobileOpen) && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {displayName}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate">
                  ₹{Number(activeProfile?.monthly_income || 85000).toLocaleString('en-IN')}/mo
                </div>
              </div>
            )}

            {(!isCollapsed || isMobileOpen) && (
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Profile Switcher Popover */}
          {isProfileMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xl z-50 space-y-2 animate-fade-in">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Switch Profile ({profiles.length})</span>
                <button
                  onClick={() => {
                    if (onOpenAuthModal) onOpenAuthModal();
                    setIsProfileMenuOpen(false);
                  }}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              <div className="space-y-1 max-h-36 overflow-y-auto">
                {profiles.map((p) => {
                  const isCur = p.id === activeProfile?.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchProfile(p.id);
                        setIsProfileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                        isCur
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0"
                          style={{ backgroundColor: p.avatar_color || '#059669' }}
                        >
                          {p.full_name.charAt(0)}
                        </div>
                        <span className="truncate">{p.full_name}</span>
                      </div>
                      {isCur && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-1 space-y-1">
                <button
                  onClick={() => {
                    handleSelectTab('profile');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold rounded-lg"
                >
                  <Settings className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Profile Settings</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold rounded-lg"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className={`hidden md:block sticky top-0 h-screen transition-all duration-300 z-30 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] h-full shadow-2xl z-50">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
