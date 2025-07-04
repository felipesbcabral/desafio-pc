import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cardHover, fadeInOut, skeletonPulse } from '../../animations/animations';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  animations: [cardHover, fadeInOut, skeletonPulse],
  template: `
    <div 
      [class]="cardClasses"
      [@cardHover]="hoverState"
      [@fadeInOut]
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      (click)="onClick()"
    >
      <div *ngIf="title || subtitle" class="card-header">
        <h3 *ngIf="title" class="card-title">{{ title }}</h3>
        <p *ngIf="subtitle" class="card-subtitle">{{ subtitle }}</p>
      </div>
      
      <div class="card-content" [class.has-header]="title || subtitle">
        <!-- Loading skeleton -->
        <div *ngIf="loading" class="card-skeleton" [@skeletonPulse]="loading">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-text"></div>
          <div class="skeleton-line skeleton-text short"></div>
        </div>
        
        <!-- Actual content -->
        <ng-content *ngIf="!loading"></ng-content>
      </div>
      
      <div *ngIf="hasFooter" class="card-footer">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() variant: CardVariant = 'default';
  @Input() padding: CardPadding = 'md';
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() hoverable: boolean = false;
  @Input() clickable: boolean = false;
  @Input() loading: boolean = false;
  @Input() hasFooter: boolean = false;
  @Input() animateOnHover: boolean = true;
  
  @Output() cardClick = new EventEmitter<void>();
  @Output() cardHover = new EventEmitter<boolean>();
  
  hoverState: string = 'normal';

  get cardClasses(): string {
    const classes = [
      'card',
      `card-${this.variant}`,
      `card-padding-${this.padding}`,
      'transition-all'
    ];

    if (this.hoverable) {
      classes.push('card-hoverable');
    }

    if (this.clickable) {
      classes.push('card-clickable');
    }

    if (this.loading) {
      classes.push('card-loading');
    }

    return classes.join(' ');
  }
  
  onMouseEnter(): void {
    if (this.hoverable && this.animateOnHover && !this.loading) {
      this.hoverState = 'hovered';
      this.cardHover.emit(true);
    }
  }
  
  onMouseLeave(): void {
    if (this.hoverable && this.animateOnHover) {
      this.hoverState = 'normal';
      this.cardHover.emit(false);
    }
  }
  
  onClick(): void {
    if (this.clickable && !this.loading) {
      this.cardClick.emit();
    }
  }
}