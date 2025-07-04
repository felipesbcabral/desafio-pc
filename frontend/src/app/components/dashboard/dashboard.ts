import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service';


import { DebtMetricsService } from '../../services/debt-metrics.service';
import { DebtMetrics } from '../../models/debt-title.model';
import { MetricCard, MetricCardData } from '../metric-card/metric-card';

import { AccessibleDirective } from '../../shared/directives/accessible.directive';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,

    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatGridListModule,
    MatDividerModule,
    MatTooltipModule,
    MetricCard,
    AccessibleDirective,
    CardComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Statistics properties
  metrics: DebtMetrics | null = null;
  metricCards: MetricCardData[] = [];
  
  // Data properties
  isLoading = true;

  // UI state properties
  showAdvancedStats = false;
  
  // Chart data
  overdueChartData: any = {
    labels: ['0-30 dias', '31-60 dias', '61-90 dias', '90+ dias'],
    datasets: [{
      label: 'Títulos em Atraso',
      data: [0, 0, 0, 0],
      backgroundColor: ['#ff6384', '#ff9f40', '#ffcd56', '#ff6384']
    }]
  };

  constructor(
    private notificationService: NotificationService,
    private debtMetricsService: DebtMetricsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    
    // Load only metrics
    this.debtMetricsService.metrics$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (metrics) => {
        this.metrics = metrics;
        this.setupMetricCards();
        this.isLoading = false;
        this.announceDataLoaded();
      },
      error: (error) => {
        console.error('Erro ao carregar dados do dashboard:', error);
        this.notificationService.error('Erro ao carregar dados do dashboard');
        this.isLoading = false;
      }
    });
  }


  


  private setupMetricCards(): void {
    if (!this.metrics) return;

    this.metricCards = [
      {
        title: 'Total de Títulos',
        value: this.metrics.totalTitles,
        icon: 'description',
        color: 'primary',
        subtitle: 'títulos cadastrados',
        clickable: true
      },
      {
        title: 'Títulos em Atraso',
        value: this.metrics.totalOverdueTitles,
        icon: 'warning',
        color: 'warning',
        subtitle: 'títulos vencidos',
        clickable: true
      },
      {
        title: 'Valor Original',
        value: this.metrics.totalOriginalValue,
        icon: 'attach_money',
        color: 'primary',
        subtitle: 'valor original',
        clickable: false
      },
      {
        title: 'Valor Atualizado',
        value: this.metrics.totalUpdatedValue,
        icon: 'trending_up',
        color: 'info',
        subtitle: 'valor atualizado',
        clickable: false
      }
    ];
  }













  private announceDataLoaded(): void {
    const message = `Dashboard carregado com métricas atualizadas`;
    console.log(message);
  }

  // Track by functions for performance
  trackByMetric(index: number, metric: MetricCardData): string {
    return metric.title;
  }



  onMetricCardClicked(metric: MetricCardData): void {
    switch (metric.title) {
      case 'Total de Títulos':
        this.router.navigate(['/debt-titles']);
        break;
      case 'Títulos em Atraso':
        this.router.navigate(['/debt-titles']);
        break;
    }
  }

  onNewTitle(): void {
    this.router.navigate(['/debt-titles/new']);
  }

  onViewAllTitles(): void {
    this.router.navigate(['/debt-titles']);
  }


  
  onCardHover(isHovered: boolean, cardType: string): void {
    if (isHovered) {
      console.log(`Hovering over ${cardType} card`);
    }
  }
  
  onCardClick(cardType: string): void {
    console.log(`Clicked on ${cardType} card`);
    
    switch (cardType) {
      case 'total':
        // Filtros removidos
        break;
      case 'overdue':
          // Navegar para títulos em atraso
          break;
      case 'value':
        this.toggleAdvancedStats();
        break;
    }
  }



  toggleAdvancedStats(): void {
    this.showAdvancedStats = !this.showAdvancedStats;
    const message = this.showAdvancedStats ? 'Estatísticas avançadas exibidas' : 'Estatísticas avançadas ocultadas';
    this.notificationService.info(message);
  }



  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'overdue':
        return '#ef4444';
      case 'active':
        return '#22c55e';
      case 'paid':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  }

  getOverduePercentage(): number {
    return this.metrics ? this.metrics.totalOverdueTitles : 0;
  }

  getValuePercentage(): number {
    return this.metrics ? (this.metrics.totalUpdatedValue / this.metrics.totalOriginalValue) * 100 : 0;
  }



  // Navegação por teclado
  onKeyDown(event: KeyboardEvent, action: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      
      switch (action) {
        case 'toggleStats':
          this.toggleAdvancedStats();
          break;
        case 'showOverdue':
          // Funcionalidade removida
          break;
      }
    }
  }



  // Métodos para as ações do dashboard
  refreshData(): void {
    this.loadDashboardData();
    this.notificationService.info('Dados atualizados');
  }

  getOverdueValuePercentage(): number {
    return this.metrics ? (this.metrics.totalUpdatedValue / this.metrics.totalOriginalValue) * 100 : 0;
  }


}
