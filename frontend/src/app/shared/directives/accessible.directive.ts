import { Directive, ElementRef, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AccessibilityService } from '../services/accessibility.service';

@Directive({
  selector: '[appAccessible]',
  standalone: true
})
export class AccessibleDirective implements OnInit, OnDestroy {
  @Input() appAccessible?: {
    ariaLabel?: string;
    ariaDescription?: string;
    role?: string;
    tabIndex?: number;
    keyboardActivatable?: boolean;
    announceOnFocus?: string;
    announceOnClick?: string;
  };
  @Input() ariaLabel?: string;
  @Input() ariaDescription?: string;
  @Input() role?: string;
  @Input() tabIndex?: number;
  @Input() keyboardActivatable = false;
  @Input() announceOnFocus?: string;
  @Input() announceOnClick?: string;

  private originalTabIndex?: string | null;

  constructor(
    private el: ElementRef<HTMLElement>,
    private accessibilityService: AccessibilityService
  ) {}

  ngOnInit(): void {
    this.setupAccessibility();
  }

  ngOnDestroy(): void {
    this.restoreOriginalAttributes();
  }

  private setupAccessibility(): void {
    const element = this.el.nativeElement;

    // Salvar atributos originais
    this.originalTabIndex = element.getAttribute('tabindex');

    // Usar propriedades do objeto appAccessible se fornecido, senão usar propriedades individuais
    const config = this.appAccessible || {
      ariaLabel: this.ariaLabel,
      ariaDescription: this.ariaDescription,
      role: this.role,
      tabIndex: this.tabIndex,
      keyboardActivatable: this.keyboardActivatable,
      announceOnFocus: this.announceOnFocus,
      announceOnClick: this.announceOnClick
    };

    // Configurar ARIA label
    if (config.ariaLabel) {
      element.setAttribute('aria-label', config.ariaLabel);
    }

    // Configurar role
    if (config.role) {
      element.setAttribute('role', config.role);
    }

    // Configurar tabindex
    if (config.tabIndex !== undefined) {
      element.setAttribute('tabindex', config.tabIndex.toString());
    } else if (config.keyboardActivatable && !element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
    }

    // Adicionar descrição se fornecida
    if (this.ariaDescription) {
      this.accessibilityService.addAriaDescription(element, this.ariaDescription);
    }

    // Configurar elemento como clicável se necessário
    if (this.keyboardActivatable) {
      element.classList.add('keyboard-activatable');
      
      // Adicionar indicador visual de foco
      element.style.outline = 'none';
      element.addEventListener('focus', this.onFocusHandler.bind(this));
      element.addEventListener('blur', this.onBlurHandler.bind(this));
    }
  }

  private restoreOriginalAttributes(): void {
    const element = this.el.nativeElement;
    
    if (this.originalTabIndex !== null) {
      element.setAttribute('tabindex', this.originalTabIndex || '');
    }
  }

  @HostListener('focus')
  onFocus(): void {
    if (this.announceOnFocus) {
      this.accessibilityService.announce(this.announceOnFocus);
    }
  }

  @HostListener('click')
  onClick(): void {
    if (this.announceOnClick) {
      this.accessibilityService.announce(this.announceOnClick);
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.keyboardActivatable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.el.nativeElement.click();
      
      if (this.announceOnClick) {
        this.accessibilityService.announce(this.announceOnClick);
      }
    }
  }

  private onFocusHandler(): void {
    const element = this.el.nativeElement;
    element.classList.add('keyboard-focused');
  }

  private onBlurHandler(): void {
    const element = this.el.nativeElement;
    element.classList.remove('keyboard-focused');
  }
}