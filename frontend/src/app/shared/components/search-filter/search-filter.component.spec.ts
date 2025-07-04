import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SearchFilterComponent } from './search-filter.component';
import { SearchFilterService } from '../../../services/search-filter.service';
import { AccessibilityService } from '../../../services/accessibility.service';
import { of } from 'rxjs';

describe('SearchFilterComponent', () => {
  let component: SearchFilterComponent;
  let fixture: ComponentFixture<SearchFilterComponent>;
  let mockSearchFilterService: jasmine.SpyObj<SearchFilterService>;
  let mockAccessibilityService: jasmine.SpyObj<AccessibilityService>;

  beforeEach(async () => {
    const searchFilterSpy = jasmine.createSpyObj('SearchFilterService', [
      'setSearchTerm',
      'setStatusFilter',
      'setSorting',
      'setValueRange',
      'setDateRange',
      'clearFilters',
      'getSearchSuggestions',
      'exportToCSV',
      'exportToJSON',
      'getCurrentFilters'
    ]);

    const accessibilitySpy = jasmine.createSpyObj('AccessibilityService', [
      'announce',
      'setFocus'
    ]);

    searchFilterSpy.getCurrentFilters.and.returnValue({
      searchTerm: '',
      statusFilter: 'all',
      sortBy: 'createdAt',
      sortDirection: 'desc',
      valueRange: { min: null, max: null },
      dateRange: { start: null, end: null }
    });

    await TestBed.configureTestingModule({
      declarations: [SearchFilterComponent],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatAutocompleteModule,
        MatSliderModule,
        MatExpansionModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: SearchFilterService, useValue: searchFilterSpy },
        { provide: AccessibilityService, useValue: accessibilitySpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFilterComponent);
    component = fixture.componentInstance;
    mockSearchFilterService = TestBed.inject(SearchFilterService) as jasmine.SpyObj<SearchFilterService>;
    mockAccessibilityService = TestBed.inject(AccessibilityService) as jasmine.SpyObj<AccessibilityService>;
    
    mockSearchFilterService.getSearchSuggestions.and.returnValue(['João Silva', 'Maria Santos']);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.filterForm.get('searchTerm')?.value).toBe('');
    expect(component.filterForm.get('status')?.value).toBe('all');
    expect(component.filterForm.get('sortBy')?.value).toBe('createdAt');
    expect(component.filterForm.get('sortDirection')?.value).toBe('desc');
  });

  describe('Search functionality', () => {
    it('should call setSearchTerm when search input changes', () => {
      const searchControl = component.filterForm.get('searchTerm');
      searchControl?.setValue('João');
      
      expect(mockSearchFilterService.setSearchTerm).toHaveBeenCalledWith('João');
    });

    it('should update search suggestions when typing', () => {
      const searchControl = component.filterForm.get('searchTerm');
      searchControl?.setValue('Jo');
      
      expect(mockSearchFilterService.getSearchSuggestions).toHaveBeenCalledWith('Jo');
      expect(component.searchSuggestions.length).toBe(2);
    });

    it('should clear search suggestions when input is empty', () => {
      const searchControl = component.filterForm.get('searchTerm');
      searchControl?.setValue('');
      
      expect(component.searchSuggestions.length).toBe(0);
    });
  });

  describe('Status filter', () => {
    it('should call setStatusFilter when status changes', () => {
      const statusControl = component.filterForm.get('status');
      statusControl?.setValue('overdue');
      
      expect(mockSearchFilterService.setStatusFilter).toHaveBeenCalledWith('overdue');
    });

    it('should announce filter change for accessibility', () => {
      const statusControl = component.filterForm.get('status');
      statusControl?.setValue('paid');
      
      expect(mockAccessibilityService.announce).toHaveBeenCalledWith(
        'Filtro de status alterado para: Pago',
        'polite'
      );
    });
  });

  describe('Sorting', () => {
    it('should call setSorting when sort field changes', () => {
      const sortByControl = component.filterForm.get('sortBy');
      sortByControl?.setValue('debtorName');
      
      expect(mockSearchFilterService.setSorting).toHaveBeenCalledWith('debtorName', 'desc');
    });

    it('should call setSorting when sort direction changes', () => {
      const sortDirectionControl = component.filterForm.get('sortDirection');
      sortDirectionControl?.setValue('asc');
      
      expect(mockSearchFilterService.setSorting).toHaveBeenCalledWith('createdAt', 'asc');
    });
  });

  describe('Value range filter', () => {
    it('should call setValueRange when range changes', () => {
      component.onValueRangeChange({ min: 100, max: 1000 });
      
      expect(mockSearchFilterService.setValueRange).toHaveBeenCalledWith(100, 1000);
    });

    it('should announce range change for accessibility', () => {
      component.onValueRangeChange({ min: 500, max: 2000 });
      
      expect(mockAccessibilityService.announce).toHaveBeenCalledWith(
        'Filtro de valor alterado: R$ 500,00 a R$ 2.000,00',
        'polite'
      );
    });
  });

  describe('Date range filter', () => {
    it('should call setDateRange when date range changes', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      component.onDateRangeChange({ start: startDate, end: endDate });
      
      expect(mockSearchFilterService.setDateRange).toHaveBeenCalledWith(startDate, endDate);
    });

    it('should announce date range change for accessibility', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      component.onDateRangeChange({ start: startDate, end: endDate });
      
      expect(mockAccessibilityService.announce).toHaveBeenCalledWith(
        jasmine.stringContaining('Filtro de data alterado'),
        'polite'
      );
    });
  });

  describe('Clear filters', () => {
    it('should call clearFilters and reset form', () => {
      // Set some values first
      component.filterForm.patchValue({
        searchTerm: 'João',
        status: 'overdue',
        sortBy: 'debtorName'
      });
      
      component.clearFilters();
      
      expect(mockSearchFilterService.clearFilters).toHaveBeenCalled();
      expect(component.filterForm.get('searchTerm')?.value).toBe('');
      expect(component.filterForm.get('status')?.value).toBe('all');
    });

    it('should announce filter clear for accessibility', () => {
      component.clearFilters();
      
      expect(mockAccessibilityService.announce).toHaveBeenCalledWith(
        'Todos os filtros foram limpos',
        'polite'
      );
    });
  });

  describe('Export functionality', () => {
    beforeEach(() => {
      component.filteredItems = [
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
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          installments: []
        }
      ];
    });

    it('should export to CSV', () => {
      component.exportData('csv');
      
      expect(mockSearchFilterService.exportToCSV).toHaveBeenCalledWith(
        component.filteredItems,
        jasmine.stringContaining('titulos_')
      );
    });

    it('should export to JSON', () => {
      component.exportData('json');
      
      expect(mockSearchFilterService.exportToJSON).toHaveBeenCalledWith(
        component.filteredItems,
        jasmine.stringContaining('titulos_')
      );
    });

    it('should announce export completion', () => {
      component.exportData('csv');
      
      expect(mockAccessibilityService.announce).toHaveBeenCalledWith(
        'Exportação concluída',
        'polite'
      );
    });
  });

  describe('Keyboard navigation', () => {
    it('should handle Enter key on search suggestions', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(event, 'preventDefault');
      
      component.onSuggestionKeyDown(event, 'João Silva');
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.filterForm.get('searchTerm')?.value).toBe('João Silva');
    });

    it('should handle Escape key to close suggestions', () => {
      component.searchSuggestions = ['João Silva', 'Maria Santos'];
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      
      component.onSearchKeyDown(event);
      
      expect(component.searchSuggestions.length).toBe(0);
    });

    it('should handle ArrowDown key for suggestion navigation', () => {
      component.searchSuggestions = ['João Silva', 'Maria Santos'];
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      spyOn(event, 'preventDefault');
      
      component.onSearchKeyDown(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.selectedSuggestionIndex).toBe(0);
    });

    it('should handle ArrowUp key for suggestion navigation', () => {
      component.searchSuggestions = ['João Silva', 'Maria Santos'];
      component.selectedSuggestionIndex = 1;
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      spyOn(event, 'preventDefault');
      
      component.onSearchKeyDown(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.selectedSuggestionIndex).toBe(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const compiled = fixture.nativeElement;
      const searchInput = compiled.querySelector('input[placeholder="Buscar por devedor ou número do título..."]');
      
      expect(searchInput.getAttribute('aria-label')).toBeTruthy();
    });

    it('should announce filter changes', () => {
      const statusControl = component.filterForm.get('status');
      statusControl?.setValue('active');
      
      expect(mockAccessibilityService.announce).toHaveBeenCalled();
    });

    it('should have keyboard navigation support', () => {
      const compiled = fixture.nativeElement;
      const filterButtons = compiled.querySelectorAll('button');
      
      filterButtons.forEach((button: HTMLElement) => {
        expect(button.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Form validation', () => {
    it('should validate value range inputs', () => {
      const minValueControl = component.filterForm.get('minValue');
      const maxValueControl = component.filterForm.get('maxValue');
      
      minValueControl?.setValue(-100);
      expect(minValueControl?.hasError('min')).toBe(true);
      
      maxValueControl?.setValue(50);
      minValueControl?.setValue(100);
      expect(component.filterForm.hasError('rangeInvalid')).toBe(true);
    });

    it('should validate date range inputs', () => {
      const startDateControl = component.filterForm.get('startDate');
      const endDateControl = component.filterForm.get('endDate');
      
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      startDateControl?.setValue(futureDate);
      expect(startDateControl?.hasError('futureDate')).toBe(true);
      
      endDateControl?.setValue(new Date('2024-01-01'));
      startDateControl?.setValue(new Date('2024-01-31'));
      expect(component.filterForm.hasError('dateRangeInvalid')).toBe(true);
    });
  });

  describe('Component lifecycle', () => {
    it('should unsubscribe on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});