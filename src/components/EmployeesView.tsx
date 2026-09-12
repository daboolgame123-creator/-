import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  User, 
  FileText, 
  Search, 
  Plus, 
  X, 
  CheckCircle2, 
  Building2, 
  Briefcase, 
  Calendar,
  Layers,
  ChevronRight,
  Eye,
  Filter,
  Check,
  Edit3,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Employee, Transaction, UserRole } from '../types';

interface EmployeesViewProps {
  employees: Employee[];
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
  onAddEmployee?: (newEmp: Omit<Employee, 'id'>) => void;
  onUpdateEmployee?: (updatedEmp: Employee, oldName?: string) => void;
  onDeleteEmployee?: (empId: string) => void;
  userRole?: UserRole;
}

// Helper to reliably match an employee name in a transaction with an employee record
export const isEmployeeMatch = (tEmpName?: string, empName?: string): boolean => {
  if (!tEmpName || !empName) return false;
  const clean = (str: string) =>
    str
      .trim()
      .toLowerCase()
      .replace(/^(د\.?|م\.?|السيد|السيدة|المهندس|المهندسة|الأستاذ|الأستاذة)\s+/g, '')
      .replace(/[إأآا]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[\(\)\[\]\{\}]/g, '')
      .replace(/\s+/g, ' ');

  const tClean = clean(tEmpName);
  const eClean = clean(empName);

  if (tClean === eClean) return true;

  const tWords = tClean.split(' ').filter(Boolean);
  const eWords = eClean.split(' ').filter(Boolean);

  if (tWords.length === 0 || eWords.length === 0) return false;

  // Exact full word sequence match
  if (tWords.join(' ') === eWords.join(' ')) return true;

  // If both have at least 2 words: require words 0 and 1 to match
  if (tWords.length >= 2 && eWords.length >= 2) {
    if (tWords[0] === eWords[0] && tWords[1] === eWords[1]) {
      // If both have 3rd word, they MUST also match
      if (tWords.length >= 3 && eWords.length >= 3) {
        return tWords[2] === eWords[2];
      }
      return true;
    }
    return false;
  }

  // If only 1 word each, only match if identical
  return tWords.length === 1 && eWords.length === 1 && tWords[0] === eWords[0];
};

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  transactions,
  onSelectTransaction,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  userRole = 'director',
}) => {
  // Main view mode: Individual Dossiers or Complete Personnel Department Register
  const [activeTab, setActiveTab] = useState<'individual' | 'all-transactions'>('individual');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [searchEmp, setSearchEmp] = useState('');
  const [searchTransactions, setSearchTransactions] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Employee Form State
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('شعبة الذاتية والإدارية');
  const [newBadge, setNewBadge] = useState('');

  // Edit Employee State
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editBadge, setEditBadge] = useState('');

  // Delete Confirmation State
  const [deleteConfirmEmployee, setDeleteConfirmEmployee] = useState<Employee | null>(null);

  // 1. All transactions belonging to Personnel Department (category === 'منتسبين' OR has employeeName)
  const personnelTransactions = useMemo(() => {
    return transactions.filter(
      (t) => t.category === 'منتسبين' || Boolean(t.employeeName && t.employeeName.trim())
    );
  }, [transactions]);

  // 2. Dynamic combined employees list:
  // Combines registered employees + ANY employee from transactions or personnel category
  const allEmployees = useMemo(() => {
    const list: Employee[] = [...employees];

    transactions.forEach((tr) => {
      const nameToTrack =
        tr.employeeName?.trim() ||
        (tr.category === 'منتسبين' && tr.entity && !['عام', 'عام / غير محدد', 'الذاتية'].includes(tr.entity.trim())
          ? tr.entity.trim()
          : null);

      if (nameToTrack) {
        const exists = list.some((emp) => isEmployeeMatch(nameToTrack, emp.name));

        if (!exists) {
          list.push({
            id: `emp-auto-${encodeURIComponent(nameToTrack.replace(/\s+/g, '_'))}`,
            name: nameToTrack,
            title: tr.subType || 'منتسب / موظف',
            department: tr.entity || 'شعبة الذاتية والإدارية',
            badgeNumber: `EMP-${Math.abs(nameToTrack.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0)) % 9000 + 1000}`,
            joinedDate: tr.date || new Date().toISOString().split('T')[0],
          });
        }
      }
    });

    return list;
  }, [employees, transactions]);

  // Set default selection
  useEffect(() => {
    if (allEmployees.length > 0) {
      if (!selectedEmployeeId || !allEmployees.some((e) => e.id === selectedEmployeeId)) {
        setSelectedEmployeeId(allEmployees[0].id);
      }
    }
  }, [allEmployees, selectedEmployeeId]);

  const filteredEmployees = useMemo(() => {
    return allEmployees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchEmp.toLowerCase()) ||
        emp.title.toLowerCase().includes(searchEmp.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchEmp.toLowerCase()) ||
        emp.badgeNumber.toLowerCase().includes(searchEmp.toLowerCase())
    );
  }, [allEmployees, searchEmp]);

  const selectedEmployee = allEmployees.find((e) => e.id === selectedEmployeeId) || allEmployees[0];

  // Find all transactions linked to this selected employee
  const linkedTransactions = useMemo(() => {
    if (!selectedEmployee) return [];
    return transactions.filter(
      (t) =>
        isEmployeeMatch(t.employeeName, selectedEmployee.name) ||
        (t.category === 'منتسبين' && isEmployeeMatch(t.entity, selectedEmployee.name))
    );
  }, [transactions, selectedEmployee]);

  // Filtered personnel transactions for Tab 2
  const filteredPersonnelTransactions = useMemo(() => {
    const q = searchTransactions.trim().toLowerCase();
    if (!q) return personnelTransactions;
    return personnelTransactions.filter(
      (t) =>
        t.number.toLowerCase().includes(q) ||
        t.sequence.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.subType.toLowerCase().includes(q) ||
        t.entity.toLowerCase().includes(q) ||
        (t.employeeName && t.employeeName.toLowerCase().includes(q))
    );
  }, [personnelTransactions, searchTransactions]);

  // Handle Add New Employee
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const trimmedName = newName.trim();
    if (onAddEmployee) {
      onAddEmployee({
        name: trimmedName,
        title: newTitle.trim() || 'منتسب',
        department: newDept.trim() || 'شعبة الذاتية والإدارية',
        badgeNumber: newBadge.trim() || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        joinedDate: new Date().toISOString().split('T')[0],
      });
    }

    setNewName('');
    setNewTitle('');
    setNewBadge('');
    setIsAddModalOpen(false);
  };

  // Start Editing selected employee
  const handleStartEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setEditName(emp.name);
    setEditTitle(emp.title || '');
    setEditDept(emp.department || '');
    setEditBadge(emp.badgeNumber || '');
  };

  // Save Edits to employee
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee || !editName.trim()) return;

    if (onUpdateEmployee) {
      onUpdateEmployee(
        {
          ...editingEmployee,
          name: editName.trim(),
          title: editTitle.trim() || 'منتسب',
          department: editDept.trim() || 'شعبة الذاتية والإدارية',
          badgeNumber: editBadge.trim() || editingEmployee.badgeNumber,
        },
        editingEmployee.name
      );
    }

    setEditingEmployee(null);
  };

  // Confirm Delete of employee
  const handleConfirmDelete = () => {
    if (!deleteConfirmEmployee) return;
    if (onDeleteEmployee) {
      onDeleteEmployee(deleteConfirmEmployee.id);
    }
    const remaining = allEmployees.filter((e) => e.id !== deleteConfirmEmployee.id);
    if (remaining.length > 0) {
      setSelectedEmployeeId(remaining[0].id);
    } else {
      setSelectedEmployeeId(null);
    }
    setDeleteConfirmEmployee(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold shadow-2xs">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>سجل شؤون المنتسبين والملفات الإدارية</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-300/40">
                {allEmployees.length} منتسب مسجل
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-300/40">
                {personnelTransactions.length} كتب ومعاملات
              </span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              أي معاملة تضاف في قسم المنتسبين تظهر هنا تلقائياً وترتبط بالسجل وبملف المنتسب المعني
            </p>
          </div>
        </div>

        {userRole === 'archivist' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-amber-400 hover:bg-stone-800 dark:hover:bg-amber-300 text-amber-300 dark:text-stone-950 text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="تسجيل منتسب جديد في السجل"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة منتسب جديد</span>
            </button>
          </div>
        )}
      </div>

      {/* View Switcher Tabs: Individual Dossiers vs Complete Personnel Register */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('individual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'individual'
              ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4 text-amber-400 dark:text-amber-600" />
          <span>ملفات المنتسبين الفردية (الأضابير)</span>
          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-white/20 dark:bg-stone-900/20">
            {allEmployees.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all-transactions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all-transactions'
              ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-500" />
          <span>سجل كافة معاملات قسم المنتسبين (شامل)</span>
          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300">
            {personnelTransactions.length}
          </span>
        </button>
      </div>

      {/* VIEW 1: Individual Employee Dossiers */}
      {activeTab === 'individual' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Employee Directory List */}
          <div className="md:col-span-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-3 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                قائمة المنتسبين ({filteredEmployees.length})
              </span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500">
                محدث تلقائياً
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث باسم المنتسب أو الشعبة..."
                value={searchEmp}
                onChange={(e) => setSearchEmp(e.target.value)}
                className="w-full pr-8 pl-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:ring-1 focus:ring-amber-500 outline-hidden"
              />
            </div>

            <div className="space-y-1.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {filteredEmployees.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 dark:bg-stone-800/40 rounded-lg border border-dashed border-stone-200 dark:border-stone-800">
                  لا يوجد منتسب مطابق لنتائج البحث
                </div>
              ) : (
                filteredEmployees.map((emp) => {
                  const count = transactions.filter(
                    (t) =>
                      isEmployeeMatch(t.employeeName, emp.name) ||
                      (t.category === 'منتسبين' && isEmployeeMatch(t.entity, emp.name))
                  ).length;
                  const isSelected = emp.id === selectedEmployee?.id;

                  return (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => setSelectedEmployeeId(emp.id)}
                      className={`w-full text-right p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-stone-900 dark:bg-stone-800 text-white border-stone-900 dark:border-amber-400 shadow-xs'
                          : 'bg-stone-50/70 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      <div className="space-y-0.5 truncate">
                        <p className="font-semibold text-xs truncate">{emp.name}</p>
                        <p className={`text-[11px] truncate ${isSelected ? 'text-stone-300 dark:text-stone-400' : 'text-stone-500 dark:text-stone-400'}`}>
                          {emp.title} • {emp.department}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mr-1.5 ${
                          isSelected 
                            ? 'bg-stone-800 dark:bg-stone-700 text-amber-300 ring-1 ring-amber-400/40' 
                            : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {count} معاملات
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Employee Records */}
          <div className="md:col-span-8 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-xs space-y-4">
            {selectedEmployee ? (
              <>
                {/* Header Info */}
                <div className="border-b border-stone-100 dark:border-stone-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-stone-800 dark:text-stone-200 flex items-center justify-center font-bold text-lg shadow-2xs">
                      <User className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                        {selectedEmployee.name}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2 flex-wrap">
                        <span>العنوان الوظيفي: <strong>{selectedEmployee.title}</strong></span>
                        <span>•</span>
                        <span>الجهة / الشعبة: <strong>{selectedEmployee.department}</strong></span>
                        {selectedEmployee.badgeNumber && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.2 rounded text-[11px]">
                              {selectedEmployee.badgeNumber}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {userRole === 'archivist' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>ملف نشط بالذاتية</span>
                      </span>

                      <button
                        type="button"
                        id="btn-edit-employee"
                        onClick={() => handleStartEdit(selectedEmployee)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                        title="تعديل الاسم والبيانات الوظيفية للمنتسب"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>تعديل البيانات</span>
                      </button>

                      <button
                        type="button"
                        id="btn-delete-employee"
                        onClick={() => setDeleteConfirmEmployee(selectedEmployee)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                        title="حذف هذا المنتسب من السجل"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>حذف</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Linked Transactions Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      المعاملات والكتب المرتبطة بهذا المنتسب ({linkedTransactions.length})
                    </h4>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500">
                      اضغط على أي معاملة للاطلاع الفوري على مرفقاتها وتفاصيلها
                    </span>
                  </div>

                  {linkedTransactions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-stone-400 dark:text-stone-500 bg-stone-50 dark:bg-stone-800/40 rounded-lg border border-dashed border-stone-200 dark:border-stone-800 space-y-2">
                      <p className="font-semibold text-stone-600 dark:text-stone-300">لا توجد كتب أو معاملات مسجلة حالياً بهذا الاسم</p>
                      <p className="text-[11px]">عند إضافة أي كتاب جديد أو تعديل معاملة واختيار هذا المنتسب ستظهر هنا فوراً تلقائياً.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {linkedTransactions.map((tr) => (
                        <div
                          key={tr.id}
                          onClick={() => onSelectTransaction(tr)}
                          className="p-3.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 hover:bg-amber-50/40 dark:hover:bg-stone-800/60 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              <span className="font-bold font-mono text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 group-hover:bg-amber-100 dark:group-hover:bg-amber-950 px-1.5 py-0.5 rounded text-[11px]">
                                {tr.number}
                              </span>
                              <span className="text-stone-400 dark:text-stone-500">• {tr.date}</span>
                              <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium text-[10px]">
                                {tr.subType}
                              </span>
                              <span className="text-stone-500 dark:text-stone-400 text-[11px]">
                                الجهة: {tr.entity}
                              </span>
                              {tr.attachments && tr.attachments.length > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800/60">
                                  📎 {tr.attachments.length} مرفقات
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-relaxed">
                              {tr.subject}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border whitespace-nowrap ${
                                tr.status === 'جديد'
                                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                  : tr.status === 'قيد الإنجاز'
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              }`}
                            >
                              {tr.status}
                            </span>
                            <Eye className="w-4 h-4 text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-100" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-xs text-stone-400">
                اختر منتسباً من القائمة الجانبية لعرض أضبارته ومعاملاته
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: Complete Personnel Department Register (All Transactions in Category 'منتسبين') */}
      {activeTab === 'all-transactions' && (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs space-y-4 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>سجل معاملات وكتب قسم شؤون المنتسبين الإجمالي</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-mono font-bold">
                  {filteredPersonnelTransactions.length} معاملة
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                قائمة متكاملة لجميع معاملات المنتسبين (إجازات، أوامر، مباشرات، انفكاك، باجات، كتب إدارية)
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث في معاملات المنتسبين..."
                value={searchTransactions}
                onChange={(e) => setSearchTransactions(e.target.value)}
                className="w-full pr-8 pl-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {filteredPersonnelTransactions.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-400 dark:text-stone-500 space-y-2">
              <p className="font-semibold text-stone-600 dark:text-stone-300">
                لا توجد معاملات مسجلة في قسم المنتسبين
              </p>
              <p className="text-[11px]">
                عند إضافة معاملة وتحديد القسم «شؤون المنتسبين» أو إدخال اسم منتسب ستظهر هنا مباشرة.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredPersonnelTransactions.map((tr) => (
                <div
                  key={tr.id}
                  onClick={() => onSelectTransaction(tr)}
                  className="py-3 px-2 hover:bg-amber-50/40 dark:hover:bg-stone-800/60 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-bold font-mono text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 group-hover:bg-amber-100 dark:group-hover:bg-amber-950 px-2 py-0.5 rounded text-[11px] border border-stone-200 dark:border-stone-700">
                        {tr.number}
                      </span>
                      <span className="text-stone-400 dark:text-stone-500">• {tr.date}</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-semibold text-[10px] border border-blue-200 dark:border-blue-800/60">
                        {tr.subType}
                      </span>
                      <span className="text-stone-500 dark:text-stone-400 text-[11px]">
                        الجهة: {tr.entity}
                      </span>
                      {tr.attachments && tr.attachments.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-bold">
                          📎 {tr.attachments.length} مرفقات
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 leading-relaxed">
                      {tr.subject}
                    </p>

                    {tr.employeeName && (
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>المنتسب المعني: <strong>{tr.employeeName}</strong></span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border whitespace-nowrap ${
                        tr.status === 'جديد'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          : tr.status === 'قيد الإنجاز'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {tr.status}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTransaction(tr);
                      }}
                      className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-900 hover:text-white dark:hover:bg-amber-400 dark:hover:text-stone-950 transition-colors"
                      title="معاينة تفاصيل ومرفقات المعاملة"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Add New Employee */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4"
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                تسجيل منتسب جديد في سجل الذاتية
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  اسم المنتسب الثلاثي واللقب *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد جاسم محمد الشمري"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  العنوان الوظيفي / الرتبة
                </label>
                <input
                  type="text"
                  placeholder="مثال: رئيس أبحاث، م. مهندس، معاون مدير..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  القسم / الشعبة
                </label>
                <input
                  type="text"
                  placeholder="مثال: شعبة الذاتية والإدارية، الحسابات..."
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  الرقم الوظيفي / رقم الباج (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: EMP-2026-44"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-stone-900 dark:bg-amber-400 text-white dark:text-stone-950 font-bold hover:bg-stone-800 dark:hover:bg-amber-300 shadow-xs cursor-pointer"
                >
                  حفظ وتثبيت المنتسب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4"
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  تعديل بيانات المنتسب
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingEmployee(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  الاسم الكامل للمنتسب *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                  سيتم تحديث الاسم تلقائياً في جميع المعاملات والمخاطبات المرتبطة به.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  العنوان الوظيفي / الرتبة
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  القسم / الشعبة
                </label>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  الرقم الوظيفي / رقم الباج
                </label>
                <input
                  type="text"
                  value={editBadge}
                  onChange={(e) => setEditBadge(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-stone-900 dark:bg-amber-400 text-white dark:text-stone-950 font-bold hover:bg-stone-800 dark:hover:bg-amber-300 shadow-xs cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmEmployee && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4"
            dir="rtl"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  تأكيد حذف المنتسب من السجل
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  هل أنت متأكد من رغبتك في حذف المنتسب <strong className="text-rose-700 dark:text-rose-400">"{deleteConfirmEmployee.name}"</strong> من سجل الذاتية؟
                </p>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 pt-1">
                  ملاحظة: لن يتم حذف المعاملات السابقة المقيدة، ولكن ستتم إزالة ملف المنتسب من قائمة السجل.
                </p>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmEmployee(null)}
                className="px-3.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                id="btn-confirm-delete-employee"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
