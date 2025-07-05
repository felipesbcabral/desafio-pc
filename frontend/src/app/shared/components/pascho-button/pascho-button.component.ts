import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideIconsModule } from '../../../core/modules/lucide-icons.module';

@Component({
  selector: 'app-pascho-button',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideIconsModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="handleClick($event)"
      [attr.aria-label]="ariaLabel"
      [title]="tooltip"
    >
      <!-- Loading spinner -->
      <svg
        *ngIf="loading"
        class="animate-spin -ml-1 mr-2 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      
      <!-- Left icon -->
      <lucide-icon
        *ngIf="leftIcon && !loading"
        [name]="leftIcon"
        [size]="iconSize"
        class="mr-2"
      ></lucide-icon>
      
      <!-- Button text -->
      <span *ngIf="!iconOnly" [class.sr-only]="iconOnly">{{ label }}</span>
      
      <!-- Right icon -->
      <lucide-icon
        *ngIf="rightIcon && !loading"
        [name]="rightIcon"
        [size]="iconSize"
        class="ml-2"
      ></lucide-icon>
      
      <!-- Icon only -->
      <lucide-icon
        *ngIf="iconOnly && icon && !loading"
        [name]="icon"
        [size]="iconSize"
      ></lucide-icon>
      
      <!-- Badge -->
      <span
        *ngIf="badge"
        class="badge"
        [class]="badgeClasses"
      >
        {{ badge }}
      </span>
    </button>
  `,
  styles: [`
    button {
      @apply inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
    }
    
    /* Size variants */
    .btn-xs {
      @apply px-2 py-1 text-xs rounded;
    }
    
    .btn-sm {
      @apply px-3 py-1.5 text-sm rounded-md;
    }
    
    .btn-md {
      @apply px-4 py-2 text-sm rounded-lg;
    }
    
    .btn-lg {
      @apply px-6 py-3 text-base rounded-lg;
    }
    
    .btn-xl {
      @apply px-8 py-4 text-lg rounded-xl;
    }
    
    /* Icon only variants */
    .btn-icon-xs {
      @apply p-1 rounded;
    }
    
    .btn-icon-sm {
      @apply p-1.5 rounded-md;
    }
    
    .btn-icon-md {
      @apply p-2 rounded-lg;
    }
    
    .btn-icon-lg {
      @apply p-3 rounded-lg;
    }
    
    .btn-icon-xl {
      @apply p-4 rounded-xl;
    }
    
    /* Color variants */
    .btn-primary {
      @apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
    }
    
    .btn-secondary {
      @apply bg-secondary-100 text-secondary-700 hover:bg-secondary-200 focus:ring-secondary-500;
    }
    
    .btn-success {
      @apply bg-success-600 text-white hover:bg-success-700 focus:ring-success-500;
    }
    
    .btn-danger {
      @apply bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500;
    }
    
    .btn-warning {
      @apply bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500;
    }
    
    .btn-info {
      @apply bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500;
    }
    
    /* Outline variants */
    .btn-outline-primary {
      @apply border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-primary-500;
    }
    
    .btn-outline-secondary {
      @apply border border-secondary-300 text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500;
    }
    
    .btn-outline-success {
      @apply border border-success-600 text-success-600 hover:bg-success-600 hover:text-white focus:ring-success-500;
    }
    
    .btn-outline-danger {
      @apply border border-danger-600 text-danger-600 hover:bg-danger-600 hover:text-white focus:ring-danger-500;
    }
    
    /* Ghost variants */
    .btn-ghost {
      @apply text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500;
    }
    
    .btn-ghost-primary {
      @apply text-primary-600 hover:bg-primary-100 focus:ring-primary-500;
    }
    
    .btn-ghost-danger {
      @apply text-danger-600 hover:bg-danger-100 focus:ring-danger-500;
    }
    
    /* Link variant */
    .btn-link {
      @apply text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline focus:ring-primary-500;
    }
    
    /* Full width */
    .btn-full {
      @apply w-full;
    }
    
    /* Badge */
    .badge {
      @apply ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium;
    }
    
    .badge-primary {
      @apply bg-primary-100 text-primary-800;
    }
    
    .badge-secondary {
      @apply bg-secondary-100 text-secondary-800;
    }
    
    .badge-success {
      @apply bg-success-100 text-success-800;
    }
    
    .badge-danger {
      @apply bg-danger-100 text-danger-800;
    }
  `]
})
export class PaschoButtonComponent {
  @Input() label = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger' | 'ghost' | 'ghost-primary' | 'ghost-danger' | 'link' = 'primary';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() iconOnly = false;
  @Input() icon?: string;
  @Input() leftIcon?: string;
  @Input() rightIcon?: string;
  @Input() badge?: string | number;
  @Input() badgeVariant: 'primary' | 'secondary' | 'success' | 'danger' = 'primary';
  @Input() ariaLabel?: string;
  @Input() tooltip?: string;
  
  @Output() clicked = new EventEmitter<Event>();
  
  get buttonClasses(): string {
    const classes = [];
    
    // Base button class
    classes.push(`btn-${this.variant}`);
    
    // Size class
    if (this.iconOnly) {
      classes.push(`btn-icon-${this.size}`);
    } else {
      classes.push(`btn-${this.size}`);
    }
    
    // Full width
    if (this.fullWidth) {
      classes.push('btn-full');
    }
    
    return classes.join(' ');
  }
  
  get badgeClasses(): string {
    return `badge-${this.badgeVariant}`;
  }
  
  get iconSize(): number {
    switch (this.size) {
      case 'xs': return 12;
      case 'sm': return 14;
      case 'md': return 16;
      case 'lg': return 18;
      case 'xl': return 20;
      default: return 16;
    }
  }
  
  handleClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}