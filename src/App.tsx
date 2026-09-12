import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TransactionsList } from './components/TransactionsList';
import { MonthlyReportView } from './components/MonthlyReportView';
import { EmployeesView } from './components/EmployeesView';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { NewTransactionModal } from './components/NewTransactionModal';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { ArchivistStudioView } from './components/ArchivistStudioView';
import { ArchivistEditorModal } from './components/ArchivistEditorModal';
import { INITIAL_TRANSACTIONS, INITIAL_EMPLOYEES } from './data/mockData';
import { Transaction, TransactionStatus, Employee, UserRole, Attachment } from './types';
import { ShieldCheck, Info, Bell, CheckCheck, UserCheck, Eye, Check, Edit3 } from 'lucide-react';

const STORAGE_KEY = 'zatiya_prototype_transactions_v2';
const EMPLOYEES_STORAGE_KEY = 'zatiya_prototype_employees_v3';
const DARK_MODE_STORAGE_KEY = 'zatiya_prototype_dark_mode_v1';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(DARK_MODE_STORAGE_KEY);
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(DARK_MODE_STORAGE_KEY, String(isDarkMode));
    } catch {
      // ignore
    }
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

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

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_EMPLOYEES;
  });

  const [userRole, setUserRole] = useState<UserRole>('director'); // Default to Director to test the Director view immediately
  const [currentView, setCurrentView] = useState<'transactions' | 'report' | 'employees' | 'archivist-studio'>('transactions');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
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

  // Sync employees to local storage
  useEffect(() => {
    try {
      localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
    } catch {
      // ignore
    }
  }, [employees]);

  // Helper to ensure any employee mentioned in a transaction exists in the employees registry
  const registerEmployeeIfNew = (employeeName?: string, department?: string, date?: string) => {
    if (!employeeName || !employeeName.trim()) return;
    const cleanName = employeeName.trim();

    setEmployees((prev) => {
      const exists = prev.some(
        (emp) => emp.name.trim().toLowerCase() === cleanName.toLowerCase()
      );
      if (exists) return prev;

      const newEmp: Employee = {
        id: `emp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: cleanName,
        title: 'منتسب',
        department: department || 'شعبة الذاتية والإدارية',
        badgeNumber: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        joinedDate: date || new Date().toISOString().split('T')[0],
      };
      return [...prev, newEmp];
    });
  };

  // Add new employee directly from Employees View
  const handleAddEmployee = (newEmp: Omit<Employee, 'id'>) => {
    const fullEmp: Employee = {
      ...newEmp,
      id: `emp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    setEmployees((prev) => [fullEmp, ...prev]);
  };

  // Update existing employee in registry & sync to transactions if name changed
  const handleUpdateEmployee = (updatedEmp: Employee, oldName?: string) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === updatedEmp.id ? updatedEmp : emp))
    );
    if (oldName && oldName.trim() !== updatedEmp.name.trim()) {
      // Sync any transactions that referenced the old name to the new updated name
      setTransactions((prev) =>
        prev.map((t) =>
          t.employeeName?.trim() === oldName.trim()
            ? { ...t, employeeName: updatedEmp.name.trim() }
            : t
        )
      );
    }
  };

  // Delete employee from registry
  const handleDeleteEmployee = (empId: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== empId));
  };

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
    if (newTr.employeeName) {
      registerEmployeeIfNew(newTr.employeeName, newTr.entity, newTr.date);
    } else if (newTr.category === 'منتسبين' && newTr.entity) {
      registerEmployeeIfNew(newTr.entity, 'شعبة الذاتية والإدارية', newTr.date);
    }
  };

  // Save entire transaction updates (fields, attachments, edits)
  const handleSaveTransaction = (updatedTr: Transaction) => {
    setTransactions((prev) =>
      prev.map((item) => (item.id === updatedTr.id ? updatedTr : item))
    );
    if (updatedTr.employeeName) {
      registerEmployeeIfNew(updatedTr.employeeName, updatedTr.entity, updatedTr.date);
    } else if (updatedTr.category === 'منتسبين' && updatedTr.entity) {
      registerEmployeeIfNew(updatedTr.entity, 'شعبة الذاتية والإدارية', updatedTr.date);
    }
    if (selectedTransaction && selectedTransaction.id === updatedTr.id) {
      setSelectedTransaction(updatedTr);
    }
    if (editingTransaction && editingTransaction.id === updatedTr.id) {
      setEditingTransaction(updatedTr);
    }
  };

  // Delete transaction permanently
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
    if (selectedTransaction?.id === id) {
      setSelectedTransaction(null);
    }
    if (editingTransaction?.id === id) {
      setEditingTransaction(null);
    }
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
    <div className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 text-[#1c1917] dark:text-stone-100 flex flex-col font-['Tajawal',sans-serif] transition-colors">
      {/* App Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        transactions={transactions}
        userRole={userRole}
        setUserRole={setUserRole}
        onMarkAllAsRead={handleMarkAllAsRead}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
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
            onEditTransaction={(tr) => setEditingTransaction(tr)}
            onDeleteTransaction={handleDeleteTransaction}
            onNavigateToStudio={() => setCurrentView('archivist-studio')}
          />
        )}

        {currentView === 'archivist-studio' && (
          <ArchivistStudioView
            transactions={transactions}
            employees={employees}
            onSaveTransaction={handleSaveTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenNewModal={() => setIsNewModalOpen(true)}
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
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            userRole={userRole}
          />
        )}
      </main>

      {/* Modals */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onUpdateStatus={handleUpdateStatus}
          onToggleReadStatus={() => handleToggleReadStatus(selectedTransaction.id)}
          onUpdateAttachments={handleUpdateAttachments}
        />
      )}

      {/* Full Comprehensive Archivist Editor Modal */}
      {editingTransaction && (
        <ArchivistEditorModal
          isOpen={true}
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSaveTransaction={handleSaveTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          employees={employees.map((e) => e.name)}
          onOpenLightbox={(att, atts, idx) => {
            if (editingTransaction) {
              setDirectAttachmentView({
                transaction: { ...editingTransaction, attachments: atts },
                attachmentIndex: idx,
              });
            }
          }}
        />
      )}

      {isNewModalOpen && (
        <NewTransactionModal
          isOpen={true}
          onClose={() => setIsNewModalOpen(false)}
          onAddTransaction={handleAddTransaction}
          employees={employees.map((e) => e.name)}
        />
      )}

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
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 py-4 px-6 text-center text-xs text-stone-500 dark:text-stone-400">
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
