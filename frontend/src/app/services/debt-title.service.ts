import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DebtTitle, CreateDebtTitleRequest } from '../models/debt-title.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DebtTitleService {
  private readonly apiUrl = `${environment.apiUrl}/api/Debts`;

  constructor(private http: HttpClient) {}

  /**
   * Busca todos os títulos de dívida
   */
  getAll(): Observable<DebtTitle[]> {
    return this.http.get<DebtTitle[]>(this.apiUrl);
  }

  /**
   * Busca títulos em atraso
   */
  getOverdue(): Observable<DebtTitle[]> {
    return this.http.get<DebtTitle[]>(`${this.apiUrl}/overdue`);
  }

  /**
   * Busca título por ID
   */
  getById(id: string): Observable<DebtTitle> {
    return this.http.get<DebtTitle>(`${this.apiUrl}/${id}`);
  }

  /**
   * Busca títulos por documento do devedor
   */
  getByDebtorDocument(document: string): Observable<DebtTitle[]> {
    const params = new HttpParams().set('document', document);
    return this.http.get<DebtTitle[]>(`${this.apiUrl}/by-debtor`, { params });
  }

  /**
   * Cria um novo título de dívida
   */
  create(debtTitle: CreateDebtTitleRequest): Observable<DebtTitle> {
    return this.http.post<DebtTitle>(this.apiUrl, debtTitle);
  }

  /**
   * Atualiza um título de dívida
   */
  update(id: string, debtTitle: CreateDebtTitleRequest): Observable<DebtTitle> {
    return this.http.put<DebtTitle>(`${this.apiUrl}/${id}`, debtTitle);
  }

  /**
   * Remove um título de dívida
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}