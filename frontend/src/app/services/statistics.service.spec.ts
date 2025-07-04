import { TestBed } from '@angular/core/testing';
import { StatisticsService } from './statistics.service';
import { DebtTitle } from '../models/debt-title.model';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let mockTitles: DebtTitle[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatisticsService);
    
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
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01'),
        installments: []
      },
      {
        id: '4',
        titleNumber: 'TIT-004',
        debtorName: 'Ana Lima',
        debtorDocument: '789.123.456-00',
        debtorEmail: 'ana@email.com',
        debtorPhone: '(11) 66666-6666',
        originalValue: 1500,
        dueDate: new Date('2024-01-30'),
        status: 'active',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        installments: []
      }
    ];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setTitles', () => {
    it('should set titles and emit statistics', () => {
      let result: any;
      
      service.statistics$.subscribe(stats => {
        result = stats;
      });
      
      service.setTitles(mockTitles);
      
      expect(result).toBeDefined();
      expect(result.totalTitles).toBe(4);
      expect(result.totalValue).toBe(5000);
    });
  });

  describe('calculateBasicStatistics', () => {
    beforeEach(() => {
      service.setTitles(mockTitles);
    });

    it('should calculate total titles correctly', () => {
      let result: any;
      
      service.statistics$.subscribe(stats => {
        result = stats;
      });
      
      expect(result.totalTitles).toBe(4);
    });

    it('should calculate overdue titles correctly', () => {
      let result: any;
      
      service.statistics$.subscribe(stats => {
        result = stats;
      });
      
      expect(result.overdueTitles).toBe(1);
    });

    it('should calculate total value correctly', () => {
      let result: any;
      
      service.statistics$.subscribe(stats => {
        result = stats;
      });
      
      expect(result.totalValue).toBe(5000);
    });

    it('should calculate overdue value correctly', () => {
      let result: any;
      
      service.statistics$.subscribe(stats => {
        result = stats;
      });
      
      expect(result.overdueValue).toBe(2000);
    });

    it('should calculate average value correctly', () => {
      let result: any;
      
      service.statistics$.subscribe(stats => {
        result = stats;
      });
      
      expect(result.averageValue).toBe(1250);
    });

    it('should calculate paid titles correctly', () => {
      let result: any;
      
      service.statistics$.subscribe(stats => {
        result = stats;
      });
      
      expect(result.paidTitles).toBe(1);
    });

    it('should calculate paid value correctly', () => {
      let result: any;
      
      service.statistics$.subscribe(stats => {
        result = stats;
      });
      
      expect(result.paidValue).toBe(500);
    });
  });

  describe('getStatusDistribution', () => {
    beforeEach(() => {
      service.setTitles(mockTitles);
    });

    it('should return correct status distribution', () => {
      let result: any;
      
      service.statusDistribution$.subscribe(distribution => {
        result = distribution;
      });
      
      expect(result.length).toBe(3);
      
      const activeStatus = result.find((item: any) => item.label === 'Ativo');
      expect(activeStatus.value).toBe(2);
      
      const overdueStatus = result.find((item: any) => item.label === 'Em Atraso');
      expect(overdueStatus.value).toBe(1);
      
      const paidStatus = result.find((item: any) => item.label === 'Pago');
      expect(paidStatus.value).toBe(1);
    });
  });

  describe('getMonthlyTrend', () => {
    beforeEach(() => {
      service.setTitles(mockTitles);
    });

    it('should return monthly trend data', () => {
      let result: any;
      
      service.monthlyTrend$.subscribe(trend => {
        result = trend;
      });
      
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('month');
      expect(result[0]).toHaveProperty('count');
      expect(result[0]).toHaveProperty('value');
    });

    it('should group titles by month correctly', () => {
      let result: any;
      
      service.monthlyTrend$.subscribe(trend => {
        result = trend;
      });
      
      const janData = result.find((item: any) => item.month === 'Jan 2024');
      expect(janData.count).toBe(2); // TIT-001 and TIT-004
      
      const febData = result.find((item: any) => item.month === 'Fev 2024');
      expect(febData.count).toBe(1); // TIT-002
      
      const marData = result.find((item: any) => item.month === 'Mar 2024');
      expect(marData.count).toBe(1); // TIT-003
    });
  });

  describe('getValueRangeDistribution', () => {
    beforeEach(() => {
      service.setTitles(mockTitles);
    });

    it('should return value range distribution', () => {
      let result: any;
      
      service.valueRangeDistribution$.subscribe(distribution => {
        result = distribution;
      });
      
      expect(result.length).toBe(4);
      expect(result[0].label).toBe('Até R$ 500');
      expect(result[1].label).toBe('R$ 501 - R$ 1.000');
      expect(result[2].label).toBe('R$ 1.001 - R$ 2.000');
      expect(result[3].label).toBe('Acima de R$ 2.000');
    });

    it('should categorize values correctly', () => {
      let result: any;
      
      service.valueRangeDistribution$.subscribe(distribution => {
        result = distribution;
      });
      
      const range1 = result.find((item: any) => item.label === 'Até R$ 500');
      expect(range1.value).toBe(1); // TIT-003 (500)
      
      const range2 = result.find((item: any) => item.label === 'R$ 501 - R$ 1.000');
      expect(range2.value).toBe(1); // TIT-001 (1000)
      
      const range3 = result.find((item: any) => item.label === 'R$ 1.001 - R$ 2.000');
      expect(range3.value).toBe(2); // TIT-002 (2000) and TIT-004 (1500)
    });
  });

  describe('getOverdueAnalysis', () => {
    beforeEach(() => {
      service.setTitles(mockTitles);
    });

    it('should return overdue analysis data', () => {
      let result: any;
      
      service.overdueAnalysis$.subscribe(analysis => {
        result = analysis;
      });
      
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('period');
      expect(result[0]).toHaveProperty('count');
      expect(result[0]).toHaveProperty('value');
    });
  });

  describe('getTopDebtors', () => {
    beforeEach(() => {
      service.setTitles(mockTitles);
    });

    it('should return top debtors by value', () => {
      const topDebtors = service.getTopDebtors(3);
      
      expect(topDebtors.length).toBe(3);
      expect(topDebtors[0].totalValue).toBe(2000); // Maria Santos
      expect(topDebtors[1].totalValue).toBe(1500); // Ana Lima
      expect(topDebtors[2].totalValue).toBe(1000); // João Silva
    });

    it('should limit results to specified count', () => {
      const topDebtors = service.getTopDebtors(2);
      
      expect(topDebtors.length).toBe(2);
    });
  });

  describe('getPaymentEfficiency', () => {
    beforeEach(() => {
      service.setTitles(mockTitles);
    });

    it('should calculate payment efficiency', () => {
      const efficiency = service.getPaymentEfficiency();
      
      expect(efficiency.paidPercentage).toBe(25); // 1 out of 4 titles
      expect(efficiency.overduePercentage).toBe(25); // 1 out of 4 titles
      expect(efficiency.activePercentage).toBe(50); // 2 out of 4 titles
      expect(efficiency.averageDaysToPayment).toBeGreaterThanOrEqual(0);
    });
  });

  describe('exportStatisticsReport', () => {
    beforeEach(() => {
      service.setTitles(mockTitles);
    });

    it('should create statistics report', () => {
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:url');
      spyOn(window.URL, 'revokeObjectURL');
      
      const link = document.createElement('a');
      spyOn(document, 'createElement').and.returnValue(link);
      spyOn(link, 'click');
      
      service.exportStatisticsReport('json');
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(link.click).toHaveBeenCalled();
    });

    it('should handle CSV format', () => {
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:url');
      spyOn(window.URL, 'revokeObjectURL');
      
      const link = document.createElement('a');
      spyOn(document, 'createElement').and.returnValue(link);
      spyOn(link, 'click');
      
      service.exportStatisticsReport('csv');
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(link.click).toHaveBeenCalled();
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const formatted = service.formatCurrency(1234.56);
      expect(formatted).toBe('R$ 1.234,56');
    });

    it('should handle zero values', () => {
      const formatted = service.formatCurrency(0);
      expect(formatted).toBe('R$ 0,00');
    });

    it('should handle negative values', () => {
      const formatted = service.formatCurrency(-100);
      expect(formatted).toBe('-R$ 100,00');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      const formatted = service.formatPercentage(0.1234);
      expect(formatted).toBe('12,34%');
    });

    it('should handle zero values', () => {
      const formatted = service.formatPercentage(0);
      expect(formatted).toBe('0,00%');
    });

    it('should handle values greater than 1', () => {
      const formatted = service.formatPercentage(1.5);
      expect(formatted).toBe('150,00%');
    });
  });
});