import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public isOnline$ = this.isOnlineSubject.asObservable();
  public isOffline$ = this.isOnline$.pipe(map(isOnline => !isOnline));

  constructor() {
    // Escuta eventos de mudança de conectividade
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    )
    .pipe(startWith(navigator.onLine))
    .subscribe(isOnline => {
      this.isOnlineSubject.next(isOnline);
      
      if (isOnline) {
        console.log('🟢 Conectividade restaurada');
        this.showConnectivityNotification('Conectividade restaurada', 'success');
      } else {
        console.log('🔴 Conexão perdida');
        this.showConnectivityNotification('Conexão perdida. Trabalhando offline.', 'warning');
      }
    });
  }

  /**
   * Verifica se está online
   */
  get isOnline(): boolean {
    return this.isOnlineSubject.value;
  }

  /**
   * Verifica se está offline
   */
  get isOffline(): boolean {
    return !this.isOnline;
  }

  /**
   * Testa conectividade fazendo uma requisição simples
   */
  async testConnectivity(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Mostra notificação de conectividade
   */
  private showConnectivityNotification(message: string, type: 'success' | 'warning' | 'error') {
    // Implementar notificação toast aqui
    // Por enquanto, apenas log no console
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Você pode integrar com um serviço de toast/notification aqui
    // Exemplo: this.toastService.show(message, type);
  }

  /**
   * Executa uma ação quando a conectividade for restaurada
   */
  whenOnline(callback: () => void): void {
    if (this.isOnline) {
      callback();
    } else {
      const subscription = this.isOnline$.subscribe(isOnline => {
        if (isOnline) {
          callback();
          subscription.unsubscribe();
        }
      });
    }
  }

  /**
   * Retorna um Observable que emite quando volta a ficar online
   */
  waitForOnline(): Observable<boolean> {
    return this.isOnline$.pipe(
      map(isOnline => isOnline),
      startWith(this.isOnline)
    );
  }
}