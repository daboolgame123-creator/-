import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TransactionsList } from './components/TransactionsList';
import { MonthlyReportView } from './components/MonthlyReportView';
import { EmployeesView } from './components/EmployeesView';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { NewTransactionModal } from './components/NewTransactionModal';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { INITIAL_TRANSACTIONS, INITIAL_EMPLOYEES } from './data/mockData';
import { Transaction, TransactionStatus, Employee, UserRole, Attachment } from './types';
import { ShieldCheck, Info, Bell, CheckCheck, UserCheck, Eye, Check } from 'lucide-react';

const STORAGE_KEY = 'zatiya_prototype_transactions_v2';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_TRANSACTIONS;
  });

  const [employees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [userRole, setUserRole] = useState<UserRole>('director'); // Default to Director to test the Director view immediately
  const [currentView, setCurrentView] = useState<'transactions' | 'report' | 'employees'>('transactions');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [directAttachmentView, setDirectAttachmentView] = useState<{
    transaction: Transaction;
    attachmentIndex: number;
  } | null>(null);

  // Detect direct link URL params (e.g. ?role=director)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role') || params.get('user');
      if (roleParam === 'director') {
        setUserRole('director');
      } else if (roleParam === 'archivist') {
        setUserRole('archivist');
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync to local storage for local persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions]);

  // Unread count
  const unreadCount = transactions.filter((t) => !t.isRead).length;

  // Format current time in Arabic
  const getCurrentTimeFormatted = () => {
    return new Intl.DateTimeFormat('ar-IQ', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
  };

  // Open & Read Handler: when transaction is opened / clicked
  const handleSelectTransaction = (tr: Transaction) => {
    const nowTime = getCurrentTimeFormatted();
    if (!tr.isRead) {
      const updatedTr: Transaction = {
        ...tr,
        isRead: true,
        readAt: nowTime,
      };
      setTransactions((prev) =>
        prev.map((item) => (item.id === tr.id ? updatedTr : item))
      );
      // In Director role: do NOT show the information modal popup!
      if (userRole === 'director') {
        setSelectedTransaction(null);
        return;
      }
      setSelectedTransaction(updatedTr);
    } else {
      // In Director role: do NOT show the information modal popup!
      if (userRole === 'director') {
        setSelectedTransaction(null);
        return;
      }
      setSelectedTransaction(tr);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    const nowTime = getCurrentTimeFormatted();
    setTransactions((prev) =>
      prev.map((item) => ({
        ...item,
        isRead: true,
        readAt: item.readAt || nowTime,
      }))
    );
    if (selectedTransaction) {
      setSelectedTransaction((prev) =>
        prev ? { ...prev, isRead: true, readAt: prev.readAt || nowTime } : null
      );
    }
  };

  // Toggle single read status
  const handleToggleReadStatus = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nowTime = getCurrentTimeFormatted();
    setTransactions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextRead = !item.isRead;
          return {
            ...item,
            isRead: nextRead,
            readAt: nextRead ? nowTime : undefined,
          };
        }
        return item;
      })
    );
    if (selectedTransaction && selectedTransaction.id === id) {
      setSelectedTransaction((prev) =>
        prev ? { ...prev, isRead: !prev.isRead, readAt: !prev.isRead ? nowTime : undefined } : null
      );
    }
  };

  // Directly open attachment full screen in lightbox & mark as read
  const handleViewAttachmentDirectly = (tr: Transaction, attachmentIndex: number = 0) => {
    // Ensure there is at least one previewable document attachment
    const attachmentsToView = (tr.attachments && tr.attachments.length > 0)
      ? tr.attachments
      : [
          {
            id: `att-doc-${tr.id}`,
            name: `كتاب_${tr.number.replace(/[\/\\]/g, '_')}.jpg`,
            type: 'كتاب رئيسي',
            fileSize: '1.2 MB',
            uploadDate: tr.date,
            isImage: true,
          }
        ];

    const safeTr = {
      ...tr,
      attachments: attachmentsToView,
    };

    const targetIdx = Math.max(0, Math.min(attachmentIndex, attachmentsToView.length - 1));

    if (!tr.isRead) {
      const nowTime = getCurrentTimeFormatted();
      const updatedTr: Transaction = {
        ...safeTr,
        isRead: true,
        readAt: nowTime,
      };
      setTransactions((prev) =>
        prev.map((item) => (item.id === tr.id ? updatedTr : item))
      );
      if (selectedTransaction?.id === tr.id) {
        setSelectedTransaction(updatedTr);
      }
      setDirectAttachmentView({ transaction: updatedTr, attachmentIndex: targetIdx });
    } else {
      setDirectAttachmentView({ transaction: safeTr, attachmentIndex: targetIdx });
    }
  };

  // Update Status handler (جديد / قيد الإنجاز / مكتمل)
  const handleUpdateStatus = (id: string, newStatus: TransactionStatus) => {
    setTransactions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    if (selectedTransaction && selectedTransaction.id === id) {
      setSelectedTransaction((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Add new transaction (by archivist)
  const handleAddTransaction = (newTr: Transaction) => {
    setTransactions((prev) => [newTr, ...prev]);
  };

  // Update attachments for any transaction (add photos, edit name/type, delete)
  const handleUpdateAttachments = (transactionId: string, updatedAttachments: Attachment[]) => {
    setTransactions((prev) =>
      prev.map((item) =>
        item.id === transactionId ? { ...item, attachments: updatedAttachments } : item
      )
    );
    if (selectedTransaction && selectedTransaction.id === transactionId) {
      setSelectedTransaction((prev) =>
        prev ? { ...prev, attachments: updatedAttachments } : null
      );
    }
  };

  // Save Director's Directive handler
  const handleSaveDirective = (transactionId: string, directiveText: string, actionRequired: boolean) => {
    const nowTime = getCurrentTimeFormatted();
    setTransactions((prev) =>
      prev.map((item) =>
        item.id === transactionId
          ? {
              ...item,
              directorDirective: {
                text: directiveText,
                date: nowTime,
                actionRequired,
              },
            }
          : item
      )
    );
    if (selectedTransaction && selectedTransaction.id === transactionId) {
      setSelectedTransaction((prev) =>
        prev
          ? {
              ...prev,
              directorDirective: {
                text: directiveText,
                date: nowTime,
                actionRequired,
              },
            }
          : null
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1c1917] flex flex-col font-['Tajawal',sans-serif]">
      {/* App Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        transactions={transactions}
        userRole={userRole}
        setUserRole={setUserRole}
        onMarkAllAsRead={handleMarkAllAsRead}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Dynamic Director Notification Banner */}
        {userRole === 'director' ? (
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-800 shrink-0">
                <Bell className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-2">
                  <span>رابط الاطلاع المباشر للسيد المدير</span>
                  {unreadCount > 0 ? (
                    <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                      {unreadCount} غير مقروء 🔴
                    </span>
                  ) : (
                    <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      تم الاطلاع على كافة الكتب ✓
                    </span>
                  )}
                </h2>
                <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                  {unreadCount > 0
                    ? `يوجد ${unreadCount} كتب رسمية جديدة رُفعت بواسطة قسم الذاتية بانتظار اطلاعك عليها. بمجرد النقر على المعاملة ستتحول تلقائياً إلى «مقروء ✓».`
                    : 'لا توجد كتب جديدة غير مقروءة حالياً. يمكنك تصفح الأرشيف والتقارير الشهرية في أي وقت.'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                id="btn-banner-mark-all-read"
                onClick={handleMarkAllAsRead}
                className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <CheckCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>تحديد الكل كمقروء ✓</span>
              </button>
            )}
          </div>
        ) : (
          /* Archivist Notification Banner */
          <div className="mb-4 p-3.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-stone-600 shrink-0" />
              <p className="leading-relaxed">
                <strong>واجهة مسؤول الذاتية والأرشفة:</strong> يمكنك رفع الكتب الجديدة مع مرفقاتها (صور، PDF). ستصل فوراً إلى رابط السيد المدير وتأخذ حالة «غير مقروء 🔴» حتى يقوم بالاطلاع عليها.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 cursor-pointer"
            >
              + رفع كتاب جديد
            </button>
          </div>
        )}

        {/* Dynamic Views */}
        {currentView === 'transactions' && (
          <TransactionsList
            transactions={transactions}
            onSelectTransaction={handleSelectTransaction}
            onToggleReadStatus={handleToggleReadStatus}
            onMarkAllAsRead={handleMarkAllAsRead}
            onUpdateStatus={handleUpdateStatus}
            onOpenNewModal={() => setIsNewModalOpen(true)}
            userRole={userRole}
            onViewAttachmentDirectly={handleViewAttachmentDirectly}
          />
        )}

        {currentView === 'report' && (
          <MonthlyReportView
            transactions={transactions}
            onSelectTransaction={handleSelectTransaction}
          />
        )}

        {currentView === 'employees' && (
          <EmployeesView
            employees={employees}
            transactions={transactions}
            onSelectTransaction={handleSelectTransaction}
          />
        )}
      </main>

      {/* Modals */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onUpdateStatus={handleUpdateStatus}
        onToggleReadStatus={() => selectedTransaction && handleToggleReadStatus(selectedTransaction.id)}
        onUpdateAttachments={handleUpdateAttachments}
      />

      <NewTransactionModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        employees={employees.map((e) => e.name)}
      />

      {/* Direct Full-Screen Image & Document Lightbox with Fixed Exit Button */}
      {directAttachmentView && directAttachmentView.transaction.attachments && directAttachmentView.transaction.attachments.length > 0 && (
        <ImageLightboxModal
          attachment={
            directAttachmentView.transaction.attachments[directAttachmentView.attachmentIndex] ||
            directAttachmentView.transaction.attachments[0]
          }
          attachments={directAttachmentView.transaction.attachments}
          currentIndex={directAttachmentView.attachmentIndex}
          onIndexChange={(idx) => setDirectAttachmentView((prev) => prev ? { ...prev, attachmentIndex: idx } : null)}
          transactionTitle={directAttachmentView.transaction.subject}
          transactionNumber={directAttachmentView.transaction.number}
          onClose={() => setDirectAttachmentView(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 px-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>منظومة متابعة الذاتية والتقارير • الإصدار التجريبي 0.1 • رابط مباشر لمدير المركز</span>
          <span className="flex items-center gap-1.5 text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> اتصال محمي ومباشر
          </span>
        </div>
      </footer>
    </div>
  );
}
