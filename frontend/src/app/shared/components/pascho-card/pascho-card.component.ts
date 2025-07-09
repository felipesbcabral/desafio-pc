import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pascho-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pascho-card" [class]="cardClasses">
      <div *ngIf="title || subtitle" class="card-header">
        <div class="card-header-content">
          <h3 *ngIf="title" class="card-title">{{ title }}</h3>
          <p *ngIf="subtitle" class="card-subtitle">{{ subtitle }}</p>
        </div>
        <div class="card-header-actions">
          <ng-content select="[slot=header-actions]"></ng-content>
        </div>
      </div>
      
      <div class="card-content" [class.p-0]="noPadding">
        <ng-content></ng-content>
      </div>
      
      <div class="card-footer">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .card-header {
      @apply px-6 py-4 border-b border-gray-200;
    }
    
    .card-title {
      @apply text-lg font-semibold text-secondary-900 mb-1;
    }
    
    .card-subtitle {
      @apply text-sm text-secondary-600;
    }
    
    .card-content {
      @apply p-6;
    }
    
    .card-footer {
      @apply px-6 py-4 border-t border-gray-200 bg-gray-50;
    }
    

    
    /* Variants */
    .card-elevated {
      @apply shadow-card-elevated;
    }
    
    .card-bordered {
      @apply border-2;
    }
    
    .card-compact {
      .card-header {
        @apply px-4 py-3;
      }
      
      .card-content {
        @apply p-4;
      }
      
      .card-footer {
        @apply px-4 py-3;
      }
    }
    

    
    /* Color variants */
    .card-primary {
      @apply border-primary-200 bg-primary-50;
      
      .card-header {
        @apply border-primary-200 bg-primary-100;
      }
      
      .card-title {
        @apply text-primary-900;
      }
    }
    
    .card-success {
      @apply border-success-200 bg-success-50;
      
      .card-header {
        @apply border-success-200 bg-success-100;
      }
      
      .card-title {
        @apply text-success-900;
      }
    }
    
    .card-danger {
      @apply border-danger-200 bg-danger-50;
      
      .card-header {
        @apply border-danger-200 bg-danger-100;
      }
      
      .card-title {
        @apply text-danger-900;
      }
    }
    

  `]
})
export class PaschoCardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() variant: 'default' | 'elevated' | 'bordered' | 'compact' = 'default';
  @Input() color: 'default' | 'primary' | 'success' | 'danger' = 'default';
  @Input() noPadding = false;
  
  get cardClasses(): string {
    const classes = [];
    
    if (this.variant === 'elevated') {
      classes.push('card-elevated');
    }
    
    if (this.variant === 'bordered') {
      classes.push('card-bordered');
    }
    
    if (this.variant === 'compact') {
      classes.push('card-compact');
    }
    
    if (this.color !== 'default') {
      classes.push(`card-${this.color}`);
    }
    
    return classes.join(' ');
  }
}