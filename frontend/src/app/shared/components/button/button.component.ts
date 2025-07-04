import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="buttonClasses"
      [disabled]="disabled || loading"
      [type]="type"
      (click)="handleClick($event)"
    >
      <span *ngIf="loading" class="loading-spinner animate-spin"></span>
      <ng-content *ngIf="!loading"></ng-content>
    </button>
  `,
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth: boolean = false;
  @Input() rounded: boolean = false;
  
  @Output() clicked = new EventEmitter<Event>();

  get buttonClasses(): string {
    const classes = [
      'btn',
      `btn-${this.variant}`,
      `btn-${this.size}`,
      'transition-all',
      'focus-ring'
    ];

    if (this.fullWidth) {
      classes.push('btn-full-width');
    }

    if (this.rounded) {
      classes.push('btn-rounded');
    }

    if (this.loading) {
      classes.push('btn-loading');
    }

    if (this.disabled) {
      classes.push('btn-disabled');
    }

    return classes.join(' ');
  }

  handleClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}