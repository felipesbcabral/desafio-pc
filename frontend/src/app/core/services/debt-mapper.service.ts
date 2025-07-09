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
    // Usar a data de vencimento da primeira parcela como dueDate do título
    const firstInstallmentDueDate = debt.installments.length > 0 
      ? debt.installments[0].dueDate.toISOString()
      : new Date().toISOString();
    
    return {
      titleNumber: debt.debtNumber,
      originalValue: debt.originalValue,
      dueDate: firstInstallmentDueDate,
      interestRatePerDay: debt.interestRate, // Já convertido no componente
      penaltyRate: debt.fineRate, // Já convertido no componente
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
      interestRatePerDay: (debt.interestRate || 0) / 100, // Converter % para decimal (mantido para update)
      penaltyRate: (debt.fineRate || 0) / 100, // Converter % para decimal (mantido para update)
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
      interestRate: response.interestRatePerDay,
      fineRate: response.penaltyRate,
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
      interestRate: response.interestRatePerDay * 30 * 100, // Converter taxa diária para mensal em %
      fineRate: response.penaltyRate * 100, // Converter decimal para %
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


}