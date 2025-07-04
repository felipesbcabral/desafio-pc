export interface DebtTitle {
  id: string;
  titleNumber: string;
  originalValue: number;
  updatedValue: number;
  dueDate: string;
  interestRatePerDay: number;
  penaltyRate: number;
  debtorName: string;
  debtorDocument: string;
  debtorDocumentType: string;
  createdAt: string;
  installmentCount: number;
  daysOverdue: number;
  isOverdue: boolean;
  installments: Installment[];
}

export interface CreateDebtTitleRequest {
  titleNumber: string;
  originalValue?: number;
  dueDate: string;
  interestRatePerDay: number;
  penaltyRate: number;
  debtorName: string;
  debtorDocument: string;
  installments: InstallmentRequest[];
}

export interface UpdateDebtTitleRequest {
  titleNumber: string;
  originalValue: number;
  dueDate: string;
  interestRatePerDay: number;
  penaltyRate: number;
  debtorName: string;
  debtorDocument: string;
}

export interface Installment {
  id: string;
  installmentNumber: number;
  value: number;
  dueDate: string;
  isPaid: boolean;
  paidAt?: string;
  isOverdue: boolean;
  daysOverdue: number;
  interestAmount: number;
  updatedValue: number;
}

export interface InstallmentRequest {
  installmentNumber: number;
  value: number;
  dueDate: string;
}

export enum DebtStatus {
  ACTIVE = 'ACTIVE',
  OVERDUE = 'OVERDUE',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export interface DebtFilters {
  debtorName?: string;
  titleNumber?: string;
  daysOverdueRange?: { min: number; max: number };
  valueRange?: { min: number; max: number };
  multipleInstallments?: boolean;
  status?: DebtStatus[];
}

export interface DebtMetrics {
  totalTitles: number;
  totalOverdueTitles: number;
  totalOriginalValue: number;
  totalUpdatedValue: number;
  averageDaysOverdue: number;
  topFiveDebts: DebtTitle[];
  overdueDistribution: OverdueDistribution[];
}

export interface OverdueDistribution {
  range: string;
  count: number;
  percentage: number;
  totalValue: number;
}

export interface SortConfig {
  field: keyof DebtTitle;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  size: number;
  total: number;
}