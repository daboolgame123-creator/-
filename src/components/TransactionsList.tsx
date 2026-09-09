import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Paperclip, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Building2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw,
  SlidersHorizontal
} from 'lucide-react';
import { Transaction, TransactionStatus, TransactionCategory, TransactionDirection } from '../types';

interface TransactionsListProps {
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
  onUpdateStatus: (id: string, status: TransactionStatus) => void;
  onOpenNewModal: () => void;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  onSelectTransaction,
  onUpdateStatus,
  onOpenNewModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('الكل');
  const [categoryFilter, setCategoryFilter] = useState<string>('الكل');
  const [directionFilter, setDirectionFilter] = useState<string>('الكل');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      // Search across multiple fields
      const matchesSearch =
        searchTerm.trim() === '' ||
        item.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sequence.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.employeeName && item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filters
      const matchesStatus = statusFilter === 'الكل' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'الكل' || item.category === categoryFilter;
      const matchesDirection = directionFilter === 'الكل' || item.direction === directionFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesDirection;
    });
  }, [transactions, searchTerm, statusFilter, categoryFilter, directionFilter]);

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="search-transactions"
              placeholder="ابحث بالعدد، أو الجهة، أو المضمون، أو اسم المنتسب، أو نوع المعاملة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-stone-200 text-xs sm:text-sm bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-stone-800 focus:border-stone-800 outline-hidden transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                مسح
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Reset Filters */}
            {(statusFilter !== 'الكل' || categoryFilter !== 'الكل' || directionFilter !== 'الكل') && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('الكل');
                  setCategoryFilter('الكل');
                  setDirectionFilter('الكل');
                }}
                className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 px-2.5 py-2 rounded-lg border border-stone-200 bg-stone-50"
              >
                <RefreshCcw className="w-3 h-3" /> إعادة تعيين
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100 text-xs">
          <span className="text-stone-400 font-medium flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> تصفية سريعة:
          </span>

          {/* Status Filter */}
          <div className="inline-flex rounded-md border border-stone-200 bg-stone-50 p-0.5">
            {['الكل', 'جديد', 'قيد الإنجاز', 'مكتمل'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="inline-flex rounded-md border border-stone-200 bg-stone-50 p-0.5">
            {['الكل', 'إدارية', 'مالية', 'منتسبين'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Direction Filter */}
          <div className="inline-flex rounded-md border border-stone-200 bg-stone-50 p-0.5">
            {['الكل', 'صادر', 'وارد', 'داخلي'].map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => setDirectionFilter(dir)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  directionFilter === dir
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {dir}
              </button>
            ))}
          </div>

          <span className="mr-auto text-[11px] text-stone-400">
            تم العثور على <strong className="text-stone-700">{filteredTransactions.length}</strong> معاملة
          </span>
        </div>
      </div>

      {/* Transactions Table / Cards */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <AlertCircle className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-sm font-semibold text-stone-700">لا توجد معاملات مطابقة للبحث</h3>
            <p className="text-xs text-stone-500">
              جرّب تغيير كلمات البحث أو إعادة تعيين الفلاتر
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-600 font-semibold">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">التسلسل</th>
                  <th className="py-3 px-4">العدد والتاريخ</th>
                  <th className="py-3 px-4">الجهة ونوع المعاملة</th>
                  <th className="py-3 px-4">المضمون والارتباط</th>
                  <th className="py-3 px-4 text-center">المرفقات</th>
                  <th className="py-3 px-4 text-center">حالة الإنجاز</th>
                  <th className="py-3 px-4 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredTransactions.map((tr) => {
                  return (
                    <tr
                      key={tr.id}
                      className="hover:bg-amber-50/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectTransaction(tr)}
                    >
                      {/* Sequence */}
                      <td className="py-3.5 px-4 text-center text-stone-400 font-mono text-xs">
                        {tr.sequence}
                      </td>

                      {/* Number & Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-stone-900 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-800 text-[11px] font-mono">
                            {tr.number}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              tr.direction === 'صادر'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                : tr.direction === 'وارد'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {tr.direction}
                          </span>
                        </div>
                        <div className="text-stone-400 text-[11px] mt-0.5">
                          {tr.date}
                        </div>
                      </td>

                      {/* Entity & Type */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-800 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-stone-400" />
                          <span>{tr.entity}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium">
                            {tr.subType}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            (قسم {tr.category})
                          </span>
                        </div>
                      </td>

                      {/* Subject & Employee */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        <p className="text-stone-800 font-medium line-clamp-2 leading-relaxed">
                          {tr.subject}
                        </p>
                        {tr.employeeName && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <User className="w-3 h-3 text-emerald-600" />
                            <span>المنتسب: {tr.employeeName}</span>
                          </div>
                        )}
                      </td>

                      {/* Attachments */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-stone-100 text-stone-600 text-[11px] font-medium">
                          <Paperclip className="w-3 h-3 text-stone-400" />
                          {tr.attachments.length} مرفق
                        </span>
                      </td>

                      {/* Status with quick switcher */}
                      <td 
                        className="py-3.5 px-4 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={tr.status}
                          onChange={(e) => onUpdateStatus(tr.id, e.target.value as TransactionStatus)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border outline-hidden transition-colors cursor-pointer ${
                            tr.status === 'جديد'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : tr.status === 'قيد الإنجاز'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <option value="جديد">جديد</option>
                          <option value="قيد الإنجاز">قيد الإنجاز</option>
                          <option value="مكتمل">مكتمل</option>
                        </select>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectTransaction(tr)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-700 transition-colors font-medium text-[11px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          عرض ومتابعة
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
