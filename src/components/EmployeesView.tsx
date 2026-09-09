import React, { useState } from 'react';
import { Users, User, FileText, ChevronLeft, ArrowLeft, Search, Calendar, Tag } from 'lucide-react';
import { Employee, Transaction } from '../types';

interface EmployeesViewProps {
  employees: Employee[];
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  transactions,
  onSelectTransaction,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(employees[0]?.id || null);
  const [searchEmp, setSearchEmp] = useState('');

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchEmp.toLowerCase()) ||
    emp.title.toLowerCase().includes(searchEmp.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchEmp.toLowerCase())
  );

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  // Find all transactions linked to this employee
  const linkedTransactions = transactions.filter(
    (t) => t.employeeName && selectedEmployee && t.employeeName.includes(selectedEmployee.name.split(' ')[0])
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900">
              سجل ملفات المنتسبين والربط الإداري
            </h2>
            <p className="text-xs text-stone-500">
              استعراض سجل كل منتسب مع كافة الكتب والإجازات والمعاملات المرتبطة به
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث باسم المنتسب..."
            value={searchEmp}
            onChange={(e) => setSearchEmp(e.target.value)}
            className="w-full pr-8 pl-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-800 outline-hidden"
          />
        </div>
      </div>

      {/* Main Grid: Left is Employee Details & Records, Right is Employee List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Employee Directory List */}
        <div className="md:col-span-4 bg-white rounded-xl border border-stone-200 p-3 shadow-xs space-y-2">
          <span className="text-xs font-bold text-stone-500 px-2 block mb-2">
            قائمة المنتسبين ({filteredEmployees.length})
          </span>

          <div className="space-y-1">
            {filteredEmployees.map((emp) => {
              const count = transactions.filter(
                (t) => t.employeeName && t.employeeName.includes(emp.name.split(' ')[0])
              ).length;

              const isSelected = emp.id === selectedEmployeeId;

              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => setSelectedEmployeeId(emp.id)}
                  className={`w-full text-right p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-stone-50/70 hover:bg-stone-100 text-stone-800 border-stone-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-xs">{emp.name}</p>
                    <p className={`text-[11px] ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                      {emp.title} • {emp.department}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-stone-800 text-amber-300' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {count} معاملات
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Employee Records */}
        <div className="md:col-span-8 bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          {selectedEmployee ? (
            <>
              {/* Header Info */}
              <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center font-bold text-lg">
                    <User className="w-6 h-6 text-stone-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900">
                      {selectedEmployee.name}
                    </h3>
                    <p className="text-xs text-stone-500">
                      العنوان: {selectedEmployee.title} | الشعبة: {selectedEmployee.department}
                    </p>
                  </div>
                </div>

                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  ملف نشط بالذاتية
                </span>
              </div>

              {/* Linked Transactions Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-stone-500" />
                    المعاملات والكتب المرتبطة بهذا المنتسب ({linkedTransactions.length})
                  </h4>
                  <span className="text-[11px] text-stone-400">
                    مفصولة ومستقلة إدارياً عن المعاملات المالية
                  </span>
                </div>

                {linkedTransactions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                    لا توجد معاملات مسجلة حالياً مرتبطة بهذا المنتسب في النظام التجريبي
                  </div>
                ) : (
                  <div className="space-y-2">
                    {linkedTransactions.map((tr) => (
                      <div
                        key={tr.id}
                        onClick={() => onSelectTransaction(tr)}
                        className="p-3.5 rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-amber-50/40 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="font-bold font-mono text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded text-[11px]">
                              {tr.number}
                            </span>
                            <span className="text-stone-400">• {tr.date}</span>
                            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium text-[10px]">
                              {tr.subType}
                            </span>
                            <span className="text-stone-500 text-[11px]">
                              الجهة: {tr.entity}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-stone-800">
                            {tr.subject}
                          </p>
                        </div>

                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border whitespace-nowrap ${
                            tr.status === 'جديد'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : tr.status === 'قيد الإنجاز'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {tr.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-xs text-stone-400">
              اختر منتسباً من القائمة لعرض سجلاته
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
