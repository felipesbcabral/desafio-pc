import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  private announcements = new BehaviorSubject<string>('');
  public announcements$ = this.announcements.asObservable();

  private focusedElement: HTMLElement | null = null;
  private keyboardNavigationEnabled = true;

  constructor() {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
  }

  /**
   * Anuncia uma mensagem para screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.announcements.next(message);
    
    // Criar elemento temporário para anúncio
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remover após anúncio
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Define foco em um elemento específico
   */
  setFocus(element: HTMLElement | string): void {
    const targetElement = typeof element === 'string' 
      ? document.querySelector(element) as HTMLElement
      : element;
    
    if (targetElement) {
      targetElement.focus();
      this.focusedElement = targetElement;
    }
  }

  /**
   * Retorna o foco para o elemento anterior
   */
  restoreFocus(): void {
    if (this.focusedElement) {
      this.focusedElement.focus();
    }
  }

  /**
   * Configura navegação por teclado global
   */
  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (event) => {
      if (!this.keyboardNavigationEnabled) return;

      switch (event.key) {
        case 'Escape':
          this.handleEscapeKey(event);
          break;
        case 'Tab':
          this.handleTabKey(event);
          break;
        case 'Enter':
        case ' ':
          this.handleActivationKey(event);
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          this.handleArrowKeys(event);
          break;
      }
    });
  }

  /**
   * Gerencia foco visível
   */
  private setupFocusManagement(): void {
    document.addEventListener('mousedown', () => {
      document.body.classList.add('using-mouse');
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        document.body.classList.remove('using-mouse');
      }
    });
  }

  private handleEscapeKey(event: KeyboardEvent): void {
    // Fechar modais, dropdowns, etc.
    const activeModal = document.querySelector('.modal.active');
    const activeDropdown = document.querySelector('.dropdown.open');
    
    if (activeModal || activeDropdown) {
      event.preventDefault();
      this.announce('Modal ou dropdown fechado');
    }
  }

  private handleTabKey(event: KeyboardEvent): void {
    // Gerenciar foco em modais
    const activeModal = document.querySelector('.modal.active');
    if (activeModal) {
      this.trapFocusInModal(event, activeModal as HTMLElement);
    }
  }

  private handleActivationKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    // Ativar elementos clicáveis com Enter/Space
    if (target.getAttribute('role') === 'button' || 
        target.classList.contains('clickable')) {
      event.preventDefault();
      target.click();
    }
  }

  private handleArrowKeys(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    // Navegação em listas e grids
    if (target.getAttribute('role') === 'listbox' ||
        target.getAttribute('role') === 'grid') {
      this.navigateList(event, target);
    }
  }

  private trapFocusInModal(event: KeyboardEvent, modal: HTMLElement): void {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  private navigateList(event: KeyboardEvent, container: HTMLElement): void {
    const items = container.querySelectorAll('[role="option"], .list-item');
    const currentIndex = Array.from(items).indexOf(document.activeElement as Element);
    
    let nextIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowDown':
        nextIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = items.length - 1;
        break;
    }
    
    if (nextIndex !== currentIndex) {
      event.preventDefault();
      (items[nextIndex] as HTMLElement).focus();
    }
  }

  /**
   * Habilita/desabilita navegação por teclado
   */
  setKeyboardNavigation(enabled: boolean): void {
    this.keyboardNavigationEnabled = enabled;
  }

  /**
   * Verifica se um elemento está visível para screen readers
   */
  isAccessible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  /**
   * Adiciona descrição acessível a um elemento
   */
  addAriaDescription(element: HTMLElement, description: string): void {
    const descriptionId = `desc-${Math.random().toString(36).substr(2, 9)}`;
    
    const descElement = document.createElement('div');
    descElement.id = descriptionId;
    descElement.className = 'sr-only';
    descElement.textContent = description;
    
    element.parentNode?.appendChild(descElement);
    element.setAttribute('aria-describedby', descriptionId);
  }

  /**
   * Valida contraste de cores
   */
  validateContrast(foreground: string, background: string): boolean {
    // Implementação básica de validação de contraste
    // Em produção, usar biblioteca especializada
    const fgLuminance = this.getLuminance(foreground);
    const bgLuminance = this.getLuminance(background);
    
    const contrast = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                    (Math.min(fgLuminance, bgLuminance) + 0.05);
    
    return contrast >= 4.5; // WCAG AA standard
  }

  private getLuminance(color: string): number {
    // Conversão simplificada - em produção usar biblioteca completa
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;
    
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private hexToRgb(hex: string): {r: number, g: number, b: number} | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}