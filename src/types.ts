export type TransactionStatus = 'جديد' | 'قيد الإنجاز' | 'مكتمل';

export type TransactionDirection = 'صادر' | 'وارد' | 'داخلي';

export type TransactionCategory = 'إدارية' | 'مالية' | 'منتسبين' | 'الأساتذة' | 'أخرى';

export type TransactionPriority = 'عادي' | 'هام' | 'عاجل' | 'عاجل جداً' | 'سري';

export type UserRole = 'director' | 'archivist'; // السيد مدير المركز | مسؤول الذاتية والأرشفة

export type AttachmentType = 
  | 'كتاب رئيسي' 
  | 'قائمة أسماء' 
  | 'ملحق' 
  | 'هامش' 
  | 'صورة وثيقة' 
  | 'وصل مالي' 
  | 'أمر إداري' 
  | 'تقرير' 
  | 'أخرى';

export interface Attachment {
  id: string;
  name: string;
  type: AttachmentType | string;
  fileSize: string;
  uploadDate: string;
  previewUrl?: string;
  isImage?: boolean;
}

// قيد مفرد في جدول الموقف اليومي
export interface DailySituationEntry {
  id: string;
  sequence: number;        // ت (1, 2, ...)
  employeeName: string;    // الاسم الرباعي للمنتسب
  employmentType: string;  // صفة العمل (دائمي، مكافأة، أجر يومي، متطوع، ساعات...)
  details: string;         // عدد الأيام ونوع الإجازة، أو عدد الساعات من وإلى، أو من يوم إلى يوم والإيفاد
  date: string;            // التاريخ (مثال: 2026/9/9)
  notes?: string;          // ملاحظات إضافية إن وجدت
}

// هيكلية الموقف اليومي الشاملة لمركز الدراسات الإفريقية المطابقة للنموذج الرسمي (9.jpg)
export interface DailySituationData {
  situationDate: string;          // تاريخ الموقف اليومي (مثال: 2026/09/09)
  addressedTo?: string;           // السيد رئيس قسم الشؤون الفكرية والثقافية دام توفيقه
  departmentName?: string;        // مركز الدراسات الافريقية
  
  // 1. الإجازات اليومية للمنتسب الدائم
  permanentLeaves: DailySituationEntry[];
  
  // 2. الساعات الزمنية (للمنتسب الدائم)
  permanentTimePermissions: DailySituationEntry[];
  
  // 3. تحويل دوام او دورية او ايفاد (للمنتسب الدائم)
  permanentShiftChanges: DailySituationEntry[];
  
  // 4. الاجازات اليومية لمنتسبي المكافأة والاجر اليومي والمتطوع
  temporaryLeaves: DailySituationEntry[];
  
  // 5. الساعات الزمنية (لمنتسبي المكافأة والاجر والمتطوع)
  temporaryTimePermissions: DailySituationEntry[];
  
  // 6. تحويل دوام او دورية او ايفاد (لمنتسبي المكافأة والاجر والمتطوع)
  temporaryShiftChanges: DailySituationEntry[];
  
  supervisorEndorsement?: string; // تأييد مسؤول المركز
  notes?: string;
}

export interface Transaction {
  id: string;
  number: string;          // العدد
  sequence: string;        // التسلسل
  date: string;            // التاريخ (مثال: 2026-08-12)
  month: string;           // صيغة الشهر للتقرير (مثال: 2026-08)
  direction: TransactionDirection; // صادر / وارد / داخلي
  category: TransactionCategory;   // إدارية / مالية / منتسبين / الأساتذة / أخرى
  subType: string;         // نوع المعاملة (إيفاد، إجازة، صرف مستحقات، مباشرة...)
  entity: string;          // الجهة (الأمانة العامة، الدائرة الإدارية، مركز خارجي...)
  subject: string;         // المضمون / ملخص المعاملة
  employeeName?: string;   // اسم المنتسب المرتبط إن وجد
  priority?: TransactionPriority; // درجة الأسبقية (عادي / عاجل / عاجل جداً / سري)
  directorDirective?: {    // هامش أو توجيه السيد المدير
    text: string;
    date: string;
    actionRequired?: boolean;
  };
  status: TransactionStatus; // جديد / قيد الإنجاز / مكتمل
  notes?: string;          // ملاحظات إدارية
  attachments: Attachment[]; // المرفقات المتعددة
  isRead?: boolean;        // شارة مقروء للمدير (true = مقروء ✓ / false = غير مقروء 🔴)
  createdAt?: string;      // وقت وتاريخ الإدخال والأرشفة
  readAt?: string;         // وقت اطلاع المدير
  isDailySituation?: boolean; // هل المعاملة عبارة عن موقف يومي رسمي؟
  dailySituationData?: DailySituationData; // بيانات الموقف اليومي المفصلة
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
  badgeNumber?: string;
  joinedDate?: string;
}
