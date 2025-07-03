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

  constructor() {
    this.debtTitleForm = this.fb.group({
      titleNumber: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      debtorName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      debtorDocument: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(14)]],
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
      
      // Criar as parcelas baseadas no número de parcelas
      const installments: InstallmentRequest[] = this.generateInstallments(
        formData.originalValue,
        formData.installmentCount,
        new Date(formData.dueDate)
      );
      
      // Formatar a data para ISO string
      const debtTitleRequest: CreateDebtTitleRequest = {
        titleNumber: formData.titleNumber,
        originalValue: formData.originalValue,
        dueDate: new Date(formData.dueDate).toISOString(),
        interestRatePerDay: formData.interestRatePerDay,
        penaltyRate: formData.penaltyRate,
        debtorName: formData.debtorName,
        debtorDocument: formData.debtorDocument,
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
        return 'Este campo é obrigatório';
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
        if (fieldName === 'originalValue') {
          return 'Valor deve ser maior que zero';
        }
        if (fieldName === 'installmentCount') {
          return 'Deve ter pelo menos 1 parcela';
        }
        return 'Valor deve ser maior ou igual a zero';
      }
      if (control.errors['max']) {
        if (fieldName === 'interestRatePerDay' || fieldName === 'penaltyRate') {
          return 'Valor não pode ser maior que 100%';
        }
        if (fieldName === 'installmentCount') {
          return 'Máximo de 12 parcelas';
        }
        return 'Valor muito alto';
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.debtTitleForm.get(fieldName);
    return !!(control?.invalid && control.touched);
  }
}
