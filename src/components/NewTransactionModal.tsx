import React, { useState } from 'react';
import { X, Plus, Paperclip, Check, UploadCloud } from 'lucide-react';
import { Transaction, TransactionDirection, TransactionCategory, TransactionStatus, Attachment } from '../types';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Transaction) => void;
  employees: string[];
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  employees,
}) => {
  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.substring(0, 7);

  const [number, setNumber] = useState('');
  const [sequence, setSequence] = useState('');
  const [date, setDate] = useState(today);
  const [direction, setDirection] = useState<TransactionDirection>('صادر');
  const [category, setCategory] = useState<TransactionCategory>('إدارية');
  const [subType, setSubType] = useState('إيفاد');
  const [entity, setEntity] = useState('');
  const [subject, setSubject] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('جديد');
  const [notes, setNotes] = useState('');

  // Sample simulated attachments
  const [attachments, setAttachments] = useState<Attachment[]>([
    {
      id: `att-new-1`,
      name: 'الكتاب_الرئيسي_الممسوح.jpg',
      type: 'كتاب رئيسي',
      fileSize: '1.1 MB',
      uploadDate: today,
      isImage: true,
    },
  ]);

  const addExtraAttachment = () => {
    const nextIndex = attachments.length + 1;
    setAttachments([
      ...attachments,
      {
        id: `att-new-${Date.now()}`,
        name: `مرفق_إضافي_صفحة_${nextIndex}.jpg`,
        type: nextIndex === 2 ? 'قائمة أسماء' : 'ملحق',
        fileSize: '850 KB',
        uploadDate: today,
        isImage: true,
      },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!number.trim() || !subject.trim() || !entity.trim()) {
      alert('يرجى ملء الحقول الأساسية: العدد، الجهة، والمضمون');
      return;
    }

    const newTr: Transaction = {
      id: `tr-${Date.now()}`,
      number: number.trim(),
      sequence: sequence.trim() || String(Math.floor(Math.random() * 900) + 100),
      date,
      month: date.substring(0, 7),
      direction,
      category,
      subType,
      entity: entity.trim(),
      subject: subject.trim(),
      employeeName: employeeName.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
      attachments,
    };

    onAddTransaction(newTr);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
        dir="rtl"
      >
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              إدخال معاملة جديدة في سجل الذاتية
            </h2>
            <p className="text-xs text-stone-500">
              أدخل بيانات الكتاب والمرفقات لإضافته إلى متابعة الشهر الجاري
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-sm">
          {/* Top Row: Number, Sequence, Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                العدد (رقم الكتاب) *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: ١٠٥٠/ص"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-stone-800 focus:border-stone-800 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                التسلسل (سجل القيد)
              </label>
              <input
                type="text"
                placeholder="مثال: ٨٢٤"
                value={sequence}
                onChange={(e) => setSequence(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-stone-800 focus:border-stone-800 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                تاريخ الكتاب
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-stone-800 focus:border-stone-800 outline-hidden"
              />
            </div>
          </div>

          {/* Direction, Category, SubType */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                حركة الكتاب
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as TransactionDirection)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-stone-800 outline-hidden"
              >
                <option value="صادر">صادر (من المركز)</option>
                <option value="وارد">وارد (إلى المركز)</option>
                <option value="داخلي">إجراء داخلي</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                القسم الرئيسي
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-stone-800 outline-hidden"
              >
                <option value="إدارية">إدارية</option>
                <option value="مالية">مالية</option>
                <option value="منتسبين">شؤون المنتسبين</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                نوع المعاملة
              </label>
              <input
                type="text"
                list="subtypes-list"
                value={subType}
                onChange={(e) => setSubType(e.target.value)}
                placeholder="إيفاد، إجازة، صرف..."
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-stone-800 outline-hidden"
              />
              <datalist id="subtypes-list">
                <option value="إيفاد" />
                <option value="إجازة اعتيادية" />
                <option value="أمر تكليف" />
                <option value="صرف مستحقات" />
                <option value="تعميم إداري" />
                <option value="كتاب شكر وتقدير" />
                <option value="مباشرة / انفكاك" />
                <option value="تحويل دوام" />
              </datalist>
            </div>
          </div>

          {/* Entity & Employee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                الجهة المرتبطة بالكتاب *
              </label>
              <input
                type="text"
                required
                placeholder="الأمانة العامة، الدائرة الإدارية، الحسابات..."
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-stone-800 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                اسم المنتسب المرتبط (إن وُجد)
              </label>
              <input
                type="text"
                list="employees-list"
                placeholder="اختر أو اكتب اسم المنتسب"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-stone-800 outline-hidden"
              />
              <datalist id="employees-list">
                {employees.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              المضمون (خلاصة الموضوع) *
            </label>
            <textarea
              required
              rows={2}
              placeholder="اكتب ملخصاً إدارياً لمضمون الكتاب..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-stone-800 outline-hidden resize-none"
            />
          </div>

          {/* Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                الحالة المبدئية
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-stone-800 outline-hidden"
              >
                <option value="جديد">جديد</option>
                <option value="قيد الإنجاز">قيد الإنجاز</option>
                <option value="مكتمل">مكتمل</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ملاحظات
              </label>
              <input
                type="text"
                placeholder="ملاحظات المتابعة أو الإجراءات..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-stone-800 outline-hidden"
              />
            </div>
          </div>

          {/* Scanned Attachments Simulator */}
          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-stone-500" />
                المرفقات الممسوحة ضوئياً ({attachments.length})
              </span>
              <button
                type="button"
                onClick={addExtraAttachment}
                className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة مرفق آخر (قائمة أسماء/ملحق)
              </button>
            </div>

            <div className="space-y-1.5">
              {attachments.map((att, i) => (
                <div key={att.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-stone-800">{att.name}</span>
                    <span className="text-stone-400">({att.type})</span>
                  </div>
                  <span className="text-stone-400 text-[11px]">{att.fileSize}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-stone-400 text-right">
              * في النموذج المحلي، يدعم النظام صور الماسح الضوئي المتعددة لكل معاملة.
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-medium cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
            >
              حفظ المعاملة ومتابعتها
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
