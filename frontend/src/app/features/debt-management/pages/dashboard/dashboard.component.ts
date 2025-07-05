import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideIconsModule } from '../../../../core/modules/lucide-icons.module';
import { Subject, takeUntil } from 'rxjs';
import { PaschoCardComponent } from '../../../../shared/components/pascho-card/pascho-card.component';
import { PaschoButtonComponent } from '../../../../shared/components/pascho-button/pascho-button.component';
import { DebtService } from '../../../../core/services/debt.service';
import { Debt, DebtSummary } from '../../../../core/models/debt.model';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

interface DashboardCard {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
  color: 'primary' | 'success' | 'danger' | 'warning';
  loading?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideIconsModule,
    PaschoCardComponent,
    PaschoButtonComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">Dashboard</h1>
          <p class="text-secondary-600 mt-1">Visão geral do sistema de gestão de dívidas</p>
        </div>
        <div class="mt-4 sm:mt-0 flex space-x-3">
          <app-pascho-button
            label="Novo Título"
            variant="primary"
            leftIcon="plus"
            [routerLink]="['/debts/new']"
          ></app-pascho-button>
        </div>
      </div>
      
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-pascho-card
          *ngFor="let card of dashboardCards"
          [loading]="card.loading ?? false"
          class="transform hover:scale-105 transition-transform duration-200"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-secondary-600">{{ card.title }}</p>
              <p class="text-2xl font-bold mt-1"
                 [class.text-primary-600]="card.color === 'primary'"
                 [class.text-success-600]="card.color === 'success'"
                 [class.text-danger-600]="card.color === 'danger'"
                 [class.text-yellow-600]="card.color === 'warning'"
              >
                {{ card.value }}
              </p>
              <p *ngIf="card.subtitle" class="text-xs text-secondary-500 mt-1">{{ card.subtitle }}</p>
              
              <!-- Trend -->
              <div *ngIf="card.trend" class="flex items-center mt-2">
                <lucide-icon
                  [name]="card.trend.direction === 'up' ? 'trending-up' : 'trending-down'"
                  [size]="14"
                  [class.text-success-500]="card.trend.direction === 'up'"
                  [class.text-danger-500]="card.trend.direction === 'down'"
                ></lucide-icon>
                <span class="text-xs ml-1"
                      [class.text-success-600]="card.trend.direction === 'up'"
                      [class.text-danger-600]="card.trend.direction === 'down'"
                >
                  {{ card.trend.value }}% {{ card.trend.period }}
                </span>
              </div>
            </div>
            
            <!-- Icon -->
            <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                 [class.bg-primary-100]="card.color === 'primary'"
                 [class.bg-success-100]="card.color === 'success'"
                 [class.bg-danger-100]="card.color === 'danger'"
                 [class.bg-yellow-100]="card.color === 'warning'"
            >
              <lucide-icon
                [name]="card.icon"
                [size]="24"
                [class.text-primary-600]="card.color === 'primary'"
                [class.text-success-600]="card.color === 'success'"
                [class.text-danger-600]="card.color === 'danger'"
                [class.text-yellow-600]="card.color === 'warning'"
              ></lucide-icon>
            </div>
          </div>
        </app-pascho-card>
      </div>
      
      <!-- Charts and Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Chart Area -->
        <div class="lg:col-span-2">
          <app-pascho-card title="Evolução Mensal" subtitle="Títulos criados nos últimos 6 meses">
            <div class="h-64">
              <canvas #chartCanvas></canvas>
            </div>
          </app-pascho-card>
        </div>
        
        <!-- Recent Debts -->
        <div>
          <app-pascho-card
            title="Títulos Recentes"
            subtitle="Últimos títulos adicionados"
            [headerActions]="true"
          >
            <div slot="header-actions">
              <app-pascho-button
                label="Ver Todos"
                variant="ghost"
                size="sm"
                [routerLink]="['/debts']"
              ></app-pascho-button>
            </div>
            
            <div class="space-y-3">
              <div
                *ngFor="let debt of recentDebts; trackBy: trackByDebtId"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                [routerLink]="['/debts', debt.id]"
              >
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-secondary-900 truncate">
                    {{ debt.debtor.name }}
                  </p>
                  <p class="text-xs text-secondary-500">
                    {{ debt.debtNumber }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-secondary-900">
                    {{ formatCurrency(debt.currentValue) }}
                  </p>
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    [class.bg-success-100]="debt.status === 'ACTIVE'"
                    [class.text-success-800]="debt.status === 'ACTIVE'"
                    [class.bg-danger-100]="debt.status === 'OVERDUE'"
                    [class.text-danger-800]="debt.status === 'OVERDUE'"
                    [class.bg-gray-100]="debt.status === 'PAID'"
                    [class.text-gray-800]="debt.status === 'PAID'"
                  >
                    {{ getStatusLabel(debt.status) }}
                  </span>
                </div>
              </div>
              
              <!-- Empty state -->
              <div *ngIf="recentDebts.length === 0" class="text-center py-8">
                <lucide-icon name="file-text" [size]="48" class="text-gray-400 mx-auto mb-2"></lucide-icon>
                <p class="text-gray-500 text-sm">Nenhum título encontrado</p>
              </div>
            </div>
          </app-pascho-card>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <app-pascho-card title="Ações Rápidas">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            [routerLink]="['/debts/new']"
          >
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
              <lucide-icon name="plus" [size]="24" class="text-primary-600"></lucide-icon>
            </div>
            <span class="text-sm font-medium text-secondary-700">Novo Título</span>
          </button>
          
          <button
            class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            [routerLink]="['/debts']"
          >
            <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-success-200 transition-colors">
              <lucide-icon name="search" [size]="24" class="text-success-600"></lucide-icon>
            </div>
            <span class="text-sm font-medium text-secondary-700">Buscar Títulos</span>
          </button>
          

        </div>
      </app-pascho-card>
    </div>
  `,
  styles: [`
    /* Custom hover effects */
    .hover\:scale-105:hover {
      transform: scale(1.02);
    }
    
    /* Smooth transitions */
    .transition-transform {
      transition-property: transform;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 200ms;
    }
    
    .transition-colors {
      transition-property: color, background-color, border-color;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 200ms;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  private destroy$ = new Subject<void>();
  private chart: Chart | null = null;
  
  dashboardCards: DashboardCard[] = this.createInitialDashboardCards();
  recentDebts: Debt[] = [];
  summary: DebtSummary | null = null;
  loading = true;
  
  constructor(private debtService: DebtService) {}
  
  ngOnInit() {
    this.loadDashboardData();
  }
  
  ngAfterViewInit() {
    this.createChart();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private loadDashboardData() {
    this.loading = true;
    
    // Load summary data
    this.debtService.getDebtSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.summary = summary;
          this.updateDashboardCards(summary);
        },
        error: (error) => {
          console.error('Erro ao carregar resumo:', error);
          this.createMockDashboardCards();
        }
      });
    
    // Load recent debts
    this.debtService.getRecentDebts(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (debts) => {
          this.recentDebts = debts;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar títulos recentes:', error);
          this.createMockRecentDebts();
          this.loading = false;
        }
      });
  }
  
  private updateDashboardCards(summary: DebtSummary) {
    this.dashboardCards = [
      {
        title: 'Total de Títulos',
        value: summary.totalDebts.toString(),
        subtitle: `${summary.totalActiveDebts} ativos`,
        icon: 'file-text',
        color: 'primary',
        loading: false,
        trend: {
          value: 12,
          direction: 'up',
          period: 'este mês'
        }
      },
      {
        title: 'Valor Total',
        value: this.formatCurrency(summary.totalValue),
        subtitle: 'Em títulos ativos',
        icon: 'dollar-sign',
        color: 'success',
        loading: false
      },
      {
        title: 'Em Atraso',
        value: this.formatCurrency(summary.totalOverdueValue),
        subtitle: `${summary.totalOverdueDebts} títulos`,
        icon: 'alert-triangle',
        color: 'danger',
        loading: false,
        trend: {
          value: 8,
          direction: 'down',
          period: 'esta semana'
        }
      },
      {
        title: 'Maior Atraso',
        value: `${summary.oldestOverdueDebt} dias`,
        subtitle: 'Título mais antigo',
        icon: 'clock',
        color: 'warning',
        loading: false
      }
    ];
  }
  
  private createInitialDashboardCards(): DashboardCard[] {
    return [
      {
        title: 'Total de Títulos',
        value: '0',
        subtitle: '0 ativos',
        icon: 'file-text',
        color: 'primary',
        loading: true
      },
      {
        title: 'Valor Total',
        value: 'R$ 0,00',
        subtitle: 'em aberto',
        icon: 'dollar-sign',
        color: 'success',
        loading: true
      },
      {
        title: 'Vencidos',
        value: '0',
        subtitle: 'títulos',
        icon: 'alert-triangle',
        color: 'danger',
        loading: true
      },
      {
        title: 'Próximos Vencimentos',
        value: '0',
        subtitle: 'próximos 30 dias',
        icon: 'calendar',
        color: 'warning',
        loading: true
      }
    ];
  }

  private createMockDashboardCards() {
    this.dashboardCards = [
      {
        title: 'Total de Títulos',
        value: '156',
        subtitle: '142 ativos',
        icon: 'file-text',
        color: 'primary',
        trend: {
          value: 12,
          direction: 'up',
          period: 'este mês'
        }
      },
      {
        title: 'Valor Total',
        value: 'R$ 2.847.650,00',
        subtitle: 'Em títulos ativos',
        icon: 'dollar-sign',
        color: 'success'
      },
      {
        title: 'Em Atraso',
        value: 'R$ 485.320,00',
        subtitle: '23 títulos',
        icon: 'alert-triangle',
        color: 'danger',
        trend: {
          value: 8,
          direction: 'down',
          period: 'esta semana'
        }
      },
      {
        title: 'Maior Atraso',
        value: '45 dias',
        subtitle: 'Título mais antigo',
        icon: 'clock',
        color: 'warning'
      }
    ];
  }
  
  private createMockRecentDebts() {
    // Mock data for development
    this.recentDebts = [];
  }
  
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
  
  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'Ativo',
      'OVERDUE': 'Em Atraso',
      'PAID': 'Pago',
      'CANCELLED': 'Cancelado',
      'RENEGOTIATED': 'Renegociado'
    };
    
    return statusMap[status] || status;
  }
  
  trackByDebtId(index: number, debt: Debt): string {
    return debt.id || index.toString();
  }

  private createChart() {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Dados de exemplo para os últimos 6 meses
    const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const data = [12, 19, 8, 15, 22, 18];

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: labels,
        datasets: [{
          label: 'Títulos Criados',
          data: data,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#F3F4F6'
            },
            ticks: {
              color: '#6B7280'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#6B7280'
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }
}