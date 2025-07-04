import { Component, Input, Output, EventEmitter, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DebtTitle, SortConfig, PaginationConfig } from '../../models/debt-title.model';

@Component({
  selector: 'app-debt-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './debt-table.html',
  styleUrl: './debt-table.scss'
})
export class DebtTable implements OnInit, OnDestroy {
  @Input() data: DebtTitle[] = [];
  @Input() loading = false;
  @Input() totalCount = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions = [5, 10, 25, 50, 100];
  @Input() sortConfig: SortConfig = { field: 'daysOverdue', direction: 'desc' };
  @Input() currentPage = 0;
  @Input() debts: DebtTitle[] = [];
  
  @Output() sortChanged = new EventEmitter<SortConfig>();
  @Output() pageChanged = new EventEmitter<PaginationConfig>();
  @Output() rowClicked = new EventEmitter<DebtTitle>();
  @Output() actionClicked = new EventEmitter<{action: string, debt: DebtTitle}>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<DebtTitle>();
  displayedColumns: string[] = [
    'titleNumber',
    'debtorName', 
    'installmentCount',
    'originalValue',
    'daysOverdue',
    'updatedValue',
    'status',
    'actions'
  ];

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.setupDataSource();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupDataSource(): void {
    this.dataSource.data = this.data;
    
    if (this.sort) {
      this.sort.sortChange
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          const sortConfig: SortConfig = {
            field: this.sort.active as keyof DebtTitle,
            direction: this.sort.direction as 'asc' | 'desc'
          };
          this.sortChanged.emit(sortConfig);
        });
    }

    if (this.paginator) {
      this.paginator.page
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          const paginationConfig: PaginationConfig = {
            page: this.paginator.pageIndex,
            size: this.paginator.pageSize,
            total: this.totalCount
          };
          this.pageChanged.emit(paginationConfig);
        });
    }
  }

  onRowClick(debt: DebtTitle): void {
    this.rowClicked.emit(debt);
  }

  onActionClick(action: string, debt: DebtTitle, event: Event): void {
    event.stopPropagation();
    this.actionClicked.emit({ action, debt });
  }

  getStatusClass(debt: DebtTitle): string {
    if (debt.isOverdue) {
      if (debt.daysOverdue > 90) return 'status-critical';
      if (debt.daysOverdue > 60) return 'status-high';
      if (debt.daysOverdue > 30) return 'status-medium';
      return 'status-low';
    }
    return 'status-current';
  }

  getStatusLabel(debt: DebtTitle): string {
    if (debt.isOverdue) {
      if (debt.daysOverdue > 90) return 'Crítico';
      if (debt.daysOverdue > 60) return 'Alto';
      if (debt.daysOverdue > 30) return 'Médio';
      return 'Baixo';
    }
    return 'Em dia';
  }

  getStatusIcon(debt: DebtTitle): string {
    if (debt.isOverdue) {
      if (debt.daysOverdue > 90) return 'error';
      if (debt.daysOverdue > 60) return 'warning';
      if (debt.daysOverdue > 30) return 'schedule';
      return 'info';
    }
    return 'check_circle';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }

  getOverduePercentage(debt: DebtTitle): number {
    if (debt.originalValue === 0) return 0;
    return ((debt.updatedValue - debt.originalValue) / debt.originalValue) * 100;
  }

  getRowAriaLabel(debt: DebtTitle): string {
    return `Título ${debt.titleNumber}, devedor ${debt.debtorName}, ` +
           `${debt.installmentCount} parcelas, valor original ${this.formatCurrency(debt.originalValue)}, ` +
           `${debt.daysOverdue} dias em atraso, valor atualizado ${this.formatCurrency(debt.updatedValue)}, ` +
           `status ${this.getStatusLabel(debt)}`;
  }

  trackByDebtId(index: number, debt: DebtTitle): string {
    return debt.id;
  }

  // Keyboard navigation
  onKeyDown(event: KeyboardEvent, debt: DebtTitle): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onRowClick(debt);
    }
  }

  // Export functionality
  exportToCSV(): void {
    const headers = [
      'Número do Título',
      'Nome do Devedor',
      'Quantidade de Parcelas',
      'Valor Original',
      'Dias em Atraso',
      'Valor Atualizado',
      'Status',
      'Data de Criação'
    ];

    const csvData = this.data.map(debt => [
      debt.titleNumber,
      debt.debtorName,
      debt.installmentCount,
      debt.originalValue,
      debt.daysOverdue,
      debt.updatedValue,
      this.getStatusLabel(debt),
      this.formatDate(debt.createdAt)
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
  }

  // Update data when input changes
  ngOnChanges(): void {
    if (this.dataSource) {
      this.dataSource.data = this.data;
    }
  }
}