import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses">
      <div *ngIf="title || subtitle" class="card-header">
        <h3 *ngIf="title" class="card-title">{{ title }}</h3>
        <p *ngIf="subtitle" class="card-subtitle">{{ subtitle }}</p>
      </div>
      
      <div class="card-content" [class.has-header]="title || subtitle">
        <ng-content></ng-content>
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
}