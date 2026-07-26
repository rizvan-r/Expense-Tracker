import React, { useState, Component } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
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

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto px-4 sm:px-8 lg:px-12 py-6">
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

      {/* Floating AI Assistant Chatbot Widget (Hidden when in 'advisor' view) */}
      <AIAssistantWidget activeView={activeView} />


      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500 glass-panel">
        <p>AI-Powered Personal Expense Tracker & Financial Assistant • Built with React, FastAPI & Supabase</p>
      </footer>
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
      <AuthProvider>
        <ExpenseProvider>
          <AppContent />
        </ExpenseProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
