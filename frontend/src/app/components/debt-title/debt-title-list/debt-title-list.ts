import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { DebtTitleService } from '../../../services/debt-title.service';
import { LoadingService } from '../../../services/loading.service';
import { NotificationService } from '../../../services/notification.service';
import { DebtTitle } from '../../../models/debt-title.model';

@Component({
  selector: 'app-debt-title-list',
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCardModule,
    FormsModule
  ],
  templateUrl: './debt-title-list.html',
  styleUrl: './debt-title-list.scss'
})
export class DebtTitleList implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Dados da tabela
  debtTitles: DebtTitle[] = [];
  filteredDebtTitles: DebtTitle[] = [];
  displayedColumns: string[] = [
    'titleNumber',
    'debtorName',
    'debtorDocument',
    'originalValue',
    'dueDate',
    'status',
    'actions'
  ];

  // Paginação
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  pageSizeOptions = [5, 10, 25, 50];

  // Ordenação
  sortField = 'dueDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Filtros
  searchTerm = '';
  overdueFilter = '';
  overdueOptions = [
    { value: '', label: 'Todos' },
    { value: 'overdue', label: 'Em Atraso' },
    { value: 'current', label: 'Em Dia' }
  ];

  // Estados
  isLoading = false;
  hasError = false;
  errorMessage = '';

  constructor(
    private debtTitleService: DebtTitleService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {
    // Configurar busca com debounce
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.applyFilters();
      });
  }

  ngOnInit(): void {
    this.loadDebtTitles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega a lista de títulos de dívida
   */
  loadDebtTitles(): void {
    this.isLoading = true;
    this.hasError = false;
    this.loadingService.show();

    this.debtTitleService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (debtTitles: DebtTitle[]) => {
          this.debtTitles = debtTitles;
          this.totalItems = debtTitles.length;
          this.applyFilters();
          this.isLoading = false;
          this.loadingService.hide();
        },
        error: (error: any) => {
          console.error('Erro ao carregar títulos de dívida:', error);
          this.hasError = true;
          this.errorMessage = 'Erro ao carregar a lista de títulos de dívida.';
          this.isLoading = false;
          this.loadingService.hide();
          this.notificationService.error('Erro ao carregar títulos de dívida');
        }
      });
  }

  /**
   * Aplica filtros e ordenação aos dados
   */
  applyFilters(): void {
    let filtered = [...this.debtTitles];

    // Filtro por texto
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.titleNumber.toLowerCase().includes(term) ||
        item.debtorName.toLowerCase().includes(term) ||
        item.debtorDocument.toLowerCase().includes(term)
      );
    }

    // Filtro por status de atraso
    if (this.overdueFilter) {
      if (this.overdueFilter === 'overdue') {
        filtered = filtered.filter(item => item.isOverdue);
      } else if (this.overdueFilter === 'current') {
        filtered = filtered.filter(item => !item.isOverdue);
      }
    }

    // Ordenação
    filtered.sort((a, b) => {
      const aValue = this.getFieldValue(a, this.sortField);
      const bValue = this.getFieldValue(b, this.sortField);
      
      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;
      
      return this.sortDirection === 'desc' ? -comparison : comparison;
    });

    this.filteredDebtTitles = filtered;
    this.totalItems = filtered.length;
    
    // Reset da paginação se necessário
    if (this.pageIndex * this.pageSize >= this.totalItems) {
      this.pageIndex = 0;
    }
  }

  /**
   * Obtém o valor de um campo para ordenação
   */
  private getFieldValue(item: DebtTitle, field: string): any {
    switch (field) {
      case 'titleNumber': return item.titleNumber;
      case 'debtorName': return item.debtorName;
      case 'debtorDocument': return item.debtorDocument;
      case 'originalValue': return item.originalValue;
      case 'dueDate': return new Date(item.dueDate);
      case 'status': return item.isOverdue ? 'Em Atraso' : 'Em Dia';
      default: return '';
    }
  }

  /**
   * Manipula mudanças na paginação
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  /**
   * Manipula mudanças na ordenação
   */
  onSortChange(sort: Sort): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction as 'asc' | 'desc';
    this.applyFilters();
  }

  /**
   * Manipula mudanças no campo de busca
   */
  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  /**
   * Manipula mudanças no filtro de status
   */
  onOverdueFilterChange(): void {
    this.applyFilters();
  }

  /**
   * Limpa todos os filtros
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.overdueFilter = '';
    this.applyFilters();
  }

  /**
   * Recarrega a lista
   */
  refresh(): void {
    this.loadDebtTitles();
  }

  /**
   * Deleta um título de dívida
   */
  deleteDebtTitle(id: string): void {
    if (confirm('Tem certeza que deseja excluir este título de dívida?')) {
      this.loadingService.show();
      
      this.debtTitleService.delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Título de dívida excluído com sucesso');
            this.loadDebtTitles();
          },
          error: (error: any) => {
            console.error('Erro ao excluir título de dívida:', error);
            this.notificationService.error('Erro ao excluir título de dívida');
            this.loadingService.hide();
          }
        });
    }
  }

  /**
   * Formata valor monetário
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Formata data
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  /**
   * Obtém a classe CSS para o status
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'PAID': return 'status-paid';
      case 'PENDING': return 'status-pending';
      case 'OVERDUE': return 'status-overdue';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }

  /**
   * Obtém o texto do status
   */
  getStatusText(status: string): string {
    switch (status) {
      case 'PAID': return 'Pago';
      case 'PENDING': return 'Pendente';
      case 'OVERDUE': return 'Vencido';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  }

  /**
   * Obtém dados paginados
   */
  getPaginatedData(): DebtTitle[] {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredDebtTitles.slice(startIndex, endIndex);
  }
}
