import { Transaction, Employee } from '../models';

export interface StorageKeys {
  TRANSACTIONS: string;
  EMPLOYEES: string;
  DARK_MODE: string;
}

export interface IDataStorage {
  loadTransactions(): Transaction[];
  saveTransactions(transactions: Transaction[]): void;
  loadEmployees(): Employee[];
  saveEmployees(employees: Employee[]): void;
  loadDarkMode(): boolean;
  saveDarkMode(isDark: boolean): void;
  exportBackupJson(): string;
  restoreFromBackupJson(jsonString: string): boolean;
}
