import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { DebtTitleDetailComponent } from './debt-title-detail.component';
import { DebtTitleService } from '../../services/debt-title.service';
import { NotificationService } from '../../services/notification.service';
import { AccessibilityService } from '../../services/accessibility.service';
import { DebtTitle } from '../../models/debt-title.model';

// Mock components
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  template: '<button><ng-content></ng-content></button>'
})
class MockButtonComponent {
  @Input() variant: string = 'primary';
  @Input() size: string = 'medium';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() ariaLabel: string = '';
}

@Component({
  selector: 'app-card',
  template: '<div class="card"><ng-content></ng-content></div>'
})
class MockCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() elevation: number = 1;
  @Input() padding: string = 'medium';
}

@Component({
  selector: 'app-loading',
  template: '<div class="loading">Loading...</div>'
})
class MockLoadingComponent {
  @Input() size: string = 'medium';
  @Input() message: string = 'Carregando...';
}

describe('DebtTitleDetailComponent', () => {
  let component: DebtTitleDetailComponent;
  let fixture: ComponentFixture<DebtTitleDetailComponent>;
  let mockDebtTitleService: jasmine.SpyObj<DebtTitleService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockAccessibilityService: jasmine.SpyObj<AccessibilityService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockTitle: DebtTitle = {
    id: '1',
    titleNumber: 'TIT-001',
    debtorName: 'João Silva',
    debtorDocument: '123.456.789-00',
    debtorEmail: 'joao@email.com',
    debtorPhone: '(11) 99999-9999',
    originalValue: 1000,
    dueDate: new Date('2024-01-15'),
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    installments: [
      {
        id: '1',
        number: 1,
        value: 500,
        dueDate: new Date('2024-01-15'),
        paidDate: new Date('2024-01-10'),
        status: 'paid',
        interest: 0,
        fine: 0,
        discount: 0
      },
      {
        id: '2',
        number: 2,
        value: 500,
        dueDate: new Date('2024-02-15'),
        paidDate: null,
        status: 'pending',
        interest: 25,
        fine: 50,
        discount: 0
      }
    ]
  };

  beforeEach(async () => {
    const debtTitleSpy = jasmine.createSpyObj('DebtTitleService', [
      'getById',
      'delete',
      'formatCurrency',
      'getStatusLabel'
    ]);
    const notificationSpy = jasmine.createSpyObj('NotificationService', [
      'success',
      'error',
      'confirm'
    ]);
    const accessibilitySpy = jasmine.createSpyObj('AccessibilityService', [
      'announce',
      'setFocus'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      params: of({ id: '1' })
    };

    debtTitleSpy.getById.and.returnValue(of(mockTitle));
    debtTitleSpy.formatCurrency.and.returnValue('R$ 1.000,00');
    debtTitleSpy.getStatusLabel.and.returnValue('Ativo');
    notificationSpy.confirm.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      declarations: [
        DebtTitleDetailComponent,
        MockButtonComponent,
        MockCardComponent,
        MockLoadingComponent
      ],
      imports: [
        BrowserAnimationsModule,
        MatTabsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatProgressSpinnerModule,
        MatDialogModule
      ],
      providers: [
        { provide: DebtTitleService, useValue: debtTitleSpy },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: AccessibilityService, useValue: accessibilitySpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DebtTitleDetailComponent);
    component = fixture.componentInstance;
    mockDebtTitleService = TestBed.inject(DebtTitleService) as jasmine.SpyObj<DebtTitleService>;
    mockNotificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    mockAccessibilityService = TestBed.inject(AccessibilityService) as jasmine.SpyObj<AccessibilityService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component initialization', () => {
    it('should initialize with default values', () => {
      expect(component.isLoading).toBe(true);
      expect(component.title).toBeNull();
      expect(component.notFound).toBe(false);
      expect(component.selectedTabIndex).toBe(0);
    });

    it('should load title on init', () => {
      component.ngOnInit();
      
      expect(mockDebtTitleService.getById).toHaveBeenCalledWith('1');
      expect(component.isLoading).toBe(false);
      expect(component.title).toEqual(mockTitle);
    });

    it('should handle title not found', () => {
      mockDebtTitleService.getById.and.returnValue(of(null));
      
      component.ngOnInit();
      
      expect(component.notFound).toBe(true);
      expect(component.isLoading).toBe(false);
    });

    it('should handle service error', () => {
      mockDebtTitleService.getById.and.returnValue(throwError('Service error'));
      spyOn(console, 'error');
      
      component.ngOnInit();
      
      expect(component.isLoading).toBe(false);
      expect(mockNotificationService.error).toHaveBeenCalledWith(
        'Erro ao carregar detalhes do título'
      );
    });

    it('should announce title load for accessibility', () => {
      component.ngOnInit();
      
      expect(mockAccessibilityService.announce).toHaveBeenCalledWith(
        'Detalhes do título TIT-001 carregados',
        'polite'
      );
    });
  });

  describe('Installment calculations', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should calculate installment summary correctly', () => {
      const summary = component.installmentSummary;
      
      expect(summary.total).toBe(2);
      expect(summary.paid).toBe(1);
      expect(summary.pending).toBe(1);
      expect(summary.overdue).toBe(0);
      expect(summary.totalValue).toBe(1000);
      expect(summary.paidValue).toBe(500);
      expect(summary.pendingValue).toBe(575); // 500 + 25 + 50
    });

    it('should calculate detailed calculations', () => {
      const calculations = component.detailedCalculations;
      
      expect(calculations.originalValue).toBe(1000);
      expect(calculations.totalInterest).toBe(25);
      expect(calculations.totalFines).toBe(50);
      expect(calculations.totalDiscounts).toBe(0);
      expect(calculations.currentValue).toBe(1075);
      expect(calculations.paidValue).toBe(500);
      expect(calculations.remainingValue).toBe(575);
    });

    it('should identify overdue installments', () => {
      // Mock an overdue installment
      const overdueInstallment = {
        ...mockTitle.installments[1],
        dueDate: new Date('2023-12-01'), // Past date
        status: 'overdue' as const
      };
      
      component.title!.installments[1] = overdueInstallment;
      
      const summary = component.installmentSummary;
      expect(summary.overdue).toBe(1);
    });
  });

  describe('Title deletion', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should delete title after confirmation', () => {
      mockDebtTitleService.delete.and.returnValue(of(undefined));
      
      component.deleteTitle();
      
      expect(mockNotificationService.confirm).toHaveBeenCalledWith(
        'Confirmar exclusão',
        'Tem certeza que deseja excluir este título? Esta ação não pode ser desfeita.'
      );
      expect(mockDebtTitleService.delete).toHaveBeenCalledWith('1');
      expect(mockNotificationService.success).toHaveBeenCalledWith(
        'Título excluído com sucesso'
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/debt-titles']);
    });

    it('should not delete title if not confirmed', () => {
      mockNotificationService.confirm.and.returnValue(of(false));
      
      component.deleteTitle();
      
      expect(mockDebtTitleService.delete).not.toHaveBeenCalled();
    });

    it('should handle deletion error', () => {
      mockDebtTitleService.delete.and.returnValue(throwError('Delete error'));
      
      component.deleteTitle();
      
      expect(mockNotificationService.error).toHaveBeenCalledWith(
        'Erro ao excluir título'
      );
    });
  });

  describe('Formatting methods', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should format currency values', () => {
      const formatted = component.formatCurrency(1000);
      
      expect(mockDebtTitleService.formatCurrency).toHaveBeenCalledWith(1000);
      expect(formatted).toBe('R$ 1.000,00');
    });

    it('should format status labels', () => {
      const formatted = component.formatStatus('active');
      
      expect(mockDebtTitleService.getStatusLabel).toHaveBeenCalledWith('active');
      expect(formatted).toBe('Ativo');
    });

    it('should format dates correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = component.formatDate(date);
      
      expect(formatted).toBe('15/01/2024');
    });

    it('should handle null dates', () => {
      const formatted = component.formatDate(null);
      
      expect(formatted).toBe('-');
    });
  });

  describe('Tab navigation', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should change selected tab', () => {
      component.onTabChange({ index: 1 } as any);
      
      expect(component.selectedTabIndex).toBe(1);
      expect(mockAccessibilityService.announce).toHaveBeenCalledWith(
        'Aba selecionada: Parcelas',
        'polite'
      );
    });

    it('should announce correct tab names', () => {
      const tabNames = ['Informações Básicas', 'Parcelas', 'Cálculos'];
      
      tabNames.forEach((name, index) => {
        component.onTabChange({ index } as any);
        
        expect(mockAccessibilityService.announce).toHaveBeenCalledWith(
          `Aba selecionada: ${name}`,
          'polite'
        );
      });
    });
  });

  describe('Accessibility features', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should handle keyboard navigation', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(event, 'preventDefault');
      
      component.onKeyDown(event, 'delete');
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockNotificationService.confirm).toHaveBeenCalled();
    });

    it('should handle Escape key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      
      component.onKeyDown(event, 'back');
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/debt-titles']);
    });

    it('should not handle other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      spyOn(event, 'preventDefault');
      
      component.onKeyDown(event, 'delete');
      
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Template rendering', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should render loading state', () => {
      component.isLoading = true;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const loadingElement = compiled.querySelector('app-loading');
      
      expect(loadingElement).toBeTruthy();
    });

    it('should render not found state', () => {
      component.notFound = true;
      component.isLoading = false;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const notFoundElement = compiled.querySelector('.not-found');
      
      expect(notFoundElement).toBeTruthy();
      expect(notFoundElement.textContent).toContain('Título não encontrado');
    });

    it('should render title details when loaded', () => {
      const compiled = fixture.nativeElement;
      
      expect(compiled.textContent).toContain('TIT-001');
      expect(compiled.textContent).toContain('João Silva');
    });

    it('should render tabs', () => {
      const compiled = fixture.nativeElement;
      const tabs = compiled.querySelectorAll('mat-tab');
      
      expect(tabs.length).toBe(3); // Basic info, installments, calculations
    });

    it('should render action buttons', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('app-button');
      
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Component lifecycle', () => {
    it('should unsubscribe on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle title without installments', () => {
      const titleWithoutInstallments = {
        ...mockTitle,
        installments: []
      };
      
      mockDebtTitleService.getById.and.returnValue(of(titleWithoutInstallments));
      component.ngOnInit();
      
      const summary = component.installmentSummary;
      expect(summary.total).toBe(0);
      expect(summary.totalValue).toBe(0);
    });

    it('should handle invalid route parameter', () => {
      mockActivatedRoute.params = of({ id: null });
      
      component.ngOnInit();
      
      expect(component.notFound).toBe(true);
    });
  });
});