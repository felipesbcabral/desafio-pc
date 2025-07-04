import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AccessibilityService } from '../../services/accessibility.service';

@Component({
  selector: 'app-screen-reader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="sr-only" 
      aria-live="polite" 
      aria-atomic="true"
      [attr.aria-label]="currentAnnouncement">
      {{ currentAnnouncement }}
    </div>
    <div 
      class="sr-only" 
      aria-live="assertive" 
      aria-atomic="true"
      [attr.aria-label]="urgentAnnouncement">
      {{ urgentAnnouncement }}
    </div>
  `,
  styles: [`
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `]
})
export class ScreenReaderComponent implements OnInit, OnDestroy {
  currentAnnouncement = '';
  urgentAnnouncement = '';
  private subscription: Subscription = new Subscription();

  constructor(private accessibilityService: AccessibilityService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.accessibilityService.announcements$.subscribe(announcement => {
        if (announcement) {
          this.currentAnnouncement = announcement;
          // Limpar após 3 segundos
          setTimeout(() => {
            this.currentAnnouncement = '';
          }, 3000);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  announceUrgent(message: string): void {
    this.urgentAnnouncement = message;
    setTimeout(() => {
      this.urgentAnnouncement = '';
    }, 3000);
  }
}