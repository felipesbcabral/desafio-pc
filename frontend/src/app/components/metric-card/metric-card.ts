import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface MetricCardData {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  loading?: boolean;
  clickable?: boolean;
}

@Component({
  selector: 'app-metric-card',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './metric-card.html',
  styleUrl: './metric-card.scss'
})
export class MetricCard {
  @Input() data!: MetricCardData;
  @Input() tooltip?: string;
  @Input() onClick?: () => void;

  get colorClass(): string {
    return `metric-card--${this.data.color}`;
  }

  get trendIcon(): string {
    if (!this.data.trend) return '';
    
    switch (this.data.trend.direction) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'trending_flat';
    }
  }

  get trendClass(): string {
    if (!this.data.trend) return '';
    
    switch (this.data.trend.direction) {
      case 'up': return 'trend--up';
      case 'down': return 'trend--down';
      default: return 'trend--neutral';
    }
  }

  onCardClick(): void {
    if (this.data.clickable && this.onClick) {
      this.onClick();
    }
  }

  formatValue(value: string | number): string {
    if (typeof value === 'number') {
      // Format currency values
      if (this.data.title.toLowerCase().includes('valor')) {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2
        }).format(value);
      }
      
      // Format percentage values
      if (this.data.title.toLowerCase().includes('percentual') || 
          this.data.title.toLowerCase().includes('%')) {
        return `${value.toFixed(1)}%`;
      }
      
      // Format regular numbers
      return new Intl.NumberFormat('pt-BR').format(value);
    }
    
    return value.toString();
  }

  getAriaLabel(): string {
    let label = `${this.data.title}: ${this.formatValue(this.data.value)}`;
    
    if (this.data.subtitle) {
      label += `. ${this.data.subtitle}`;
    }
    
    if (this.data.trend) {
      const direction = this.data.trend.direction === 'up' ? 'aumento' : 
                       this.data.trend.direction === 'down' ? 'diminuição' : 'estável';
      label += `. Tendência: ${direction} de ${this.data.trend.value}% ${this.data.trend.label}`;
    }
    
    return label;
  }
}