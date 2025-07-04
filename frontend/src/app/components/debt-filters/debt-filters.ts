import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { DebtFilters, DebtStatus } from '../../models/debt-title.model';

@Component({
  selector: 'app-debt-filters',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatSliderModule,
    MatChipsModule
  ],
  templateUrl: './debt-filters.html',
  styleUrl: './debt-filters.scss'
})
export class DebtFiltersComponent {
  @Output() filtersChanged = new EventEmitter<DebtFilters>();
  @Output() filtersCleared = new EventEmitter<void>();
  @Input() isLoading = false;

  filterForm: FormGroup;
  debtStatuses = Object.values(DebtStatus);
  
  overdueRanges = [
    { label: '0-30 dias', min: 0, max: 30 },
    { label: '31-60 dias', min: 31, max: 60 },
    { label: '61-90 dias', min: 61, max: 90 },
    { label: '>90 dias', min: 91, max: 999999 }
  ];

  valueRanges = [
    { label: 'R$ 0 - R$ 500', min: 0, max: 500 },
    { label: 'R$ 501 - R$ 1.000', min: 501, max: 1000 },
    { label: 'R$ 1.001 - R$ 5.000', min: 1001, max: 5000 },
    { label: 'R$ 5.001 - R$ 10.000', min: 5001, max: 10000 },
    { label: '> R$ 10.000', min: 10001, max: 999999999 }
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.createFilterForm();
    this.setupFormSubscription();
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      debtorName: [''],
      titleNumber: [''],
      selectedOverdueRange: [null],
      customOverdueMin: [null],
      customOverdueMax: [null],
      selectedValueRange: [null],
      customValueMin: [null],
      customValueMax: [null],
      multipleInstallments: [false],
      status: [[]]
    });
  }

  private setupFormSubscription(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.emitFilters();
    });
  }

  private emitFilters(): void {
    const formValue = this.filterForm.value;
    const filters: DebtFilters = {};

    // Text filters
    if (formValue.debtorName?.trim()) {
      filters.debtorName = formValue.debtorName.trim();
    }

    if (formValue.titleNumber?.trim()) {
      filters.titleNumber = formValue.titleNumber.trim();
    }

    // Overdue range
    if (formValue.selectedOverdueRange) {
      filters.daysOverdueRange = formValue.selectedOverdueRange;
    } else if (formValue.customOverdueMin !== null || formValue.customOverdueMax !== null) {
      filters.daysOverdueRange = {
        min: formValue.customOverdueMin || 0,
        max: formValue.customOverdueMax || 999999
      };
    }

    // Value range
    if (formValue.selectedValueRange) {
      filters.valueRange = formValue.selectedValueRange;
    } else if (formValue.customValueMin !== null || formValue.customValueMax !== null) {
      filters.valueRange = {
        min: formValue.customValueMin || 0,
        max: formValue.customValueMax || 999999999
      };
    }

    // Multiple installments
    if (formValue.multipleInstallments) {
      filters.multipleInstallments = true;
    }

    // Status
    if (formValue.status && formValue.status.length > 0) {
      filters.status = formValue.status;
    }

    this.filtersChanged.emit(filters);
  }

  onOverdueRangeChange(range: any): void {
    if (range) {
      this.filterForm.patchValue({
        customOverdueMin: null,
        customOverdueMax: null
      });
    }
  }

  onValueRangeChange(range: any): void {
    if (range) {
      this.filterForm.patchValue({
        customValueMin: null,
        customValueMax: null
      });
    }
  }

  onCustomOverdueChange(): void {
    this.filterForm.patchValue({
      selectedOverdueRange: null
    });
  }

  onCustomValueChange(): void {
    this.filterForm.patchValue({
      selectedValueRange: null
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.filterForm.patchValue({
      debtorName: '',
      titleNumber: '',
      multipleInstallments: false,
      status: []
    });
    this.filtersCleared.emit();
  }

  hasActiveFilters(): boolean {
    const formValue = this.filterForm.value;
    return !!(formValue.debtorName?.trim() ||
             formValue.titleNumber?.trim() ||
             formValue.selectedOverdueRange ||
             formValue.customOverdueMin !== null ||
             formValue.customOverdueMax !== null ||
             formValue.selectedValueRange ||
             formValue.customValueMin !== null ||
             formValue.customValueMax !== null ||
             formValue.multipleInstallments ||
             (formValue.status && formValue.status.length > 0));
  }

  getStatusLabel(status: DebtStatus): string {
    const labels = {
      [DebtStatus.ACTIVE]: 'Ativo',
      [DebtStatus.OVERDUE]: 'Em Atraso',
      [DebtStatus.PAID]: 'Pago',
      [DebtStatus.CANCELLED]: 'Cancelado'
    };
    return labels[status] || status;
  }
}