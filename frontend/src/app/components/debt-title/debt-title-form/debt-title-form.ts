import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { DebtTitleService } from '../../../services/debt-title.service';
import { NotificationService } from '../../../services/notification.service';
import { LoadingService } from '../../../services/loading.service';
import { DebtTitle, CreateDebtTitleRequest, InstallmentRequest } from '../../../models/debt-title.model';

@Component({
  selector: 'app-debt-title-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './debt-title-form.html',
  styleUrl: './debt-title-form.scss'
})
export class DebtTitleForm implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private debtTitleService = inject(DebtTitleService);
  private notificationService = inject(NotificationService);
  private loadingService = inject(LoadingService);

  debtTitleForm: FormGroup;
  isEditMode = false;
  debtTitleId: string | null = null;
  previewInstallments: any[] = [];

  constructor() {
    this.debtTitleForm = this.fb.group({
      titleNumber: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      debtorName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      debtorDocument: ['', [Validators.required, this.documentValidator]],
      originalValue: ['', [Validators.required, Validators.min(0.01)]],
      dueDate: ['', [Validators.required]],
      interestRatePerDay: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      penaltyRate: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      installmentCount: [1, [Validators.required, Validators.min(1), Validators.max(12)]]
    });
  }

  ngOnInit(): void {
    this.debtTitleId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.debtTitleId;

    if (this.isEditMode && this.debtTitleId) {
      this.loadDebtTitle(this.debtTitleId);
    }
  }

  private loadDebtTitle(id: string): void {
    this.loadingService.show();
    this.debtTitleService.getById(id).subscribe({
      next: (debtTitle) => {
        this.debtTitleForm.patchValue({
          titleNumber: debtTitle.titleNumber,
          debtorName: debtTitle.debtorName,
          debtorDocument: debtTitle.debtorDocument,
          originalValue: debtTitle.originalValue,
          dueDate: new Date(debtTitle.dueDate),
          interestRatePerDay: debtTitle.interestRatePerDay,
          penaltyRate: debtTitle.penaltyRate,
          installmentCount: debtTitle.installmentCount
        });
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Erro ao carregar título:', error);
        this.notificationService.error('Erro ao carregar título');
        this.loadingService.hide();
        this.router.navigate(['/debt-titles']);
      }
    });
  }

  onSubmit(): void {
    if (this.debtTitleForm.valid) {
      this.loadingService.show();
      const formData = this.debtTitleForm.value;
      
      // Convert formatted values to numbers
      const originalValue = this.parseToNumber(formData.originalValue);
      const interestRatePerDay = this.parsePercentageToNumber(formData.interestRatePerDay) / 100;
      const penaltyRate = this.parsePercentageToNumber(formData.penaltyRate) / 100; 
      
      // Criar as parcelas baseadas no número de parcelas
      const installments: InstallmentRequest[] = this.generateInstallments(
        originalValue,
        formData.installmentCount,
        new Date(formData.dueDate)
      );
      
      // Formatar a data para ISO string
      const debtTitleRequest: CreateDebtTitleRequest = {
        titleNumber: formData.titleNumber,
        originalValue: originalValue,
        dueDate: new Date(formData.dueDate).toISOString(),
        interestRatePerDay: interestRatePerDay,
        penaltyRate: penaltyRate,
        debtorName: formData.debtorName,
        debtorDocument: formData.debtorDocument.replace(/\D/g, ''),
        installments: installments
      };

      if (this.isEditMode && this.debtTitleId) {
        this.updateDebtTitle(this.debtTitleId, debtTitleRequest);
      } else {
        this.createDebtTitle(debtTitleRequest);
      }
    } else {
      this.markFormGroupTouched();
      this.notificationService.warning('Por favor, corrija os erros no formulário');
    }
  }

  private createDebtTitle(debtTitle: CreateDebtTitleRequest): void {
    this.debtTitleService.create(debtTitle).subscribe({
      next: () => {
        this.notificationService.success('Título criado com sucesso!');
        this.loadingService.hide();
        this.router.navigate(['/debt-titles']);
      },
      error: (error) => {
        console.error('Erro ao criar título:', error);
        this.notificationService.error('Erro ao criar título');
        this.loadingService.hide();
      }
    });
  }

  private updateDebtTitle(id: string, debtTitle: CreateDebtTitleRequest): void {
    this.debtTitleService.update(id, debtTitle).subscribe({
      next: () => {
        this.notificationService.success('Título atualizado com sucesso!');
        this.loadingService.hide();
        this.router.navigate(['/debt-titles']);
      },
      error: (error) => {
        console.error('Erro ao atualizar título:', error);
        this.notificationService.error('Erro ao atualizar título');
        this.loadingService.hide();
      }
    });
  }

  private generateInstallments(totalValue: number, installmentCount: number, firstDueDate: Date): InstallmentRequest[] {
    const installments: InstallmentRequest[] = [];
    const installmentValue = totalValue / installmentCount;
    
    for (let i = 1; i <= installmentCount; i++) {
      const dueDate = new Date(firstDueDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));
      
      installments.push({
        installmentNumber: i,
        value: installmentValue,
        dueDate: dueDate.toISOString()
      });
    }
    
    return installments;
  }

  onCancel(): void {
    this.router.navigate(['/debt-titles']);
  }

  onDocumentInput(event: any): void {
    const value = event.target.value.replace(/\D/g, '');
    let formattedValue = '';

    if (value.length <= 11) {
      // CPF format: 000.000.000-00
      formattedValue = value
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    } else {
      // CNPJ format: 00.000.000/0000-00
      formattedValue = value
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2');
    }

    this.debtTitleForm.patchValue({
      debtorDocument: formattedValue
    });
  }

  onValueInput(event: any, fieldName: string): void {
    const value = event.target.value.replace(/[^\d,]/g, '');
    const formattedValue = this.formatCurrency(value);
    
    this.debtTitleForm.patchValue({
      [fieldName]: formattedValue
    });
  }

  onValueBlur(fieldName: string): void {
    const control = this.debtTitleForm.get(fieldName);
    if (control?.value) {
      const numericValue = this.parseToNumber(control.value);
      control.setValue(this.formatCurrency(numericValue.toString().replace('.', ',')));
      
      if (fieldName === 'originalValue') {
        this.updateInstallmentPreview();
      }
    }
  }

  private formatCurrency(value: string): string {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    
    const formatted = (parseInt(numbers) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return formatted;
  }

  private parseToNumber(value: string): number {
    if (!value) return 0;
    const cleanValue = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
  }

  onPercentageInput(event: any, fieldName: string): void {
    const value = event.target.value.replace(/[^\d,]/g, '');
    const formattedValue = this.formatPercentage(value);
    
    this.debtTitleForm.patchValue({
      [fieldName]: formattedValue
    });
    
    this.updateInstallmentPreview();
  }

  onPercentageBlur(fieldName: string): void {
    const control = this.debtTitleForm.get(fieldName);
    if (control?.value) {
      const numericValue = this.parsePercentageToNumber(control.value);
      control.setValue(this.formatPercentage(numericValue.toString().replace('.', ',')));
    }
  }

  onInstallmentCountChange(): void {
    this.updateInstallmentPreview();
  }

  onDateChange(): void {
    this.updateInstallmentPreview();
  }

  private formatPercentage(value: string): string {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    
    const formatted = (parseInt(numbers) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return formatted;
  }

  private parsePercentageToNumber(value: string): number {
    if (!value) return 0;
    const cleanValue = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
  }

  private updateInstallmentPreview(): void {
    const formValue = this.debtTitleForm.value;
    
    if (formValue.originalValue && formValue.installmentCount && formValue.dueDate) {
      const originalValue = this.parseToNumber(formValue.originalValue);
      const installmentCount = parseInt(formValue.installmentCount) || 1;
      const dueDate = new Date(formValue.dueDate);
      const interestRate = this.parsePercentageToNumber(formValue.interestRatePerDay) || 0;
      const penaltyRate = this.parsePercentageToNumber(formValue.penaltyRate) || 0;
      
      if (originalValue > 0 && installmentCount > 0 && !isNaN(dueDate.getTime())) {
        this.previewInstallments = this.generateInstallmentPreview(
          originalValue,
          dueDate,
          installmentCount,
          interestRate,
          penaltyRate
        );
      } else {
        this.previewInstallments = [];
      }
    } else {
      this.previewInstallments = [];
    }
  }

  private generateInstallmentPreview(originalValue: number, dueDate: Date, installmentCount: number, interestRate: number, penaltyRate: number): any[] {
    const installments = [];
    const installmentValue = originalValue / installmentCount;
    
    for (let i = 0; i < installmentCount; i++) {
      const installmentDueDate = new Date(dueDate);
      installmentDueDate.setMonth(installmentDueDate.getMonth() + i);
      
      installments.push({
        number: i + 1,
        amount: installmentValue,
        dueDate: installmentDueDate,
        status: 'Pendente'
      });
    }
    
    return installments;
  }

  getTotalValue(): number {
    return this.previewInstallments.reduce((total, installment) => total + installment.amount, 0);
  }

  getInstallmentValue(): number {
    return this.previewInstallments.length > 0 ? this.previewInstallments[0].amount : 0;
  }

  private documentValidator(control: any) {
    if (!control.value) {
      return null;
    }

    const document = control.value.replace(/\D/g, '');
    
    if (document.length === 11) {
      return this.isValidCPF(document) ? null : { invalidDocument: true };
    } else if (document.length === 14) {
      return this.isValidCNPJ(document) ? null : { invalidDocument: true };
    }
    
    return { invalidDocument: true };
  }

  private isValidCPF(cpf: string): boolean {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cpf.charAt(10));
  }

  private isValidCNPJ(cnpj: string): boolean {
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
      return false;
    }

    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(cnpj.charAt(12))) return false;

    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    return digit2 === parseInt(cnpj.charAt(13));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.debtTitleForm.controls).forEach(key => {
      const control = this.debtTitleForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.debtTitleForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return this.getRequiredMessage(fieldName);
      }
      if (control.errors['minlength']) {
        return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres`;
      }
      if (control.errors['maxlength']) {
        return `Máximo de ${control.errors['maxlength'].requiredLength} caracteres`;
      }
      if (control.errors['email']) {
        return 'Email inválido';
      }
      if (control.errors['min']) {
        return this.getMinMessage(fieldName);
      }
      if (control.errors['max']) {
        return this.getMaxMessage(fieldName);
      }
      if (control.errors['pattern']) {
        return this.getPatternMessage(fieldName);
      }
      if (control.errors['invalidDocument']) {
        return 'CPF ou CNPJ inválido';
      }
    }
    return '';
  }

  private getRequiredMessage(fieldName: string): string {
    const messages: { [key: string]: string } = {
      'titleNumber': 'Número do título é obrigatório',
      'debtorName': 'Nome do devedor é obrigatório',
      'debtorDocument': 'CPF/CNPJ é obrigatório',
      'originalValue': 'Valor original é obrigatório',
      'dueDate': 'Data de vencimento é obrigatória',
      'interestRatePerDay': 'Taxa de juros é obrigatória',
      'penaltyRate': 'Taxa de multa é obrigatória',
      'installmentCount': 'Número de parcelas é obrigatório'
    };
    return messages[fieldName] || 'Este campo é obrigatório';
  }

  private getMinMessage(fieldName: string): string {
    const messages: { [key: string]: string } = {
      'originalValue': 'Valor deve ser maior que zero',
      'installmentCount': 'Deve ter pelo menos 1 parcela',
      'interestRatePerDay': 'Taxa deve ser maior ou igual a zero',
      'penaltyRate': 'Taxa deve ser maior ou igual a zero'
    };
    return messages[fieldName] || 'Valor deve ser maior ou igual a zero';
  }

  private getMaxMessage(fieldName: string): string {
    const messages: { [key: string]: string } = {
      'interestRatePerDay': 'Taxa não pode ser maior que 100%',
      'penaltyRate': 'Taxa não pode ser maior que 100%',
      'installmentCount': 'Máximo de 12 parcelas'
    };
    return messages[fieldName] || 'Valor muito alto';
  }

  private getPatternMessage(fieldName: string): string {
    const messages: { [key: string]: string } = {
      'debtorDocument': 'Formato de CPF/CNPJ inválido',
      'titleNumber': 'Formato do número do título inválido'
    };
    return messages[fieldName] || 'Formato inválido';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.debtTitleForm.get(fieldName);
    return !!(control?.invalid && control.touched);
  }
}
