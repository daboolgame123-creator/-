import React from 'react';
import { 
  FileText, 
  BarChart3, 
  Users, 
  Plus, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Bell,
  CheckCheck,
  UserCheck,
  FolderOpen
} from 'lucide-react';
import { Transaction, UserRole } from '../types';

interface HeaderProps {
  currentView: 'transactions' | 'report' | 'employees';
  setCurrentView: (view: 'transactions' | 'report' | 'employees') => void;
  onOpenNewModal: () => void;
  transactions: Transaction[];
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onMarkAllAsRead: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  onOpenNewModal,
  transactions,
  userRole,
  setUserRole,
  onMarkAllAsRead,
}) => {
  const unreadCount = transactions.filter((t) => !t.isRead).length;
  const inProgressCount = transactions.filter((t) => t.status === 'قيد الإنجاز').length;
  const completedCount = transactions.filter((t) => t.status === 'مكتمل').length;
  const totalCount = transactions.length;

  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-20 shadow-xs">
      {/* Top security and alert bar */}
      <div className="bg-stone-900 text-stone-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 font-medium text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            رابط مباشر ومشفر (Offline-First)
          </span>

          {/* Director Unread Notification Alert */}
          {unreadCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-600/80 animate-pulse">
              <Bell className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>يوجد <strong>{unreadCount}</strong> كتب جديدة لم تطّلع عليها 🔴</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              جميع الكتب والبريد مقروءة ومطّلع عليها
            </span>
          )}
        </div>

        {/* Top Right: Mark All Read & Quick Role Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {unreadCount > 0 && (
            <button
              type="button"
              id="btn-header-mark-all-read"
              onClick={onMarkAllAsRead}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 bg-amber-900/40 hover:bg-amber-900/70 px-2.5 py-0.5 rounded border border-amber-700/60 transition-colors cursor-pointer"
              title="تحديد كل الكتب غير المقروءة كمطّلع عليها"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>تحديد الكل كمقروء ✓</span>
            </button>
          )}

          {/* Role Segmented Switcher */}
          <div className="inline-flex items-center rounded-lg bg-stone-800 p-0.5 border border-stone-700 text-[11px]">
            <button
              type="button"
              id="role-director"
              onClick={() => setUserRole('director')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                userRole === 'director'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>السيد مدير المركز</span>
            </button>

            <button
              type="button"
              id="role-archivist"
              onClick={() => setUserRole('archivist')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                userRole === 'archivist'
                  ? 'bg-stone-200 text-stone-900 font-bold shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <FolderOpen className="w-3 h-3" />
              <span>مسؤول الذاتية والأرشفة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Title & Active Role Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            <FileText className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                منظومة متابعة الذاتية والتقارير
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                إصدار تجريبي 0.1
              </span>
              {userRole === 'director' ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                  واجهة السيد المدير (اطلاع ومتابعة البريد)
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-600"></span>
                  واجهة مسؤول الذاتية (إدخال وتوثيق)
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              رابط مباشر للمدير للاطلاع الفوري على المعاملات والكتب الرسمية والمرفقات
            </p>
          </div>
        </div>

        {/* View Switcher and Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-100/80 p-1 text-xs font-medium">
            <button
              type="button"
              id="tab-transactions"
              onClick={() => setCurrentView('transactions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                currentView === 'transactions'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>سجل المعاملات</span>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              id="tab-monthly-report"
              onClick={() => setCurrentView('report')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                currentView === 'report'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
              <span>التقرير الشهري التفاعلي</span>
            </button>

            <button
              type="button"
              id="tab-employees"
              onClick={() => setCurrentView('employees')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                currentView === 'employees'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>سجل المنتسبين</span>
            </button>
          </div>

          <button
            type="button"
            id="btn-add-transaction"
            onClick={onOpenNewModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>إدخال معاملة جديدة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
