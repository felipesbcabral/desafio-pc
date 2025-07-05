import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LucideIconsModule } from '../../../../core/modules/lucide-icons.module';
import { PaschoCardComponent } from '../../../../shared/components/pascho-card/pascho-card.component';
import { PaschoButtonComponent } from '../../../../shared/components/pascho-button/pascho-button.component';
import { DebtService } from '../../../../core/services/debt.service';
import { Debt } from '../../../../core/models/debt.model';

@Component({
  selector: 'app-debt-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideIconsModule,
    PaschoCardComponent,
    PaschoButtonComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p class="mt-4 text-secondary-600">Carregando dados da dívida...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="text-center py-12">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6">
          <lucide-icon name="alert-circle" [size]="48" class="text-red-500 mx-auto mb-4"></lucide-icon>
          <h3 class="text-lg font-medium text-red-800 mb-2">Erro ao carregar dívida</h3>
          <p class="text-red-600">{{ error }}</p>
          <app-pascho-button
            label="Voltar"
            variant="secondary"
            leftIcon="arrow-left"
            [routerLink]="['/debts']"
            class="mt-4"
          ></app-pascho-button>
        </div>
      </div>

      <!-- Content -->
      <div *ngIf="debt && !loading && !error">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-secondary-900">{{ debt.debtNumber }}</h1>
            <p class="text-secondary-600 mt-1">{{ debt.debtor.name }} - {{ debt.debtor.documentType }}: {{ formatDocument(debt.debtor.document) }}</p>
          </div>
          <div class="mt-4 sm:mt-0 flex space-x-3">
            <app-pascho-button
              label="Editar"
              variant="secondary"
              leftIcon="edit"
              [routerLink]="['/debts', debt.id, 'edit']"
            ></app-pascho-button>
            <app-pascho-button
              label="Voltar"
              variant="secondary"
              leftIcon="arrow-left"
              [routerLink]="['/debts']"
            ></app-pascho-button>
          </div>
        </div>
      
        <!-- Status Badge -->
        <div class="flex items-center space-x-3">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" [ngClass]="getStatusBadge().class">
            <lucide-icon [name]="getStatusBadge().icon" [size]="16" class="mr-1"></lucide-icon>
            {{ getStatusBadge().text }}
          </span>
          <span class="text-sm text-secondary-600" *ngIf="debt.status === 'OVERDUE'">Em atraso</span>
        </div>
      
        <!-- Main Info Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <app-pascho-card title="Valor Original" variant="elevated">
            <div class="text-center">
              <div class="text-3xl font-bold text-secondary-900">{{ formatCurrency(debt.originalValue) }}</div>
              <div class="text-sm text-secondary-600 mt-1">Valor inicial do título</div>
            </div>
          </app-pascho-card>
          
          <app-pascho-card title="Valor Atual" variant="elevated">
            <div class="text-center">
              <div class="text-3xl font-bold" [ngClass]="debt.currentValue > debt.originalValue ? 'text-red-600' : 'text-secondary-900'">{{ formatCurrency(debt.currentValue) }}</div>
              <div class="text-sm text-secondary-600 mt-1">Com juros e multa</div>
            </div>
          </app-pascho-card>
          
          <app-pascho-card title="Parcelas" variant="elevated">
            <div class="text-center">
              <div class="text-3xl font-bold text-secondary-900">{{ debt.paidInstallments }}/{{ debt.totalInstallments }}</div>
              <div class="text-sm text-secondary-600 mt-1">Parcelas pagas</div>
            </div>
          </app-pascho-card>
        </div>
      
        <!-- Detailed Information -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Dados do Título -->
          <app-pascho-card title="Dados do Título">
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-secondary-600">Número:</span>
                <span class="font-medium">{{ debt.debtNumber }}</span>
              </div>
              <div class="flex justify-between" *ngIf="debt.createdAt">
                <span class="text-secondary-600">Data de Criação:</span>
                <span class="font-medium">{{ formatDate(debt.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">Total de Parcelas:</span>
                <span class="font-medium">{{ debt.totalInstallments }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">Taxa de Juros:</span>
                <span class="font-medium">{{ formatRate(debt.interestRate) }}% a.m.</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">Taxa de Multa:</span>
                <span class="font-medium">{{ formatRate(debt.fineRate) }}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">Status:</span>
                <span class="font-medium" [ngClass]="{
                  'text-green-600': debt.status === 'PAID',
                  'text-red-600': debt.status === 'OVERDUE',
                  'text-blue-600': debt.status === 'ACTIVE'
                }">{{ getStatusBadge().text }}</span>
              </div>
            </div>
          </app-pascho-card>
          
          <!-- Dados do Devedor -->
          <app-pascho-card title="Dados do Devedor">
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-secondary-600">Nome:</span>
                <span class="font-medium">{{ debt.debtor.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">{{ debt.debtor.documentType }}:</span>
                <span class="font-medium">{{ formatDocument(debt.debtor.document) }}</span>
              </div>
            </div>
          </app-pascho-card>
        </div>
      
        <!-- Timeline de Parcelas -->
        <app-pascho-card title="Parcelas" subtitle="Informações das parcelas" *ngIf="debt.installments && debt.installments.length > 0">
          <div class="space-y-4">
            <div *ngFor="let installment of debt.installments; let i = index" 
                 class="flex items-center justify-between p-4 rounded-lg border" 
                 [ngClass]="getInstallmentStatus(installment).class">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center" 
                     [ngClass]="{
                       'bg-green-500': installment.status === 'PAID',
                       'bg-red-500': installment.status === 'OVERDUE',
                       'bg-yellow-500': installment.status === 'PENDING'
                     }">
                  <lucide-icon [name]="getInstallmentStatus(installment).icon" [size]="16" class="text-white"></lucide-icon>
                </div>
                <div>
                  <div class="font-medium" [ngClass]="{
                    'text-green-800': installment.status === 'PAID',
                    'text-red-800': installment.status === 'OVERDUE',
                    'text-yellow-800': installment.status === 'PENDING'
                  }">Parcela {{ i + 1 }}/{{ debt.totalInstallments }}</div>
                  <div class="text-sm" [ngClass]="{
                    'text-green-600': installment.status === 'PAID',
                    'text-red-600': installment.status === 'OVERDUE',
                    'text-yellow-600': installment.status === 'PENDING'
                  }">
                    <span *ngIf="installment.status === 'PAID' && installment.paymentDate">Paga em {{ formatDate(installment.paymentDate) }}</span>
                    <span *ngIf="installment.status === 'OVERDUE'">{{ getInstallmentStatus(installment).text }}</span>
                    <span *ngIf="installment.status === 'PENDING'">{{ getInstallmentStatus(installment).text }}</span>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold" [ngClass]="{
                  'text-green-800': installment.status === 'PAID',
                  'text-red-800': installment.status === 'OVERDUE',
                  'text-yellow-800': installment.status === 'PENDING'
                }">{{ formatCurrency(installment.currentValue || installment.originalValue) }}</div>
                <div class="text-sm" [ngClass]="{
                  'text-green-600': installment.status === 'PAID',
                  'text-red-600': installment.status === 'OVERDUE',
                  'text-yellow-600': installment.status === 'PENDING'
                }">Venc: {{ formatDate(installment.dueDate) }}</div>
                <app-pascho-button
                  *ngIf="installment.status !== 'PAID'"
                  label="Marcar como Paga"
                  variant="success"
                  size="sm"
                  class="mt-2"
                ></app-pascho-button>
              </div>
            </div>
          </div>
        </app-pascho-card>

        <!-- Mensagem quando não há parcelas -->
        <app-pascho-card title="Parcelas" *ngIf="!debt.installments || debt.installments.length === 0">
          <div class="text-center py-8">
            <lucide-icon name="calendar" [size]="48" class="text-secondary-400 mx-auto mb-4"></lucide-icon>
            <p class="text-secondary-600">Nenhuma parcela encontrada para esta dívida.</p>
          </div>
        </app-pascho-card>
      
        <!-- Actions -->
        <app-pascho-card title="Ações">
          <div class="flex flex-wrap gap-3">
            <app-pascho-button
              label="Gerar Relatório"
              variant="primary"
              leftIcon="file-text"
            ></app-pascho-button>
            <app-pascho-button
              label="Enviar Cobrança"
              variant="warning"
              leftIcon="mail"
            ></app-pascho-button>
            <app-pascho-button
              label="Renegociar"
              variant="info"
              leftIcon="handshake"
            ></app-pascho-button>
            <app-pascho-button
              label="Histórico"
              variant="secondary"
              leftIcon="clock"
            ></app-pascho-button>
          </div>
        </app-pascho-card>
      </div>
    </div>
  `
})
export class DebtDetailComponent implements OnInit, OnDestroy {
  debt: Debt | null = null;
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private debtService: DebtService
  ) {}

  ngOnInit(): void {
    const debtId = this.route.snapshot.paramMap.get('id');
    if (debtId) {
      this.loadDebt(debtId);
    } else {
      this.error = 'ID da dívida não encontrado';
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDebt(id: string): void {
    this.loading = true;
    this.debtService.getDebtById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (debt) => {
          this.debt = debt;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar dívida:', error);
          this.error = 'Erro ao carregar os dados da dívida';
          this.loading = false;
        }
      });
  }

  getStatusBadge(): { class: string; icon: string; text: string } {
    if (!this.debt) return { class: '', icon: '', text: '' };
    
    switch (this.debt.status) {
      case 'ACTIVE':
        return {
          class: 'bg-green-100 text-green-800',
          icon: 'check-circle',
          text: 'Ativo'
        };
      case 'OVERDUE':
        return {
          class: 'bg-red-100 text-red-800',
          icon: 'alert-circle',
          text: 'Em Atraso'
        };
      case 'PAID':
        return {
          class: 'bg-blue-100 text-blue-800',
          icon: 'check-circle-2',
          text: 'Pago'
        };
      default:
        return {
          class: 'bg-gray-100 text-gray-800',
          icon: 'circle',
          text: 'Desconhecido'
        };
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR').format(dateObj);
  }

  formatDocument(document: string): string {
    if (document.length === 11) {
      // CPF
      return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (document.length === 14) {
      // CNPJ
      return document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return document;
  }

  formatRate(rate: number): string {
    return rate.toFixed(2);
  }

  getInstallmentStatus(installment: any): { class: string; icon: string; text: string } {
    if (installment.status === 'PAID') {
      return {
        class: 'bg-green-50 border-green-200',
        icon: 'check',
        text: 'Paga'
      };
    } else if (installment.status === 'OVERDUE') {
      return {
        class: 'bg-red-50 border-red-200',
        icon: 'x',
        text: 'Em atraso'
      };
    } else {
      return {
        class: 'bg-yellow-50 border-yellow-200',
        icon: 'clock',
        text: 'Pendente'
      };
    }
  }
}