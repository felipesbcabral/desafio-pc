import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LucideIconsModule } from '../../../../core/modules/lucide-icons.module';
import { PaschoCardComponent } from '../../../../shared/components/pascho-card/pascho-card.component';
import { PaschoButtonComponent } from '../../../../shared/components/pascho-button/pascho-button.component';
import { PaschoInputComponent } from '../../../../shared/components/pascho-input/pascho-input.component';
import { DebtService } from '../../../../core/services/debt.service';
import { Debt, UpdateDebtRequest } from '../../../../core/models/debt.model';
import { CustomValidators } from '../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-debt-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    LucideIconsModule,
    PaschoCardComponent,
    PaschoButtonComponent,
    PaschoInputComponent
  ],
  template: `
    <!-- Loading State -->
    <div *ngIf="isLoading" class="flex justify-center items-center py-12">
      <div class="text-center">
        <lucide-icon name="loader-2" [size]="32" class="text-primary-600 animate-spin mx-auto mb-4"></lucide-icon>
        <p class="text-secondary-600">Carregando dados do título...</p>
      </div>
    </div>
    
    <div class="space-y-6" *ngIf="!isLoading">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">Editar Título #{{debt?.debtNumber || 'Carregando...'}}</h1>
          <p class="text-secondary-600 mt-1">{{debt?.debtor?.name || 'Carregando...'}} - {{debt?.debtor?.document || 'Carregando...'}}</p>
        </div>
        <div class="mt-4 sm:mt-0 flex space-x-3">
          <app-pascho-button
            label="Cancelar"
            variant="secondary"
            leftIcon="x"
            (click)="onCancel()"
          ></app-pascho-button>
          <app-pascho-button
            label="Salvar"
            variant="primary"
            leftIcon="check"
            [disabled]="!debtForm.valid || isSaving"
            (click)="onSave()"
          ></app-pascho-button>
        </div>
      </div>
      
      <!-- Status Alert -->
      <app-pascho-card>
        <div class="flex items-center space-x-3">
          <lucide-icon name="alert-triangle" [size]="20" class="text-warning-600"></lucide-icon>
          <div>
            <h3 class="font-medium text-warning-800">Atenção</h3>
            <p class="text-sm text-warning-700">Este título possui parcelas em atraso. Alterações podem afetar os cálculos de juros e multa.</p>
          </div>
        </div>
      </app-pascho-card>
      
      <!-- Dados do Título -->
      <app-pascho-card title="Dados do Título">
        <form [formGroup]="debtForm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-pascho-input
              label="Número do Título"
              [ngModel]="debt?.debtNumber || 'Carregando...'"
              [ngModelOptions]="{standalone: true}"
              [disabled]="true"
            ></app-pascho-input>
            
            <app-pascho-input
              label="Status"
              [ngModel]="debt?.status || 'Carregando...'"
              [ngModelOptions]="{standalone: true}"
              [disabled]="true"
            ></app-pascho-input>
            
            <app-pascho-input
              label="Valor Original"
              type="number"
              formControlName="originalAmount"
              [required]="true"
              [errorMessage]="getFieldError('originalAmount')"
            ></app-pascho-input>
            
            <app-pascho-input
              label="Data de Emissão"
              type="date"
              formControlName="issueDate"
              [required]="true"
              [errorMessage]="getFieldError('issueDate')"
            ></app-pascho-input>
            
            <app-pascho-input
              label="Data de Vencimento"
              type="date"
              formControlName="dueDate"
              [required]="true"
              [errorMessage]="getFieldError('dueDate')"
            ></app-pascho-input>
            
            <app-pascho-input
              label="Taxa de Juros (% a.m.)"
              type="number"
              formControlName="interestRate"
              [required]="true"
              [errorMessage]="getFieldError('interestRate')"
            ></app-pascho-input>
            
            <app-pascho-input
              label="Taxa de Multa (%)"
              type="number"
              formControlName="fineRate"
              [required]="true"
              [errorMessage]="getFieldError('fineRate')"
            ></app-pascho-input>
            
            <app-pascho-input
              label="Número de Parcelas"
              type="number"
              formControlName="installmentCount"
              [required]="true"
              [errorMessage]="getFieldError('installmentCount')"
            ></app-pascho-input>
          </div>
          

        </form>
      </app-pascho-card>
      
      <!-- Dados do Devedor -->
      <app-pascho-card title="Dados do Devedor">
        <form [formGroup]="debtForm">
          <div formGroupName="debtor" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-pascho-input
               label="Nome Completo"
               formControlName="name"
               [required]="true"
               [errorMessage]="getDebtorFieldError('name')"
             ></app-pascho-input>
             
             <app-pascho-input
               label="CPF/CNPJ"
               formControlName="document"
               [required]="true"
               [errorMessage]="getDebtorFieldError('document')"
             ></app-pascho-input>
             

          </div>
        </form>
      </app-pascho-card>
      

      
      <!-- Actions -->
      <app-pascho-card>
        <div class="flex justify-between">
          <div class="flex space-x-3">
            <app-pascho-button
              label="Excluir Título"
              variant="danger"
              leftIcon="trash-2"
              (click)="onDelete()"
            ></app-pascho-button>
          </div>
          
          <div class="flex space-x-3">
            <app-pascho-button
              label="Cancelar"
              variant="secondary"
              (click)="onCancel()"
            ></app-pascho-button>
            <app-pascho-button
              label="Salvar Alterações"
            variant="primary"
            leftIcon="check"
            [disabled]="!debtForm.valid || isSaving"
            (click)="onSave()"
            ></app-pascho-button>
          </div>
        </div>
      </app-pascho-card>
    </div>
  `
})
export class DebtEditComponent implements OnInit {
  debtForm!: FormGroup;
  debt: Debt | null = null;
  debtId: string | null = null;
  isLoading = true;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private debtService: DebtService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.debtId = this.route.snapshot.paramMap.get('id');
    if (this.debtId) {
      this.loadDebt();
    }
  }

  private initializeForm(): void {
    this.debtForm = this.fb.group({
      originalAmount: ['', [Validators.required, Validators.min(0.01)]],
      issueDate: ['', Validators.required],
      dueDate: ['', Validators.required],
      interestRate: ['', Validators.required],
      fineRate: ['', Validators.required],
      installmentCount: ['', [Validators.required, Validators.min(1)]],
      debtor: this.fb.group({
        name: ['', Validators.required],
        document: ['', [Validators.required, CustomValidators.cpfCnpj]]
      })
    });
  }

  private loadDebt(): void {
    if (!this.debtId) return;
    
    this.isLoading = true;
    this.debtService.getDebtById(this.debtId).subscribe({
      next: (debt) => {
        this.debt = debt;
        this.populateForm(debt);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar título:', error);
        this.isLoading = false;
      }
    });
  }

  private populateForm(debt: Debt): void {
    this.debtForm.patchValue({
      originalAmount: debt.originalValue,
      issueDate: this.formatDateForInput(debt.createdAt?.toString() || new Date().toISOString()),
      dueDate: this.formatDateForInput(debt.installments[0]?.dueDate?.toString() || new Date().toISOString()),
      interestRate: debt.interestRate,
      fineRate: debt.fineRate,
      installmentCount: debt.totalInstallments,
      debtor: {
        name: debt.debtor.name,
        document: debt.debtor.document
      }
    });
  }

  private formatDateForInput(date: string): string {
    return new Date(date).toISOString().split('T')[0];
  }

  onSave(): void {
    if (this.debtForm.valid && this.debtId) {
      this.isSaving = true;
      const formValue = this.debtForm.value;
      
      const updateRequest: UpdateDebtRequest = {
        originalAmount: formValue.originalAmount,
        issueDate: formValue.issueDate,
        dueDate: formValue.dueDate,
        interestRate: formValue.interestRate,
        fineRate: formValue.fineRate,
        installmentCount: formValue.installmentCount,
        debtor: formValue.debtor
      };

      this.debtService.updateDebt(this.debtId, updateRequest).subscribe({
        next: () => {
          this.isSaving = false;
          this.router.navigate(['/debts', this.debtId]);
        },
        error: (error) => {
          console.error('Erro ao salvar título:', error);
          this.isSaving = false;
        }
      });
    }
  }

  onCancel(): void {
    if (this.debtId) {
      this.router.navigate(['/debts', this.debtId]);
    } else {
      this.router.navigate(['/debts']);
    }
  }

  onDelete(): void {
    if (this.debtId && confirm('Tem certeza que deseja excluir este título?')) {
      this.debtService.deleteDebt(this.debtId).subscribe({
        next: () => {
          this.router.navigate(['/debts']);
        },
        error: (error) => {
          console.error('Erro ao excluir título:', error);
        }
      });
    }
  }

  getFieldError(fieldName: string): string | undefined {
    const field = this.debtForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) return 'Campo obrigatório';
      if (field.errors?.['email']) return 'E-mail inválido';
      if (field.errors?.['cpfCnpj']) return 'CPF/CNPJ inválido';
    }
    return undefined;
  }

  getDebtorFieldError(fieldName: string): string | undefined {
    const field = this.debtForm.get(`debtor.${fieldName}`);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) return 'Campo obrigatório';
      if (field.errors?.['email']) return 'E-mail inválido';
      if (field.errors?.['cpfCnpj']) return 'CPF/CNPJ inválido';
    }
    return undefined;
  }
}