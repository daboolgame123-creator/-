import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Calendar, 
  Building2, 
  User, 
  Paperclip, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  Tag, 
  Layers, 
  FileSearch,
  ExternalLink
} from 'lucide-react';
import { Transaction, TransactionStatus } from '../types';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: TransactionStatus) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onUpdateStatus,
}) => {
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState<number>(0);

  if (!transaction) return null;

  const currentAttachment = transaction.attachments[selectedAttachmentIndex] || transaction.attachments[0];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
        dir="rtl"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-900 text-amber-300">
                العدد: {transaction.number}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                التسلسل: {transaction.sequence}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                {transaction.direction}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                قسم {transaction.category}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800">
                نوع: {transaction.subType}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 mt-1">
              {transaction.subject}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Transaction Metadata & Status */}
          <div className="lg:col-span-7 space-y-5">
            {/* Status Control Box */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                متابعة حالة المعاملة (الميزة الميدانية)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['جديد', 'قيد الإنجاز', 'مكتمل'] as TransactionStatus[]).map((status) => {
                  const isActive = transaction.status === status;
                  let colorClasses = 'border-stone-200 bg-white text-stone-700 hover:border-stone-300';
                  if (isActive) {
                    if (status === 'جديد') colorClasses = 'border-blue-500 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-400';
                    if (status === 'قيد الإنجاز') colorClasses = 'border-amber-500 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-400';
                    if (status === 'مكتمل') colorClasses = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-400';
                  }

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => onUpdateStatus(transaction.id, status)}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${colorClasses}`}
                    >
                      {status === 'جديد' && <AlertCircle className="w-3.5 h-3.5" />}
                      {status === 'قيد الإنجاز' && <Clock className="w-3.5 h-3.5" />}
                      {status === 'مكتمل' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{status}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
              <div className="p-3 rounded-lg border border-stone-200 bg-white space-y-1">
                <span className="text-xs font-semibold text-stone-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" /> تاريخ الكتاب
                </span>
                <p className="font-semibold text-stone-800">{transaction.date}</p>
                <span className="text-xs text-stone-400">تابع لتقرير شهر {transaction.month}</span>
              </div>

              <div className="p-3 rounded-lg border border-stone-200 bg-white space-y-1">
                <span className="text-xs font-semibold text-stone-400 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-stone-500" /> الجهة المرتبطة
                </span>
                <p className="font-semibold text-stone-800">{transaction.entity}</p>
              </div>

              {transaction.employeeName && (
                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-1 sm:col-span-2">
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-600" /> المنتسب المرتبط بالمعاملة
                  </span>
                  <p className="font-bold text-stone-900">{transaction.employeeName}</p>
                  <span className="text-xs text-stone-500">
                    يمكنك استعراض كامل ملفات هذا المنتسب من تبويب «سجل المنتسبين»
                  </span>
                </div>
              )}
            </div>

            {/* Specific Dynamic Details (If Any) */}
            {transaction.specificDetails && Object.keys(transaction.specificDetails).length > 0 && (
              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                <span className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-stone-500" />
                  بيانات تفصيلية خاصة بنوع ({transaction.subType}):
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {transaction.specificDetails.destination && (
                    <div>
                      <span className="text-stone-400 block">وجهة الإيفاد:</span>
                      <span className="font-semibold text-stone-800">{transaction.specificDetails.destination}</span>
                    </div>
                  )}
                  {transaction.specificDetails.vehicle && (
                    <div>
                      <span className="text-stone-400 block">العجلة المخصصة:</span>
                      <span className="font-semibold text-stone-800">{transaction.specificDetails.vehicle}</span>
                    </div>
                  )}
                  {transaction.specificDetails.purpose && (
                    <div className="col-span-2">
                      <span className="text-stone-400 block">الغرض:</span>
                      <span className="font-semibold text-stone-800">{transaction.specificDetails.purpose}</span>
                    </div>
                  )}
                  {transaction.specificDetails.amount && (
                    <div>
                      <span className="text-stone-400 block">المبلغ المالي:</span>
                      <span className="font-semibold text-emerald-700">{transaction.specificDetails.amount}</span>
                    </div>
                  )}
                  {transaction.specificDetails.leaveDays && (
                    <div>
                      <span className="text-stone-400 block">عدد أيام الإجازة:</span>
                      <span className="font-semibold text-stone-800">{transaction.specificDetails.leaveDays} أيام ({transaction.specificDetails.leaveType})</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5">
              <span className="text-xs font-bold text-stone-500 block">ملاحظات الذاتية والمتابعة:</span>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                {transaction.notes || 'لا توجد ملاحظات مسجلة لهذه المعاملة.'}
              </p>
            </div>
          </div>

          {/* Right Column: Scanned Attachments Multi-view */}
          <div className="lg:col-span-5 space-y-3.5 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-stone-500" />
                المرفقات الممسوحة ({transaction.attachments.length} وثائق)
              </span>
              <span className="text-[11px] text-stone-400">ماسح ضوئي محلي</span>
            </div>

            {/* Attachment selector tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {transaction.attachments.map((att, idx) => (
                <button
                  key={att.id}
                  type="button"
                  onClick={() => setSelectedAttachmentIndex(idx)}
                  className={`text-xs px-2.5 py-1 rounded-md border whitespace-nowrap transition-colors cursor-pointer ${
                    selectedAttachmentIndex === idx
                      ? 'bg-stone-900 text-amber-300 border-stone-900 font-semibold'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {att.type} #{idx + 1}
                </button>
              ))}
            </div>

            {/* Simulated Scanned Paper Preview */}
            <div className="flex-1 min-h-[300px] rounded-xl border border-stone-300 bg-stone-100 p-3 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              {currentAttachment ? (
                <div className="w-full h-full bg-white rounded-lg shadow-sm border border-stone-200 p-4 flex flex-col justify-between text-right relative font-serif">
                  {/* Watermark of scanned document */}
                  <div className="border-b-2 border-stone-800 pb-3 flex justify-between items-start text-xs text-stone-600">
                    <div>
                      <p className="font-bold text-stone-900">جمهورية العراق (محاكاة تجريبية)</p>
                      <p>قسم الشؤون الإدارية والذاتية</p>
                    </div>
                    <div className="text-left text-[11px]">
                      <p>العدد: {transaction.number}</p>
                      <p>التاريخ: {transaction.date}</p>
                    </div>
                  </div>

                  {/* Body Simulation */}
                  <div className="my-auto py-4 space-y-2 text-xs leading-relaxed text-stone-800">
                    <p className="font-bold text-center text-sm mb-3">
                      م/ {transaction.subject}
                    </p>
                    <p className="text-stone-600">
                      إلى / {transaction.entity}
                    </p>
                    <p className="indent-4 text-stone-700">
                      تحية طيبة... إشارةً إلى السياقات الإدارية والتعليمات النافذة، يرجى التفضل بالاطلاع على ما ورد في هذه الوثيقة
                      بخصوص ({transaction.subType})، واتخاذ ما يلزم بموجب الصلاحيات المخولة...
                    </p>
                    <div className="h-12 border border-dashed border-stone-200 rounded flex items-center justify-center text-stone-400 text-[11px]">
                      [ صورة ممسوحة ضوئياً: {currentAttachment.name} ]
                    </div>
                  </div>

                  {/* Footer stamps simulation */}
                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-sans text-[10px]">
                      نوع المرفق: {currentAttachment.type} ({currentAttachment.fileSize})
                    </span>
                    <span className="text-emerald-700 font-bold">
                      ختم الأرشفة الورقية / محفوظ
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-stone-400 text-xs py-8">
                  لا توجد مرفقات مرتبطة بهذه المعاملة
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 px-1">
              <span>{currentAttachment?.name}</span>
              <span className="text-stone-400">{currentAttachment?.fileSize}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            تاريخ التوثيق: {transaction.date} • التسلسل الإداري: #{transaction.sequence}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
