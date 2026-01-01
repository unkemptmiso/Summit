
export interface Transaction {
  id: number | string;
  date: string;
  description: string;
  amount: string | number;
  category: string;
  method: string;
  receiptPath?: string;
  createdAt?: number;
}

export interface RecurringExpense {
  id: string;
  description: string;
  amount: number | string;
  category: string;
  method: string;
}

export interface AssetItem {
  id: string;
  name: string;
  value: string | number;
}

export interface AssetCategory {
  id: string;
  name: string;
  isLiability?: boolean;
  isTracking?: boolean;
  items: AssetItem[];
}

export interface IncomeStream {
  id: string;
  name: string;
  grossAmount: number | string;
  netAmount: number | string;
}

export interface MonthlyHistoryEntry {
  date: string;
  sortKey?: string;
  netWorth: number;
  netDiff: number;
  yield: number;
  preTaxIncome: number;
  comment: string;
  snapshot?: AssetCategory[];
}

export interface IncomeHistoryEntry {
  date: string;
  sortKey: string;
  totalGross: number;
  totalNet: number;
  streams: IncomeStream[];
  comment: string;
}

export interface DrivingLogEntry {
  id: number | string;
  date: string;
  miles: string | number;
  destination: string;
  purpose: string;
}

export interface CategoryStat {
  name: string;
  total: number;
  lastTotal: number;
  diffPct: number;
  avg12M: number;
}