import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DebtTitleService } from '../../../services/debt-title.service';
import { DebtTitle } from '../../../models/debt-title.model';

interface InstallmentPreview {
  number: number;
  dueDate: Date;
  value: number;
}

@Component({
  selector: 'app-debt-title-form',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './debt-title-form.html',
  styleUrl: './debt-title-form.scss'
})
export class DebtTitleFormComponent implements OnInit, AfterViewInit {
  isEditMode = false;
  titleId: string | null = null;
  isLoading = false;
  editingField: string | null = null;
  originalValues: any = {};

  titleData: any = {
    titleNumber: '',
    debtorName: '',
    debtorDocument: '',
    originalValue: null,
    dueDate: null,
    interestRatePerDay: null,
    penaltyRate: null,
    installmentCount: 1
  };

  @ViewChild('titleNumberInput') titleNumberInput!: ElementRef;
  @ViewChild('debtorNameInput') debtorNameInput!: ElementRef;
  @ViewChild('debtorDocumentInput') debtorDocumentInput!: ElementRef;
  @ViewChild('originalValueInput') originalValueInput!: ElementRef;
  @ViewChild('dueDateInput') dueDateInput!: ElementRef;
  @ViewChild('interestRateInput') interestRateInput!: ElementRef;
  @ViewChild('penaltyRateInput') penaltyRateInput!: ElementRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private debtTitleService: DebtTitleService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.titleId = params['id'];
        this.loadTitleForEdit();
      } else {
        // Valores padrão para novo título
        this.titleData.installmentCount = 1;
      }
    });
  }

  ngAfterViewInit(): void {
    // Implementação futura se necessário
  }

  private loadTitleForEdit(): void {
    if (!this.titleId) return;

    this.isLoading = true;
    this.debtTitleService.getById(this.titleId).subscribe({
      next: (title) => {
        this.titleData = {
          titleNumber: title.titleNumber,
          debtorName: title.debtorName,
          debtorDocument: title.debtorDocument,
          originalValue: title.originalValue,
          dueDate: new Date(title.dueDate),
          interestRatePerDay: title.interestRatePerDay * 100,
          penaltyRate: title.penaltyRate * 100,
          installmentCount: title.installments?.length || 1
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar título:', error);
        this.snackBar.open('Erro ao carregar título', 'Fechar', { duration: 3000 });
        this.isLoading = false;
        this.router.navigate(['/debt-titles']);
      }
    });
  }

  // Métodos de edição inline
  startEditing(field: string): void {
    if (this.editingField && this.editingField !== field) {
      this.cancelEdit();
    }
    
    this.editingField = field;
    this.originalValues[field] = this.titleData[field];
    
    // Focus no input após o Angular atualizar a view
    setTimeout(() => {
      const inputRef = this.getInputRef(field);
      if (inputRef) {
        inputRef.nativeElement.focus();
        inputRef.nativeElement.select();
      }
    }, 100);
  }

  saveField(field: string): void {
    // Validação básica
    if (!this.isFieldValid(field)) {
      this.snackBar.open('Valor inválido', 'Fechar', { duration: 2000 });
      return;
    }

    this.editingField = null;
    delete this.originalValues[field];
  }

  cancelEdit(): void {
    if (this.editingField && this.originalValues[this.editingField] !== undefined) {
      this.titleData[this.editingField] = this.originalValues[this.editingField];
    }
    this.editingField = null;
    this.originalValues = {};
  }

  private getInputRef(field: string): ElementRef | null {
    switch (field) {
      case 'titleNumber': return this.titleNumberInput;
      case 'debtorName': return this.debtorNameInput;
      case 'debtorDocument': return this.debtorDocumentInput;
      case 'originalValue': return this.originalValueInput;
      case 'dueDate': return this.dueDateInput;
      case 'interestRatePerDay': return this.interestRateInput;
      case 'penaltyRate': return this.penaltyRateInput;
      default: return null;
    }
  }

  private isFieldValid(field: string): boolean {
    const value = this.titleData[field];
    
    switch (field) {
      case 'titleNumber':
      case 'debtorName':
        return value && value.trim().length > 0;
      case 'debtorDocument':
        return value && this.isValidDocument(value);
      case 'originalValue':
        return value && parseFloat(value) > 0;
      case 'dueDate':
        return value && new Date(value) > new Date();
      case 'interestRatePerDay':
      case 'penaltyRate':
        return value !== null && parseFloat(value) >= 0;
      default:
        return true;
    }
  }

  private isValidDocument(document: string): boolean {
    const cleanDoc = document.replace(/\D/g, '');
    return cleanDoc.length === 11 || cleanDoc.length === 14;
  }

  // Métodos de formatação
  formatCurrency(value: any): string {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  }

  formatDate(date: any): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatDocument(document: string): string {
    if (!document) return '';
    const cleanDoc = document.replace(/\D/g, '');
    
    if (cleanDoc.length === 11) {
      return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cleanDoc.length === 14) {
      return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return document;
  }

  formatPercentage(value: any): string {
    if (!value) return '';
    return `${parseFloat(value).toFixed(2)}%`;
  }

  onCancel(): void {
    this.router.navigate(['/debt-titles']);
  }

  // Métodos de input
  onDocumentInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      // CPF
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // CNPJ
      value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    this.titleData.debtorDocument = value;
  }

  onValueInput(event: any): void {
    let value = event.target.value.replace(/[^\d,]/g, '');
    this.titleData.originalValue = value;
  }

  onPercentageInput(event: any): void {
    let value = event.target.value.replace(/[^\d,]/g, '');
    const field = event.target.getAttribute('formControlName') || 
                  (this.editingField === 'interestRatePerDay' ? 'interestRatePerDay' : 'penaltyRate');
    this.titleData[field] = value;
  }

  // Métodos de preview de parcelas
  getInstallmentPreview(): InstallmentPreview[] {
    if (!this.titleData.originalValue || !this.titleData.dueDate || !this.titleData.installmentCount) {
      return [];
    }

    const installments = [];
    const installmentValue = parseFloat(this.titleData.originalValue) / this.titleData.installmentCount;
    const baseDate = new Date(this.titleData.dueDate);

    for (let i = 0; i < this.titleData.installmentCount; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      installments.push({
        number: i + 1,
        value: installmentValue,
        dueDate: dueDate
      });
    }

    return installments;
  }

  // Métodos principais
  canSave(): boolean {
    return !!(this.titleData.titleNumber && 
             this.titleData.debtorName && 
             this.titleData.debtorDocument && 
             this.titleData.originalValue && 
             this.titleData.dueDate && 
             this.titleData.interestRatePerDay !== null && 
             this.titleData.penaltyRate !== null);
  }

  onSave(): void {
    if (!this.canSave()) {
      this.snackBar.open('Preencha todos os campos obrigatórios', 'Fechar', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    if (this.isEditMode) {
      this.updateTitle();
    } else {
      this.createTitle();
    }
  }

  private createTitle(): void {
    const installments = this.generateInstallmentsForCreation();
    
    const createRequest = {
      titleNumber: this.titleData.titleNumber,
      debtorName: this.titleData.debtorName,
      debtorDocument: this.titleData.debtorDocument.replace(/\D/g, ''),
      originalValue: parseFloat(this.titleData.originalValue),
      dueDate: this.titleData.dueDate.toISOString(),
      interestRatePerDay: parseFloat(this.titleData.interestRatePerDay) / 100,
      penaltyRate: parseFloat(this.titleData.penaltyRate) / 100,
      installments: installments
    };

    this.debtTitleService.create(createRequest).subscribe({
      next: () => {
        this.snackBar.open('Título criado com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/debt-titles']);
      },
      error: (error) => {
        console.error('Erro ao criar título:', error);
        this.snackBar.open('Erro ao criar título', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private updateTitle(): void {
    if (!this.titleId) return;
    
    const updateRequest = {
      titleNumber: this.titleData.titleNumber,
      debtorName: this.titleData.debtorName,
      debtorDocument: this.titleData.debtorDocument.replace(/\D/g, ''),
      originalValue: parseFloat(this.titleData.originalValue),
      dueDate: this.titleData.dueDate.toISOString(),
      interestRatePerDay: parseFloat(this.titleData.interestRatePerDay) / 100,
      penaltyRate: parseFloat(this.titleData.penaltyRate) / 100
    };

    this.debtTitleService.update(this.titleId, updateRequest).subscribe({
      next: () => {
        this.snackBar.open('Título atualizado com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/debt-titles']);
      },
      error: (error) => {
        console.error('Erro ao atualizar título:', error);
        this.snackBar.open('Erro ao atualizar título', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private generateInstallmentsForCreation(): any[] {
    const installments = [];
    const installmentValue = parseFloat(this.titleData.originalValue) / this.titleData.installmentCount;
    const baseDate = new Date(this.titleData.dueDate);

    for (let i = 0; i < this.titleData.installmentCount; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      installments.push({
        installmentNumber: i + 1,
        value: installmentValue,
        dueDate: dueDate.toISOString()
      });
    }

    return installments;
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
}
