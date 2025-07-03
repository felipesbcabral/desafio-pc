import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);

  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  private addNotification(notification: Notification): void {
    const currentNotifications = this.notifications$.value;
    this.notifications$.next([...currentNotifications, notification]);

    // Auto remove notification after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  removeNotification(id: string): void {
    const currentNotifications = this.notifications$.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notifications$.next(filteredNotifications);
  }

  success(message: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'success',
      message,
      duration
    });
  }

  error(message: string, duration: number = 7000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'error',
      message,
      duration
    });
  }

  warning(message: string, duration: number = 6000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'warning',
      message,
      duration
    });
  }

  info(message: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'info',
      message,
      duration
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  clearAll(): void {
    this.notifications$.next([]);
  }
}