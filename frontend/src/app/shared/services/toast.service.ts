import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastType, ToastPosition } from '../components/toast/toast.component';

export interface ToastConfig {
  id?: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  showIcon?: boolean;
  showCloseButton?: boolean;
  showProgress?: boolean;
  persistent?: boolean;
  position?: ToastPosition;
  onClick?: () => void;
}

export interface Toast extends Required<Omit<ToastConfig, 'onClick'>> {
  id: string;
  createdAt: Date;
  onClick?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  private toastIdCounter = 0;

  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  constructor() {}

  /**
   * Show a success toast
   */
  success(message: string, config?: Partial<ToastConfig>): string {
    return this.show({
      type: 'success',
      message,
      ...config
    });
  }

  /**
   * Show an error toast
   */
  error(message: string, config?: Partial<ToastConfig>): string {
    return this.show({
      type: 'error',
      message,
      duration: 7000, // Longer duration for errors
      persistent: false,
      ...config
    });
  }

  /**
   * Show a warning toast
   */
  warning(message: string, config?: Partial<ToastConfig>): string {
    return this.show({
      type: 'warning',
      message,
      duration: 6000,
      ...config
    });
  }

  /**
   * Show an info toast
   */
  info(message: string, config?: Partial<ToastConfig>): string {
    return this.show({
      type: 'info',
      message,
      ...config
    });
  }

  /**
   * Show a custom toast
   */
  show(config: ToastConfig): string {
    const id = config.id || this.generateId();
    
    const toast: Toast = {
      id,
      type: config.type,
      title: config.title || '',
      message: config.message,
      duration: config.duration ?? 5000,
      showIcon: config.showIcon ?? true,
      showCloseButton: config.showCloseButton ?? true,
      showProgress: config.showProgress ?? true,
      persistent: config.persistent ?? false,
      position: config.position ?? 'top-right',
      createdAt: new Date(),
      onClick: config.onClick
    };

    const currentToasts = this.toastsSubject.value;
    
    // Check for duplicate messages
    const isDuplicate = currentToasts.some(t => 
      t.message === toast.message && 
      t.type === toast.type &&
      (Date.now() - t.createdAt.getTime()) < 1000 // Within 1 second
    );

    if (!isDuplicate) {
      this.toastsSubject.next([...currentToasts, toast]);
      
      // Auto-remove if not persistent
      if (!toast.persistent && toast.duration > 0) {
        setTimeout(() => {
          this.remove(id);
        }, toast.duration);
      }
    }

    return id;
  }

  /**
   * Remove a specific toast
   */
  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.filter(toast => toast.id !== id);
    this.toastsSubject.next(updatedToasts);
  }

  /**
   * Remove all toasts
   */
  clear(): void {
    this.toastsSubject.next([]);
  }

  /**
   * Remove all toasts of a specific type
   */
  clearByType(type: ToastType): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.filter(toast => toast.type !== type);
    this.toastsSubject.next(updatedToasts);
  }

  /**
   * Get current toasts
   */
  getToasts(): Toast[] {
    return this.toastsSubject.value;
  }

  /**
   * Get toasts by position
   */
  getToastsByPosition(position: ToastPosition): Toast[] {
    return this.toastsSubject.value.filter(toast => toast.position === position);
  }

  /**
   * Update an existing toast
   */
  update(id: string, updates: Partial<ToastConfig>): void {
    const currentToasts = this.toastsSubject.value;
    const toastIndex = currentToasts.findIndex(toast => toast.id === id);
    
    if (toastIndex !== -1) {
      const updatedToast = {
        ...currentToasts[toastIndex],
        ...updates,
        id // Preserve the original ID
      };
      
      const updatedToasts = [...currentToasts];
      updatedToasts[toastIndex] = updatedToast;
      this.toastsSubject.next(updatedToasts);
    }
  }

  /**
   * Check if a toast exists
   */
  exists(id: string): boolean {
    return this.toastsSubject.value.some(toast => toast.id === id);
  }

  /**
   * Get toast count
   */
  getCount(): number {
    return this.toastsSubject.value.length;
  }

  /**
   * Get toast count by type
   */
  getCountByType(type: ToastType): number {
    return this.toastsSubject.value.filter(toast => toast.type === type).length;
  }

  private generateId(): string {
    return `toast-${++this.toastIdCounter}-${Date.now()}`;
  }

  // Convenience methods for common use cases
  
  /**
   * Show a loading toast that can be updated
   */
  loading(message: string = 'Carregando...', config?: Partial<ToastConfig>): string {
    return this.show({
      type: 'info',
      message,
      persistent: true,
      showProgress: false,
      showCloseButton: false,
      ...config
    });
  }

  /**
   * Update a loading toast to success
   */
  loadingSuccess(id: string, message: string = 'Concluído!'): void {
    this.update(id, {
      type: 'success',
      message,
      persistent: false,
      duration: 3000,
      showCloseButton: true
    });
  }

  /**
   * Update a loading toast to error
   */
  loadingError(id: string, message: string = 'Erro ao carregar'): void {
    this.update(id, {
      type: 'error',
      message,
      persistent: false,
      duration: 5000,
      showCloseButton: true
    });
  }

  /**
   * Show a confirmation toast with action
   */
  confirm(message: string, onConfirm: () => void, config?: Partial<ToastConfig>): string {
    return this.show({
      type: 'warning',
      message,
      persistent: true,
      showProgress: false,
      onClick: onConfirm,
      ...config
    });
  }
}