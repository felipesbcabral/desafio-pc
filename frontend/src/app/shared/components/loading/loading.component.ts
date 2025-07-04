import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { rotate, pulse, fadeInOut } from '../../animations/animations';

export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'bars';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  animations: [rotate, pulse, fadeInOut],
  template: `
    <div 
      [class]="loadingClasses"
      role="status"
      [attr.aria-label]="ariaLabel"
      [attr.aria-live]="'polite'"
    >
      <!-- Spinner variant -->
      <div *ngIf="variant === 'spinner'" class="loading-spinner" [@rotate]="isVisible">
        <svg viewBox="0 0 24 24">
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            stroke-width="2" 
            fill="none" 
            stroke-linecap="round"
            stroke-dasharray="60 40"
          ></circle>
        </svg>
      </div>
      
      <!-- Dots variant -->
      <div *ngIf="variant === 'dots'" class="loading-dots">
        <div class="dot dot-1"></div>
        <div class="dot dot-2"></div>
        <div class="dot dot-3"></div>
      </div>
      
      <!-- Pulse variant -->
      <div *ngIf="variant === 'pulse'" class="loading-pulse" [@pulse]="'loading'">
        <div class="pulse-circle"></div>
      </div>
      
      <!-- Bars variant -->
      <div *ngIf="variant === 'bars'" class="loading-bars">
        <div class="bar bar-1"></div>
        <div class="bar bar-2"></div>
        <div class="bar bar-3"></div>
        <div class="bar bar-4"></div>
      </div>
      
      <!-- Loading text -->
      <span *ngIf="showText" class="loading-text">{{ text }}</span>
    </div>
  `,
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
  @Input() size: LoadingSize = 'md';
  @Input() variant: LoadingVariant = 'spinner';
  @Input() showText: boolean = false;
  @Input() text: string = 'Carregando...';
  @Input() color?: string;
  @Input() ariaLabel: string = 'Carregando conteúdo';
  @Input() inline: boolean = false;
  @Input() overlay: boolean = false;
  
  isVisible = true;

  get loadingClasses(): string {
    const classes = [
      'app-loading',
      `loading-${this.size}`,
      `loading-${this.variant}`,
      this.inline ? 'loading-inline' : '',
      this.overlay ? 'loading-overlay' : '',
      this.showText ? 'loading-with-text' : ''
    ].filter(Boolean);
    
    return classes.join(' ');
  }
}