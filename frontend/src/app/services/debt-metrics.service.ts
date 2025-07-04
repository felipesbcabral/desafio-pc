import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { DebtTitle, DebtMetrics, OverdueDistribution } from '../models/debt-title.model';
import { DebtTitleService } from './debt-title.service';

@Injectable({
  providedIn: 'root'
})
export class DebtMetricsService {
  private metricsSubject = new BehaviorSubject<DebtMetrics | null>(null);
  public metrics$ = this.metricsSubject.asObservable();

  constructor(private debtTitleService: DebtTitleService) {
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    this.debtTitleService.getAll().subscribe((titles: DebtTitle[]) => {
      if (titles && titles.length > 0) {
        const metrics = this.calculateMetrics(titles);
        this.metricsSubject.next(metrics);
      }
    });
  }

  private calculateMetrics(titles: DebtTitle[]): DebtMetrics {
    const overdueTitles = titles.filter(title => title.isOverdue);
    
    return {
      totalTitles: titles.length,
      totalOverdueTitles: overdueTitles.length,
      totalOriginalValue: this.calculateTotalOriginalValue(titles),
      totalUpdatedValue: this.calculateTotalUpdatedValue(titles),
      averageDaysOverdue: this.calculateAverageDaysOverdue(overdueTitles),
      topFiveDebts: this.getTopFiveDebts(titles),
      overdueDistribution: this.calculateOverdueDistribution(overdueTitles)
    };
  }

  private calculateTotalOriginalValue(titles: DebtTitle[]): number {
    return titles.reduce((total, title) => total + title.originalValue, 0);
  }

  private calculateTotalUpdatedValue(titles: DebtTitle[]): number {
    return titles.reduce((total, title) => total + title.updatedValue, 0);
  }

  private calculateAverageDaysOverdue(overdueTitles: DebtTitle[]): number {
    if (overdueTitles.length === 0) return 0;
    const totalDays = overdueTitles.reduce((total, title) => total + title.daysOverdue, 0);
    return Math.round(totalDays / overdueTitles.length);
  }

  private getTopFiveDebts(titles: DebtTitle[]): DebtTitle[] {
    return titles
      .sort((a, b) => b.updatedValue - a.updatedValue)
      .slice(0, 5);
  }

  private calculateOverdueDistribution(overdueTitles: DebtTitle[]): OverdueDistribution[] {
    const ranges = [
      { range: '0-30 dias', min: 0, max: 30 },
      { range: '31-60 dias', min: 31, max: 60 },
      { range: '61-90 dias', min: 61, max: 90 },
      { range: '>90 dias', min: 91, max: Infinity }
    ];

    const total = overdueTitles.length;
    
    return ranges.map(rangeConfig => {
      const titlesInRange = overdueTitles.filter(title => 
        title.daysOverdue >= rangeConfig.min && title.daysOverdue <= rangeConfig.max
      );
      
      const count = titlesInRange.length;
      const totalValue = titlesInRange.reduce((sum, title) => sum + title.updatedValue, 0);
      
      return {
        range: rangeConfig.range,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        totalValue
      };
    });
  }

  public refreshMetrics(): void {
    this.initializeMetrics();
  }

  public getMetricsByDateRange(startDate: Date, endDate: Date): Observable<DebtMetrics> {
    return this.debtTitleService.getAll().pipe(
      map((titles: DebtTitle[]) => {
        const filteredTitles = titles.filter((title: DebtTitle) => {
          const titleDate = new Date(title.createdAt);
          return titleDate >= startDate && titleDate <= endDate;
        });
        return this.calculateMetrics(filteredTitles);
      })
    );
  }

  public getOverdueGrowthTrend(days: number = 30): Observable<{ date: string; count: number; value: number }[]> {
    return this.debtTitleService.getAll().pipe(
      map((titles: DebtTitle[]) => {
        const trend = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          
          const overdueTitles = titles.filter((title: DebtTitle) => {
            const titleDueDate = new Date(title.dueDate);
            return titleDueDate <= date && title.isOverdue;
          });
          
          trend.push({
            date: date.toISOString().split('T')[0],
            count: overdueTitles.length,
            value: overdueTitles.reduce((sum: number, title: DebtTitle) => sum + title.updatedValue, 0)
          });
        }
        
        return trend;
      })
    );
  }
}