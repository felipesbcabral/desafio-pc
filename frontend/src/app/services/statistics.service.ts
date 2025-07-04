import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { DebtTitle } from '../models/debt-title.model';

export interface DashboardStatistics {
  totalTitles: number;
  totalValue: number;
  overdueTitles: number;
  overdueValue: number;
  paidTitles: number;
  paidValue: number;
  activeTitles: number;
  activeValue: number;
  averageValue: number;
  averageDaysOverdue: number;
  monthlyTrend: MonthlyTrend[];
  statusDistribution: StatusDistribution[];
  valueRangeDistribution: ValueRangeDistribution[];
  overdueByPeriod: OverdueByPeriod[];
  topDebtors: TopDebtor[];
}

export interface MonthlyTrend {
  month: string;
  totalValue: number;
  overdueValue: number;
  count: number;
  overdueCount: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
  value: number;
  color: string;
}

export interface ValueRangeDistribution {
  range: string;
  count: number;
  percentage: number;
  minValue: number;
  maxValue: number;
}

export interface OverdueByPeriod {
  period: string;
  count: number;
  value: number;
  color: string;
}

export interface TopDebtor {
  name: string;
  document: string;
  totalValue: number;
  titleCount: number;
  overdueValue: number;
  overdueTitles: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private debtTitles$ = new BehaviorSubject<DebtTitle[]>([]);
  private statistics$ = new BehaviorSubject<DashboardStatistics | null>(null);

  constructor() {
    // Recalcular estatísticas quando os dados mudarem
    this.debtTitles$.subscribe(titles => {
      const stats = this.calculateStatistics(titles);
      this.statistics$.next(stats);
    });
  }

  /**
   * Define os títulos de dívida para cálculo das estatísticas
   */
  setDebtTitles(titles: DebtTitle[]): void {
    this.debtTitles$.next(titles);
  }

  /**
   * Obtém as estatísticas calculadas
   */
  getStatistics(): Observable<DashboardStatistics | null> {
    return this.statistics$.asObservable();
  }

  /**
   * Obtém dados formatados para gráficos
   */
  getChartData(type: 'status' | 'monthly' | 'valueRange' | 'overduePeriod'): Observable<ChartData> {
    return this.statistics$.pipe(
      map(stats => {
        if (!stats) return { labels: [], datasets: [] };

        switch (type) {
          case 'status':
            return this.formatStatusChart(stats.statusDistribution);
          case 'monthly':
            return this.formatMonthlyChart(stats.monthlyTrend);
          case 'valueRange':
            return this.formatValueRangeChart(stats.valueRangeDistribution);
          case 'overduePeriod':
            return this.formatOverduePeriodChart(stats.overdueByPeriod);
          default:
            return { labels: [], datasets: [] };
        }
      })
    );
  }

  /**
   * Calcula todas as estatísticas
   */
  private calculateStatistics(titles: DebtTitle[]): DashboardStatistics {
    const totalTitles = titles.length;
    const totalValue = titles.reduce((sum, title) => sum + title.originalValue, 0);
    
    const overdueTitles = titles.filter(title => title.isOverdue);
    const overdueValue = overdueTitles.reduce((sum, title) => sum + title.updatedValue, 0);
    
    // Assumindo que títulos pagos têm uma propriedade isPaid
    const paidTitles = titles.filter(title => (title as any).isPaid === true);
    const paidValue = paidTitles.reduce((sum, title) => sum + title.originalValue, 0);
    
    const activeTitles = titles.filter(title => !title.isOverdue && !(title as any).isPaid);
    const activeValue = activeTitles.reduce((sum, title) => sum + title.originalValue, 0);
    
    const averageValue = totalTitles > 0 ? totalValue / totalTitles : 0;
    const averageDaysOverdue = overdueTitles.length > 0 
      ? overdueTitles.reduce((sum, title) => sum + (title.daysOverdue || 0), 0) / overdueTitles.length 
      : 0;

    return {
      totalTitles,
      totalValue,
      overdueTitles: overdueTitles.length,
      overdueValue,
      paidTitles: paidTitles.length,
      paidValue,
      activeTitles: activeTitles.length,
      activeValue,
      averageValue,
      averageDaysOverdue,
      monthlyTrend: this.calculateMonthlyTrend(titles),
      statusDistribution: this.calculateStatusDistribution(titles),
      valueRangeDistribution: this.calculateValueRangeDistribution(titles),
      overdueByPeriod: this.calculateOverdueByPeriod(overdueTitles),
      topDebtors: this.calculateTopDebtors(titles)
    };
  }

  /**
   * Calcula tendência mensal
   */
  private calculateMonthlyTrend(titles: DebtTitle[]): MonthlyTrend[] {
    const monthlyData = new Map<string, { total: number; overdue: number; count: number; overdueCount: number }>();
    
    titles.forEach(title => {
      const date = new Date(title.dueDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { total: 0, overdue: 0, count: 0, overdueCount: 0 });
      }
      
      const data = monthlyData.get(monthKey)!;
      data.total += title.originalValue;
      data.count += 1;
      
      if (title.isOverdue) {
        data.overdue += title.updatedValue;
        data.overdueCount += 1;
      }
    });
    
    return Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Últimos 12 meses
      .map(([month, data]) => ({
        month: this.formatMonthLabel(month),
        totalValue: data.total,
        overdueValue: data.overdue,
        count: data.count,
        overdueCount: data.overdueCount
      }));
  }

  /**
   * Calcula distribuição por status
   */
  private calculateStatusDistribution(titles: DebtTitle[]): StatusDistribution[] {
    const total = titles.length;
    if (total === 0) return [];
    
    const overdue = titles.filter(title => title.isOverdue);
    const paid = titles.filter(title => (title as any).isPaid === true);
    const active = titles.filter(title => !title.isOverdue && !(title as any).isPaid);
    
    return [
      {
        status: 'Em Atraso',
        count: overdue.length,
        percentage: (overdue.length / total) * 100,
        value: overdue.reduce((sum, title) => sum + title.updatedValue, 0),
        color: '#ef4444'
      },
      {
        status: 'Em Dia',
        count: active.length,
        percentage: (active.length / total) * 100,
        value: active.reduce((sum, title) => sum + title.originalValue, 0),
        color: '#22c55e'
      },
      {
        status: 'Pagos',
        count: paid.length,
        percentage: (paid.length / total) * 100,
        value: paid.reduce((sum, title) => sum + title.originalValue, 0),
        color: '#3b82f6'
      }
    ].filter(item => item.count > 0);
  }

  /**
   * Calcula distribuição por faixa de valor
   */
  private calculateValueRangeDistribution(titles: DebtTitle[]): ValueRangeDistribution[] {
    const ranges = [
      { range: 'Até R$ 1.000', min: 0, max: 1000 },
      { range: 'R$ 1.001 - R$ 5.000', min: 1001, max: 5000 },
      { range: 'R$ 5.001 - R$ 10.000', min: 5001, max: 10000 },
      { range: 'R$ 10.001 - R$ 50.000', min: 10001, max: 50000 },
      { range: 'Acima de R$ 50.000', min: 50001, max: Infinity }
    ];
    
    const total = titles.length;
    
    return ranges.map(({ range, min, max }) => {
      const count = titles.filter(title => 
        title.originalValue >= min && title.originalValue <= max
      ).length;
      
      return {
        range,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        minValue: min,
        maxValue: max === Infinity ? 0 : max
      };
    }).filter(item => item.count > 0);
  }

  /**
   * Calcula títulos em atraso por período
   */
  private calculateOverdueByPeriod(overdueTitles: DebtTitle[]): OverdueByPeriod[] {
    const periods = [
      { period: '1-30 dias', min: 1, max: 30, color: '#fbbf24' },
      { period: '31-60 dias', min: 31, max: 60, color: '#f97316' },
      { period: '61-90 dias', min: 61, max: 90, color: '#ef4444' },
      { period: 'Mais de 90 dias', min: 91, max: Infinity, color: '#dc2626' }
    ];
    
    return periods.map(({ period, min, max, color }) => {
      const titlesInPeriod = overdueTitles.filter(title => {
        const days = title.daysOverdue || 0;
        return days >= min && days <= max;
      });
      
      return {
        period,
        count: titlesInPeriod.length,
        value: titlesInPeriod.reduce((sum, title) => sum + title.updatedValue, 0),
        color
      };
    }).filter(item => item.count > 0);
  }

  /**
   * Calcula top devedores
   */
  private calculateTopDebtors(titles: DebtTitle[]): TopDebtor[] {
    const debtorMap = new Map<string, {
      name: string;
      document: string;
      totalValue: number;
      titleCount: number;
      overdueValue: number;
      overdueTitles: number;
    }>();
    
    titles.forEach(title => {
      const key = title.debtorDocument;
      
      if (!debtorMap.has(key)) {
        debtorMap.set(key, {
          name: title.debtorName,
          document: title.debtorDocument,
          totalValue: 0,
          titleCount: 0,
          overdueValue: 0,
          overdueTitles: 0
        });
      }
      
      const debtor = debtorMap.get(key)!;
      debtor.totalValue += title.originalValue;
      debtor.titleCount += 1;
      
      if (title.isOverdue) {
        debtor.overdueValue += title.updatedValue;
        debtor.overdueTitles += 1;
      }
    });
    
    return Array.from(debtorMap.values())
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);
  }

  /**
   * Formata dados para gráfico de status
   */
  private formatStatusChart(distribution: StatusDistribution[]): ChartData {
    return {
      labels: distribution.map(item => item.status),
      datasets: [{
        label: 'Quantidade',
        data: distribution.map(item => item.count),
        backgroundColor: distribution.map(item => item.color),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }

  /**
   * Formata dados para gráfico mensal
   */
  private formatMonthlyChart(trend: MonthlyTrend[]): ChartData {
    return {
      labels: trend.map(item => item.month),
      datasets: [
        {
          label: 'Valor Total',
          data: trend.map(item => item.totalValue),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true
        },
        {
          label: 'Valor em Atraso',
          data: trend.map(item => item.overdueValue),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true
        }
      ]
    };
  }

  /**
   * Formata dados para gráfico de faixa de valor
   */
  private formatValueRangeChart(distribution: ValueRangeDistribution[]): ChartData {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    return {
      labels: distribution.map(item => item.range),
      datasets: [{
        label: 'Quantidade',
        data: distribution.map(item => item.count),
        backgroundColor: colors.slice(0, distribution.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }

  /**
   * Formata dados para gráfico de período de atraso
   */
  private formatOverduePeriodChart(periods: OverdueByPeriod[]): ChartData {
    return {
      labels: periods.map(item => item.period),
      datasets: [{
        label: 'Quantidade',
        data: periods.map(item => item.count),
        backgroundColor: periods.map(item => item.color),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }

  /**
   * Formata label do mês
   */
  private formatMonthLabel(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  }

  /**
   * Exporta estatísticas para relatório
   */
  exportStatisticsReport(): Observable<string> {
    return this.statistics$.pipe(
      map(stats => {
        if (!stats) return '';
        
        const report = {
          geradoEm: new Date().toISOString(),
          resumo: {
            totalTitulos: stats.totalTitles,
            valorTotal: stats.totalValue,
            titulosEmAtraso: stats.overdueTitles,
            valorEmAtraso: stats.overdueValue,
            titulosPagos: stats.paidTitles,
            valorPago: stats.paidValue,
            valorMedio: stats.averageValue,
            mediaDiasAtraso: stats.averageDaysOverdue
          },
          distribuicaoStatus: stats.statusDistribution,
          tendenciaMensal: stats.monthlyTrend,
          topDevedores: stats.topDebtors,
          atrasoPorPeriodo: stats.overdueByPeriod
        };
        
        return JSON.stringify(report, null, 2);
      })
    );
  }
}