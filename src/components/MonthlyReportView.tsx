import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  FolderTree, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Download, 
  ChevronLeft, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  Briefcase, 
  Users,
  Eye
} from 'lucide-react';
import { Transaction } from '../types';

interface MonthlyReportViewProps {
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  transactions,
  onSelectTransaction,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [activeTab, setActiveTab] = useState<'all' | 'administrative' | 'financial' | 'personnel' | 'outgoing' | 'incoming'>('all');

  // Filter transactions by selected month
  const monthTransactions = transactions.filter((t) => t.month === selectedMonth);

  // Groupings
  const administrativeTrs = monthTransactions.filter((t) => t.category === 'إدارية');
  const financialTrs = monthTransactions.filter((t) => t.category === 'مالية');
  const personnelTrs = monthTransactions.filter((t) => t.category === 'منتسبين');
  const outgoingTrs = monthTransactions.filter((t) => t.direction === 'صادر');
  const incomingTrs = monthTransactions.filter((t) => t.direction === 'وارد');

  // Counts & stats
  const total = monthTransactions.length;
  const completed = monthTransactions.filter((t) => t.status === 'مكتمل').length;
  const inProgress = monthTransactions.filter((t) => t.status === 'قيد الإنجاز').length;
  const newCount = monthTransactions.filter((t) => t.status === 'جديد').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Decide which list to show
  let displayedList = monthTransactions;
  let sectionTitle = 'كافة معاملات الشهر';
  if (activeTab === 'administrative') {
    displayedList = administrativeTrs;
    sectionTitle = 'المعاملات الإدارية (إيفادات، تكاليف، أوامر...)';
  } else if (activeTab === 'financial') {
    displayedList = financialTrs;
    sectionTitle = 'المعاملات المالية (صرف مستحقات، سلف...)';
  } else if (activeTab === 'personnel') {
    displayedList = personnelTrs;
    sectionTitle = 'معاملات شؤون المنتسبين (إجازات، مباشرة، انفكاك...)';
  } else if (activeTab === 'outgoing') {
    displayedList = outgoingTrs;
    sectionTitle = 'الكتب الصادرة من المركز';
  } else if (activeTab === 'incoming') {
    displayedList = incomingTrs;
    sectionTitle = 'الكتب الواردة إلى المركز';
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900">
              ملف التقرير الشهري المنظم
            </h2>
            <p className="text-xs text-stone-500">
              تجميع إحصائي وتفصيلي تفاعلي مصنف لجميع الكتب والمعاملات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Month selector */}
          <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 text-xs">
            <Calendar className="w-4 h-4 text-stone-500" />
            <span className="font-semibold text-stone-700">شهر التقرير:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-bold text-stone-900 outline-hidden cursor-pointer"
            >
              <option value="2026-08">آب (أغسطس) 2026</option>
              <option value="2026-07">تموز (يوليو) 2026</option>
              <option value="2026-09">أيلول (سبتمبر) 2026</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-stone-600" />
            طباعة التقرير
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs font-medium text-stone-500 block mb-1">إجمالي المعاملات</span>
          <div className="text-2xl font-bold text-stone-900">{total}</div>
          <span className="text-[11px] text-stone-400 mt-1 block">خلال شهر آب 2026</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs font-medium text-emerald-600 block mb-1">المعاملات المكتملة</span>
          <div className="text-2xl font-bold text-emerald-700">{completed}</div>
          <span className="text-[11px] text-stone-400 mt-1 block">بنسبة إنجاز {completionRate}%</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs font-medium text-amber-600 block mb-1">قيد الإنجاز للمتابعة</span>
          <div className="text-2xl font-bold text-amber-700">{inProgress}</div>
          <span className="text-[11px] text-stone-400 mt-1 block">تتطلب استكمال الإجراء</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs font-medium text-blue-600 block mb-1">الكتب الصادرة والواردة</span>
          <div className="text-lg font-bold text-stone-900 flex items-center gap-2 mt-1">
            <span className="text-indigo-600">{outgoingTrs.length} صادر</span>
            <span className="text-stone-300">/</span>
            <span className="text-amber-600">{incomingTrs.length} وارد</span>
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">حركة المراسلات الرسمية</span>
        </div>
      </div>

      {/* Interactive Dossier Tree Navigation */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-stone-600" />
            شجرة التقرير الشهري (اختر الباب للاستعراض):
          </h3>
          <span className="text-xs text-stone-400">انقر على أي قسم لفرز المعاملات المرتبطة به</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`p-3 rounded-lg border text-right transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            <div className="font-bold mb-1 flex items-center justify-between">
              <span>كافة الأقسام</span>
              <span className="text-[11px] font-normal opacity-80">({total})</span>
            </div>
            <p className="text-[11px] opacity-75">المعاملات الإجمالية</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('administrative')}
            className={`p-3 rounded-lg border text-right transition-all cursor-pointer ${
              activeTab === 'administrative'
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            <div className="font-bold mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-amber-400" /> الإدارية
              </span>
              <span className="text-[11px] font-normal opacity-80">({administrativeTrs.length})</span>
            </div>
            <p className="text-[11px] opacity-75">إيفادات، تكاليف، أوامر</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('financial')}
            className={`p-3 rounded-lg border text-right transition-all cursor-pointer ${
              activeTab === 'financial'
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            <div className="font-bold mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> المالية
              </span>
              <span className="text-[11px] font-normal opacity-80">({financialTrs.length})</span>
            </div>
            <p className="text-[11px] opacity-75">صرف مستحقات، سلف</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('personnel')}
            className={`p-3 rounded-lg border text-right transition-all cursor-pointer ${
              activeTab === 'personnel'
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            <div className="font-bold mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-400" /> المنتسبين
              </span>
              <span className="text-[11px] font-normal opacity-80">({personnelTrs.length})</span>
            </div>
            <p className="text-[11px] opacity-75">إجازات، مباشرة، انفكاك</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('outgoing')}
            className={`p-3 rounded-lg border text-right transition-all cursor-pointer ${
              activeTab === 'outgoing'
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            <div className="font-bold mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" /> الصادر
              </span>
              <span className="text-[11px] font-normal opacity-80">({outgoingTrs.length})</span>
            </div>
            <p className="text-[11px] opacity-75">المخاطبات إلى الخارج</p>
          </button>
        </div>
      </div>

      {/* Breakdown List for the Selected Branch */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <h4 className="text-xs font-bold text-stone-800">
            {sectionTitle} ({displayedList.length} سجلات)
          </h4>
          <span className="text-xs text-stone-400">
            تنسيق رسمي معد للمدير ومسؤول الذاتية
          </span>
        </div>

        {displayedList.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400">
            لا توجد معاملات مسجلة في هذا الباب لشهر {selectedMonth}
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {displayedList.map((tr) => (
              <div
                key={tr.id}
                onClick={() => onSelectTransaction(tr)}
                className="p-4 hover:bg-amber-50/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-bold font-mono text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                      العدد: {tr.number}
                    </span>
                    <span className="text-stone-400">ت: {tr.sequence}</span>
                    <span className="text-stone-400">• {tr.date}</span>
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium text-[10px]">
                      {tr.subType}
                    </span>
                    <span className="text-stone-500 font-medium">
                      إلى/من: {tr.entity}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-stone-800">
                    {tr.subject}
                  </p>

                  {tr.employeeName && (
                    <p className="text-[11px] text-emerald-700">
                      المنتسب المعني: {tr.employeeName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                      tr.status === 'جديد'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : tr.status === 'قيد الإنجاز'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
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
                    className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-900 hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
