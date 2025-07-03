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