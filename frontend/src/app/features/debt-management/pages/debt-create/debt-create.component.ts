import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideIconsModule } from '../../../../core/modules/lucide-icons.module';
import { PaschoCardComponent } from '../../../../shared/components/pascho-card/pascho-card.component';
import { PaschoButtonComponent } from '../../../../shared/components/pascho-button/pascho-button.component';
import { PaschoInputComponent } from '../../../../shared/components/pascho-input/pascho-input.component';
import { PaschoDatePickerComponent } from '../../../../shared/components/pascho-date-picker/pascho-date-picker.component';
import { DebtService } from '../../../../core/services/debt.service';
import { CustomValidators } from '../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-debt-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LucideIconsModule,
    PaschoCardComponent,
    PaschoButtonComponent,
    PaschoInputComponent,
    PaschoDatePickerComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">Novo Título de Dívida</h1>
          <p class="text-secondary-600 mt-1">Cadastre um novo título no sistema</p>
        </div>
        <div class="mt-4 sm:mt-0">
          <app-pascho-button
            label="Voltar"
            variant="secondary"
            leftIcon="arrow-left"
            [routerLink]="['/debts']"
          ></app-pascho-button>
        </div>
      </div>
      
      <!-- Progress Steps -->
      <app-pascho-card>
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div [class]="getStepClass(1)">
                1
              </div>
              <span [class]="getStepTextClass(1)">Dados do Devedor</span>
            </div>
            <div class="w-8 h-0.5 bg-gray-300"></div>
            <div class="flex items-center">
              <div [class]="getStepClass(2)">
                2
              </div>
              <span [class]="getStepTextClass(2)">Dados do Título</span>
            </div>
            <div class="w-8 h-0.5 bg-gray-300"></div>
            <div class="flex items-center">
              <div [class]="getStepClass(3)">
                3
              </div>
              <span [class]="getStepTextClass(3)">Parcelas</span>
            </div>
            <div class="w-8 h-0.5 bg-gray-300"></div>
            <div class="flex items-center">
              <div [class]="getStepClass(4)">
                4
              </div>
              <span [class]="getStepTextClass(4)">Confirmação</span>
            </div>
          </div>
        </div>
      </app-pascho-card>
      
      <!-- Form Step 1 - Dados do Devedor -->
      <app-pascho-card *ngIf="currentStep === 1" title="Dados do Devedor" subtitle="Passo 1 de 4">
        <form [formGroup]="debtorForm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-pascho-input
              label="Nome Completo"
              placeholder="Digite o nome do devedor"
              [required]="true"
              formControlName="name"
              [errorMessage]="getErrorMessage('name', debtorForm)"
            ></app-pascho-input>
            
            <app-pascho-input
              label="CPF/CNPJ"
              placeholder="000.000.000-00"
              [required]="true"
              formControlName="document"
              [errorMessage]="getErrorMessage('document', debtorForm)"
            ></app-pascho-input>
          </div>
          
          <div class="flex justify-end mt-6">
            <app-pascho-button
              label="Próximo"
              variant="primary"
              rightIcon="arrow-right"
              (click)="nextStep()"
            ></app-pascho-button>
          </div>
        </form>
      </app-pascho-card>
      
      <!-- Form Step 2 - Dados do Título -->
      <app-pascho-card *ngIf="currentStep === 2" title="Dados do Título" subtitle="Passo 2 de 4">
        <form [formGroup]="debtForm">
          <div class="grid grid-cols-1 gap-6">
            <app-pascho-input
              label="Número do Título"
              placeholder="Digite o número do título"
              [required]="true"
              formControlName="titleNumber"
              [errorMessage]="getErrorMessage('titleNumber', debtForm)"
            ></app-pascho-input>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <app-pascho-input
                label="Valor Total da Compra"
                placeholder="R$ 0,00"
                type="number"
                [step]="0.01"
                [required]="true"
                formControlName="originalValue"
                [errorMessage]="getErrorMessage('originalValue', debtForm)"
                helpText="Valor total da compra sem juros"
              ></app-pascho-input>
              
              <app-pascho-input
                label="Quantidade de Parcelas"
                placeholder="Ex: 12"
                type="number"
                [min]="1"
                [max]="60"
                [required]="true"
                formControlName="numberOfInstallments"
                [errorMessage]="getErrorMessage('numberOfInstallments', debtForm)"
                helpText="Máximo 60 parcelas"
                (input)="onInstallmentCountChange()"
              ></app-pascho-input>
            </div>
            
            <app-pascho-date-picker
              label="Data de Vencimento da Primeira Parcela"
              placeholder="Selecione a data de vencimento"
              [required]="true"
              formControlName="dueDate"
              [errorMessage]="getErrorMessage('dueDate', debtForm)"
              helpText="Data de vencimento da primeira parcela"
            ></app-pascho-date-picker>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <app-pascho-input
                label="Taxa de Juros (% ao dia)"
                placeholder="0.00"
                type="number"
                [step]="0.01"
                [required]="true"
                formControlName="interestRatePerDay"
                [errorMessage]="getErrorMessage('interestRatePerDay', debtForm)"
                helpText="Taxa aplicada progressivamente a cada parcela"
                (input)="onInstallmentCountChange()"
              ></app-pascho-input>
              
              <app-pascho-input
                label="Taxa de Multa (%)"
                placeholder="0.00"
                type="number"
                [step]="0.01"
                [required]="true"
                formControlName="penaltyRate"
                [errorMessage]="getErrorMessage('penaltyRate', debtForm)"
                helpText="Taxa aplicada em cada parcela"
                (input)="onInstallmentCountChange()"
              ></app-pascho-input>
            </div>
          </div>
          
          <div class="flex justify-between mt-6">
            <app-pascho-button
              label="Anterior"
              variant="secondary"
              leftIcon="arrow-left"
              (click)="previousStep()"
            ></app-pascho-button>
            <app-pascho-button
              label="Próximo"
              variant="primary"
              rightIcon="arrow-right"
              (click)="nextStep()"
            ></app-pascho-button>
          </div>
        </form>
      </app-pascho-card>
      
      <!-- Form Step 3 - Parcelas -->
      <app-pascho-card *ngIf="currentStep === 3" title="Parcelas da Dívida" subtitle="Passo 3 de 4">
        <form [formGroup]="installmentsForm">
          <div class="space-y-4">
            <!-- Resumo do Cálculo -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 class="text-lg font-medium text-blue-900 mb-2">Resumo do Cálculo</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span class="text-blue-700">Valor Total:</span>
                  <span class="ml-2 font-medium">R$ {{ debtForm.get('originalValue')?.value | number:'1.2-2' }}</span>
                </div>
                <div>
                  <span class="text-blue-700">Parcelas:</span>
                  <span class="ml-2 font-medium">{{ debtForm.get('numberOfInstallments')?.value }}x</span>
                </div>
                <div>
                  <span class="text-blue-700">Total com Juros:</span>
                  <span class="ml-2 font-medium">R$ {{ getTotalWithInterest() | number:'1.2-2' }}</span>
                </div>
              </div>
              <div class="mt-3 text-xs text-blue-600">
                <p>* Juros de {{ debtForm.get('interestRatePerDay')?.value }}% ao dia aplicados progressivamente</p>
                <p>* Multa de {{ debtForm.get('penaltyRate')?.value }}% aplicada em cada parcela</p>
              </div>
            </div>
            
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-secondary-900">Parcelas Calculadas Automaticamente</h3>
              <div class="flex gap-2">
                <app-pascho-button
                  label="Recalcular"
                  variant="secondary"
                  size="sm"
                  leftIcon="refresh-cw"
                  (click)="generateInstallments()"
                ></app-pascho-button>
                <app-pascho-button
                  label="Adicionar Parcela"
                  variant="secondary"
                  size="sm"
                  leftIcon="plus"
                  (click)="addInstallment()"
                ></app-pascho-button>
              </div>
            </div>
            
            <div formArrayName="installments" class="space-y-4">
              <div *ngFor="let installment of getInstallmentsFormArray().controls; let i = index" 
                   [formGroupName]="i" 
                   class="border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-center mb-4">
                  <h4 class="font-medium text-secondary-900">Parcela {{ i + 1 }}</h4>
                  <app-pascho-button
                    *ngIf="getInstallmentsFormArray().length > 1"
                    label="Remover"
                    variant="danger"
                    size="sm"
                    leftIcon="trash-2"
                    (click)="removeInstallment(i)"
                  ></app-pascho-button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <app-pascho-input
                    label="Número da Parcela"
                    type="number"
                    [required]="true"
                    formControlName="installmentNumber"
                    [errorMessage]="getErrorMessage('installmentNumber', $any(installment))"
                  ></app-pascho-input>
                  
                  <app-pascho-input
                    label="Valor da Parcela"
                    type="number"
                    placeholder="R$ 0,00"
                    [step]="0.01"
                    [required]="true"
                    formControlName="value"
                    [errorMessage]="getErrorMessage('value', $any(installment))"
                  ></app-pascho-input>
                  
                  <app-pascho-date-picker
                    label="Data de Vencimento"
                    placeholder="Selecione a data de vencimento"
                    [required]="true"
                    formControlName="dueDate"
                    [errorMessage]="getErrorMessage('dueDate', $any(installment))"
                    helpText="Selecione a data de vencimento"
                  ></app-pascho-date-picker>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-between mt-6">
            <app-pascho-button
              label="Anterior"
              variant="secondary"
              leftIcon="arrow-left"
              (click)="previousStep()"
            ></app-pascho-button>
            <app-pascho-button
              label="Próximo"
              variant="primary"
              rightIcon="arrow-right"
              (click)="nextStep()"
            ></app-pascho-button>
          </div>
        </form>
      </app-pascho-card>
      
      <!-- Form Step 4 - Confirmação -->
      <app-pascho-card *ngIf="currentStep === 4" title="Confirmação" subtitle="Passo 4 de 4">
        <div class="space-y-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium text-secondary-900 mb-3">Dados do Devedor</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-secondary-600">Nome:</span>
                <span class="ml-2 font-medium">{{ debtorForm.get('name')?.value }}</span>
              </div>
              <div>
                <span class="text-secondary-600">CPF/CNPJ:</span>
                <span class="ml-2 font-medium">{{ debtorForm.get('document')?.value }}</span>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium text-secondary-900 mb-3">Dados do Título</h3>
            <div class="grid grid-cols-1 gap-4 text-sm">
              <div>
                <span class="text-secondary-600">Número do Título:</span>
                <span class="ml-2 font-medium">{{ debtForm.get('titleNumber')?.value }}</span>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span class="text-secondary-600">Valor Total da Compra:</span>
                  <span class="ml-2 font-medium">R$ {{ debtForm.get('originalValue')?.value | number:'1.2-2' }}</span>
                </div>
                <div>
                  <span class="text-secondary-600">Quantidade de Parcelas:</span>
                  <span class="ml-2 font-medium">{{ debtForm.get('numberOfInstallments')?.value }}x</span>
                </div>
              </div>
              
              <div>
                <span class="text-secondary-600">Data da Primeira Parcela:</span>
                <span class="ml-2 font-medium">{{ debtForm.get('dueDate')?.value }}</span>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span class="text-secondary-600">Taxa de Juros:</span>
                  <span class="ml-2 font-medium">{{ debtForm.get('interestRatePerDay')?.value }}% ao dia</span>
                </div>
                <div>
                  <span class="text-secondary-600">Taxa de Multa:</span>
                  <span class="ml-2 font-medium">{{ debtForm.get('penaltyRate')?.value }}%</span>
                </div>
              </div>
              
              <div class="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span class="text-blue-700 font-medium">Valor Total com Juros:</span>
                    <span class="ml-2 font-bold text-blue-900">R$ {{ getTotalWithInterest() | number:'1.2-2' }}</span>
                  </div>
                  <div>
                    <span class="text-blue-700 font-medium">Juros Totais:</span>
                    <span class="ml-2 font-bold text-blue-900">R$ {{ (getTotalWithInterest() - debtForm.get('originalValue')?.value) | number:'1.2-2' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium text-secondary-900 mb-3">Parcelas da Dívida</h3>
            <div class="space-y-3">
              <div class="text-sm">
                <span class="text-secondary-600">Total de Parcelas:</span>
                <span class="ml-2 font-medium">{{ getInstallmentsFormArray().length }}</span>
              </div>
              
              <div class="space-y-2">
                <div *ngFor="let installment of getInstallmentsFormArray().controls; let i = index" 
                     class="border border-gray-200 rounded p-3 bg-white">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span class="text-secondary-600">Parcela:</span>
                      <span class="ml-2 font-medium">{{ installment.get('installmentNumber')?.value }}</span>
                    </div>
                    <div>
                      <span class="text-secondary-600">Valor:</span>
                      <span class="ml-2 font-medium">R$ {{ installment.get('value')?.value | number:'1.2-2' }}</span>
                    </div>
                    <div>
                       <span class="text-secondary-600">Vencimento:</span>
                       <span class="ml-2 font-medium">{{ installment.get('dueDate')?.value }}</span>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-between mt-6">
          <app-pascho-button
            label="Anterior"
            variant="secondary"
            leftIcon="arrow-left"
            (click)="previousStep()"
          ></app-pascho-button>
          <app-pascho-button
            label="Criar Título"
            variant="primary"
            rightIcon="check"
            [loading]="isSubmitting"
            (click)="onSubmit()"
          ></app-pascho-button>
        </div>
      </app-pascho-card>
    </div>
  `
})
export class DebtCreateComponent {
  debtorForm: FormGroup;
  debtForm: FormGroup;
  installmentsForm: FormGroup;
  currentStep = 1;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private debtService: DebtService,
    private router: Router
  ) {
    this.debtorForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      document: ['', [Validators.required, CustomValidators.cpfOrCnpj]]
    });

    this.debtForm = this.fb.group({
      titleNumber: ['', [Validators.required, Validators.minLength(1)]],
      originalValue: ['', [Validators.required, CustomValidators.positiveValue]],
      numberOfInstallments: ['', [Validators.required, Validators.min(1), Validators.max(60)]],
      dueDate: ['', [Validators.required, CustomValidators.dateFormat]],
      interestRatePerDay: ['', Validators.required],
      penaltyRate: ['', Validators.required]
    });

    this.installmentsForm = this.fb.group({
      installments: this.fb.array([this.createInstallmentFormGroup()])
    });
    
    // Adicionar listeners para recalcular automaticamente
    this.debtForm.get('originalValue')?.valueChanges.subscribe(() => {
      this.onInstallmentCountChange();
    });
    
    this.debtForm.get('interestRatePerDay')?.valueChanges.subscribe(() => {
      this.onInstallmentCountChange();
    });
    
    this.debtForm.get('penaltyRate')?.valueChanges.subscribe(() => {
      this.onInstallmentCountChange();
    });
    
    this.debtForm.get('dueDate')?.valueChanges.subscribe(() => {
      this.onInstallmentCountChange();
    });
  }

  createInstallmentFormGroup(): FormGroup {
    return this.fb.group({
      installmentNumber: ['', [Validators.required, Validators.min(1)]],
      value: ['', [Validators.required, CustomValidators.positiveValue]],
      dueDate: ['', [Validators.required, CustomValidators.dateFormat]]
    });
  }

  getInstallmentsFormArray(): FormArray {
    return this.installmentsForm.get('installments') as FormArray;
  }

  addInstallment(): void {
    const installments = this.getInstallmentsFormArray();
    const nextNumber = installments.length + 1;
    const newInstallment = this.createInstallmentFormGroup();
    newInstallment.get('installmentNumber')?.setValue(nextNumber);
    installments.push(newInstallment);
  }

  removeInstallment(index: number): void {
    const installments = this.getInstallmentsFormArray();
    if (installments.length > 1) {
      installments.removeAt(index);
      // Renumerar as parcelas
      installments.controls.forEach((control, i) => {
        control.get('installmentNumber')?.setValue(i + 1);
      });
    }
  }

  getStepClass(step: number): string {
    const baseClass = 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium';
    if (step === this.currentStep) {
      return `${baseClass} bg-primary-600 text-white`;
    } else if (step < this.currentStep) {
      return `${baseClass} bg-green-600 text-white`;
    } else {
      return `${baseClass} bg-gray-300 text-gray-600`;
    }
  }

  getStepTextClass(step: number): string {
    const baseClass = 'ml-2 text-sm font-medium';
    if (step === this.currentStep) {
      return `${baseClass} text-primary-600`;
    } else if (step < this.currentStep) {
      return `${baseClass} text-green-600`;
    } else {
      return `${baseClass} text-gray-600`;
    }
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.debtorForm.valid;
      case 2:
        return this.debtForm.valid;
      case 3:
        return this.installmentsForm.valid;
      default:
        return true;
    }
  }

  markCurrentStepAsTouched(): void {
    switch (this.currentStep) {
      case 1:
        this.debtorForm.markAllAsTouched();
        break;
      case 2:
        this.debtForm.markAllAsTouched();
        break;
      case 3:
        this.installmentsForm.markAllAsTouched();
        break;
    }
  }

  nextStep(): void {
    this.markCurrentStepAsTouched();
    if (this.validateCurrentStep()) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  private formatDateForBackend(dateString: string): string {
    // Converte DD/MM/AAAA para AAAA-MM-DD
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  onSubmit(): void {
    if (this.isSubmitting) return;
    
    // Validar todos os formulários
    this.debtorForm.markAllAsTouched();
    this.debtForm.markAllAsTouched();
    this.installmentsForm.markAllAsTouched();

    if (!this.debtorForm.valid || !this.debtForm.valid || !this.installmentsForm.valid) {
      console.error('Formulário inválido');
      return;
    }

    this.isSubmitting = true;

    // Preparar dados para envio
    const createDebtRequest = {
      titleNumber: this.debtForm.get('titleNumber')?.value,
      originalValue: parseFloat(this.debtForm.get('originalValue')?.value),
      dueDate: this.formatDateForBackend(this.debtForm.get('dueDate')?.value),
      interestRatePerDay: parseFloat(this.debtForm.get('interestRatePerDay')?.value),
      penaltyRate: parseFloat(this.debtForm.get('penaltyRate')?.value),
      debtorName: this.debtorForm.get('name')?.value,
      debtorDocument: this.debtorForm.get('document')?.value,
      installments: this.getInstallmentsFormArray().controls.map(control => ({
        installmentNumber: parseInt(control.get('installmentNumber')?.value),
        value: parseFloat(control.get('value')?.value),
        dueDate: this.formatDateForBackend(control.get('dueDate')?.value)
      }))
    };

    this.debtService.createDebtTitle(createDebtRequest).subscribe({
      next: (response) => {
        console.log('Título criado com sucesso:', response);
        this.router.navigate(['/debts']);
      },
      error: (error) => {
        console.error('Erro ao criar título:', error);
        this.isSubmitting = false;
      }
    });
  }

  private calculateTotalValue(): number {
    return this.getInstallmentsFormArray().controls.reduce((total, control) => {
      const value = parseFloat(control.get('value')?.value || '0');
      return total + value;
    }, 0);
  }

  onInstallmentCountChange(): void {
    const numberOfInstallments = this.debtForm.get('numberOfInstallments')?.value;
    const originalValue = this.debtForm.get('originalValue')?.value;
    
    if (numberOfInstallments && originalValue && numberOfInstallments > 0) {
      this.generateInstallments();
    }
  }
  
  getTotalWithInterest(): number {
    return this.getInstallmentsFormArray().controls.reduce((total, control) => {
      const value = parseFloat(control.get('value')?.value || '0');
      return total + value;
    }, 0);
  }

  generateInstallments(): void {
    const numberOfInstallments = parseInt(this.debtForm.get('numberOfInstallments')?.value || '0');
    const originalValue = parseFloat(this.debtForm.get('originalValue')?.value || '0');
    const interestRate = parseFloat(this.debtForm.get('interestRatePerDay')?.value || '0') / 100;
    const penaltyRate = parseFloat(this.debtForm.get('penaltyRate')?.value || '0') / 100;
    const firstDueDate = this.debtForm.get('dueDate')?.value;

    if (numberOfInstallments <= 0 || originalValue <= 0) {
      return;
    }

    // Limpar parcelas existentes
    const installmentsArray = this.getInstallmentsFormArray();
    while (installmentsArray.length > 0) {
      installmentsArray.removeAt(0);
    }

    // Calcular valor base da parcela
    const baseInstallmentValue = originalValue / numberOfInstallments;
    
    // Gerar parcelas
    for (let i = 0; i < numberOfInstallments; i++) {
      // Calcular juros compostos para cada parcela
      const daysFromFirst = i * 30; // Assumindo parcelas mensais
      const interestAmount = baseInstallmentValue * interestRate * daysFromFirst;
      const penaltyAmount = baseInstallmentValue * penaltyRate;
      const finalValue = baseInstallmentValue + interestAmount + penaltyAmount;
      
      // Calcular data de vencimento
      let dueDate = '';
      if (firstDueDate) {
        const [day, month, year] = firstDueDate.split('/');
        const baseDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        baseDate.setMonth(baseDate.getMonth() + i);
        
        const newDay = baseDate.getDate().toString().padStart(2, '0');
        const newMonth = (baseDate.getMonth() + 1).toString().padStart(2, '0');
        const newYear = baseDate.getFullYear().toString();
        dueDate = `${newDay}/${newMonth}/${newYear}`;
      }
      
      const installmentGroup = this.fb.group({
        installmentNumber: [i + 1, [Validators.required, Validators.min(1)]],
        value: [parseFloat(finalValue.toFixed(2)), [Validators.required, CustomValidators.positiveValue]],
        dueDate: [dueDate, [Validators.required, CustomValidators.dateFormat]]
      });
      
      installmentsArray.push(installmentGroup);
    }
  }

  getErrorMessage(fieldName: string, form: FormGroup): string {
    const control = form.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;
    
    if (errors['required']) {
      return 'Este campo é obrigatório';
    }
    
    if (errors['cpfOrCnpj']) {
      return errors['cpfOrCnpj'].message || 'CPF ou CNPJ inválido';
    }
    
    if (errors['percentage']) {
      return errors['percentage'].message || 'Porcentagem inválida';
    }
    
    if (errors['dateFormat']) {
      return errors['dateFormat'].message || 'Formato de data inválido (DD/MM/AAAA)';
    }
    
    if (errors['positiveValue']) {
      return errors['positiveValue'].message || 'Valor deve ser positivo';
    }
    
    if (errors['min']) {
      return `Valor mínimo é ${errors['min'].min}`;
    }
    
    if (errors['max']) {
      return `Valor máximo é ${errors['max'].max}`;
    }
    
    if (errors['minlength']) {
      return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    }
    
    return 'Campo inválido';
  }
}