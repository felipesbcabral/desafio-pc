import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type IconName = 
  | 'add' 
  | 'edit' 
  | 'delete' 
  | 'search' 
  | 'filter' 
  | 'sort' 
  | 'download' 
  | 'upload' 
  | 'refresh' 
  | 'settings' 
  | 'user' 
  | 'users' 
  | 'dashboard' 
  | 'list' 
  | 'card' 
  | 'table' 
  | 'chart' 
  | 'calendar' 
  | 'clock' 
  | 'warning' 
  | 'error' 
  | 'success' 
  | 'info' 
  | 'close' 
  | 'check' 
  | 'check-circle' 
  | 'x-circle' 
  | 'alert-triangle' 
  | 'arrow-left' 
  | 'arrow-right' 
  | 'arrow-up' 
  | 'arrow-down' 
  | 'chevron-left' 
  | 'chevron-right' 
  | 'chevron-up' 
  | 'chevron-down' 
  | 'menu' 
  | 'more' 
  | 'eye' 
  | 'eye-off' 
  | 'heart' 
  | 'star' 
  | 'bookmark' 
  | 'share' 
  | 'copy' 
  | 'external-link' 
  | 'home' 
  | 'mail' 
  | 'phone' 
  | 'location' 
  | 'money' 
  | 'credit-card' 
  | 'bank' 
  | 'receipt' 
  | 'document' 
  | 'folder' 
  | 'file' 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'attachment' 
  | 'link' 
  | 'lock' 
  | 'unlock' 
  | 'shield' 
  | 'key' 
  | 'notification' 
  | 'bell' 
  | 'message' 
  | 'chat' 
  | 'send' 
  | 'inbox' 
  | 'archive' 
  | 'trash' 
  | 'restore' 
  | 'undo' 
  | 'redo' 
  | 'save' 
  | 'print' 
  | 'export' 
  | 'import' 
  | 'sync' 
  | 'loading' 
  | 'spinner';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg 
      [class]="iconClasses"
      [attr.width]="iconSize"
      [attr.height]="iconSize"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.aria-label]="ariaLabel || name"
      role="img"
    >
      <ng-container [ngSwitch]="name">
        <!-- Add Icon -->
        <g *ngSwitchCase="'add'">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </g>
        
        <!-- Edit Icon -->
        <g *ngSwitchCase="'edit'">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </g>
        
        <!-- Delete Icon -->
        <g *ngSwitchCase="'delete'">
          <polyline points="3,6 5,6 21,6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </g>
        
        <!-- Search Icon -->
        <g *ngSwitchCase="'search'">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="M21 21l-4.35-4.35"></path>
        </g>
        
        <!-- Filter Icon -->
        <g *ngSwitchCase="'filter'">
          <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
        </g>
        
        <!-- Sort Icon -->
        <g *ngSwitchCase="'sort'">
          <path d="M3 6h18"></path>
          <path d="M7 12h10"></path>
          <path d="M10 18h4"></path>
        </g>
        
        <!-- Download Icon -->
        <g *ngSwitchCase="'download'">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7,10 12,15 17,10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </g>
        
        <!-- Upload Icon -->
        <g *ngSwitchCase="'upload'">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17,8 12,3 7,8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </g>
        
        <!-- Refresh Icon -->
        <g *ngSwitchCase="'refresh'">
          <polyline points="23,4 23,10 17,10"></polyline>
          <polyline points="1,20 1,14 7,14"></polyline>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
        </g>
        
        <!-- Settings Icon -->
        <g *ngSwitchCase="'settings'">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </g>
        
        <!-- User Icon -->
        <g *ngSwitchCase="'user'">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </g>
        
        <!-- Users Icon -->
        <g *ngSwitchCase="'users'">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </g>
        
        <!-- Dashboard Icon -->
        <g *ngSwitchCase="'dashboard'">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </g>
        
        <!-- List Icon -->
        <g *ngSwitchCase="'list'">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </g>
        
        <!-- Warning Icon -->
        <g *ngSwitchCase="'warning'">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </g>
        
        <!-- Error Icon -->
        <g *ngSwitchCase="'error'">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </g>
        
        <!-- Success Icon -->
        <g *ngSwitchCase="'success'">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22,4 12,14.01 9,11.01"></polyline>
        </g>
        
        <!-- Info Icon -->
        <g *ngSwitchCase="'info'">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </g>
        
        <!-- Close Icon -->
        <g *ngSwitchCase="'close'">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </g>
        
        <!-- Check Icon -->
        <g *ngSwitchCase="'check'">
          <polyline points="20,6 9,17 4,12"></polyline>
        </g>
        
        <!-- Check Circle Icon -->
        <g *ngSwitchCase="'check-circle'">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22,4 12,14.01 9,11.01"></polyline>
        </g>
        
        <!-- X Circle Icon -->
        <g *ngSwitchCase="'x-circle'">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </g>
        
        <!-- Alert Triangle Icon -->
        <g *ngSwitchCase="'alert-triangle'">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </g>
        
        <!-- Money Icon -->
        <g *ngSwitchCase="'money'">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </g>
        
        <!-- Receipt Icon -->
        <g *ngSwitchCase="'receipt'">
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"></path>
          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
          <path d="M12 18V6"></path>
        </g>
        
        <!-- Clock Icon -->
        <g *ngSwitchCase="'clock'">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12,6 12,12 16,14"></polyline>
        </g>
        
        <!-- Calendar Icon -->
        <g *ngSwitchCase="'calendar'">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </g>
        
        <!-- Loading/Spinner Icon -->
        <g *ngSwitchCase="'loading'" class="animate-spin">
          <path d="M21 12a9 9 0 11-6.219-8.56"></path>
        </g>
        
        <!-- Default fallback -->
        <g *ngSwitchDefault>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </g>
      </ng-container>
    </svg>
  `,
  styleUrls: ['./icon.component.scss']
})
export class IconComponent {
  @Input() name: IconName = 'info';
  @Input() size: IconSize = 'md';
  @Input() ariaLabel?: string;
  @Input() color?: string;

  get iconClasses(): string {
    const classes = [
      'app-icon',
      `icon-${this.size}`
    ];

    if (this.color) {
      classes.push(`text-${this.color}`);
    }

    return classes.join(' ');
  }

  get iconSize(): string {
    const sizes = {
      'xs': '12',
      'sm': '16',
      'md': '20',
      'lg': '24',
      'xl': '32',
      '2xl': '48'
    };
    return sizes[this.size];
  }
}