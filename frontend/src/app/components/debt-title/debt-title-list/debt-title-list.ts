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
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { InputComponent } from '../../../shared/components/input/input.component';
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
    FormsModule,
    ButtonComponent
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

  // Propriedades para filtros
  searchTerm = '';
  overdueFilter = '';
  dateRangeFilter = { start: '', end: '' };
  valueRangeFilter = { min: null, max: null };
  
  overdueOptions = [
    { value: '', label: 'Todos' },
    { value: 'overdue', label: 'Em Atraso' },
    { value: 'current', label: 'Em Dia' }
  ];
  
  // Propriedades para formatação
  currencyCode = 'BRL';
  locale = 'pt-BR';

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
    
    // Filtro por faixa de datas
    if (this.dateRangeFilter.start) {
      const startDate = new Date(this.dateRangeFilter.start);
      filtered = filtered.filter(item => new Date(item.dueDate) >= startDate);
    }
    
    if (this.dateRangeFilter.end) {
      const endDate = new Date(this.dateRangeFilter.end);
      filtered = filtered.filter(item => new Date(item.dueDate) <= endDate);
    }
    
    // Filtro por faixa de valores
    if (this.valueRangeFilter.min !== null && this.valueRangeFilter.min > 0) {
      filtered = filtered.filter(item => item.updatedValue >= this.valueRangeFilter.min!);
    }
    
    if (this.valueRangeFilter.max !== null && this.valueRangeFilter.max > 0) {
      filtered = filtered.filter(item => item.updatedValue <= this.valueRangeFilter.max!);
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
    this.dateRangeFilter = { start: '', end: '' };
    this.valueRangeFilter = { min: null, max: null };
    this.applyFilters();
  }
  
  /**
   * Verifica se há filtros ativos
   */
  hasActiveFilters(): boolean {
    return !!(this.searchTerm || 
             this.overdueFilter || 
             this.dateRangeFilter.start || 
             this.dateRangeFilter.end || 
             this.valueRangeFilter.min || 
             this.valueRangeFilter.max);
  }
  
  /**
   * Manipula mudanças no filtro de data
   */
  onDateRangeChange(): void {
    this.applyFilters();
  }
  
  /**
   * Manipula mudanças no filtro de valor
   */
  onValueRangeChange(): void {
    this.applyFilters();
  }
  
  /**
   * Exporta dados filtrados para CSV
   */
  exportToCSV(): void {
    if (this.filteredDebtTitles.length === 0) {
      this.notificationService.warning('Não há dados para exportar');
      return;
    }
    
    const headers = ['Número', 'Devedor', 'Documento', 'Valor Original', 'Valor Atualizado', 'Vencimento', 'Status', 'Dias Atraso'];
    const csvData = this.filteredDebtTitles.map(item => [
      item.titleNumber,
      item.debtorName,
      item.debtorDocument,
      item.originalValue.toString(),
      item.updatedValue.toString(),
      this.formatDate(item.dueDate),
      item.isOverdue ? 'Em Atraso' : 'Em Dia',
      item.daysOverdue.toString()
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `titulos-divida-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.notificationService.success('Dados exportados com sucesso');
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
            this.loadingService.hide();
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
   * Formata valor monetário com opções avançadas
   */
  formatCurrency(value: number, compact = false): string {
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: this.currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    };
    
    if (compact && value >= 1000) {
      options.notation = 'compact';
      options.compactDisplay = 'short';
    }
    
    return new Intl.NumberFormat(this.locale, options).format(value);
  }

  /**
   * Formata data com opções avançadas
   */
  formatDate(date: string, format: 'short' | 'medium' | 'long' = 'short'): string {
    const dateObj = new Date(date);
    
    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString(this.locale);
      case 'medium':
        return dateObj.toLocaleDateString(this.locale, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      case 'long':
        return dateObj.toLocaleDateString(this.locale, {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
      default:
        return dateObj.toLocaleDateString(this.locale);
    }
  }
  
  /**
   * Calcula dias em atraso com formatação
   */
  formatOverdueDays(daysOverdue: number): string {
    if (daysOverdue <= 0) return 'Em dia';
    if (daysOverdue === 1) return '1 dia';
    return `${daysOverdue} dias`;
  }
  
  /**
   * Formata status com cor
   */
  getStatusInfo(debtTitle: DebtTitle): { text: string; class: string } {
    if (debtTitle.isOverdue) {
      return {
        text: `Atraso: ${this.formatOverdueDays(debtTitle.daysOverdue)}`,
        class: 'status-overdue'
      };
    }
    return {
      text: 'Em dia',
      class: 'status-current'
    };
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
