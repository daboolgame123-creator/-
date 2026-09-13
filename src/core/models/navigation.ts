import { TransactionDirection, TransactionCategory } from './transaction';
import { EmployeeCategory } from './employee';

export type UserRole = 'director' | 'archivist'; // السيد مدير المركز | مسؤول الذاتية والأرشفة

export interface NavigationTarget {
  view?: 'transactions' | 'employees' | 'daily-situations' | 'report' | 'archivist-studio';
  direction?: TransactionDirection | 'الكل';
  category?: TransactionCategory | 'الكل';
  subType?: string;
  employeeName?: string;
  entity?: string;
  searchTerm?: string;
  employeeCategory?: EmployeeCategory;
}
