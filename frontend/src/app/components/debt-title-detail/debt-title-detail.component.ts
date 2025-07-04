import { Component, OnInit, OnDestroy, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil, switchMap, of } from 'rxjs';

import { DebtTitleService } from '../../services/debt-title.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingService } from '../../services/loading.service';
import { AccessibilityService } from '../../shared/services/accessibility.service';
import { DebtTitle, Installment } from '../../models/debt-title.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { AccessibleDirective } from '../../shared/directives/accessible.directive';
import { fadeInOut, slideUp, listAnimation } from '../../shared/animations/animations';

interface InstallmentCalculation {
  installmentNumber: number;
  dueDate: Date;
  originalValue: number;
  interest: number;
  penalty: number;
  totalValue: number;
  daysOverdue: number;
  status: 'paid' | 'pending' | 'overdue';
  paymentDate?: Date;
  paidValue?: number;
}

interface TitleSummary {
  totalInstallments: number;
  paidInstallments: number;
  pendingInstallments: number;
  overdueInstallments: number;
  totalOriginalValue: number;
  totalPaidValue: number;
  totalPendingValue: number;
  totalOverdueValue: number;
  interestAccrued: number;
  penaltiesAccrued: number;
  completionPercentage: number;
}

@Component({
  selector: 'app-debt-title-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    ButtonComponent,
    CardComponent,
    LoadingComponent,
    AccessibleDirective
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="detail-container" [@fadeInOut]="!isLoading">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container" [@fadeInOut]="isLoading">
        <app-loading type="spinner" size="lg" text="Carregando detalhes do título..."></app-loading>
      </div>

      <!-- Title Not Found -->
      <div *ngIf="!isLoading && !title" class="not-found" [@slideInUp]="!title">
        <app-card variant="outlined" padding="xl" class="not-found-card">
          <div class="not-found-content">
            <mat-icon class="not-found-icon">search_off</mat-icon>
            <h2>Título não encontrado</h2>
            <p>O título solicitado não foi encontrado ou não existe.</p>
            <app-button variant="primary" routerLink="/dashboard">
              <mat-icon>arrow_back</mat-icon>
              Voltar ao Dashboard
            </app-button>
          </div>
        </app-card>
      </div>

      <!-- Title Details -->
      <div *ngIf="!isLoading && title" [@fadeInOut]="!!title">
        <!-- Header -->
        <div class="detail-header" [@slideInUp]="!!title">
          <div class="header-content">
            <div class="title-info">
              <h1 id="title-detail-heading" tabindex="-1">
                Título {{ title.titleNumber }}
              </h1>
              <div class="status-badge" [style.background-color]="getStatusColor(title.isOverdue ? 'overdue' : 'active')">
                {{ getStatusLabel(title.isOverdue ? 'overdue' : 'active') }}
              </div>
            </div>
            
            <div class="header-actions">
              <app-button 
                variant="outline" 
                size="sm" 
                routerLink="/debt-titles/{{ title.id }}/edit"
                [appAccessible]="{
                  ariaLabel: 'Editar título ' + title.titleNumber,
                  role: 'link'
                }">
                <mat-icon>edit</mat-icon>
                Editar
              </app-button>
              
              <app-button 
                variant="error" 
                size="sm" 
                (clicked)="confirmDelete()"
                [appAccessible]="{
                  ariaLabel: 'Excluir título ' + title.titleNumber,
                  role: 'button'
                }">
                <mat-icon>delete</mat-icon>
                Excluir
              </app-button>
              
              <app-button 
                variant="outline" 
                size="sm" 
                routerLink="/dashboard"
                [appAccessible]="{
                  ariaLabel: 'Voltar ao dashboard',
                  role: 'link'
                }">
                <mat-icon>arrow_back</mat-icon>
                Voltar
              </app-button>
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="summary-section" [@listAnimation]="!!title">
          <h2 class="sr-only">Resumo do Título</h2>
          
          <div class="summary-grid">
            <app-card variant="elevated" padding="md" class="summary-card">
              <div class="summary-content">
                <div class="summary-icon primary">
                  <mat-icon>receipt</mat-icon>
                </div>
                <div class="summary-info">
                  <h3>Valor Original</h3>
                  <p class="summary-value">{{ formatCurrency(title.originalValue || 0) }}</p>
                </div>
              </div>
            </app-card>

            <app-card variant="elevated" padding="md" class="summary-card">
              <div class="summary-content">
                <div class="summary-icon success">
                  <mat-icon>check_circle</mat-icon>
                </div>
                <div class="summary-info">
                  <h3>Valor Pago</h3>
                  <p class="summary-value">{{ formatCurrency(summary.totalPaidValue) }}</p>
                  <small>{{ summary.completionPercentage | number:'1.1-1' }}% concluído</small>
                </div>
              </div>
            </app-card>

            <app-card variant="elevated" padding="md" class="summary-card">
              <div class="summary-content">
                <div class="summary-icon warning">
                  <mat-icon>schedule</mat-icon>
                </div>
                <div class="summary-info">
                  <h3>Valor Pendente</h3>
                  <p class="summary-value">{{ formatCurrency(summary.totalPendingValue) }}</p>
                  <small>{{ summary.pendingInstallments }} parcelas</small>
                </div>
              </div>
            </app-card>

            <app-card variant="elevated" padding="md" class="summary-card">
              <div class="summary-content">
                <div class="summary-icon error">
                  <mat-icon>warning</mat-icon>
                </div>
                <div class="summary-info">
                  <h3>Valor em Atraso</h3>
                  <p class="summary-value">{{ formatCurrency(summary.totalOverdueValue) }}</p>
                  <small>{{ summary.overdueInstallments }} parcelas</small>
                </div>
              </div>
            </app-card>
          </div>
        </div>

        <!-- Tabs Content -->
        <div class="tabs-section" [@slideInUp]="!!title">
          <mat-tab-group [(selectedIndex)]="selectedTabIndex" (selectedTabChange)="onTabChange($event)">
            <!-- Basic Information Tab -->
            <mat-tab label="Informações Básicas" aria-label="Aba de informações básicas do título">
              <div class="tab-content" [@fadeInOut]="selectedTabIndex === 0">
                <div class="info-grid">
                  <app-card variant="outlined" padding="lg" class="info-card">
                    <h3>Dados do Título</h3>
                    <div class="info-list">
                      <div class="info-item">
                        <label>Número do Título:</label>
                        <span>{{ title.titleNumber }}</span>
                      </div>
                      <div class="info-item">
                        <label>Data de Criação:</label>
                        <span>{{ title.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                      </div>
                      <div class="info-item">
                        <label>Data de Vencimento:</label>
                        <span>{{ title.dueDate | date:'dd/MM/yyyy' }}</span>
                      </div>
                      <div class="info-item">
                        <label>Valor Original:</label>
                        <span>{{ formatCurrency(title.originalValue || 0) }}</span>
                      </div>
                      <div class="info-item">
                        <label>Status:</label>
                        <span class="status-text" [style.color]="getStatusColor(title.isOverdue ? 'overdue' : 'active')">
                          {{ getStatusLabel(title.isOverdue ? 'overdue' : 'active') }}
                        </span>
                      </div>
                    </div>
                  </app-card>

                  <app-card variant="outlined" padding="lg" class="info-card">
                    <h3>Dados do Devedor</h3>
                    <div class="info-list">
                      <div class="info-item">
                        <label>Nome:</label>
                        <span>{{ title.debtorName }}</span>
                      </div>
                      <div class="info-item">
                        <label>Documento:</label>
                        <span>{{ title.debtorDocument }}</span>
                      </div>
                      <div class="info-item">
                        <label>Email:</label>
                        <span>Não informado</span>
                      </div>
                      <div class="info-item">
                        <label>Telefone:</label>
                        <span>Não informado</span>
                      </div>
                    </div>
                  </app-card>
                </div>
              </div>
            </mat-tab>

            <!-- Installments Tab -->
            <mat-tab label="Histórico de Parcelas" aria-label="Aba de histórico de parcelas">
              <div class="tab-content" [@fadeInOut]="selectedTabIndex === 1">
                <div class="installments-section">
                  <div class="installments-header">
                    <h3>Parcelas ({{ calculations.length }})</h3>
                    <div class="installments-summary">
                      <span class="summary-item paid">
                        <mat-icon>check_circle</mat-icon>
                        {{ summary.paidInstallments }} Pagas
                      </span>
                      <span class="summary-item pending">
                        <mat-icon>schedule</mat-icon>
                        {{ summary.pendingInstallments }} Pendentes
                      </span>
                      <span class="summary-item overdue">
                        <mat-icon>warning</mat-icon>
                        {{ summary.overdueInstallments }} Em Atraso
                      </span>
                    </div>
                  </div>

                  <div class="installments-table">
                    <table mat-table [dataSource]="calculations" class="installments-mat-table">
                      <!-- Installment Number Column -->
                      <ng-container matColumnDef="installmentNumber">
                        <th mat-header-cell *matHeaderCellDef>Parcela</th>
                        <td mat-cell *matCellDef="let calculation">{{ calculation.installmentNumber }}</td>
                      </ng-container>

                      <!-- Due Date Column -->
                      <ng-container matColumnDef="dueDate">
                        <th mat-header-cell *matHeaderCellDef>Vencimento</th>
                        <td mat-cell *matCellDef="let calculation">
                          {{ calculation.dueDate | date:'dd/MM/yyyy' }}
                        </td>
                      </ng-container>

                      <!-- Original Value Column -->
                      <ng-container matColumnDef="originalValue">
                        <th mat-header-cell *matHeaderCellDef>Valor Original</th>
                        <td mat-cell *matCellDef="let calculation">
                          {{ formatCurrency(calculation.originalValue) }}
                        </td>
                      </ng-container>

                      <!-- Interest Column -->
                      <ng-container matColumnDef="interest">
                        <th mat-header-cell *matHeaderCellDef>Juros</th>
                        <td mat-cell *matCellDef="let calculation">
                          {{ formatCurrency(calculation.interest) }}
                        </td>
                      </ng-container>

                      <!-- Penalty Column -->
                      <ng-container matColumnDef="penalty">
                        <th mat-header-cell *matHeaderCellDef>Multa</th>
                        <td mat-cell *matCellDef="let calculation">
                          {{ formatCurrency(calculation.penalty) }}
                        </td>
                      </ng-container>

                      <!-- Total Value Column -->
                      <ng-container matColumnDef="totalValue">
                        <th mat-header-cell *matHeaderCellDef>Valor Total</th>
                        <td mat-cell *matCellDef="let calculation">
                          {{ formatCurrency(calculation.totalValue) }}
                        </td>
                      </ng-container>

                      <!-- Status Column -->
                      <ng-container matColumnDef="status">
                        <th mat-header-cell *matHeaderCellDef>Status</th>
                        <td mat-cell *matCellDef="let calculation">
                          <span class="status-badge small" [style.background-color]="getStatusColor(calculation.status)">
                            {{ getStatusLabel(calculation.status) }}
                          </span>
                        </td>
                      </ng-container>

                      <!-- Payment Date Column -->
                      <ng-container matColumnDef="paymentDate">
                        <th mat-header-cell *matHeaderCellDef>Data Pagamento</th>
                        <td mat-cell *matCellDef="let calculation">
                          {{ calculation.paymentDate ? (calculation.paymentDate | date:'dd/MM/yyyy') : '-' }}
                        </td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                    </table>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Calculations Tab -->
            <mat-tab label="Cálculos Detalhados" aria-label="Aba de cálculos detalhados">
              <div class="tab-content" [@fadeInOut]="selectedTabIndex === 2">
                <div class="calculations-section">
                  <app-card variant="outlined" padding="lg" class="calculations-card">
                    <h3>Resumo Financeiro</h3>
                    <div class="calculations-grid">
                      <div class="calculation-group">
                        <h4>Valores Originais</h4>
                        <div class="calculation-item">
                          <label>Valor Total Original:</label>
                          <span>{{ formatCurrency(summary.totalOriginalValue) }}</span>
                        </div>
                        <div class="calculation-item">
                          <label>Número de Parcelas:</label>
                          <span>{{ summary.totalInstallments }}</span>
                        </div>
                      </div>

                      <div class="calculation-group">
                        <h4>Valores Pagos</h4>
                        <div class="calculation-item">
                          <label>Total Pago:</label>
                          <span class="success">{{ formatCurrency(summary.totalPaidValue) }}</span>
                        </div>
                        <div class="calculation-item">
                          <label>Parcelas Pagas:</label>
                          <span>{{ summary.paidInstallments }}</span>
                        </div>
                      </div>

                      <div class="calculation-group">
                        <h4>Valores Pendentes</h4>
                        <div class="calculation-item">
                          <label>Total Pendente:</label>
                          <span class="warning">{{ formatCurrency(summary.totalPendingValue) }}</span>
                        </div>
                        <div class="calculation-item">
                          <label>Parcelas Pendentes:</label>
                          <span>{{ summary.pendingInstallments }}</span>
                        </div>
                      </div>

                      <div class="calculation-group">
                        <h4>Valores em Atraso</h4>
                        <div class="calculation-item">
                          <label>Total em Atraso:</label>
                          <span class="error">{{ formatCurrency(summary.totalOverdueValue) }}</span>
                        </div>
                        <div class="calculation-item">
                          <label>Parcelas em Atraso:</label>
                          <span>{{ summary.overdueInstallments }}</span>
                        </div>
                      </div>

                      <div class="calculation-group">
                        <h4>Encargos</h4>
                        <div class="calculation-item">
                          <label>Juros Acumulados:</label>
                          <span class="warning">{{ formatCurrency(summary.interestAccrued) }}</span>
                        </div>
                        <div class="calculation-item">
                          <label>Multas Acumuladas:</label>
                          <span class="error">{{ formatCurrency(summary.penaltiesAccrued) }}</span>
                        </div>
                      </div>

                      <div class="calculation-group">
                        <h4>Progresso</h4>
                        <div class="calculation-item">
                          <label>Percentual Concluído:</label>
                          <span class="success">{{ summary.completionPercentage | number:'1.1-1' }}%</span>
                        </div>
                        <div class="progress-bar">
                          <div class="progress-fill" [style.width.%]="summary.completionPercentage"></div>
                        </div>
                      </div>
                    </div>
                  </app-card>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./debt-title-detail.component.scss'],
  animations: [fadeInOut, slideUp, listAnimation]
})
export class DebtTitleDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private debtTitleService = inject(DebtTitleService);
  private notificationService = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private accessibilityService = inject(AccessibilityService);

  title: DebtTitle | null = null;
  isLoading = false;
  selectedTabIndex = 0;
  calculations: InstallmentCalculation[] = [];
  summary: TitleSummary = {
    totalInstallments: 0,
    paidInstallments: 0,
    pendingInstallments: 0,
    overdueInstallments: 0,
    totalOriginalValue: 0,
    totalPaidValue: 0,
    totalPendingValue: 0,
    totalOverdueValue: 0,
    interestAccrued: 0,
    penaltiesAccrued: 0,
    completionPercentage: 0
  };

  displayedColumns: string[] = [
    'installmentNumber',
    'dueDate',
    'originalValue',
    'interest',
    'penalty',
    'totalValue',
    'status',
    'paymentDate'
  ];

  ngOnInit(): void {
    this.loadTitleDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTitleDetails(): void {
    this.isLoading = true;
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          const titleId = params['id'];
          if (!titleId) {
            return of(null);
          }
          return this.debtTitleService.getById(titleId);
        })
      )
      .subscribe({
        next: (title) => {
          this.isLoading = false;
          this.title = title;
          if (title) {
            this.calculateInstallments();
            this.calculateSummary();
            this.accessibilityService.announce(`Detalhes do título ${title.titleNumber} carregados`);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erro ao carregar título:', error);
          this.notificationService.error('Erro ao carregar detalhes do título');
        }
      });
  }

  private calculateInstallments(): void {
    if (!this.title) return;

    const installments = this.title.installments || [];
    const today = new Date();
    
    this.calculations = installments.map((installment, index) => {
      // Garantir que os valores são números válidos
      const installmentValue = Number(installment.value) || 0;
      const dueDate = new Date(installment.dueDate);
      const daysOverdue = today > dueDate ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      // Cálculo de juros (1% ao mês)
      const monthsOverdue = daysOverdue > 0 ? Math.ceil(daysOverdue / 30) : 0;
      const interest = monthsOverdue > 0 ? installmentValue * 0.01 * monthsOverdue : 0;
      
      // Cálculo de multa (2% sobre o valor original se em atraso)
      const penalty = daysOverdue > 0 ? installmentValue * 0.02 : 0;
      
      const totalValue = installmentValue + interest + penalty;
      
      let status: 'paid' | 'pending' | 'overdue' = 'pending';
      if (installment.paidAt) {
        status = 'paid';
      } else if (daysOverdue > 0) {
        status = 'overdue';
      }

      return {
        installmentNumber: index + 1,
        dueDate: dueDate,
        originalValue: installmentValue,
        interest: interest,
        penalty: penalty,
        totalValue: totalValue,
        daysOverdue: daysOverdue,
        status: status,
        paymentDate: installment.paidAt ? new Date(installment.paidAt) : undefined,
        paidValue: installmentValue
      };
    });
  }

  private calculateSummary(): void {
    if (!this.calculations.length) return;

    const paid = this.calculations.filter(c => c.status === 'paid');
    const pending = this.calculations.filter(c => c.status === 'pending');
    const overdue = this.calculations.filter(c => c.status === 'overdue');

    this.summary = {
      totalInstallments: this.calculations.length,
      paidInstallments: paid.length,
      pendingInstallments: pending.length,
      overdueInstallments: overdue.length,
      totalOriginalValue: this.calculations.reduce((sum, c) => sum + c.originalValue, 0),
      totalPaidValue: paid.reduce((sum, c) => sum + (c.paidValue || c.totalValue), 0),
      totalPendingValue: pending.reduce((sum, c) => sum + c.totalValue, 0),
      totalOverdueValue: overdue.reduce((sum, c) => sum + c.totalValue, 0),
      interestAccrued: this.calculations.reduce((sum, c) => sum + c.interest, 0),
      penaltiesAccrued: this.calculations.reduce((sum, c) => sum + c.penalty, 0),
      completionPercentage: this.calculations.length > 0 ? (paid.length / this.calculations.length) * 100 : 0
    };
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
    const tabNames = ['Informações Básicas', 'Histórico de Parcelas', 'Cálculos Detalhados'];
    this.accessibilityService.announce(`Aba ${tabNames[event.index]} selecionada`);
  }

  confirmDelete(): void {
    if (!this.title) return;

    const confirmed = confirm(`Tem certeza que deseja excluir o título ${this.title.titleNumber}?`);
    if (confirmed) {
      this.deleteTitle();
    }
  }

  private deleteTitle(): void {
    if (!this.title) return;

    this.loadingService.show();

    this.debtTitleService.delete(this.title.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Título excluído com sucesso');
          this.accessibilityService.announce('Título excluído com sucesso');
          this.loadingService.hide();
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Erro ao excluir título:', error);
          this.notificationService.error('Erro ao excluir título');
          this.loadingService.hide();
        }
      });
  }

  formatCurrency(value: number): string {
    // Verificar se o valor é um número válido
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return 'R$ 0,00';
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'paid':
        return '#22c55e';
      case 'pending':
        return '#f59e0b';
      case 'overdue':
        return '#ef4444';
      case 'active':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Em Atraso';
      case 'active':
        return 'Ativo';
      default:
        return 'Desconhecido';
    }
  }
}