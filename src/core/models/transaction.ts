export type TransactionStatus = 'جديد' | 'قيد الإنجاز' | 'مكتمل';

export type TransactionDirection = 'صادر' | 'وارد' | 'داخلي';

export type TransactionCategory = 'إدارية' | 'مالية' | 'منتسبين' | 'الأساتذة' | 'أخرى';

export type TransactionPriority = 'عادي' | 'هام' | 'عاجل' | 'عاجل جداً' | 'سري';

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

export interface DirectorDirective {
  text: string;
  date: string;
  actionRequired?: boolean;
}

export interface TransactionSpecificDetails {
  destination?: string;
  vehicle?: string;
  purpose?: string;
  amount?: string;
  leaveDays?: number;
  leaveType?: string;
}

import type { DailySituationData } from './dailySituation';

export interface Transaction {
  id: string;
  number: string;
  sequence: string;
  date: string;
  month: string;
  direction: TransactionDirection;
  category: TransactionCategory;
  subType: string;
  entity: string;
  subject: string;
  employeeName?: string;
  priority?: TransactionPriority;
  directorDirective?: DirectorDirective;
  status: TransactionStatus;
  notes?: string;
  attachments: Attachment[];
  isRead?: boolean;
  createdAt?: string;
  readAt?: string;
  isDailySituation?: boolean;
  dailySituationData?: DailySituationData;
  specificDetails?: TransactionSpecificDetails;
}
