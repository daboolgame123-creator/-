import React from 'react';
import { 
  FileText, 
  BarChart3, 
  Users, 
  Plus, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { Transaction } from '../types';

interface HeaderProps {
  currentView: 'transactions' | 'report' | 'employees';
  setCurrentView: (view: 'transactions' | 'report' | 'employees') => void;
  onOpenNewModal: () => void;
  transactions: Transaction[];
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  onOpenNewModal,
  transactions,
}) => {
  const inProgressCount = transactions.filter((t) => t.status === 'قيد الإنجاز').length;
  const completedCount = transactions.filter((t) => t.status === 'مكتمل').length;
  const totalCount = transactions.length;

  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-20 shadow-xs">
      {/* Top security bar */}
      <div className="bg-stone-50 border-b border-stone-100 px-4 py-1.5 text-xs text-stone-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            وضع العمل المحلي (Offline-First)
          </span>
          <span className="hidden sm:inline text-stone-400">|</span>
          <span className="hidden sm:inline text-stone-500">
            بيانات تجريبية وهمية 100% • محمي ومحلي داخل جهازك
          </span>
        </div>
        <div className="flex items-center gap-3 text-stone-500">
          <span className="flex items-center gap-1 font-medium text-stone-700">
            إجمالي المعاملات: <span className="font-bold text-stone-900">{totalCount}</span>
          </span>
          <span className="flex items-center gap-1 text-amber-700 font-medium">
            <Clock className="w-3 h-3 text-amber-500" />
            قيد الإنجاز: {inProgressCount}
          </span>
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            مكتمل: {completedCount}
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-lg shadow-sm">
            <FileText className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
              منظومة متابعة الذاتية والتقارير
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                نسخة تجريبية 0.1
              </span>
            </h1>
            <p className="text-xs text-stone-500">
              طبقة تنظيم ومتابعة وإعداد تقارير شهرية متقدمة لقسم الذاتية
            </p>
          </div>
        </div>

        {/* View Switcher and Action Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-100/80 p-1 text-xs font-medium">
            <button
              type="button"
              id="tab-transactions"
              onClick={() => setCurrentView('transactions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                currentView === 'transactions'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              سجل المعاملات
            </button>

            <button
              type="button"
              id="tab-monthly-report"
              onClick={() => setCurrentView('report')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                currentView === 'report'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
              التقرير الشهري التفاعلي
            </button>

            <button
              type="button"
              id="tab-employees"
              onClick={() => setCurrentView('employees')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                currentView === 'employees'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              سجل المنتسبين
            </button>
          </div>

          <button
            type="button"
            id="btn-add-transaction"
            onClick={onOpenNewModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            إدخال معاملة جديدة
          </button>
        </div>
      </div>
    </header>
  );
};
