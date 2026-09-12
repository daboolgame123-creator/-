import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Plus, 
  FileText, 
  Printer, 
  Search, 
  Users, 
  Clock, 
  Send, 
  Paperclip, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Filter, 
  Download,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { Transaction, DailySituationData, DailySituationEntry } from '../types';
import { DailySituationDocumentModal } from './DailySituationDocumentModal';

interface DailySituationsViewProps {
  transactions: Transaction[];
  onSelectTransaction?: (transaction: Transaction) => void;
  onOpenNewDailySituation: () => void;
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onViewAttachment?: (transaction: Transaction, index: number) => void;
}

export const DailySituationsView: React.FC<DailySituationsViewProps> = ({
  transactions,
  onSelectTransaction,
  onOpenNewDailySituation,
  onEditTransaction,
  onDeleteTransaction,
  onViewAttachment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [activePreviewDoc, setActivePreviewDoc] = useState<Transaction | null>(null);

  // Filter transactions that are daily situations
  const dailySituationTransactions = useMemo(() => {
    return transactions.filter(
      (t) => t.isDailySituation === true || t.subType === 'موقف يومي' || Boolean(t.dailySituationData)
    ).sort((a, b) => {
      const dateA = a.dailySituationData?.situationDate || a.date;
      const dateB = b.dailySituationData?.situationDate || b.date;
      return dateB.localeCompare(dateA);
    });
  }, [transactions]);

  // Extract all unique dates available
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    dailySituationTransactions.forEach((t) => {
      const d = t.dailySituationData?.situationDate || t.date;
      if (d) dates.add(d);
    });
    return Array.from(dates).sort().reverse();
  }, [dailySituationTransactions]);

  // Filtered by date & search query
  const filteredSituations = useMemo(() => {
    return dailySituationTransactions.filter((t) => {
      const situationDate = t.dailySituationData?.situationDate || t.date;
      if (selectedDateFilter && situationDate !== selectedDateFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const data = t.dailySituationData;
        const inSubject = t.subject.toLowerCase().includes(q);
        const inNumber = t.number.toLowerCase().includes(q);

        // Search in all entries' employee names & details
        const inEntries = data ? (
          data.permanentLeaves?.some((e) => e.employeeName.toLowerCase().includes(q) || e.details.toLowerCase().includes(q)) ||
          data.permanentTimePermissions?.some((e) => e.employeeName.toLowerCase().includes(q) || e.details.toLowerCase().includes(q)) ||
          data.permanentShiftChanges?.some((e) => e.employeeName.toLowerCase().includes(q) || e.details.toLowerCase().includes(q)) ||
          data.temporaryLeaves?.some((e) => e.employeeName.toLowerCase().includes(q) || e.details.toLowerCase().includes(q)) ||
          data.temporaryTimePermissions?.some((e) => e.employeeName.toLowerCase().includes(q) || e.details.toLowerCase().includes(q)) ||
          data.temporaryShiftChanges?.some((e) => e.employeeName.toLowerCase().includes(q) || e.details.toLowerCase().includes(q))
        ) : false;

        return inSubject || inNumber || inEntries;
      }

      return true;
    });
  }, [dailySituationTransactions, selectedDateFilter, searchQuery]);

  // Statistics calculation across all daily situations
  const stats = useMemo(() => {
    let totalLeaves = 0;
    let totalTimePermissions = 0;
    let totalMissionsAndShifts = 0;
    const recordedEmployees = new Set<string>();

    dailySituationTransactions.forEach((t) => {
      const d = t.dailySituationData;
      if (d) {
        const permLeaves = d.permanentLeaves?.length || 0;
        const tempLeaves = d.temporaryLeaves?.length || 0;
        totalLeaves += (permLeaves + tempLeaves);

        const permTimes = d.permanentTimePermissions?.length || 0;
        const tempTimes = d.temporaryTimePermissions?.length || 0;
        totalTimePermissions += (permTimes + tempTimes);

        const permShifts = d.permanentShiftChanges?.length || 0;
        const tempShifts = d.temporaryShiftChanges?.length || 0;
        totalMissionsAndShifts += (permShifts + tempShifts);

        [
          ...(d.permanentLeaves || []),
          ...(d.permanentTimePermissions || []),
          ...(d.permanentShiftChanges || []),
          ...(d.temporaryLeaves || []),
          ...(d.temporaryTimePermissions || []),
          ...(d.temporaryShiftChanges || []),
        ].forEach((e) => {
          if (e.employeeName) recordedEmployees.add(e.employeeName.trim());
        });
      }
    });

    return {
      totalSituations: dailySituationTransactions.length,
      totalLeaves,
      totalTimePermissions,
      totalMissionsAndShifts,
      uniqueEmployeesCount: recordedEmployees.size,
    };
  }, [dailySituationTransactions]);

  return (
    <div className="space-y-5" dir="rtl">
      {/* Top Banner and Navigation Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700/50 flex items-center justify-center font-bold text-xl shadow-2xs">
            📋
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                سجل الموقف اليومي لمنتسبي المركز
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50">
                النموذج الرسمي المعتمد 2026
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              متابعة يومية لإجازات المنتسبين الدائميين والمكافأة، الساعات الزمنية، وتحويلات الدوام والإيفادات
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenNewDailySituation}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-amber-400 text-white dark:text-stone-950 text-xs sm:text-sm font-bold hover:bg-stone-800 dark:hover:bg-amber-300 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-400 dark:text-stone-950" />
          <span>+ تنظيم موقف يومي جديد</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span>المواقف المؤرشفة</span>
            <Calendar className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
            {stats.totalSituations}
          </div>
          <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
            استمارة موقف يومي معتمدة
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span>إجمالي الإجازات</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {stats.totalLeaves}
          </div>
          <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
            إجازات دائمية ومكافأة/أجر
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span>الساعات الزمنية</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400">
            {stats.totalTimePermissions}
          </div>
          <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
            إذن خروج وزمنيات موثقة
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span>إيفادات وتحويل دوام</span>
            <Briefcase className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {stats.totalMissionsAndShifts}
          </div>
          <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
            انفكاك أو إيفاد أو دورية
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="بحث باسم المنتسب، الملاحظة، أو رقم القيد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Date Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            <span className="text-stone-600 dark:text-stone-300 font-semibold">تاريخ الموقف:</span>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="bg-transparent font-bold text-stone-900 dark:text-stone-100 outline-hidden cursor-pointer"
            >
              <option value="">كافة التواريخ ({dailySituationTransactions.length})</option>
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {selectedDateFilter && (
            <button
              type="button"
              onClick={() => setSelectedDateFilter('')}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline px-1 cursor-pointer"
            >
              إلغاء التصفية
            </button>
          )}
        </div>
      </div>

      {/* Daily Situations List */}
      {filteredSituations.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 text-2xl">
            📋
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-1">
            لا توجد استمارات موقف يومي مسجلة تطابق البحث
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-4">
            يمكنك إدخال استمارة الموقف اليومي لمنتسبي المركز الآن وتوثيق كافة الإجازات والساعات الزمنية والإيفادات.
          </p>
          <button
            type="button"
            onClick={onOpenNewDailySituation}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 dark:bg-amber-400 text-white dark:text-stone-950 text-xs font-bold hover:bg-stone-800 dark:hover:bg-amber-300 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400 dark:text-stone-950" />
            <span>تنظيم موقف يومي جديد</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSituations.map((tr) => {
            const data: DailySituationData | undefined = tr.dailySituationData;
            const dateStr = data?.situationDate || tr.date;
            
            const permLeaves = data?.permanentLeaves || [];
            const permTimes = data?.permanentTimePermissions || [];
            const permShifts = data?.permanentShiftChanges || [];
            const tempLeaves = data?.temporaryLeaves || [];
            const tempTimes = data?.temporaryTimePermissions || [];
            const tempShifts = data?.temporaryShiftChanges || [];

            const totalEntries = 
              permLeaves.length + 
              permTimes.length + 
              permShifts.length + 
              tempLeaves.length + 
              tempTimes.length + 
              tempShifts.length;

            return (
              <div
                key={tr.id}
                className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Header Row */}
                <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                      📋
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                          {tr.subject || `الموقف اليومي لمنتسبي المركز بتاريخ ${dateStr}`}
                        </h3>
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-300/60">
                          بتاريخ: {dateStr}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-1 flex-wrap">
                        <span>العدد: <strong className="font-mono text-stone-700 dark:text-stone-300">{tr.number}</strong></span>
                        <span>•</span>
                        <span>القيد: <strong className="font-mono text-stone-700 dark:text-stone-300">{tr.sequence}</strong></span>
                        <span>•</span>
                        <span>الجهة: {data?.departmentName || tr.entity || 'مركز الدراسات الافريقية'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setActivePreviewDoc(tr)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-amber-400 text-white dark:text-stone-950 text-xs font-bold hover:bg-stone-800 dark:hover:bg-amber-300 transition-colors shadow-2xs cursor-pointer active:scale-95"
                      title="عرض الاستمارة الرسمية كما وردت في كتاب المركز وطباعتها أصولياً"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>عرض الاستمارة والطباعة 🖨️</span>
                    </button>

                    {onEditTransaction && (
                      <button
                        type="button"
                        onClick={() => onEditTransaction(tr)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
                        title="تعديل بيانات الموقف اليومي"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
                        <span>تعديل</span>
                      </button>
                    )}

                    {onDeleteTransaction && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('هل أنت متأكد من حذف استمارة هذا الموقف اليومي؟')) {
                            onDeleteTransaction(tr.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                        title="حذف الموقف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Body: Division Summary Badges & Quick Table */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Category Counts Chips */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
                      إجازات دائمية: <strong>{permLeaves.length}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-semibold">
                      ساعات دائمي: <strong>{permTimes.length}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold">
                      تحويل/إيفاد دائمي: <strong>{permShifts.length}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold">
                      إجازات مكافأة/أجر: <strong>{tempLeaves.length}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold">
                      ساعات مكافأة/أجر: <strong>{tempTimes.length}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800 font-semibold">
                      تحويل/إيفاد مكافأة/أجر: <strong>{tempShifts.length}</strong>
                    </span>
                  </div>

                  {/* Summary of items inside this daily situation */}
                  {totalEntries > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Section 1: الدائمي */}
                      <div className="bg-stone-50 dark:bg-stone-800/40 rounded-lg p-3 border border-stone-200/80 dark:border-stone-800 space-y-2">
                        <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-1.5">
                          <span>الموقف اليومي (للمنتسب الدائم)</span>
                          <span className="text-[11px] text-stone-500 font-mono">
                            ({permLeaves.length + permTimes.length + permShifts.length}) قيود
                          </span>
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {permLeaves.map((l, i) => (
                            <div key={`pl-${i}`} className="flex items-center justify-between gap-2 p-1.5 rounded bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700/60">
                              <span className="font-bold text-stone-900 dark:text-stone-200">{l.employeeName}</span>
                              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded font-medium">
                                إجازة: {l.details}
                              </span>
                            </div>
                          ))}
                          {permTimes.map((t, i) => (
                            <div key={`pt-${i}`} className="flex items-center justify-between gap-2 p-1.5 rounded bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700/60">
                              <span className="font-bold text-stone-900 dark:text-stone-200">{t.employeeName}</span>
                              <span className="text-[11px] text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded font-medium">
                                زمنية: {t.details}
                              </span>
                            </div>
                          ))}
                          {permShifts.map((s, i) => (
                            <div key={`ps-${i}`} className="flex items-center justify-between gap-2 p-1.5 rounded bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700/60">
                              <span className="font-bold text-stone-900 dark:text-stone-200">{s.employeeName}</span>
                              <span className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded font-medium">
                                تحويل/إيفاد: {s.details}
                              </span>
                            </div>
                          ))}
                          {permLeaves.length === 0 && permTimes.length === 0 && permShifts.length === 0 && (
                            <div className="text-center text-stone-400 text-[11px] py-1">
                              لا توجد قيود مسجلة للمنتسب الدائم بهذا اليوم
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Section 2: المكافأة والأجر والمتطوع */}
                      <div className="bg-stone-50 dark:bg-stone-800/40 rounded-lg p-3 border border-stone-200/80 dark:border-stone-800 space-y-2">
                        <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-1.5">
                          <span>منتسبو المكافأة والأجر اليومي والمتطوع</span>
                          <span className="text-[11px] text-stone-500 font-mono">
                            ({tempLeaves.length + tempTimes.length + tempShifts.length}) قيود
                          </span>
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {tempLeaves.map((l, i) => (
                            <div key={`tl-${i}`} className="flex items-center justify-between gap-2 p-1.5 rounded bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700/60">
                              <span className="font-bold text-stone-900 dark:text-stone-200">{l.employeeName}</span>
                              <span className="text-[11px] text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded font-medium">
                                إجازة: {l.details}
                              </span>
                            </div>
                          ))}
                          {tempTimes.map((t, i) => (
                            <div key={`tt-${i}`} className="flex items-center justify-between gap-2 p-1.5 rounded bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700/60">
                              <span className="font-bold text-stone-900 dark:text-stone-200">{t.employeeName}</span>
                              <span className="text-[11px] text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded font-medium">
                                زمنية: {t.details}
                              </span>
                            </div>
                          ))}
                          {tempShifts.map((s, i) => (
                            <div key={`ts-${i}`} className="flex items-center justify-between gap-2 p-1.5 rounded bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700/60">
                              <span className="font-bold text-stone-900 dark:text-stone-200">{s.employeeName}</span>
                              <span className="text-[11px] text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded font-medium">
                                انفكاك/إيفاد: {s.details}
                              </span>
                            </div>
                          ))}
                          {tempLeaves.length === 0 && tempTimes.length === 0 && tempShifts.length === 0 && (
                            <div className="text-center text-stone-400 text-[11px] py-1">
                              لا توجد قيود مسجلة لمنتسبي المكافأة بهذا اليوم
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-stone-500 dark:text-stone-400 italic bg-stone-50 dark:bg-stone-800/40 p-2.5 rounded-lg border border-dashed border-stone-200 dark:border-stone-800 text-center">
                      استمارة موقف يومي فارغة (دوام طبيعي كامل دون إجازات أو غيابات مسجلة).
                    </div>
                  )}

                  {/* Attachments Footer */}
                  {tr.attachments && tr.attachments.length > 0 && (
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 font-semibold">
                        <Paperclip className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>الملحقات والمستندات الممسوحة ({tr.attachments.length}):</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {tr.attachments.map((att, idx) => (
                          <button
                            key={att.id}
                            type="button"
                            onClick={() => onViewAttachment?.(tr, idx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-stone-700 dark:text-stone-300 text-[11px] font-medium border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-stone-500" />
                            <span>{att.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Official Sheet Printable Modal */}
      {activePreviewDoc && (
        <DailySituationDocumentModal
          transaction={activePreviewDoc}
          onClose={() => setActivePreviewDoc(null)}
          onViewAttachment={onViewAttachment}
        />
      )}
    </div>
  );
};
