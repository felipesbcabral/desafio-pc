import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent, IconName } from '../icon/icon.component';
import { ButtonComponent } from '../button/button.component';
import { slideInOut, shake, progressBar } from '../../animations/animations';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent],
  animations: [slideInOut, shake, progressBar],
  template: `
    <div 
      *ngIf="isVisible" 
      [class]="toastClasses"
      role="alert"
      [attr.aria-live]="type === 'error' ? 'assertive' : 'polite'"
      [attr.aria-atomic]="true"
      [@slideInOut]
      [@shake]="animationState"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      (click)="onClick()"
    >
      <div class="toast-content">
        <div class="toast-icon" *ngIf="showIcon">
          <app-icon [name]="iconName" size="sm"></app-icon>
        </div>
        
        <div class="toast-body">
          <div *ngIf="title" class="toast-title">{{ title }}</div>
          <div class="toast-message">{{ message }}</div>
        </div>
        
        <app-button 
          *ngIf="showCloseButton"
          variant="ghost" 
          size="sm"
          class="toast-close"
          (clicked)="close()"
          [attr.aria-label]="'Fechar notificação'"
        >
          <app-icon name="close" size="xs"></app-icon>
        </app-button>
      </div>
      
      <div *ngIf="showProgress" class="toast-progress">
        <div 
          class="toast-progress-bar" 
          [style.animation-duration.ms]="duration"
          [@progressBar]="progressValue"
        ></div>
      </div>
    </div>
  `,
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() type: ToastType = 'info';
  @Input() title?: string;
  @Input() message: string = '';
  @Input() duration: number = 5000; // 5 seconds
  @Input() showIcon: boolean = true;
  @Input() showCloseButton: boolean = true;
  @Input() showProgress: boolean = true;
  @Input() persistent: boolean = false; // Don't auto-close
  @Input() position: ToastPosition = 'top-right';
  @Input() isVisible: boolean = true;
  
  @Output() toastClose = new EventEmitter<void>();
  @Output() toastClick = new EventEmitter<void>();
  
  private timeoutId?: number;
  animationState: string = '';
  progressValue: number = 0;

  get toastClasses(): string {
    const classes = [
      'toast',
      `toast-${this.type}`,
      `toast-${this.position}`
    ];
    return classes.join(' ');
  }

  get iconName(): IconName {
    const iconMap: Record<ToastType, IconName> = {
      success: 'check-circle',
      error: 'x-circle',
      warning: 'alert-triangle',
      info: 'info'
    };
    return iconMap[this.type];
  }

  ngOnInit(): void {
    if (!this.persistent && this.duration > 0) {
      this.startAutoClose();
      this.startProgressBar();
    }
    
    // Trigger shake animation for error toasts
    if (this.type === 'error') {
      setTimeout(() => {
        this.animationState = 'error';
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.clearAutoClose();
  }

  private startAutoClose(): void {
    this.timeoutId = window.setTimeout(() => {
      this.close();
    }, this.duration);
  }
  
  private startProgressBar(): void {
    if (this.showProgress) {
      this.progressValue = 100;
    }
  }

  private clearAutoClose(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  close(): void {
    this.clearAutoClose();
    this.isVisible = false;
    
    // Delay the emission to allow for exit animation
    setTimeout(() => {
      this.toastClose.emit();
    }, 300);
  }

  onClick(): void {
    this.toastClick.emit();
  }

  onMouseEnter(): void {
    // Pause auto-close on hover
    this.clearAutoClose();
  }

  onMouseLeave(): void {
    // Resume auto-close when not hovering
    if (!this.persistent && this.duration > 0) {
      this.startAutoClose();
    }
  }
}