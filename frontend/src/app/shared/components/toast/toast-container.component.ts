import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastComponent } from './toast.component';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  template: `
    <div class="toast-container">
      <!-- Top positions -->
      <div class="toast-position toast-top-left">
        <app-toast
          *ngFor="let toast of getToastsByPosition('top-left'); trackBy: trackByToastId"
          [type]="toast.type"
          [title]="toast.title"
          [message]="toast.message"
          [duration]="toast.duration"
          [showIcon]="toast.showIcon"
          [showCloseButton]="toast.showCloseButton"
          [showProgress]="toast.showProgress"
          [persistent]="toast.persistent"
          [position]="toast.position"
          (toastClose)="removeToast(toast.id)"
          (toastClick)="onToastClick(toast)"
        ></app-toast>
      </div>
      
      <div class="toast-position toast-top-center">
        <app-toast
          *ngFor="let toast of getToastsByPosition('top-center'); trackBy: trackByToastId"
          [type]="toast.type"
          [title]="toast.title"
          [message]="toast.message"
          [duration]="toast.duration"
          [showIcon]="toast.showIcon"
          [showCloseButton]="toast.showCloseButton"
          [showProgress]="toast.showProgress"
          [persistent]="toast.persistent"
          [position]="toast.position"
          (toastClose)="removeToast(toast.id)"
          (toastClick)="onToastClick(toast)"
        ></app-toast>
      </div>
      
      <div class="toast-position toast-top-right">
        <app-toast
          *ngFor="let toast of getToastsByPosition('top-right'); trackBy: trackByToastId"
          [type]="toast.type"
          [title]="toast.title"
          [message]="toast.message"
          [duration]="toast.duration"
          [showIcon]="toast.showIcon"
          [showCloseButton]="toast.showCloseButton"
          [showProgress]="toast.showProgress"
          [persistent]="toast.persistent"
          [position]="toast.position"
          (toastClose)="removeToast(toast.id)"
          (toastClick)="onToastClick(toast)"
        ></app-toast>
      </div>
      
      <!-- Bottom positions -->
      <div class="toast-position toast-bottom-left">
        <app-toast
          *ngFor="let toast of getToastsByPosition('bottom-left'); trackBy: trackByToastId"
          [type]="toast.type"
          [title]="toast.title"
          [message]="toast.message"
          [duration]="toast.duration"
          [showIcon]="toast.showIcon"
          [showCloseButton]="toast.showCloseButton"
          [showProgress]="toast.showProgress"
          [persistent]="toast.persistent"
          [position]="toast.position"
          (toastClose)="removeToast(toast.id)"
          (toastClick)="onToastClick(toast)"
        ></app-toast>
      </div>
      
      <div class="toast-position toast-bottom-center">
        <app-toast
          *ngFor="let toast of getToastsByPosition('bottom-center'); trackBy: trackByToastId"
          [type]="toast.type"
          [title]="toast.title"
          [message]="toast.message"
          [duration]="toast.duration"
          [showIcon]="toast.showIcon"
          [showCloseButton]="toast.showCloseButton"
          [showProgress]="toast.showProgress"
          [persistent]="toast.persistent"
          [position]="toast.position"
          (toastClose)="removeToast(toast.id)"
          (toastClick)="onToastClick(toast)"
        ></app-toast>
      </div>
      
      <div class="toast-position toast-bottom-right">
        <app-toast
          *ngFor="let toast of getToastsByPosition('bottom-right'); trackBy: trackByToastId"
          [type]="toast.type"
          [title]="toast.title"
          [message]="toast.message"
          [duration]="toast.duration"
          [showIcon]="toast.showIcon"
          [showCloseButton]="toast.showCloseButton"
          [showProgress]="toast.showProgress"
          [persistent]="toast.persistent"
          [position]="toast.position"
          (toastClose)="removeToast(toast.id)"
          (toastClick)="onToastClick(toast)"
        ></app-toast>
      </div>
    </div>
  `,
  styleUrls: ['./toast-container.component.scss']
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts$: Observable<Toast[]>;
  private destroy$ = new Subject<void>();
  private toasts: Toast[] = [];

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  ngOnInit(): void {
    this.toasts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(toasts => {
        this.toasts = toasts;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getToastsByPosition(position: string): Toast[] {
    return this.toasts.filter(toast => toast.position === position);
  }

  removeToast(id: string): void {
    this.toastService.remove(id);
  }

  onToastClick(toast: Toast): void {
    if (toast.onClick) {
      toast.onClick();
    }
  }

  trackByToastId(index: number, toast: Toast): string {
    return toast.id;
  }
}