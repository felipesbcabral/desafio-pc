import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SearchFilterService, FilterOptions } from '../../../services/search-filter.service';
import { InputComponent } from '../input/input.component';
import { ButtonComponent } from '../button/button.component';
import { AccessibleDirective } from '../../directives/accessible.directive';

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputComponent,
    ButtonComponent,
    AccessibleDirective
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="search-filter-container" role="search" aria-label="Busca e filtros">
      <!-- Barra de Busca -->
      <div class="search-section">
        <div class="search-input-container">
          <app-input
            [value]="searchTerm"
            placeholder="Buscar por devedor, número do título ou documento..."
            type="search"
            (inputChange)="onSearchChange($event)"
            [appAccessible]="{
               ariaLabel: 'Campo de busca',
               announceOnFocus: 'Campo de busca ativo'
             }"
             class="search-input"
          ></app-input>
          
          <div class="search-suggestions" *ngIf="suggestions.length > 0" role="listbox">
            <button
              *ngFor="let suggestion of suggestions; trackBy: trackBySuggestion"
              class="suggestion-item"
              role="option"
              (click)="selectSuggestion(suggestion)"
              [appAccessible]="{
                ariaLabel: 'Sugestão: ' + suggestion,
                keyboardActivatable: true
              }"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <app-button
          variant="secondary"
          size="md"
          (click)="clearSearch()"
          [disabled]="!searchTerm"
          [appAccessible]="{
            ariaLabel: 'Limpar busca',
            announceOnClick: 'Busca limpa'
          }"
        >
          <i class="icon-clear" aria-hidden="true"></i>
          Limpar
        </app-button>
      </div>

      <!-- Filtros -->
      <div class="filters-section" [class.expanded]="showFilters">
        <div class="filters-header">
          <h3>Filtros</h3>
          <app-button
            variant="ghost"
            size="sm"
            (click)="toggleFilters()"
            [appAccessible]="{
              ariaLabel: showFilters ? 'Ocultar filtros' : 'Mostrar filtros',
              announceOnClick: showFilters ? 'Filtros ocultados' : 'Filtros exibidos'
            }"
          >
            <i [class]="showFilters ? 'icon-chevron-up' : 'icon-chevron-down'" aria-hidden="true"></i>
            {{ showFilters ? 'Ocultar' : 'Mostrar' }} Filtros
          </app-button>
        </div>

        <div class="filters-content" *ngIf="showFilters">
          <!-- Filtro de Status -->
          <div class="filter-group">
            <label for="status-filter" class="filter-label">Status</label>
            <select
              id="status-filter"
              [(ngModel)]="statusFilter"
              (ngModelChange)="onStatusChange($event)"
              class="filter-select"
              [appAccessible]="{
                ariaLabel: 'Filtro de status'
              }"
            >
              <option value="all">Todos</option>
              <option value="active">Em Dia</option>
              <option value="overdue">Em Atraso</option>
              <option value="paid">Pagos</option>
            </select>
          </div>

          <!-- Filtro de Data -->
          <div class="filter-group">
            <label class="filter-label">Período de Vencimento</label>
            <div class="date-range">
              <app-input
                [value]="dateStart"
                type="date"
                placeholder="Data inicial"
                (inputChange)="onDateStartChange($event)"
                [appAccessible]="{
                  ariaLabel: 'Data inicial do período'
                }"
              ></app-input>
              <span class="date-separator">até</span>
              <app-input
                [value]="dateEnd"
                type="date"
                placeholder="Data final"
                (inputChange)="onDateEndChange($event)"
                [appAccessible]="{
                  ariaLabel: 'Data final do período'
                }"
              ></app-input>
            </div>
          </div>

          <!-- Filtro de Valor -->
          <div class="filter-group">
            <label class="filter-label">Faixa de Valor</label>
            <div class="value-range">
              <app-input
                [value]="valueMin?.toString() || ''"
                type="number"
                placeholder="Valor mínimo"
                (inputChange)="onValueMinChange($event)"
                [appAccessible]="{
                  ariaLabel: 'Valor mínimo'
                }"
              ></app-input>
              <span class="value-separator">até</span>
              <app-input
                [value]="valueMax?.toString() || ''"
                type="number"
                placeholder="Valor máximo"
                (inputChange)="onValueMaxChange($event)"
                [appAccessible]="{
                  ariaLabel: 'Valor máximo'
                }"
              ></app-input>
            </div>
          </div>

          <!-- Ações dos Filtros -->
          <div class="filter-actions">
            <app-button
              variant="secondary"
              size="sm"
              (click)="clearAllFilters()"
              [disabled]="!hasActiveFilters"
              [appAccessible]="{
                ariaLabel: 'Limpar todos os filtros',
                announceOnClick: 'Todos os filtros foram limpos'
              }"
            >
              Limpar Filtros
            </app-button>
            
            <app-button
              variant="primary"
              size="sm"
              (click)="applyFilters()"
              [appAccessible]="{
                ariaLabel: 'Aplicar filtros',
                announceOnClick: 'Filtros aplicados'
              }"
            >
              Aplicar
            </app-button>
          </div>
        </div>
      </div>

      <!-- Ordenação -->
      <div class="sorting-section">
        <label for="sort-select" class="sort-label">Ordenar por:</label>
        <select
          id="sort-select"
          [(ngModel)]="sortBy"
          (ngModelChange)="onSortChange()"
          class="sort-select"
          [appAccessible]="{
            ariaLabel: 'Ordenação'
          }"
        >
          <option value="titleNumber">Número do Título</option>
          <option value="debtorName">Nome do Devedor</option>
          <option value="originalValue">Valor Original</option>
          <option value="dueDate">Data de Vencimento</option>
          <option value="daysOverdue">Dias em Atraso</option>
        </select>
        
        <app-button
          variant="ghost"
          size="sm"
          (click)="toggleSortDirection()"
          [appAccessible]="{
            ariaLabel: 'Ordenação ' + (sortDirection === 'asc' ? 'crescente' : 'decrescente'),
            announceOnClick: 'Ordenação alterada para ' + (sortDirection === 'desc' ? 'crescente' : 'decrescente')
          }"
        >
          <i [class]="sortDirection === 'asc' ? 'icon-arrow-up' : 'icon-arrow-down'" aria-hidden="true"></i>
          {{ sortDirection === 'asc' ? 'Crescente' : 'Decrescente' }}
        </app-button>
      </div>

      <!-- Resultados -->
      <div class="results-info" *ngIf="showResultsInfo">
        <span class="results-count">
          Mostrando {{ filteredCount }} de {{ totalCount }} títulos
          <span *ngIf="hasActiveFilters" class="filtered-indicator">(filtrado)</span>
        </span>
        
        <div class="export-actions">
          <app-button
            variant="outline"
            size="sm"
            (click)="exportCSV()"
            [appAccessible]="{
              ariaLabel: 'Exportar para CSV',
              announceOnClick: 'Exportando dados para CSV'
            }"
          >
            <i class="icon-download" aria-hidden="true"></i>
            CSV
          </app-button>
          
          <app-button
            variant="outline"
            size="sm"
            (click)="exportJSON()"
            [appAccessible]="{
              ariaLabel: 'Exportar para JSON',
              announceOnClick: 'Exportando dados para JSON'
            }"
          >
            <i class="icon-download" aria-hidden="true"></i>
            JSON
          </app-button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './search-filter.component.scss'
})
export class SearchFilterComponent implements OnInit, OnDestroy {
  @Input() showResultsInfo = true;
  @Input() totalCount = 0;
  @Input() filteredCount = 0;
  @Output() filtersChange = new EventEmitter<FilterOptions>();
  @Output() exportData = new EventEmitter<{ type: 'csv' | 'json' }>();

  searchTerm = '';
  statusFilter: FilterOptions['status'] = 'all';
  sortBy: FilterOptions['sortBy'] = 'titleNumber';
  sortDirection: FilterOptions['sortDirection'] = 'asc';
  dateStart = '';
  dateEnd = '';
  valueMin: number | null = null;
  valueMax: number | null = null;
  
  showFilters = false;
  suggestions: string[] = [];
  hasActiveFilters = false;

  private destroy$ = new Subject<void>();

  constructor(private searchFilterService: SearchFilterService) {}

  ngOnInit(): void {
    // Observar sugestões de busca
    this.searchFilterService.getSuggestions(this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe(suggestions => {
        this.suggestions = suggestions;
      });

    this.updateActiveFiltersStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.searchFilterService.setSearchTerm(term);
    this.emitFiltersChange();
    
    // Atualizar sugestões
    this.searchFilterService.getSuggestions(term)
      .pipe(takeUntil(this.destroy$))
      .subscribe(suggestions => {
        this.suggestions = suggestions;
      });
  }

  selectSuggestion(suggestion: string): void {
    this.searchTerm = suggestion;
    this.suggestions = [];
    this.onSearchChange(suggestion);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.suggestions = [];
    this.onSearchChange('');
  }

  onStatusChange(status: FilterOptions['status']): void {
    this.statusFilter = status;
    this.searchFilterService.setStatusFilter(status);
    this.emitFiltersChange();
    this.updateActiveFiltersStatus();
  }

  onDateStartChange(value: string): void {
    this.dateStart = value;
    this.onDateRangeChange();
  }

  onDateEndChange(value: string): void {
    this.dateEnd = value;
    this.onDateRangeChange();
  }

  onDateRangeChange(): void {
    if (this.dateStart && this.dateEnd) {
      this.searchFilterService.setDateRange(new Date(this.dateStart), new Date(this.dateEnd));
      this.emitFiltersChange();
    }
    this.updateActiveFiltersStatus();
  }

  onValueMinChange(value: string): void {
    this.valueMin = value ? parseFloat(value) : null;
    this.onValueRangeChange();
  }

  onValueMaxChange(value: string): void {
    this.valueMax = value ? parseFloat(value) : null;
    this.onValueRangeChange();
  }

  onValueRangeChange(): void {
    if (this.valueMin !== null && this.valueMax !== null) {
      this.searchFilterService.setValueRange(this.valueMin, this.valueMax);
      this.emitFiltersChange();
    }
    this.updateActiveFiltersStatus();
  }

  onSortChange(): void {
    this.searchFilterService.setSorting(this.sortBy, this.sortDirection);
    this.emitFiltersChange();
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.onSortChange();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.dateStart = '';
    this.dateEnd = '';
    this.valueMin = null;
    this.valueMax = null;
    
    this.searchFilterService.clearFilters();
    this.emitFiltersChange();
    this.updateActiveFiltersStatus();
  }

  applyFilters(): void {
    this.emitFiltersChange();
  }

  exportCSV(): void {
    this.exportData.emit({ type: 'csv' });
  }

  exportJSON(): void {
    this.exportData.emit({ type: 'json' });
  }

  trackBySuggestion(index: number, suggestion: string): string {
    return suggestion;
  }

  private emitFiltersChange(): void {
    const filters: FilterOptions = {
      searchTerm: this.searchTerm,
      status: this.statusFilter,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      dateRange: this.dateStart && this.dateEnd ? {
        start: new Date(this.dateStart),
        end: new Date(this.dateEnd)
      } : undefined,
      valueRange: this.valueMin !== null && this.valueMax !== null ? {
        min: this.valueMin,
        max: this.valueMax
      } : undefined
    };
    
    this.filtersChange.emit(filters);
  }

  private updateActiveFiltersStatus(): void {
    this.hasActiveFilters = 
      this.searchTerm.trim() !== '' ||
      this.statusFilter !== 'all' ||
      !!(this.dateStart && this.dateEnd) ||
      (this.valueMin !== null && this.valueMax !== null);
  }
}