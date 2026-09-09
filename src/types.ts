export type TransactionStatus = 'جديد' | 'قيد الإنجاز' | 'مكتمل';

export type TransactionDirection = 'صادر' | 'وارد' | 'داخلي';

export type TransactionCategory = 'إدارية' | 'مالية' | 'منتسبين' | 'أخرى';

export interface Attachment {
  id: string;
  name: string;
  type: 'كتاب رئيسي' | 'قائمة أسماء' | 'ملحق' | 'هامش' | 'أخرى';
  fileSize: string;
  uploadDate: string;
  previewUrl?: string;
  isImage?: boolean;
}

export interface Transaction {
  id: string;
  number: string;          // العدد
  sequence: string;        // التسلسل
  date: string;            // التاريخ (مثال: 2026-08-12)
  month: string;           // صيغة الشهر للتقرير (مثال: 2026-08)
  direction: TransactionDirection; // صادر / وارد / داخلي
  category: TransactionCategory;   // إدارية / مالية / منتسبين
  subType: string;         // نوع المعاملة (إيفاد، إجازة، صرف مستحقات، مباشرة...)
  entity: string;          // الجهة (الأمانة العامة، الدائرة الإدارية، مركز خارجي...)
  subject: string;         // المضمون / ملخص المعاملة
  employeeName?: string;   // اسم المنتسب المرتبط إن وجد
  status: TransactionStatus; // جديد / قيد الإنجاز / مكتمل
  notes?: string;          // ملاحظات إدارية
  attachments: Attachment[]; // المرفقات المتعددة
  specificDetails?: {      // حقول مرنة حسب نوع المعاملة
    destination?: string;  // وجهة الإيفاد مثلاً
    vehicle?: string;      // نوع العجلة
    purpose?: string;      // الغرض
    amount?: string;       // المبلغ إن كانت مالية
    leaveDays?: number;    // عدد أيام الإجازة
    leaveType?: string;    // نوع الإجازة
  };
}

export interface Employee {
  id: string;
  name: string;
  title: string;
  department: string;
}
