import { Injectable } from '@angular/core';
import {
  CreateDebtTitleRequest,
  UpdateDebtTitleRequest,
  DebtTitleResponse,
  InstallmentRequest,
  InstallmentResponse
} from '../models/backend.model';
import {
  Debt,
  CreateDebtRequest,
  UpdateDebtRequest,
  Installment,
  DebtStatus,
  InstallmentStatus,
  Debtor
} from '../models/debt.model';

@Injectable({
  providedIn: 'root'
})
export class DebtMapperService {

  /**
   * Converte CreateDebtRequest do frontend para CreateDebtTitleRequest do backend
   */
  toCreateRequest(debt: CreateDebtRequest): CreateDebtTitleRequest {
    return {
      titleNumber: debt.debtNumber,
      originalValue: debt.originalValue,
      dueDate: new Date().toISOString(), // Usar a data de vencimento da primeira parcela
      interestRatePerDay: debt.interestRate / 100, // Converter percentual para decimal
      penaltyRate: debt.fineRate / 100, // Converter percentual para decimal
      debtorName: debt.debtor.name,
      debtorDocument: debt.debtor.document,
      installments: debt.installments.map((installment, index) => ({
        installmentNumber: index + 1,
        value: installment.originalValue,
        dueDate: installment.dueDate.toISOString()
      }))
    };
  }

  /**
   * Converte UpdateDebtRequest do frontend para UpdateDebtTitleRequest do backend
   */
  toUpdateRequest(debt: UpdateDebtRequest, currentDebt?: any): UpdateDebtTitleRequest {
    return {
      titleNumber: currentDebt?.debtNumber || 'TITULO-001', // Usar número atual ou padrão
      originalValue: debt.originalAmount || 0,
      dueDate: debt.dueDate || new Date().toISOString(),
      interestRatePerDay: (debt.interestRate || 0) / 100, // Converter % para decimal
      penaltyRate: (debt.fineRate || 0) / 100, // Converter % para decimal
      debtorName: debt.debtor?.name || '',
      debtorDocument: debt.debtor?.document || ''
    };
  }

  /**
   * Converte DebtTitleResponse do backend para Debt do frontend
   */
  fromResponse(response: DebtTitleResponse): Debt {
    const debtor: Debtor = {
      name: response.debtorName,
      document: response.debtorDocument,
      documentType: response.debtorDocumentType as 'CPF' | 'CNPJ'
    };

    const installments: Installment[] = response.installments.map(inst => ({
      id: inst.id,
      installmentNumber: inst.installmentNumber,
      originalValue: inst.value,
      currentValue: inst.updatedValue,
      dueDate: new Date(inst.dueDate),
      paymentDate: inst.paidAt ? new Date(inst.paidAt) : undefined,
      status: inst.isPaid ? InstallmentStatus.PAID : 
              inst.isOverdue ? InstallmentStatus.OVERDUE : InstallmentStatus.PENDING,
      interestRate: response.interestRatePerDay * 100, // Converter de decimal para percentual
      fineRate: response.penaltyRate * 100, // Converter de decimal para percentual
      interestAmount: inst.interestAmount,
      fineAmount: 0, // Calcular se necessário
      totalAmount: inst.updatedValue,
      daysOverdue: inst.daysOverdue
    }));

    const paidInstallments = installments.filter(i => i.status === InstallmentStatus.PAID).length;
    const hasOverdue = installments.some(i => i.status === InstallmentStatus.OVERDUE);
    const allPaid = paidInstallments === installments.length;

    let status: DebtStatus;
    if (allPaid) {
      status = DebtStatus.PAID;
    } else if (hasOverdue) {
      status = DebtStatus.OVERDUE;
    } else {
      status = DebtStatus.ACTIVE;
    }

    return {
      id: response.id,
      debtNumber: response.titleNumber,
      debtor,
      originalValue: response.originalValue,
      currentValue: response.updatedValue,
      totalInstallments: response.installmentCount,
      paidInstallments,
      status,
      interestRate: response.interestRatePerDay * 100, // Converter de decimal para percentual
      fineRate: response.penaltyRate * 100, // Converter de decimal para percentual
      createdAt: new Date(response.createdAt),
      installments
    };
  }

  /**
   * Converte array de DebtTitleResponse para array de Debt
   */
  fromResponseArray(responses: DebtTitleResponse[]): Debt[] {
    return responses.map(response => this.fromResponse(response));
  }

  /**
   * Cria um InstallmentRequest a partir de dados do frontend
   */
  createInstallmentRequest(installmentNumber: number, value: number, dueDate: Date): InstallmentRequest {
    return {
      installmentNumber,
      value,
      dueDate: dueDate.toISOString()
    };
  }
}