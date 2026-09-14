import { User, RoleId, Permission, userHasPermission } from '../core/models/user';
import { canUserAccessTransaction } from '../core/models/accessScope';
import { Transaction } from '../core/models/transaction';
import { Employee } from '../core/models/employee';
import { splitEmployeeNames, isEmployeeMatch } from '../utils/employeeUtils';

/**
 * المستخدمون الافتراضيون لتمثيل الأدوار في النظام (Mock User Identities)
 * مهيأ للتبديل السلس في بيئة الـ Prototype وقابل للربط المباشر بـ Auth Provider مستقبلاً
 */
export const MOCK_USERS: Record<RoleId, User> = {
  director: {
    id: 'usr-director',
    username: 'director',
    displayName: 'السيد مدير المركز (د. سعد الشمري)',
    role: 'director',
    department: 'إدارة المركز',
    isActive: true,
    createdAt: '2024-01-01',
  },
  archivist: {
    id: 'usr-archivist',
    username: 'archivist',
    displayName: 'مسؤول شعبة الذاتية والأرشفة',
    role: 'archivist',
    department: 'شعبة الذاتية والأرشفة',
    isActive: true,
    createdAt: '2024-01-01',
  },
  employee: {
    id: 'usr-emp-5',
    username: 'ameer_ibrahim',
    displayName: 'أمير إبراهيم علي حسن',
    role: 'employee',
    employeeId: 'emp-5', // مرتبط بالباحث د. أمير إبراهيم
    department: 'مركز الدراسات الافريقية',
    isActive: true,
    createdAt: '2024-01-01',
  },
  admin: {
    id: 'usr-admin',
    username: 'admin',
    displayName: 'مدير المنظومة (المشرف العام)',
    role: 'admin',
    department: 'إدارة تكنولوجيا المعلومات',
    isActive: true,
    createdAt: '2024-01-01',
  },
};

export class AuthService {
  /**
   * جلب كائن المستخدم النشط بناءً على الدور المحدد
   */
  static getUserForRole(roleId: RoleId): User {
    return MOCK_USERS[roleId] || MOCK_USERS.director;
  }

  /**
   * فحص الصلاحية الصريحة للمستخدم
   */
  static hasPermission(user: User | null | undefined, permission: Permission): boolean {
    return userHasPermission(user, permission);
  }

  /**
   * تصفية المعاملات بناءً على صلاحيات ونطاق رؤية المستخدم (Access Scope Filter)
   * هذه الدالة تطبق منطق التخويل الأمني (Authorization Logic) الجاهز للنقل إلى الـ Backend
   */
  static filterTransactionsForUser(user: User, transactions: Transaction[]): Transaction[] {
    if (!user || !user.isActive) return [];

    // مسؤول النظام والمدير يطلعون على كل المعاملات المسموحة لدورهم
    return transactions.filter((tr) => canUserAccessTransaction(user, tr));
  }

  /**
   * مزامنة وتطبيع العلاقات ونطاق الرؤية للمعاملة (Normalization & Data Enrichment)
   * يضمن:
   * 1. ملء employeeIds استناداً إلى employeeName وسجل المنتسبين
   * 2. تعيين نطاق الرؤية الافتراضي (visibility) إن لم يكن محدداً
   */
  static normalizeTransaction(tr: Transaction, allEmployees: Employee[]): Transaction {
    const updated = { ...tr };

    // 1. استخراج ومطابقة معرفات المنتسبين (employeeIds) إذا لم تكن موجودة
    if ((!updated.employeeIds || updated.employeeIds.length === 0) && updated.employeeName) {
      const names = splitEmployeeNames(updated.employeeName);
      const matchedIds: string[] = [];

      for (const name of names) {
        const found = allEmployees.find((e) => isEmployeeMatch(e.name, name));
        if (found && !matchedIds.includes(found.id)) {
          matchedIds.push(found.id);
        }
      }

      if (matchedIds.length > 0) {
        updated.employeeIds = matchedIds;
      }
    }

    // 2. تعيين نطاق الرؤية الافتراضي (Default Access Scope) للبيانات السابقة
    if (!updated.visibility) {
      if (updated.priority === 'سري') {
        updated.visibility = 'DirectorOnly';
      } else if (updated.category === 'منتسبين' || (updated.employeeIds && updated.employeeIds.length > 0)) {
        updated.visibility = 'SpecificEmployees';
      } else if (updated.category === 'إدارية' || updated.category === 'مالية') {
        updated.visibility = 'Administrative';
      } else {
        updated.visibility = 'PublicToEmployees';
      }
    }

    return updated;
  }
}
