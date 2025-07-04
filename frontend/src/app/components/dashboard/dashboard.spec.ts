import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { Dashboard } from './dashboard';
import { DebtTitleService } from '../../services/debt-title.service';
import { NotificationService } from '../../services/notification.service';
import { StatisticsService } from '../../services/statistics.service';
import { SearchFilterService } from '../../services/search-filter.service';
import { AccessibilityService } from '../../services/accessibility.service';
import { DebtTitle } from '../../models/debt-title.model';

// Mock components
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  template: '<button><ng-content></ng-content></button>'
})
class MockButtonComponent {
  @Input() variant: string = 'primary';
  @Input() size: string = 'medium';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() ariaLabel: string = '';
}

@Component({
  selector: 'app-card',
  template: '<div class="card"><ng-content></ng-content></div>'
})
class MockCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() elevation: number = 1;
  @Input() padding: string = 'medium';
}

@Component({
  selector: 'app-loading',
  template: '<div class="loading">Loading...</div>'
})
class MockLoadingComponent {
  @Input() size: string = 'medium';
  @Input() message: string = 'Carregando...';
}

@Component({
  selector: 'app-screen-reader',
  template: '<div class="sr-only"><ng-content></ng-content></div>'
})
class MockScreenReaderComponent {}

@Component({
  selector: 'app-search-filter',
  template: '<div class="search-filter">Search Filter</div>'
})
class MockSearchFilterComponent {
  @Input() filteredItems: any[] = [];
  @Output() filtersChange = new EventEmitter();
  @Output() exportData = new EventEmitter();
}

@Component({
  selector: 'app-chart',
  template: '<div class="chart">Chart</div>'
})
class MockChartComponent {
  @Input() type: string = 'bar';
  @Input() data: any = null;
  @Input() options: any = {};
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() height: number = 400;
  @Output() chartClick = new EventEmitter();
  @Output() chartHover = new EventEmitter();
}

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let mockDebtTitleService: jasmine.SpyObj<DebtTitleService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockStatisticsService: jasmine.SpyObj<StatisticsService>;
  let mockSearchFilterService: jasmine.SpyObj<SearchFilterService>;
  let mockAccessibilityService: jasmine.SpyObj<AccessibilityService>;

  const mockTitles: DebtTitle[] = [
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
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
      installments: []
    }
  ];

  beforeEach(async () => {
    const debtTitleSpy = jasmine.createSpyObj('DebtTitleService', ['getAll']);
    const notificationSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    const statisticsSpy = jasmine.createSpyObj('StatisticsService', [
      'setTitles',
      'formatCurrency',
      'formatPercentage',
      'exportStatisticsReport'
    ], {
      statistics$: of({
        totalTitles: 2,
        overdueTitles: 1,
        totalValue: 3000,
        overdueValue: 2000,
        averageValue: 1500,
        paidTitles: 0,
        paidValue: 0
      }),
      statusDistribution$: of([
        { label: 'Ativo', value: 1, color: '#4caf50' },
        { label: 'Em Atraso', value: 1, color: '#f44336' }
      ]),
      monthlyTrend$: of([
        { month: 'Jan 2024', count: 1, value: 1000 },
        { month: 'Fev 2024', count: 1, value: 2000 }
      ]),
      valueRangeDistribution$: of([
        { label: 'R$ 501 - R$ 1.000', value: 1, color: '#2196f3' },
        { label: 'R$ 1.001 - R$ 2.000', value: 1, color: '#ff9800' }
      ]),
      overdueAnalysis$: of([
        { period: '0-30 dias', count: 1, value: 2000, color: '#f44336' }
      ])
    });
    const searchFilterSpy = jasmine.createSpyObj('SearchFilterService', [
      'setItems',
      'exportToCSV',
      'exportToJSON'
    ], {
      filteredResults$: of({
        items: mockTitles,
        total: 2,
        hasFilters: false
      })
    });
    const accessibilitySpy = jasmine.createSpyObj('AccessibilityService', [
      'announce',
      'setFocus'
    ]);

    debtTitleSpy.getAll.and.returnValue(of(mockTitles));
    statisticsSpy.formatCurrency.and.returnValue('R$ 1.000,00');
    statisticsSpy.formatPercentage.and.returnValue('50,00%');

    await TestBed.configureTestingModule({
      declarations: [
        Dashboard,
        MockButtonComponent,
        MockCardComponent,
        MockLoadingComponent,
        MockScreenReaderComponent,
        MockSearchFilterComponent,
        MockChartComponent
      ],
      imports: [
        BrowserAnimationsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        RouterTestingModule
      ],
      providers: [
        { provide: DebtTitleService, useValue: debtTitleSpy },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: StatisticsService, useValue: statisticsSpy },
        { provide: SearchFilterService, useValue: searchFilterSpy },
        { provide: AccessibilityService, useValue: accessibilitySpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    mockDebtTitleService = TestBed.inject(DebtTitleService) as jasmine.SpyObj<DebtTitleService>;
    mockNotificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    mockStatisticsService = TestBed.inject(StatisticsService) as jasmine.SpyObj<StatisticsService>;
    mockSearchFilterService = TestBed.inject(SearchFilterService) as jasmine.SpyObj<SearchFilterService>;
    mockAccessibilityService = TestBed.inject(AccessibilityService) as jasmine.SpyObj<AccessibilityService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component initialization', () => {
    it('should initialize with default values', () => {
      expect(component.isLoading).toBe(true);
      expect(component.totalTitles).toBe(0);
      expect(component.overdueTitles).toBe(0);
      expect(component.totalValue).toBe(0);
      expect(component.overdueValue).toBe(0);
      expect(component.recentTitles).toEqual([]);
      expect(component.showAdvancedStats).toBe(false);
    });

    it('should load dashboard data on init', () => {
      component.ngOnInit();
      
      expect(mockDebtTitleService.getAll).toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
      expect(component.allTitles).toEqual(mockTitles);
    });

    it('should setup statistics observers', () => {
      component.ngOnInit();
      
      expect(mockStatisticsService.setTitles).toHaveBeenCalledWith(mockTitles);
      expect(mockSearchFilterService.setItems).toHaveBeenCalledWith(mockTitles);
    });

    it('should announce dashboard load for accessibility', () => {
      component.ngOnInit();
      
      expect(mockAccessibilityService.announce).toHaveBeenCalledWith(
        'Dashboard carregado com 2 títulos',
        'polite'
      );
    });
  });

  describe('Statistics display', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should display basic statistics', () => {
      expect(component.totalTitles).toBe(2);
      expect(component.overdueTitles).toBe(1);
      expect(component.totalValue).toBe(3000);
      expect(component.overdueValue).toBe(2000);
    });

    it('should calculate percentages correctly', () => {
      const overduePercentage = component.getOverdueTitlesPercentage();
      const overdueValuePercentage = component.getOverdueValuePercentage();
      
      expect(overduePercentage).toBe(50); // 1 out of 2
      expect(overdueValuePercentage).toBeCloseTo(66.67, 1); // 2000 out of 3000
    });

    it('should format currency values', () => {
      const formatted = component.formatCurrency(1000);
      expect(mockStatisticsService.formatCurrency).toHaveBeenCalledWith(1000);
      expect(formatted).toBe('R$ 1.000,00');
    });

    it('should format percentage values', () => {
      const formatted = component.formatPercentage(0.5);
      expect(mockStatisticsService.formatPercentage).toHaveBeenCalledWith(0.5);
      expect(formatted).toBe('50,00%');
    });
  });

  describe('Chart data', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should have status chart data', () => {
      expect(component.statusChartData).toBeDefined();
      expect(component.statusChartData.labels).toEqual(['Ativo', 'Em Atraso']);
      expect(component.statusChartData.datasets[0].data).toEqual([1, 1]);
    });

    it('should have monthly trend data', () => {
      expect(component.monthlyChartData).toBeDefined();
      expect(component.monthlyChartData.labels).toEqual(['Jan 2024', 'Fev 2024']);
      expect(component.monthlyChartData.datasets[0].data).toEqual([1, 1]);
    });

    it('should have value range distribution data', () => {
      expect(component.valueRangeChartData).toBeDefined();
      expect(component.valueRangeChartData.labels).toEqual(['R$ 501 - R$ 1.000', 'R$ 1.001 - R$ 2.000']);
      expect(component.valueRangeChartData.datasets[0].data).toEqual([1, 1]);
    });

    it('should have overdue analysis data', () => {
      expect(component.overdueChartData).toBeDefined();
      expect(component.overdueChartData.labels).toEqual(['0-30 dias']);
      expect(component.overdueChartData.datasets[0].data).toEqual([1]);
    });
  });

  describe('User interactions', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should toggle advanced statistics', () => {
      expect(component.showAdvancedStats).toBe(false);
      
      component.toggleAdvancedStats();
      
      expect(component.showAdvancedStats).toBe(true);
      expect(mockAccessibilityService.announce).toHaveBeenCalledWith(
        'Estatísticas avançadas exibidas',
        'polite'
      );
    });

    it('should handle filters change', () => {
      const filters = {
        searchTerm: 'João',
        statusFilter: 'active',
        sortBy: 'debtorName',
        sortDirection: 'asc'
      };
      
      component.onFiltersChange(filters);
      
      expect(mockAccessibilityService.announce).toHaveBeenCalledWith(
        'Filtros aplicados. 2 resultados encontrados.',
        'polite'
      );
    });

    it('should handle export data', () => {
      component.onExportData('csv');
      
      expect(mockSearchFilterService.exportToCSV).toHaveBeenCalled();
      expect(mockAccessibilityService.announce).toHaveBeenCalledWith(
        'Exportação iniciada',
        'polite'
      );
    });

    it('should export statistics report', () => {
      component.exportStatisticsReport('json');
      
      expect(mockStatisticsService.exportStatisticsReport).toHaveBeenCalledWith('json');
      expect(mockAccessibilityService.announce).toHaveBeenCalledWith(
        'Relatório de estatísticas exportado',
        'polite'
      );
    });
  });

  describe('Navigation and actions', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should handle card hover', () => {
      spyOn(component, 'announceStatistic');
      
      component.onCardHover('totalTitles');
      
      expect(component.announceStatistic).toHaveBeenCalledWith('totalTitles');
    });

    it('should handle card click', () => {
      spyOn(component, 'announceStatistic');
      
      component.onCardClick('overdueTitles');
      
      expect(component.announceStatistic).toHaveBeenCalledWith('overdueTitles');
    });

    it('should announce statistics for accessibility', () => {
      component.announceStatistic('totalTitles');
      
      expect(mockAccessibilityService.announce).toHaveBeenCalledWith(
        'Total de títulos: 2',
        'polite'
      );
    });

    it('should handle keyboard navigation', () => {
      spyOn(component, 'announceStatistic');
      
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.onKeyDown(event, 'totalValue');
      
      expect(component.announceStatistic).toHaveBeenCalledWith('totalValue');
    });
  });

  describe('Status and colors', () => {
    it('should return correct status colors', () => {
      expect(component.getStatusColor('active')).toBe('#4caf50');
      expect(component.getStatusColor('overdue')).toBe('#f44336');
      expect(component.getStatusColor('paid')).toBe('#2196f3');
      expect(component.getStatusColor('cancelled')).toBe('#9e9e9e');
      expect(component.getStatusColor('unknown')).toBe('#9e9e9e');
    });
  });

  describe('TrackBy functions', () => {
    it('should track titles by id', () => {
      const title = mockTitles[0];
      const result = component.trackByTitleId(0, title);
      
      expect(result).toBe(title.id);
    });
  });

  describe('Error handling', () => {
    it('should handle service errors gracefully', () => {
      mockDebtTitleService.getAll.and.returnValue(of(null as any));
      spyOn(console, 'error');
      
      component.ngOnInit();
      
      expect(component.isLoading).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Component cleanup', () => {
    it('should unsubscribe on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Template rendering', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should render statistics cards', () => {
      const compiled = fixture.nativeElement;
      const cards = compiled.querySelectorAll('app-card');
      
      expect(cards.length).toBeGreaterThanOrEqual(4); // At least 4 stat cards
    });

    it('should render action buttons', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('app-button');
      
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render search filter component', () => {
      const compiled = fixture.nativeElement;
      const searchFilter = compiled.querySelector('app-search-filter');
      
      expect(searchFilter).toBeTruthy();
    });

    it('should conditionally render advanced statistics', () => {
      let compiled = fixture.nativeElement;
      let charts = compiled.querySelectorAll('app-chart');
      
      expect(charts.length).toBe(0); // Hidden by default
      
      component.showAdvancedStats = true;
      fixture.detectChanges();
      
      compiled = fixture.nativeElement;
      charts = compiled.querySelectorAll('app-chart');
      
      expect(charts.length).toBeGreaterThan(0); // Now visible
    });
  });
});