export interface Debtor {
  id?: string;
  name: string;
  document: string; // CPF ou CNPJ
  documentType: 'CPF' | 'CNPJ';
  email?: string;
  phone?: string;
  address?: Address;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Installment {
  id?: string;
  debtId?: string;
  installmentNumber: number;
  originalValue: number;
  currentValue: number;
  dueDate: Date;
  paymentDate?: Date;
  status: InstallmentStatus;
  interestRate: number;
  fineRate: number;
  interestAmount: number;
  fineAmount: number;
  totalAmount: number;
  daysOverdue: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Debt {
  id?: string;
  debtNumber: string;
  debtor: Debtor;
  originalValue: number;
  currentValue: number;
  totalInstallments: number;
  paidInstallments: number;
  status: DebtStatus;
  interestRate: number; // Taxa de juros mensal
  fineRate: number; // Taxa de multa
  createdAt?: Date;
  updatedAt?: Date;
  installments: Installment[];
  notes?: string;
}

export enum DebtStatus {
  ACTIVE = 'ACTIVE',
  OVERDUE = 'OVERDUE',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  RENEGOTIATED = 'RENEGOTIATED'
}

export enum InstallmentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export interface DebtSummary {
  totalDebts: number;
  totalActiveDebts: number;
  totalOverdueDebts: number;
  totalPaidDebts: number;
  totalValue: number;
  totalOverdueValue: number;
  totalPaidValue: number;
  averageDaysOverdue: number;
  largestDebt: number;
  oldestOverdueDebt: number;
}

export interface DebtFilter {
  debtorName?: string;
  debtorDocument?: string;
  status?: DebtStatus[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
  valueFrom?: number;
  valueTo?: number;
  overdueOnly?: boolean;
  sortBy?: 'debtNumber' | 'debtorName' | 'originalValue' | 'currentValue' | 'dueDate' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface DebtListResponse {
  debts: Debt[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateDebtRequest {
  debtNumber: string;
  debtor: Omit<Debtor, 'id' | 'createdAt' | 'updatedAt'>;
  originalValue: number;
  totalInstallments: number;
  interestRate: number;
  fineRate: number;
  installments: Omit<Installment, 'id' | 'debtId' | 'currentValue' | 'interestAmount' | 'fineAmount' | 'totalAmount' | 'daysOverdue' | 'status' | 'createdAt' | 'updatedAt'>[];
  notes?: string;
}

export interface UpdateDebtRequest {
  originalAmount?: number;
  issueDate?: string;
  dueDate?: string;
  interestRate?: number;
  fineRate?: number;
  installmentCount?: number;
  observations?: string;
  debtor?: {
    name?: string;
    document?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
}

export interface PayInstallmentRequest {
  installmentId: string;
  paymentDate: Date;
  paidAmount: number;
  notes?: string;
}