import React, { useState, Component } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { ExpenseManager } from './components/ExpenseManager';
import { ReceiptOCR } from './components/ReceiptOCR';
import { BudgetPredictor } from './components/BudgetPredictor';
import { HealthScore } from './components/HealthScore';
import { Simulator } from './components/Simulator';
import { SavingsPlan } from './components/SavingsPlan';
import { ProfileView } from './components/ProfileView';
import { AIFinancialAdvisor } from './components/AIFinancialAdvisor';
import { AIAssistantWidget } from './components/AIAssistantWidget';
import { AuthModal } from './components/AuthModal';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught UI Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl max-w-lg space-y-4 shadow-2xl">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h2 className="text-xl font-bold font-heading">Application Notice</h2>
            <p className="text-xs text-rose-300 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800 text-left overflow-x-auto">
              {this.state.error?.toString() || 'Render exception detected.'}
            </p>
            <p className="text-xs text-slate-400">
              Click below to reset cached state and return to the login interface.
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Reset & Return to Login
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const MainLayout = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-row selection:bg-emerald-500 selection:text-white transition-colors duration-300 animate-fade-in">
      {/* Left Side Navigation Menu */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Right Content Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar (No Tab Buttons) */}
        <TopHeader
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        {/* View Pages Container */}
        <main className="flex-1 w-full mx-auto px-4 sm:px-8 lg:px-12 py-6 animate-slide-up">
          {activeView === 'dashboard' && (
            <Dashboard
              setActiveView={setActiveView}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          )}

          {activeView === 'expenses' && (
            <ExpenseManager
              isAddModalOpen={isAddModalOpen}
              setIsAddModalOpen={setIsAddModalOpen}
            />
          )}

          {activeView === 'ocr' && (
            <ReceiptOCR setActiveView={setActiveView} />
          )}

          {activeView === 'budget' && (
            <BudgetPredictor />
          )}

          {activeView === 'advisor' && (
            <AIFinancialAdvisor />
          )}

          {activeView === 'health' && (
            <HealthScore setActiveView={setActiveView} />
          )}

          {activeView === 'simulator' && (
            <Simulator />
          )}

          {activeView === 'savings' && (
            <SavingsPlan />
          )}

          {activeView === 'profile' && (
            <ProfileView />
          )}
        </main>

        {/* Account Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        {/* Floating AI Assistant Chatbot Widget */}
        <AIAssistantWidget activeView={activeView} />

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 shadow-sm font-medium transition-colors duration-300">
          <p>AI-Powered Personal Expense Tracker & Financial Assistant • Built with React, Spring Boot, FastAPI & Supabase</p>
        </footer>
      </div>
    </div>
  );
};

export const AppContent = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ExpenseProvider>
            <AppContent />
          </ExpenseProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
