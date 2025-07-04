import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { StatisticsService, ChartData } from '../../../services/statistics.service';
import { LoadingComponent } from '../loading/loading.component';
import { AccessibleDirective } from '../../directives/accessible.directive';

// Definindo tipos para Chart.js
declare var Chart: any;

export type ChartType = 'pie' | 'doughnut' | 'bar' | 'line' | 'polarArea';

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
      enabled?: boolean;
      callbacks?: any;
    };
    title?: {
      display?: boolean;
      text?: string;
    };
  };
  scales?: {
    x?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    y?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
      beginAtZero?: boolean;
    };
  };
  animation?: {
    duration?: number;
    easing?: string;
  };
  accessibility?: {
    enabled?: boolean;
  };
}

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent,
    AccessibleDirective
  ],
  template: `
    <div class="chart-container" [class.loading]="isLoading">
      <div class="chart-header" *ngIf="title">
        <h3 class="chart-title">{{ title }}</h3>
        <p class="chart-description" *ngIf="description">{{ description }}</p>
      </div>
      
      <div class="chart-wrapper">
        <app-loading *ngIf="isLoading" size="md"></app-loading>
        
        <canvas
          #chartCanvas
          [attr.aria-label]="ariaLabel || title"
          [attr.role]="'img'"
          [appAccessible]="{
            ariaDescription: getChartDescription()
          }"
          class="chart-canvas"
          [class.hidden]="isLoading"
        ></canvas>
        
        <div class="chart-fallback" *ngIf="!isLoading && !hasData">
          <i class="icon-chart" aria-hidden="true"></i>
          <p>{{ noDataMessage || 'Nenhum dado disponível para exibir' }}</p>
        </div>
      </div>
      
      <div class="chart-legend" *ngIf="showCustomLegend && chartData?.datasets">
        <div class="legend-items">
          <div 
            *ngFor="let item of getLegendItems(); trackBy: trackByLegendItem"
            class="legend-item"
            [appAccessible]="{
              keyboardActivatable: true,
              ariaLabel: 'Item da legenda: ' + item.label + ', valor: ' + item.value
            }"
            (click)="toggleDataset(item.index)"
          >
            <span 
              class="legend-color"
              [style.background-color]="item.color"
              [attr.aria-hidden]="true"
            ></span>
            <span class="legend-label">{{ item.label }}</span>
            <span class="legend-value" *ngIf="item.value !== undefined">
              {{ formatValue(item.value) }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="chart-summary" *ngIf="showSummary">
        <div class="summary-stats">
          <div class="stat-item" *ngIf="getTotalValue() > 0">
            <span class="stat-label">Total:</span>
            <span class="stat-value">{{ formatValue(getTotalValue()) }}</span>
          </div>
          <div class="stat-item" *ngIf="getItemCount() > 0">
            <span class="stat-label">Itens:</span>
            <span class="stat-value">{{ getItemCount() }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './chart.component.scss'
})
export class ChartComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  @Input() type: ChartType = 'pie';
  @Input() chartData: ChartData | null = null;
  @Input() options: ChartOptions = {};
  @Input() title?: string;
  @Input() description?: string;
  @Input() ariaLabel?: string;
  @Input() noDataMessage?: string;
  @Input() showCustomLegend = false;
  @Input() showSummary = false;
  @Input() height = 300;
  @Input() width?: number;
  @Input() isLoading = false;
  @Input() formatType: 'currency' | 'number' | 'percentage' = 'number';
  
  private chart: any;
  private destroy$ = new Subject<void>();
  private resizeObserver?: ResizeObserver;

  constructor(
    private statisticsService: StatisticsService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.setupDefaultOptions();
  }

  ngAfterViewInit(): void {
    this.initializeChart();
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.chart) {
      this.chart.destroy();
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  get hasData(): boolean {
    return !!(this.chartData?.datasets?.length && 
             this.chartData.datasets.some(dataset => dataset.data.length > 0));
  }

  private setupDefaultOptions(): void {
    const defaultOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: !this.showCustomLegend,
          position: 'bottom'
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.parsed || context.parsed?.y || 0;
              return `${label}: ${this.formatValue(value)}`;
            }
          }
        },
        title: {
          display: !!this.title && !this.showCustomLegend,
          text: this.title
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      },
      accessibility: {
        enabled: true
      }
    };

    // Configurações específicas por tipo de gráfico
    if (this.type === 'line' || this.type === 'bar') {
      defaultOptions.scales = {
        x: {
          display: true,
          title: {
            display: false
          }
        },
        y: {
          display: true,
          beginAtZero: true,
          title: {
            display: false
          }
        }
      };
    }

    this.options = { ...defaultOptions, ...this.options };
  }

  private initializeChart(): void {
    if (!this.chartCanvas || !this.hasData) {
      return;
    }

    // Verificar se Chart.js está disponível
    if (typeof Chart === 'undefined') {
      console.error('Chart.js não está carregado');
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Não foi possível obter o contexto do canvas');
      return;
    }

    // Destruir gráfico existente
    if (this.chart) {
      this.chart.destroy();
    }

    try {
      this.chart = new Chart(ctx, {
        type: this.type,
        data: this.chartData,
        options: this.options
      });

      // Configurar acessibilidade
      this.setupAccessibility();
    } catch (error) {
      console.error('Erro ao criar gráfico:', error);
    }
  }

  private setupAccessibility(): void {
    const canvas = this.chartCanvas.nativeElement;
    
    // Adicionar descrição detalhada
    canvas.setAttribute('aria-describedby', 'chart-description-' + Math.random().toString(36).substr(2, 9));
    
    // Tornar o canvas focável
    canvas.setAttribute('tabindex', '0');
    
    // Adicionar eventos de teclado
    canvas.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Implementar navegação por teclado no gráfico
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.announceChartData();
        break;
      case 'ArrowRight':
      case 'ArrowLeft':
        event.preventDefault();
        // Navegar entre pontos de dados
        break;
    }
  }

  private announceChartData(): void {
    if (!this.chartData) return;
    
    const summary = this.getChartDescription();
    // Usar o serviço de acessibilidade para anunciar
    console.log('Anunciando:', summary);
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.chart) {
          this.chart.resize();
        }
      });
      
      this.resizeObserver.observe(this.elementRef.nativeElement);
    }
  }

  updateChart(newData: ChartData): void {
    this.chartData = newData;
    
    if (this.chart && this.hasData) {
      this.chart.data = newData;
      this.chart.update('active');
    } else {
      this.initializeChart();
    }
  }

  toggleDataset(index: number): void {
    if (this.chart && this.chart.isDatasetVisible(index)) {
      this.chart.hide(index);
    } else if (this.chart) {
      this.chart.show(index);
    }
  }

  getLegendItems(): Array<{ label: string; color: string; value?: number; index: number }> {
    if (!this.chartData?.datasets?.length) return [];
    
    const items: Array<{ label: string; color: string; value?: number; index: number }> = [];
    
    this.chartData.datasets.forEach((dataset, datasetIndex) => {
      if (this.type === 'pie' || this.type === 'doughnut') {
        // Para gráficos de pizza, cada label é um item
        this.chartData!.labels?.forEach((label, labelIndex) => {
          const color = Array.isArray(dataset.backgroundColor) 
            ? dataset.backgroundColor[labelIndex] 
            : dataset.backgroundColor || '#3b82f6';
          
          items.push({
            label: label as string,
            color: color as string,
            value: dataset.data[labelIndex],
            index: labelIndex
          });
        });
      } else {
        // Para outros tipos, cada dataset é um item
        const color = Array.isArray(dataset.backgroundColor)
          ? dataset.backgroundColor[0]
          : dataset.backgroundColor || dataset.borderColor || '#3b82f6';
        
        items.push({
          label: dataset.label || `Dataset ${datasetIndex + 1}`,
          color: color as string,
          value: dataset.data.reduce((sum, val) => sum + (val || 0), 0),
          index: datasetIndex
        });
      }
    });
    
    return items;
  }

  getTotalValue(): number {
    if (!this.chartData?.datasets?.length) return 0;
    
    return this.chartData.datasets.reduce((total, dataset) => {
      return total + dataset.data.reduce((sum, val) => sum + (val || 0), 0);
    }, 0);
  }

  getItemCount(): number {
    if (!this.chartData?.datasets?.length) return 0;
    
    if (this.type === 'pie' || this.type === 'doughnut') {
      return this.chartData.labels?.length || 0;
    }
    
    return this.chartData.datasets.length;
  }

  getChartDescription(): string {
    if (!this.hasData) {
      return 'Gráfico sem dados disponíveis';
    }
    
    const typeNames = {
      pie: 'pizza',
      doughnut: 'rosca',
      bar: 'barras',
      line: 'linha',
      polarArea: 'área polar'
    };
    
    const typeName = typeNames[this.type] || this.type;
    const itemCount = this.getItemCount();
    const totalValue = this.getTotalValue();
    
    let description = `Gráfico de ${typeName} com ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`;
    
    if (totalValue > 0) {
      description += `, valor total: ${this.formatValue(totalValue)}`;
    }
    
    return description;
  }

  formatValue(value: number): string {
    switch (this.formatType) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      case 'percentage':
        return new Intl.NumberFormat('pt-BR', {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }).format(value / 100);
      default:
        return new Intl.NumberFormat('pt-BR').format(value);
    }
  }

  trackByLegendItem(index: number, item: any): string {
    return `${item.label}-${item.index}`;
  }

  // Método para exportar gráfico como imagem
  exportAsImage(filename = 'chart.png'): void {
    if (!this.chart) return;
    
    const url = this.chart.toBase64Image();
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
  }

  // Método para obter dados do gráfico em formato acessível
  getAccessibleData(): string {
    if (!this.hasData) return 'Nenhum dado disponível';
    
    const items = this.getLegendItems();
    return items.map(item => 
      `${item.label}: ${this.formatValue(item.value || 0)}`
    ).join(', ');
  }
}