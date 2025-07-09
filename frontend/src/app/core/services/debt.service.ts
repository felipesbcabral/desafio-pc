import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, throwError } from 'rxjs';
import {
  Debt,
  DebtFilter,
  DebtListResponse,
  DebtSummary,
  CreateDebtRequest,
  UpdateDebtRequest,
  PayInstallmentRequest,
  Installment
} from '../models/debt.model';
import { DebtTitleResponse } from '../models/backend.model';
import { ApiResponse } from '../models/api.model';
import { DebtMapperService } from './debt-mapper.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DebtService {
  private readonly apiUrl = `${environment.apiUrl}/debts`;
  private debtsSubject = new BehaviorSubject<Debt[]>([]);
  private summarySubject = new BehaviorSubject<DebtSummary | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public debts$ = this.debtsSubject.asObservable();
  public summary$ = this.summarySubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private mapper: DebtMapperService
  ) {}

  /**
   * Busca todas as dívidas com filtros opcionais
   */
  getDebts(filter?: DebtFilter): Observable<DebtListResponse> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    
    // O backend atual não suporta filtros, então vamos buscar todas as dívidas
    // e aplicar filtros no frontend se necessário
    
    return this.http.get<DebtTitleResponse[]>(this.apiUrl)
      .pipe(
        map(responses => {
          const debts = this.mapper.fromResponseArray(responses);
          
          // Aplicar filtros no frontend se necessário
          let filteredDebts = debts;
          if (filter) {
            filteredDebts = this.applyClientSideFilters(debts, filter);
          }
          
          this.debtsSubject.next(filteredDebts);
          
          // Simular paginação no frontend
          const page = filter?.page || 1;
          const pageSize = filter?.pageSize || 20;
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedDebts = filteredDebts.slice(startIndex, endIndex);
          
          return {
            debts: paginatedDebts,
            total: filteredDebts.length,
            page,
            pageSize,
            totalPages: Math.ceil(filteredDebts.length / pageSize)
          };
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return throwError(() => error);
        }),
        map(data => {
          this.loadingSubject.next(false);
          return data;
        })
      );
  }

  /**
   * Aplica filtros no lado do cliente
   */
  private applyClientSideFilters(debts: Debt[], filter: DebtFilter): Debt[] {
    return debts.filter(debt => {
      if (filter.debtorName && !debt.debtor.name.toLowerCase().includes(filter.debtorName.toLowerCase())) {
        return false;
      }
      if (filter.debtorDocument && !debt.debtor.document.includes(filter.debtorDocument)) {
        return false;
      }
      if (filter.status && filter.status.length > 0 && !filter.status.includes(debt.status)) {
        return false;
      }
      if (filter.overdueOnly && debt.status !== 'OVERDUE') {
        return false;
      }
      if (filter.valueFrom !== undefined && debt.originalValue < filter.valueFrom) {
        return false;
      }
      if (filter.valueTo !== undefined && debt.originalValue > filter.valueTo) {
        return false;
      }
      return true;
    });
  }

  /**
   * Busca uma dívida específica por ID
   */
  getDebtById(id: string): Observable<Debt> {
    return this.http.get<DebtTitleResponse>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => this.mapper.fromResponse(response)),
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Cria uma nova dívida
   */
  createDebt(debt: CreateDebtRequest): Observable<Debt> {
    this.loadingSubject.next(true);
    
    const backendRequest = this.mapper.toCreateRequest(debt);
    
    return this.http.post<DebtTitleResponse>(this.apiUrl, backendRequest)
      .pipe(
        map(response => {
          const mappedDebt = this.mapper.fromResponse(response);
          // Atualiza a lista local
          const currentDebts = this.debtsSubject.value;
          this.debtsSubject.next([mappedDebt, ...currentDebts]);
          return mappedDebt;
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return throwError(() => error);
        }),
        map(data => {
          this.loadingSubject.next(false);
          return data;
        })
      );
  }

  /**
   * Cria um novo título de dívida diretamente com CreateDebtTitleRequest
   */
  createDebtTitle(request: any): Observable<DebtTitleResponse> {
    this.loadingSubject.next(true);
    
    return this.http.post<DebtTitleResponse>(this.apiUrl, request)
      .pipe(
        map(response => {
          // Atualiza a lista local se necessário
          const mappedDebt = this.mapper.fromResponse(response);
          const currentDebts = this.debtsSubject.value;
          this.debtsSubject.next([mappedDebt, ...currentDebts]);
          return response;
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return throwError(() => error);
        }),
        map(data => {
          this.loadingSubject.next(false);
          return data;
        })
      );
  }

  /**
   * Atualiza uma dívida existente
   */
  updateDebt(id: string, debt: UpdateDebtRequest): Observable<Debt> {
    this.loadingSubject.next(true);
    
    // Busca o debt atual para obter o titleNumber
    const currentDebt = this.debtsSubject.value.find(d => d.id === id);
    const backendRequest = this.mapper.toUpdateRequest(debt, currentDebt);
    
    return this.http.put<DebtTitleResponse>(`${this.apiUrl}/${id}`, backendRequest)
      .pipe(
        map(response => {
          const mappedDebt = this.mapper.fromResponse(response);
          // Atualiza a lista local
          const currentDebts = this.debtsSubject.value;
          const updatedDebts = currentDebts.map(d => 
            d.id === id ? mappedDebt : d
          );
          this.debtsSubject.next(updatedDebts);
          return mappedDebt;
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return throwError(() => error);
        }),
        map(data => {
          this.loadingSubject.next(false);
          return data;
        })
      );
  }

  /**
   * Exclui uma dívida
   */
  deleteDebt(id: string): Observable<void> {
    this.loadingSubject.next(true);
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        map(() => {
          // Remove da lista local
          const currentDebts = this.debtsSubject.value;
          const filteredDebts = currentDebts.filter(d => d.id !== id);
          this.debtsSubject.next(filteredDebts);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return throwError(() => error);
        }),
        map(() => {
          this.loadingSubject.next(false);
        })
      );
  }

  /**
   * Busca dívidas por documento do devedor
   */
  getDebtsByDebtorDocument(document: string): Observable<Debt[]> {
    const params = new HttpParams().set('document', document);
    
    return this.http.get<DebtTitleResponse[]>(`${this.apiUrl}/by-debtor`, { params })
      .pipe(
        map(responses => this.mapper.fromResponseArray(responses)),
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Paga uma parcela
   */
  payInstallment(payment: PayInstallmentRequest): Observable<Installment> {
    return this.http.post<ApiResponse<Installment>>(`${this.apiUrl}/installments/${payment.installmentId}/pay`, payment)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            // Atualiza a dívida na lista local
            this.refreshDebtInList(response.data.debtId!);
            return response.data;
          }
          throw new Error(response.message || 'Erro ao pagar parcela');
        }),
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Busca o resumo das dívidas (KPIs)
   */
  getDebtSummary(): Observable<DebtSummary> {
    return this.http.get<DebtTitleResponse[]>(this.apiUrl)
      .pipe(
        map(responses => {
          const debts = this.mapper.fromResponseArray(responses);
          
          const totalDebts = debts.length;
          const activeDebts = debts.filter(d => d.status === 'ACTIVE').length;
          const overdueDebts = debts.filter(d => d.status === 'OVERDUE').length;
          const paidDebts = debts.filter(d => d.status === 'PAID').length;
          
          const totalValue = debts.reduce((sum, d) => sum + d.currentValue, 0);
          const overdueValue = debts.filter(d => d.status === 'OVERDUE').reduce((sum, d) => sum + d.currentValue, 0);
          const paidValue = debts.filter(d => d.status === 'PAID').reduce((sum, d) => sum + d.currentValue, 0);
          
          const overdueDebtsWithDays = debts.filter(d => d.status === 'OVERDUE');
          
          // Calcular média de dias em atraso baseado nas parcelas
          let totalDaysOverdue = 0;
          let overdueInstallmentsCount = 0;
          
          overdueDebtsWithDays.forEach(debt => {
             const overdueInstallments = debt.installments.filter(i => i.status === 'OVERDUE');
             overdueInstallments.forEach(installment => {
               totalDaysOverdue += installment.daysOverdue;
               overdueInstallmentsCount++;
             });
           });
           
           const averageDaysOverdue = overdueInstallmentsCount > 0 
             ? totalDaysOverdue / overdueInstallmentsCount 
             : 0;
           
           const largestDebt = debts.length > 0 ? Math.max(...debts.map(d => d.currentValue)) : 0;
           
           // Encontrar a parcela mais antiga em atraso
           let oldestOverdueDebt = 0;
           overdueDebtsWithDays.forEach(debt => {
             const overdueInstallments = debt.installments.filter(i => i.status === 'OVERDUE');
             overdueInstallments.forEach(installment => {
               if (installment.daysOverdue > oldestOverdueDebt) {
                 oldestOverdueDebt = installment.daysOverdue;
               }
             });
           });

          const summary: DebtSummary = {
            totalDebts,
            totalActiveDebts: activeDebts,
            totalOverdueDebts: overdueDebts,
            totalPaidDebts: paidDebts,
            totalValue,
            totalOverdueValue: overdueValue,
            totalPaidValue: paidValue,
            averageDaysOverdue,
            largestDebt,
            oldestOverdueDebt
          };
          
          this.summarySubject.next(summary);
          return summary;
        }),
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Busca dívidas recentes para o dashboard
   */
  getRecentDebts(limit: number = 5): Observable<Debt[]> {
    return this.http.get<DebtTitleResponse[]>(this.apiUrl)
      .pipe(
        map(responses => {
          const debts = this.mapper.fromResponseArray(responses);
          
          // Ordenar por data de criação (mais recentes primeiro) e limitar
          return debts
            .sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            })
            .slice(0, limit);
        }),
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Calcula valores de juros e multa para uma parcela
   */
  // Método removido - cálculos devem ser feitos exclusivamente no backend



  /**
   * Atualiza uma dívida específica na lista local
   */
  private refreshDebtInList(debtId: string): void {
    this.getDebtById(debtId).subscribe({
      next: (updatedDebt) => {
        const currentDebts = this.debtsSubject.value;
        const updatedDebts = currentDebts.map(d => 
          d.id === debtId ? updatedDebt : d
        );
        this.debtsSubject.next(updatedDebts);
      },
      error: (error) => {
        console.error('Erro ao atualizar dívida na lista:', error);
      }
    });
  }

  /**
   * Verifica se há dados em cache
   */
  hasCache(): boolean {
    return this.debtsSubject.value.length > 0;
  }

  /**
   * Obtém os dados do cache
   */
  getCachedDebts(): Debt[] {
    return this.debtsSubject.value;
  }

  /**
   * Limpa o cache local
   */

}