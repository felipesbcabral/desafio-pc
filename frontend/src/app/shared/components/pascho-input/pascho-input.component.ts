import { Component, Input, Output, EventEmitter, forwardRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideIconsModule } from '../../../core/modules/lucide-icons.module';

@Component({
  selector: 'app-pascho-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideIconsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PaschoInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="input-group" [class]="containerClasses">
      <!-- Label -->
      <label
        *ngIf="label"
        [for]="inputId"
        class="pascho-label"
        [class.required]="required"
      >
        {{ label }}
        <span *ngIf="required" class="text-danger-500 ml-1">*</span>
      </label>
      
      <!-- Input container -->
      <div class="input-container" [class]="inputContainerClasses">
        <!-- Left icon -->
        <div *ngIf="leftIcon" class="input-icon-left">
          <lucide-icon [name]="leftIcon" [size]="16"></lucide-icon>
        </div>
        
        <!-- Prefix -->
        <span *ngIf="prefix" class="input-prefix">{{ prefix }}</span>
        
        <!-- Input field -->
        <input
          [id]="inputId"
          [type]="inputType"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [class]="inputClasses"
          [value]="value"
          [min]="min"
          [max]="max"
          [step]="step"
          [attr.maxlength]="maxLength"
          [pattern]="pattern"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          [attr.aria-describedby]="hasError ? errorId : helpId"
          [attr.aria-invalid]="hasError"
        />
        
        <!-- Textarea -->
        <textarea
          *ngIf="type === 'textarea'"
          [id]="inputId"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [class]="inputClasses"
          [value]="value"
          [rows]="rows"
          [attr.maxlength]="maxLength"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          [attr.aria-describedby]="hasError ? errorId : helpId"
          [attr.aria-invalid]="hasError"
        ></textarea>
        

        
        <!-- Right icon -->
        <div *ngIf="rightIcon" class="input-icon-right">
          <lucide-icon [name]="rightIcon" [size]="16"></lucide-icon>
        </div>
        
        <!-- Clear button -->
        <button
          *ngIf="clearable && value && !disabled"
          type="button"
          class="input-clear"
          (click)="clear()"
          aria-label="Limpar campo"
        >
          <lucide-icon name="x" [size]="14"></lucide-icon>
        </button>
        
        <!-- Password toggle -->
        <button
          *ngIf="type === 'password'"
          type="button"
          class="input-password-toggle"
          (click)="togglePasswordVisibility()"
          [attr.aria-label]="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
        >
          <lucide-icon [name]="showPassword ? 'eye-off' : 'eye'" [size]="16"></lucide-icon>
        </button>
      </div>
      
      <!-- Help text -->
      <p
        *ngIf="helpText && !hasError"
        [id]="helpId"
        class="input-help"
      >
        {{ helpText }}
      </p>
      
      <!-- Error message -->
      <p
        *ngIf="hasError"
        [id]="errorId"
        class="input-error"
        role="alert"
      >
        <lucide-icon name="alert-circle" [size]="14" class="mr-1"></lucide-icon>
        {{ errorMessage }}
      </p>
      

    </div>
  `,
  styles: [`
    .input-group {
      @apply w-full;
    }
    
    .input-container {
      @apply relative flex items-center;
    }
    
    .input-base {
      @apply block w-full rounded-lg border border-gray-300 shadow-sm transition-colors duration-200 focus:border-primary-500 focus:outline-none focus:ring-0;
      border-width: 1px !important;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
    }
    
    .input-with-left-icon {
      @apply pl-24;
    }
    
    .input-with-right-icon {
      @apply pr-10;
    }
    
    .input-with-prefix {
      @apply pl-12;
    }
    

    
    .input-error-state {
      @apply border-danger-300 focus:border-danger-500 focus:outline-none;
    }
    

    
    .input-disabled {
      @apply bg-gray-50 text-gray-500 cursor-not-allowed;
      border-color: #d1d5db !important;
      box-shadow: none !important;
    }
    
    .input-readonly {
      @apply bg-gray-50 cursor-default;
      border-color: #d1d5db !important;
      box-shadow: none !important;
    }
    
    /* Size variants */
    .input-sm {
      @apply px-3 py-1.5 text-sm;
    }
    
    .input-md {
      @apply px-3 py-2 text-sm;
    }
    
    .input-lg {
      @apply px-4 py-3 text-base;
    }
    
    /* Icons */
    .input-icon-left {
      @apply absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none;
    }
    
    .input-icon-right {
      @apply absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none;
    }
    
    /* Prefix */
    .input-prefix {
      @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none;
    }
    
    /* Action buttons */
    .input-clear,
    .input-password-toggle {
      @apply absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded focus:outline-none;
    }
    
    .input-clear {
      @apply right-3;
    }
    
    .input-password-toggle {
      @apply right-3;
    }
    
    /* Help and error text */
    .input-help {
      @apply mt-1 text-sm text-gray-600;
    }
    
    .input-error {
      @apply mt-1 text-sm text-danger-600 flex items-center;
    }
    

    
    /* Required indicator */
    .required {
      @apply relative;
    }
    
    /* Focus styles */
    .input-focused {
      @apply border-primary-500;
    }
    
    /* Textarea specific */
    textarea.input-base {
      @apply resize-y min-h-[80px];
    }
  `]
})
export class PaschoInputComponent implements ControlValueAccessor, OnInit {
  @Input() label?: string;
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea' | 'date' = 'text';
  @Input() placeholder?: string;
  @Input() helpText?: string;
  @Input() errorMessage?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() clearable = false;
  @Input() leftIcon?: string;
  @Input() rightIcon?: string;
  @Input() prefix?: string;
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
  @Input() maxLength?: number;
  @Input() pattern?: string;
  @Input() rows = 3;
  @Input() control?: FormControl;
  
  @Output() inputChange = new EventEmitter<string>();
  
  value = '';
  focused = false;
  showPassword = false;
  inputId = `pascho-input-${Math.random().toString(36).substr(2, 9)}`;
  errorId = `${this.inputId}-error`;
  helpId = `${this.inputId}-help`;
  
  private onChange = (value: string) => {};
  private onTouched = () => {};
  
  ngOnInit() {
    if (this.control) {
      this.control.valueChanges.subscribe(value => {
        this.value = value || '';
      });
    }
  }
  
  get inputType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type === 'textarea' ? 'text' : this.type;
  }
  
  get hasError(): boolean {
    return !!(this.errorMessage || (this.control?.invalid && this.control?.touched));
  }
  
  get containerClasses(): string {
    const classes = [];
    
    if (this.focused) {
      classes.push('input-focused');
    }
    
    return classes.join(' ');
  }
  
  get inputContainerClasses(): string {
    return 'relative';
  }
  
  get inputClasses(): string {
    const classes = ['input-base'];
    
    // Size
    classes.push(`input-${this.size}`);
    
    // Icons and affixes
    if (this.leftIcon) {
      classes.push('input-with-left-icon');
    }
    
    if (this.rightIcon || this.clearable || this.type === 'password') {
      classes.push('input-with-right-icon');
    }
    
    if (this.prefix) {
      classes.push('input-with-prefix');
    }
    
    // States
    if (this.hasError) {
      classes.push('input-error-state');
    }
    
    if (this.disabled) {
      classes.push('input-disabled');
    }
    
    if (this.readonly) {
      classes.push('input-readonly');
    }
    
    return classes.join(' ');
  }
  
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }
  
  onFocus(): void {
    this.focused = true;
  }
  
  onBlur(): void {
    this.focused = false;
    this.onTouched();
  }
  
  clear(): void {
    this.value = '';
    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value || '';
  }
  
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}