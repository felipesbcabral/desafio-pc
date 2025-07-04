import { TestBed } from '@angular/core/testing';
import { SearchFilterService } from './search-filter.service';
import { DebtTitle } from '../models/debt-title.model';

describe('SearchFilterService', () => {
  let service: SearchFilterService;
  let mockTitles: DebtTitle[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchFilterService);
    
    // Mock data
    mockTitles = [
      {
        id: '1',
        titleNumber: 'TIT-001',
        debtorName: 'João Silva',
        debtorDocument: '123.456.789-00',
        debtorEmail: 'joao@email.com',
        debtorPhone: '(11) 99999-9999',
        originalValue: 1000,
        dueDate: new Date('2024-01-15'),
        status: 'active',
        createdAt: new Date('2023-12-01'),
        updatedAt: new Date('2023-12-01'),
        installments: []
      },
      {
        id: '2',
        titleNumber: 'TIT-002',
        debtorName: 'Maria Santos',
        debtorDocument: '987.654.321-00',
        debtorEmail: 'maria@email.com',
        debtorPhone: '(11) 88888-8888',
        originalValue: 2000,
        dueDate: new Date('2023-12-01'),
        status: 'overdue',
        createdAt: new Date('2023-11-01'),
        updatedAt: new Date('2023-11-01'),
        installments: []
      },
      {
        id: '3',
        titleNumber: 'TIT-003',
        debtorName: 'Pedro Costa',
        debtorDocument: '456.789.123-00',
        debtorEmail: 'pedro@email.com',
        debtorPhone: '(11) 77777-7777',
        originalValue: 500,
        dueDate: new Date('2024-02-01'),
        status: 'paid',
        createdAt: new Date('2023-10-01'),
        updatedAt: new Date('2023-10-01'),
        installments: []
      }
    ];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setItems', () => {
    it('should set items and emit filtered results', () => {
      let result: any;
      
      service.filteredResults$.subscribe(res => {
        result = res;
      });
      
      service.setItems(mockTitles);
      
      expect(result.items).toEqual(mockTitles);
      expect(result.total).toBe(3);
    });
  });

  describe('setSearchTerm', () => {
    beforeEach(() => {
      service.setItems(mockTitles);
    });

    it('should filter by debtor name', () => {
      let result: any;
      
      service.filteredResults$.subscribe(res => {
        result = res;
      });
      
      service.setSearchTerm('João');
      
      expect(result.items.length).toBe(1);
      expect(result.items[0].debtorName).toBe('João Silva');
    });

    it('should filter by title number', () => {
      let result: any;
      
      service.filteredResults$.subscribe(res => {
        result = res;
      });
      
      service.setSearchTerm('TIT-002');
      
      expect(result.items.length).toBe(1);
      expect(result.items[0].titleNumber).toBe('TIT-002');
    });

    it('should be case insensitive', () => {
      let result: any;
      
      service.filteredResults$.subscribe(res => {
        result = res;
      });
      
      service.setSearchTerm('joão');
      
      expect(result.items.length).toBe(1);
      expect(result.items[0].debtorName).toBe('João Silva');
    });

    it('should return all items when search term is empty', () => {
      let result: any;
      
      service.filteredResults$.subscribe(res => {
        result = res;
      });
      
      service.setSearchTerm('');
      
      expect(result.items.length).toBe(3);
    });
  });

  describe('setStatusFilter', () => {
    beforeEach(() => {
      service.setItems(mockTitles);
    });

    it('should filter by status', () => {
      let result: any;
      
      service.filteredResults$.subscribe(res => {
        result = res;
      });
      
      service.setStatusFilter('overdue');
      
      expect(result.items.length).toBe(1);
      expect(result.items[0].status).toBe('overdue');
    });

    it('should return all items when status filter is "all"', () => {
      let result: any;
      
      service.filteredResults$.subscribe(res => {
        result = res;
      });
      
      service.setStatusFilter('all');
      
      expect(result.items.length).toBe(3);
    });
  });

  describe('setSorting', () => {
    beforeEach(() => {
      service.setItems(mockTitles);
    });

    it('should sort by debtor name ascending', () => {
      let result: any;
      
      service.filteredResults$.subscribe(res => {
        result = res;
      });
      
      service.setSorting('debtorName', 'asc');
      
      expect(result.items[0].debtorName).toBe('João Silva');
      expect(result.items[1].debtorName).toBe('Maria Santos');
      expect(result.items[2].debtorName).toBe('Pedro Costa');
    });

    it('should sort by debtor name descending', () => {
      let result: any;
      
      service.filteredResults$.subscribe(res => {
        result = res;
      });
      
      service.setSorting('debtorName', 'desc');
      
      expect(result.items[0].debtorName).toBe('Pedro Costa');
      expect(result.items[1].debtorName).toBe('Maria Santos');
      expect(result.items[2].debtorName).toBe('João Silva');
    });

    it('should sort by value ascending', () => {
      let result: any;
      
      service.filteredResults$.subscribe(res => {
        result = res;
      });
      
      service.setSorting('originalValue', 'asc');
      
      expect(result.items[0].originalValue).toBe(500);
      expect(result.items[1].originalValue).toBe(1000);
      expect(result.items[2].originalValue).toBe(2000);
    });

    it('should sort by due date ascending', () => {
      let result: any;
      
      service.filteredResults$.subscribe(res => {
        result = res;
      });
      
      service.setSorting('dueDate', 'asc');
      
      expect(result.items[0].dueDate.getTime()).toBeLessThan(result.items[1].dueDate.getTime());
    });
  });

  describe('setValueRange', () => {
    beforeEach(() => {
      service.setItems(mockTitles);
    });

    it('should filter by value range', () => {
      let result: any;
      
      service.filteredResults$.subscribe(res => {
        result = res;
      });
      
      service.setValueRange(800, 1500);
      
      expect(result.items.length).toBe(1);
      expect(result.items[0].originalValue).toBe(1000);
    });

    it('should include items at range boundaries', () => {
      let result: any;
      
      service.filteredResults$.subscribe(res => {
        result = res;
      });
      
      service.setValueRange(500, 1000);
      
      expect(result.items.length).toBe(2);
      expect(result.items.some(item => item.originalValue === 500)).toBe(true);
      expect(result.items.some(item => item.originalValue === 1000)).toBe(true);
    });
  });

  describe('setDateRange', () => {
    beforeEach(() => {
      service.setItems(mockTitles);
    });

    it('should filter by date range', () => {
      let result: any;
      
      service.filteredResults$.subscribe(res => {
        result = res;
      });
      
      service.setDateRange(new Date('2024-01-01'), new Date('2024-01-31'));
      
      expect(result.items.length).toBe(1);
      expect(result.items[0].titleNumber).toBe('TIT-001');
    });
  });

  describe('clearFilters', () => {
    beforeEach(() => {
      service.setItems(mockTitles);
      service.setSearchTerm('João');
      service.setStatusFilter('active');
      service.setSorting('debtorName', 'desc');
    });

    it('should reset all filters to default values', () => {
      let result: any;
      
      service.filteredResults$.subscribe(res => {
        result = res;
      });
      
      service.clearFilters();
      
      expect(result.items.length).toBe(3);
      
      const currentFilters = service.getCurrentFilters();
      expect(currentFilters.searchTerm).toBe('');
      expect(currentFilters.statusFilter).toBe('all');
      expect(currentFilters.sortBy).toBe('createdAt');
      expect(currentFilters.sortDirection).toBe('desc');
    });
  });

  describe('getSearchSuggestions', () => {
    beforeEach(() => {
      service.setItems(mockTitles);
    });

    it('should return debtor name suggestions', () => {
      const suggestions = service.getSearchSuggestions('Jo');
      
      expect(suggestions.length).toBe(1);
      expect(suggestions[0]).toBe('João Silva');
    });

    it('should return title number suggestions', () => {
      const suggestions = service.getSearchSuggestions('TIT');
      
      expect(suggestions.length).toBe(3);
      expect(suggestions).toContain('TIT-001');
      expect(suggestions).toContain('TIT-002');
      expect(suggestions).toContain('TIT-003');
    });

    it('should limit suggestions to maximum count', () => {
      const suggestions = service.getSearchSuggestions('TIT', 2);
      
      expect(suggestions.length).toBe(2);
    });

    it('should return empty array for no matches', () => {
      const suggestions = service.getSearchSuggestions('xyz');
      
      expect(suggestions.length).toBe(0);
    });
  });

  describe('exportToCSV', () => {
    it('should create CSV content', () => {
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:url');
      spyOn(window.URL, 'revokeObjectURL');
      
      const link = document.createElement('a');
      spyOn(document, 'createElement').and.returnValue(link);
      spyOn(link, 'click');
      
      service.exportToCSV(mockTitles, 'test.csv');
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(link.click).toHaveBeenCalled();
    });
  });

  describe('exportToJSON', () => {
    it('should create JSON content', () => {
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:url');
      spyOn(window.URL, 'revokeObjectURL');
      
      const link = document.createElement('a');
      spyOn(document, 'createElement').and.returnValue(link);
      spyOn(link, 'click');
      
      service.exportToJSON(mockTitles, 'test.json');
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(link.click).toHaveBeenCalled();
    });
  });
});