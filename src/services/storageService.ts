import { Transaction, Employee } from '../core/models';
import { INITIAL_TRANSACTIONS, INITIAL_EMPLOYEES } from '../data/mockData';
import { AuthService } from './authService';

export const STORAGE_KEYS = {
  TRANSACTIONS: 'zatiya_prototype_transactions_v2',
  EMPLOYEES: 'zatiya_prototype_employees_v3',
  DARK_MODE: 'zatiya_prototype_dark_mode_v1',
} as const;

export class StorageService {
  static loadTransactions(existingEmployees?: Employee[]): Transaction[] {
    const employees = existingEmployees || this.loadEmployees();
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // تطبيع البيانات وتثبيت الصلاحيات وعلاقات المنتسبين للبيانات المخزنة مسبقاً
          return parsed.map((tr) => AuthService.normalizeTransaction(tr, employees));
        }
      }
    } catch (e) {
      console.error('Error loading transactions from localStorage:', e);
    }
    return INITIAL_TRANSACTIONS.map((tr) => AuthService.normalizeTransaction(tr, employees));
  }

  static saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions to localStorage:', e);
    }
  }

  static loadEmployees(): Employee[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading employees from localStorage:', e);
    }
    return INITIAL_EMPLOYEES;
  }

  static saveEmployees(employees: Employee[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    } catch (e) {
      console.error('Error saving employees to localStorage:', e);
    }
  }

  static exportBackup(): string {
    const backupData = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      transactions: this.loadTransactions(),
      employees: this.loadEmployees(),
    };
    return JSON.stringify(backupData, null, 2);
  }

  static restoreFromBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (data.transactions && Array.isArray(data.transactions)) {
        this.saveTransactions(data.transactions);
      }
      if (data.employees && Array.isArray(data.employees)) {
        this.saveEmployees(data.employees);
      }
      return { success: true, message: 'تم استعادة النسخة الاحتياطية بنجاح.' };
    } catch (e) {
      return { success: false, message: 'ملف النسخة الاحتياطية غير صالح أو تالف.' };
    }
  }
}
