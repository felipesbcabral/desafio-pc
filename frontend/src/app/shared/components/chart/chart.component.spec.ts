import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartComponent } from './chart.component';
import { AccessibilityService } from '../../../services/accessibility.service';
import { PLATFORM_ID } from '@angular/core';

// Mock Chart.js
const mockChart = {
  destroy: jasmine.createSpy('destroy'),
  update: jasmine.createSpy('update'),
  resize: jasmine.createSpy('resize'),
  getElementsAtEventForMode: jasmine.createSpy('getElementsAtEventForMode').and.returnValue([]),
  canvas: {
    getContext: jasmine.createSpy('getContext').and.returnValue({
      clearRect: jasmine.createSpy('clearRect')
    })
  }
};

const mockChartConstructor = jasmine.createSpy('Chart').and.returnValue(mockChart);

// Mock Chart.js module
(global as any).Chart = mockChartConstructor;
(global as any).Chart.register = jasmine.createSpy('register');

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;
  let mockAccessibilityService: jasmine.SpyObj<AccessibilityService>;

  beforeEach(async () => {
    const accessibilitySpy = jasmine.createSpyObj('AccessibilityService', [
      'announce',
      'setFocus'
    ]);

    await TestBed.configureTestingModule({
      declarations: [ChartComponent],
      providers: [
        { provide: AccessibilityService, useValue: accessibilitySpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    mockAccessibilityService = TestBed.inject(AccessibilityService) as jasmine.SpyObj<AccessibilityService>;
  });

  beforeEach(() => {
    // Reset mocks
    mockChartConstructor.calls.reset();
    mockChart.destroy.calls.reset();
    mockChart.update.calls.reset();
    mockChart.resize.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component initialization', () => {
    it('should set default properties', () => {
      expect(component.type).toBe('bar');
      expect(component.responsive).toBe(true);
      expect(component.maintainAspectRatio).toBe(true);
      expect(component.showLegend).toBe(true);
      expect(component.showTooltips).toBe(true);
      expect(component.animationDuration).toBe(1000);
    });

    it('should initialize with loading state', () => {
      expect(component.isLoading).toBe(false);
      expect(component.hasError).toBe(false);
    });
  });

  describe('Chart creation', () => {
    beforeEach(() => {
      component.data = {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
          label: 'Test Data',
          data: [10, 20, 30],
          backgroundColor: ['#ff6384', '#36a2eb', '#ffce56']
        }]
      };
      fixture.detectChanges();
    });

    it('should create chart after view init', () => {
      component.ngAfterViewInit();
      expect(mockChartConstructor).toHaveBeenCalled();
    });

    it('should not create chart if no data provided', () => {
      component.data = null;
      component.ngAfterViewInit();
      expect(mockChartConstructor).not.toHaveBeenCalled();
    });

    it('should handle chart creation error', () => {
      mockChartConstructor.and.throwError('Chart creation failed');
      spyOn(console, 'error');
      
      component.ngAfterViewInit();
      
      expect(component.hasError).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Chart updates', () => {
    beforeEach(() => {
      component.data = {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
          label: 'Test Data',
          data: [10, 20, 30],
          backgroundColor: ['#ff6384', '#36a2eb', '#ffce56']
        }]
      };
      fixture.detectChanges();
      component.ngAfterViewInit();
    });

    it('should update chart when data changes', () => {
      const newData = {
        labels: ['Apr', 'May', 'Jun'],
        datasets: [{
          label: 'New Data',
          data: [40, 50, 60],
          backgroundColor: ['#ff6384', '#36a2eb', '#ffce56']
        }]
      };
      
      component.data = newData;
      component.ngOnChanges({
        data: {
          currentValue: newData,
          previousValue: component.data,
          firstChange: false,
          isFirstChange: () => false
        }
      });
      
      expect(mockChart.update).toHaveBeenCalled();
    });

    it('should update chart when options change', () => {
      const newOptions = {
        responsive: false,
        plugins: {
          legend: {
            display: false
          }
        }
      };
      
      component.options = newOptions;
      component.ngOnChanges({
        options: {
          currentValue: newOptions,
          previousValue: {},
          firstChange: false,
          isFirstChange: () => false
        }
      });
      
      expect(mockChart.update).toHaveBeenCalled();
    });
  });

  describe('Chart interactions', () => {
    beforeEach(() => {
      component.data = {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
          label: 'Test Data',
          data: [10, 20, 30],
          backgroundColor: ['#ff6384', '#36a2eb', '#ffce56']
        }]
      };
      fixture.detectChanges();
      component.ngAfterViewInit();
    });

    it('should handle chart click events', () => {
      spyOn(component.chartClick, 'emit');
      mockChart.getElementsAtEventForMode.and.returnValue([{ index: 0, datasetIndex: 0 }]);
      
      const mockEvent = new MouseEvent('click');
      component.onChartClick(mockEvent);
      
      expect(component.chartClick.emit).toHaveBeenCalledWith({
        event: mockEvent,
        elements: [{ index: 0, datasetIndex: 0 }],
        dataIndex: 0,
        datasetIndex: 0,
        value: 10,
        label: 'Jan'
      });
    });

    it('should handle chart hover events', () => {
      spyOn(component.chartHover, 'emit');
      mockChart.getElementsAtEventForMode.and.returnValue([{ index: 1, datasetIndex: 0 }]);
      
      const mockEvent = new MouseEvent('mousemove');
      component.onChartHover(mockEvent);
      
      expect(component.chartHover.emit).toHaveBeenCalledWith({
        event: mockEvent,
        elements: [{ index: 1, datasetIndex: 0 }],
        dataIndex: 1,
        datasetIndex: 0,
        value: 20,
        label: 'Feb'
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      component.data = {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
          label: 'Test Data',
          data: [10, 20, 30],
          backgroundColor: ['#ff6384', '#36a2eb', '#ffce56']
        }]
      };
      component.title = 'Test Chart';
      component.description = 'A test chart showing monthly data';
      fixture.detectChanges();
    });

    it('should generate chart summary for screen readers', () => {
      const summary = component.getChartSummary();
      
      expect(summary).toContain('Test Chart');
      expect(summary).toContain('A test chart showing monthly data');
      expect(summary).toContain('3 pontos de dados');
      expect(summary).toContain('Jan: 10');
      expect(summary).toContain('Feb: 20');
      expect(summary).toContain('Mar: 30');
    });

    it('should handle keyboard navigation', () => {
      spyOn(component, 'announceDataPoint');
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      component.onKeyDown(event);
      
      expect(component.currentDataIndex).toBe(0);
      expect(component.announceDataPoint).toHaveBeenCalledWith(0);
    });

    it('should navigate through data points with arrow keys', () => {
      component.currentDataIndex = 0;
      
      // Navigate right
      let event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      component.onKeyDown(event);
      expect(component.currentDataIndex).toBe(1);
      
      // Navigate left
      event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      component.onKeyDown(event);
      expect(component.currentDataIndex).toBe(0);
    });

    it('should announce data point information', () => {
      component.announceDataPoint(1);
      
      expect(mockAccessibilityService.announce).toHaveBeenCalledWith(
        'Feb: 20',
        'polite'
      );
    });

    it('should handle Enter key to announce current data point', () => {
      spyOn(component, 'announceDataPoint');
      component.currentDataIndex = 2;
      
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.onKeyDown(event);
      
      expect(component.announceDataPoint).toHaveBeenCalledWith(2);
    });
  });

  describe('Chart types', () => {
    it('should handle different chart types', () => {
      const chartTypes = ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'];
      
      chartTypes.forEach(type => {
        component.type = type as any;
        component.data = {
          labels: ['A', 'B'],
          datasets: [{ label: 'Test', data: [1, 2] }]
        };
        
        component.ngAfterViewInit();
        
        expect(mockChartConstructor).toHaveBeenCalledWith(
          jasmine.any(Object),
          jasmine.objectContaining({ type })
        );
        
        // Reset for next iteration
        component.ngOnDestroy();
        mockChartConstructor.calls.reset();
      });
    });
  });

  describe('Responsive behavior', () => {
    beforeEach(() => {
      component.data = {
        labels: ['Jan', 'Feb'],
        datasets: [{ label: 'Test', data: [1, 2] }]
      };
      fixture.detectChanges();
      component.ngAfterViewInit();
    });

    it('should handle window resize', () => {
      spyOn(component, 'resizeChart');
      
      window.dispatchEvent(new Event('resize'));
      
      // Wait for debounce
      setTimeout(() => {
        expect(component.resizeChart).toHaveBeenCalled();
      }, 300);
    });

    it('should resize chart when called', () => {
      component.resizeChart();
      expect(mockChart.resize).toHaveBeenCalled();
    });
  });

  describe('Loading and error states', () => {
    it('should show loading state', () => {
      component.isLoading = true;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const loadingElement = compiled.querySelector('.chart-loading');
      
      expect(loadingElement).toBeTruthy();
      expect(loadingElement.textContent).toContain('Carregando gráfico...');
    });

    it('should show error state', () => {
      component.hasError = true;
      component.errorMessage = 'Failed to load chart';
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const errorElement = compiled.querySelector('.chart-error');
      
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('Failed to load chart');
    });

    it('should show no data state', () => {
      component.data = null;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const noDataElement = compiled.querySelector('.chart-no-data');
      
      expect(noDataElement).toBeTruthy();
      expect(noDataElement.textContent).toContain('Nenhum dado disponível');
    });
  });

  describe('Component cleanup', () => {
    beforeEach(() => {
      component.data = {
        labels: ['Jan', 'Feb'],
        datasets: [{ label: 'Test', data: [1, 2] }]
      };
      fixture.detectChanges();
      component.ngAfterViewInit();
    });

    it('should destroy chart on component destroy', () => {
      component.ngOnDestroy();
      expect(mockChart.destroy).toHaveBeenCalled();
    });

    it('should remove resize listener on destroy', () => {
      spyOn(window, 'removeEventListener');
      
      component.ngOnDestroy();
      
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'resize',
        jasmine.any(Function)
      );
    });
  });

  describe('Custom options', () => {
    it('should merge custom options with defaults', () => {
      component.options = {
        scales: {
          y: {
            beginAtZero: false
          }
        }
      };
      
      component.data = {
        labels: ['A'],
        datasets: [{ label: 'Test', data: [1] }]
      };
      
      component.ngAfterViewInit();
      
      const chartConfig = mockChartConstructor.calls.mostRecent().args[1];
      expect(chartConfig.options.scales.y.beginAtZero).toBe(false);
      expect(chartConfig.options.responsive).toBe(true); // Default should still be there
    });
  });
});