import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { hoverScale, pulse, rotate } from '../../animations/animations';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  animations: [hoverScale, pulse, rotate],
  template: `
    <button
      [class]="buttonClasses"
      [disabled]="disabled || loading"
      [type]="type"
      (click)="handleClick($event)"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      [@hoverScale]="hoverState"
      [@pulse]="pulseState"
    >
      <span *ngIf="loading" class="loading-spinner" [@rotate]="loading"></span>
      <ng-content *ngIf="!loading"></ng-content>
    </button>
  `,
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth: boolean = false;
  @Input() rounded: boolean = false;
  @Input() pulse: boolean = false;
  
  @Output() clicked = new EventEmitter<Event>();
  
  hoverState: string = 'normal';
  pulseState: string = '';

  get buttonClasses(): string {
    const classes = [
      'btn',
      `btn-${this.variant}`,
      `btn-${this.size}`,
      'transition-all',
      'focus-ring',
      'transform-gpu'
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
      // Trigger click animation
      this.pulseState = 'clicked';
      setTimeout(() => {
        this.pulseState = '';
      }, 200);
      
      this.clicked.emit(event);
    }
  }
  
  onMouseEnter(): void {
    if (!this.disabled && !this.loading) {
      this.hoverState = 'hovered';
    }
  }
  
  onMouseLeave(): void {
    this.hoverState = 'normal';
  }
  
  ngOnInit(): void {
    if (this.pulse) {
      this.pulseState = 'loading';
    }
  }
}