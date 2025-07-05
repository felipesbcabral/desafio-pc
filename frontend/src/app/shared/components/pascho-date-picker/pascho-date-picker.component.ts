import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideIconsModule } from '../../../core/modules/lucide-icons.module';

@Component({
  selector: 'app-pascho-date-picker',
  standalone: true,
  imports: [CommonModule, LucideIconsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PaschoDatePickerComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative">
      <label *ngIf="label" class="block text-sm font-medium text-secondary-700 mb-2">
        {{ label }}
        <span *ngIf="required" class="text-red-500 ml-1">*</span>
      </label>
      
      <div class="relative">
        <input
          type="text"
          [value]="displayValue"
          [placeholder]="placeholder"
          [class]="inputClasses"
          (click)="toggleCalendar()"
          (input)="onInputChange($event)"
          (blur)="onBlur()"
          readonly
        />
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <lucide-icon name="calendar" [size]="20" class="text-gray-400"></lucide-icon>
        </div>
      </div>
      
      <!-- Calendar Dropdown -->
      <div *ngIf="showCalendar" class="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80">
        <!-- Calendar Header -->
        <div class="flex items-center justify-between mb-4">
          <button type="button" (click)="previousMonth()" class="p-1 hover:bg-gray-100 rounded">
            <lucide-icon name="chevron-left" [size]="20"></lucide-icon>
          </button>
          <h3 class="text-lg font-medium text-secondary-900">
            {{ getMonthName(currentMonth) }} {{ currentYear }}
          </h3>
          <button type="button" (click)="nextMonth()" class="p-1 hover:bg-gray-100 rounded">
            <lucide-icon name="chevron-right" [size]="20"></lucide-icon>
          </button>
        </div>
        
        <!-- Days of Week -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div *ngFor="let day of daysOfWeek" class="text-center text-sm font-medium text-gray-500 py-2">
            {{ day }}
          </div>
        </div>
        
        <!-- Calendar Days -->
        <div class="grid grid-cols-7 gap-1">
          <button
            *ngFor="let day of calendarDays"
            type="button"
            [class]="getDayClasses(day)"
            [disabled]="!day.isCurrentMonth || (disablePastDates && day.isPast)"
            (click)="selectDate(day)"
          >
            {{ day.day }}
          </button>
        </div>
        
        <!-- Calendar Footer -->
        <div class="flex justify-between mt-4 pt-3 border-t border-gray-200">
          <button type="button" (click)="selectToday()" class="text-sm text-primary-600 hover:text-primary-700">
            Hoje
          </button>
          <button type="button" (click)="closeCalendar()" class="text-sm text-gray-600 hover:text-gray-700">
            Fechar
          </button>
        </div>
      </div>
      
      <!-- Error Message -->
      <p *ngIf="errorMessage" class="mt-1 text-sm text-red-600">
        {{ errorMessage }}
      </p>
      
      <!-- Help Text -->
      <p *ngIf="helpText && !errorMessage" class="mt-1 text-sm text-gray-500">
        {{ helpText }}
      </p>
    </div>
    
    <!-- Overlay -->
    <div *ngIf="showCalendar" class="fixed inset-0 z-40" (click)="closeCalendar()"></div>
  `,
  styles: [`
    .input-base {
      @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200;
    }
    
    .input-error {
      @apply border-red-300 focus:ring-red-500 focus:border-red-500;
    }
    
    .day-button {
      @apply w-8 h-8 text-sm rounded hover:bg-gray-100 transition-colors duration-150;
    }
    
    .day-selected {
      @apply bg-primary-600 text-white hover:bg-primary-700;
    }
    
    .day-today {
      @apply bg-primary-100 text-primary-700 font-medium;
    }
    
    .day-disabled {
      @apply text-gray-300 cursor-not-allowed hover:bg-transparent;
    }
    
    .day-other-month {
      @apply text-gray-400;
    }
  `]
})
export class PaschoDatePickerComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Selecione uma data';
  @Input() required = false;
  @Input() errorMessage = '';
  @Input() helpText = '';
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() disablePastDates = false;
  
  @Output() dateSelected = new EventEmitter<string>();
  
  value = '';
  displayValue = '';
  showCalendar = false;
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  selectedDate?: Date;
  
  daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  calendarDays: CalendarDay[] = [];
  
  private onChange = (value: string) => {};
  private onTouched = () => {};
  
  ngOnInit() {
    this.generateCalendar();
  }
  
  get inputClasses(): string {
    const baseClasses = 'input-base cursor-pointer';
    return this.errorMessage ? `${baseClasses} input-error` : baseClasses;
  }
  
  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
    if (this.showCalendar) {
      this.generateCalendar();
    }
  }
  
  closeCalendar() {
    this.showCalendar = false;
  }
  
  onInputChange(event: any) {
    const inputValue = event.target.value;
    this.displayValue = inputValue;
    
    // Validar formato DD/MM/AAAA
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = inputValue.match(dateRegex);
    
    if (match) {
      const [, day, month, year] = match;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      if (this.isValidDate(date, parseInt(day), parseInt(month), parseInt(year))) {
        this.selectedDate = date;
        this.value = inputValue;
        this.onChange(this.value);
        this.dateSelected.emit(this.value);
      }
    }
  }
  
  onBlur() {
    this.onTouched();
  }
  
  selectDate(day: CalendarDay) {
    if (!day.isCurrentMonth || (this.disablePastDates && day.isPast)) return;
    
    const date = new Date(this.currentYear, this.currentMonth, day.day);
    this.selectedDate = date;
    
    // Formatar como DD/MM/AAAA
    const formattedDate = this.formatDate(date);
    this.value = formattedDate;
    this.displayValue = formattedDate;
    
    this.onChange(this.value);
    this.dateSelected.emit(this.value);
    this.closeCalendar();
  }
  
  selectToday() {
    const today = new Date();
    this.selectDate({
      day: today.getDate(),
      isCurrentMonth: true,
      isPast: false,
      isToday: true,
      isSelected: false
    });
  }
  
  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }
  
  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }
  
  generateCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === this.currentMonth;
      const isPast = this.disablePastDates && date < today;
      const isToday = date.getTime() === today.getTime();
      const isSelected = this.selectedDate && date.getTime() === this.selectedDate.getTime();
      
      days.push({
        day: date.getDate(),
        isCurrentMonth,
        isPast,
        isToday,
        isSelected: !!isSelected
      });
    }
    
    this.calendarDays = days;
  }
  
  getDayClasses(day: CalendarDay): string {
    let classes = 'day-button';
    
    if (day.isSelected) {
      classes += ' day-selected';
    } else if (day.isToday) {
      classes += ' day-today';
    }
    
    if (!day.isCurrentMonth) {
      classes += ' day-other-month';
    }
    
    if ((this.disablePastDates && day.isPast) || !day.isCurrentMonth) {
      classes += ' day-disabled';
    }
    
    return classes;
  }
  
  getMonthName(month: number): string {
    return this.monthNames[month];
  }
  
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  private isValidDate(date: Date, day: number, month: number, year: number): boolean {
    return (
      date.getDate() === day &&
      date.getMonth() === month - 1 &&
      date.getFullYear() === year
    );
  }
  
  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
    this.displayValue = value || '';
    
    if (value) {
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = value.match(dateRegex);
      if (match) {
        const [, day, month, year] = match;
        this.selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        this.currentMonth = this.selectedDate.getMonth();
        this.currentYear = this.selectedDate.getFullYear();
        this.generateCalendar();
      }
    }
  }
  
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    // Implementar se necessário
  }
}

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isPast: boolean;
  isToday: boolean;
  isSelected: boolean;
}