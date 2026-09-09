import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TransactionsList } from './components/TransactionsList';
import { MonthlyReportView } from './components/MonthlyReportView';
import { EmployeesView } from './components/EmployeesView';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { NewTransactionModal } from './components/NewTransactionModal';
import { INITIAL_TRANSACTIONS, INITIAL_EMPLOYEES } from './data/mockData';
import { Transaction, TransactionStatus, Employee } from './types';
import { ShieldCheck, Info, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'zatiya_prototype_transactions_v1';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_TRANSACTIONS;
  });

  const [employees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [currentView, setCurrentView] = useState<'transactions' | 'report' | 'employees'>('transactions');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Sync to local storage for local persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions]);

  // Update Status handler
  const handleUpdateStatus = (id: string, newStatus: TransactionStatus) => {
    setTransactions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    // Also update selected transaction if modal is open
    if (selectedTransaction && selectedTransaction.id === id) {
      setSelectedTransaction((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Add new transaction
  const handleAddTransaction = (newTr: Transaction) => {
    setTransactions((prev) => [newTr, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1c1917] flex flex-col font-['Tajawal',sans-serif]">
      {/* App Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        transactions={transactions}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Helper Note Banner */}
        <div className="mb-5 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs flex items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <p className="leading-relaxed">
              <strong>مرحباً بك في النموذج التجريبي الأولي:</strong> يمكنك تجربة البحث، تغيير حالة أي كتاب (من جديد إلى قيد الإنجاز أو مكتمل)، وإضافة معاملات جديدة ومعاينة التقرير الشهري. سنطوّر النموذج خطوة بخطوة بحسب ملاحظاتك.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-amber-800 shrink-0 hidden md:inline">
            البيانات تحفظ محلياً على جهازك
          </span>
        </div>

        {/* Dynamic Views */}
        {currentView === 'transactions' && (
          <TransactionsList
            transactions={transactions}
            onSelectTransaction={setSelectedTransaction}
            onUpdateStatus={handleUpdateStatus}
            onOpenNewModal={() => setIsNewModalOpen(true)}
          />
        )}

        {currentView === 'report' && (
          <MonthlyReportView
            transactions={transactions}
            onSelectTransaction={setSelectedTransaction}
          />
        )}

        {currentView === 'employees' && (
          <EmployeesView
            employees={employees}
            transactions={transactions}
            onSelectTransaction={setSelectedTransaction}
          />
        )}
      </main>

      {/* Modals */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      <NewTransactionModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        employees={employees.map((e) => e.name)}
      />

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 px-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>نظام الذاتية الداخلي • نسخة أولية للمعاينة والاختبار والتطوير المستمر</span>
          <span className="flex items-center gap-1.5 text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> لا يتم إرسال أي وثائق لأطراف خارجية
          </span>
        </div>
      </footer>
    </div>
  );
}
