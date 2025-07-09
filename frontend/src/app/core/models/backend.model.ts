// Modelos que correspondem exatamente aos DTOs do backend

export interface CreateDebtTitleRequest {
  titleNumber: string;
  originalValue?: number;
  dueDate: string; // ISO string
  interestRatePerDay: number;
  penaltyRate: number;
  debtorName: string;
  debtorDocument: string;
  installments: InstallmentRequest[];
}

export interface UpdateDebtTitleRequest {
  titleNumber: string;
  originalValue: number;
  dueDate: string; // ISO string
  interestRatePerDay: number;
  penaltyRate: number;
  debtorName: string;
  debtorDocument?: string;
}

export interface InstallmentRequest {
  installmentNumber: number;
  value: number;
  dueDate: string; // ISO string
}

export interface DebtTitleResponse {
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
  installments: InstallmentResponse[];
}

export interface InstallmentResponse {
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