import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DebtTitle } from '../models/debt-title.model';

export interface FilterOptions {
  searchTerm: string;
  status: 'all' | 'active' | 'overdue' | 'paid';
  sortBy: 'titleNumber' | 'debtorName' | 'originalValue' | 'dueDate' | 'daysOverdue';
  sortDirection: 'asc' | 'desc';
  dateRange?: {
    start: Date;
    end: Date;
  };
  valueRange?: {
    min: number;
    max: number;
  };
}

export interface SearchResult {
  items: DebtTitle[];
  totalCount: number;
  filteredCount: number;
  hasFilters: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SearchFilterService {
  private searchTerm$ = new BehaviorSubject<string>('');
  private status$ = new BehaviorSubject<FilterOptions['status']>('all');
  private sortBy$ = new BehaviorSubject<FilterOptions['sortBy']>('titleNumber');
  private sortDirection$ = new BehaviorSubject<FilterOptions['sortDirection']>('asc');
  private dateRange$ = new BehaviorSubject<FilterOptions['dateRange'] | undefined>(undefined);
  private valueRange$ = new BehaviorSubject<FilterOptions['valueRange'] | undefined>(undefined);

  private allItems$ = new BehaviorSubject<DebtTitle[]>([]);

  constructor() {}

  /**
   * Define os itens para busca e filtro
   */
  setItems(items: DebtTitle[]): void {
    this.allItems$.next(items);
  }

  /**
   * Obtém os resultados filtrados e ordenados
   */
  getFilteredResults(): Observable<SearchResult> {
    return combineLatest([
      this.allItems$,
      this.searchTerm$.pipe(debounceTime(300), distinctUntilChanged()),
      this.status$,
      this.sortBy$,
      this.sortDirection$,
      this.dateRange$,
      this.valueRange$
    ]).pipe(
      map(([items, searchTerm, status, sortBy, sortDirection, dateRange, valueRange]) => {
        let filteredItems = [...items];
        const totalCount = items.length;

        // Aplicar filtro de busca por texto
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase().trim();
          filteredItems = filteredItems.filter(item => 
            item.debtorName.toLowerCase().includes(term) ||
            item.titleNumber.toLowerCase().includes(term) ||
            item.debtorDocument.toLowerCase().includes(term)
          );
        }

        // Aplicar filtro de status
        if (status !== 'all') {
          filteredItems = filteredItems.filter(item => {
            switch (status) {
              case 'overdue':
                return item.isOverdue;
              case 'active':
                return !item.isOverdue;
              case 'paid':
                // Assumindo que títulos pagos têm uma propriedade específica
                return (item as any).isPaid === true;
              default:
                return true;
            }
          });
        }

        // Aplicar filtro de data
        if (dateRange) {
          filteredItems = filteredItems.filter(item => {
            const dueDate = new Date(item.dueDate);
            return dueDate >= dateRange.start && dueDate <= dateRange.end;
          });
        }

        // Aplicar filtro de valor
        if (valueRange) {
          filteredItems = filteredItems.filter(item => 
            item.originalValue >= valueRange.min && item.originalValue <= valueRange.max
          );
        }

        // Aplicar ordenação
        filteredItems.sort((a, b) => {
          let aValue: any;
          let bValue: any;

          switch (sortBy) {
            case 'titleNumber':
              aValue = a.titleNumber;
              bValue = b.titleNumber;
              break;
            case 'debtorName':
              aValue = a.debtorName;
              bValue = b.debtorName;
              break;
            case 'originalValue':
              aValue = a.originalValue;
              bValue = b.originalValue;
              break;
            case 'dueDate':
              aValue = new Date(a.dueDate);
              bValue = new Date(b.dueDate);
              break;
            case 'daysOverdue':
              aValue = a.daysOverdue || 0;
              bValue = b.daysOverdue || 0;
              break;
            default:
              aValue = a.titleNumber;
              bValue = b.titleNumber;
          }

          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          let comparison = 0;
          if (aValue > bValue) {
            comparison = 1;
          } else if (aValue < bValue) {
            comparison = -1;
          }

          return sortDirection === 'desc' ? -comparison : comparison;
        });

        const hasFilters = searchTerm.trim() !== '' || 
                          status !== 'all' || 
                          dateRange !== undefined || 
                          valueRange !== undefined;

        return {
          items: filteredItems,
          totalCount,
          filteredCount: filteredItems.length,
          hasFilters
        };
      })
    );
  }

  /**
   * Define o termo de busca
   */
  setSearchTerm(term: string): void {
    this.searchTerm$.next(term);
  }

  /**
   * Define o filtro de status
   */
  setStatusFilter(status: FilterOptions['status']): void {
    this.status$.next(status);
  }

  /**
   * Define a ordenação
   */
  setSorting(sortBy: FilterOptions['sortBy'], direction: FilterOptions['sortDirection']): void {
    this.sortBy$.next(sortBy);
    this.sortDirection$.next(direction);
  }

  /**
   * Define o filtro de data
   */
  setDateRange(start: Date, end: Date): void {
    this.dateRange$.next({ start, end });
  }

  /**
   * Define o filtro de valor
   */
  setValueRange(min: number, max: number): void {
    this.valueRange$.next({ min, max });
  }

  /**
   * Limpa todos os filtros
   */
  clearFilters(): void {
    this.searchTerm$.next('');
    this.status$.next('all');
    this.dateRange$.next(undefined);
    this.valueRange$.next(undefined);
  }

  /**
   * Obtém o estado atual dos filtros
   */
  getCurrentFilters(): FilterOptions {
    return {
      searchTerm: this.searchTerm$.value,
      status: this.status$.value,
      sortBy: this.sortBy$.value,
      sortDirection: this.sortDirection$.value,
      dateRange: this.dateRange$.value,
      valueRange: this.valueRange$.value
    };
  }

  /**
   * Exporta os dados filtrados para CSV
   */
  exportToCSV(items: DebtTitle[], filename = 'debt-titles.csv'): void {
    const headers = [
      'Número do Título',
      'Nome do Devedor',
      'Documento',
      'Valor Original',
      'Valor Atualizado',
      'Data de Vencimento',
      'Dias em Atraso',
      'Status'
    ];

    const csvContent = [
      headers.join(','),
      ...items.map(item => [
        `"${item.titleNumber}"`,
        `"${item.debtorName}"`,
        `"${item.debtorDocument}"`,
        item.originalValue.toFixed(2),
        item.updatedValue.toFixed(2),
        `"${item.dueDate}"`,
        item.daysOverdue || 0,
        `"${item.isOverdue ? 'Em Atraso' : 'Em Dia'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Exporta os dados filtrados para JSON
   */
  exportToJSON(items: DebtTitle[], filename = 'debt-titles.json'): void {
    const jsonContent = JSON.stringify(items, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Busca sugestões baseadas no termo de busca
   */
  getSuggestions(term: string): Observable<string[]> {
    return this.allItems$.pipe(
      map(items => {
        if (!term.trim()) return [];
        
        const suggestions = new Set<string>();
        const searchTerm = term.toLowerCase();
        
        items.forEach(item => {
          if (item.debtorName.toLowerCase().includes(searchTerm)) {
            suggestions.add(item.debtorName);
          }
          if (item.titleNumber.toLowerCase().includes(searchTerm)) {
            suggestions.add(item.titleNumber);
          }
        });
        
        return Array.from(suggestions).slice(0, 5);
      })
    );
  }
}