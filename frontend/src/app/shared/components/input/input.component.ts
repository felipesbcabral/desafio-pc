import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputVariant = 'default' | 'filled' | 'outlined';
export type InputSize = 'sm' | 'md' | 'lg';
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div [class]="containerClasses">
      <label *ngIf="label" [for]="inputId" class="input-label">
        {{ label }}
        <span *ngIf="required" class="input-required">*</span>
      </label>
      
      <div class="input-wrapper">
        <span *ngIf="prefixIcon" class="input-prefix-icon">
          <ng-content select="[slot=prefix-icon]"></ng-content>
        </span>
        
        <input
          [id]="inputId"
          [class]="inputClasses"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [value]="value"
          [attr.aria-describedby]="helpText || errorMessage ? inputId + '-help' : null"
          [attr.aria-invalid]="hasError"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
        />
        
        <span *ngIf="suffixIcon" class="input-suffix-icon">
          <ng-content select="[slot=suffix-icon]"></ng-content>
        </span>
        
        <span *ngIf="loading" class="input-loading">
          <div class="loading-spinner animate-spin"></div>
        </span>
      </div>
      
      <div *ngIf="helpText || errorMessage" [id]="inputId + '-help'" class="input-help">
        <span *ngIf="errorMessage" class="input-error">{{ errorMessage }}</span>
        <span *ngIf="helpText && !errorMessage" class="input-help-text">{{ helpText }}</span>
      </div>
    </div>
  `,
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements ControlValueAccessor {
  @Input() variant: InputVariant = 'outlined';
  @Input() size: InputSize = 'md';
  @Input() type: InputType = 'text';
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() helpText?: string;
  @Input() errorMessage?: string;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() required: boolean = false;
  @Input() loading: boolean = false;
  @Input() prefixIcon: boolean = false;
  @Input() suffixIcon: boolean = false;
  @Input() inputId: string = `input-${Math.random().toString(36).substr(2, 9)}`;
  
  @Output() inputChange = new EventEmitter<string>();
  @Output() inputFocus = new EventEmitter<void>();
  @Output() inputBlur = new EventEmitter<void>();

  value: string = '';
  isFocused: boolean = false;

  private onChange = (value: string) => {};
  private onTouched = () => {};

  get containerClasses(): string {
    const classes = [
      'input-container',
      `input-${this.variant}`,
      `input-${this.size}`
    ];

    if (this.disabled) {
      classes.push('input-disabled');
    }

    if (this.hasError) {
      classes.push('input-error-state');
    }

    if (this.isFocused) {
      classes.push('input-focused');
    }

    if (this.loading) {
      classes.push('input-loading-state');
    }

    return classes.join(' ');
  }

  get inputClasses(): string {
    const classes = [
      'input-field',
      'transition-all',
      'focus-ring'
    ];

    if (this.prefixIcon) {
      classes.push('has-prefix');
    }

    if (this.suffixIcon || this.loading) {
      classes.push('has-suffix');
    }

    return classes.join(' ');
  }

  get hasError(): boolean {
    return !!this.errorMessage;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }

  onFocus(): void {
    this.isFocused = true;
    this.inputFocus.emit();
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
    this.inputBlur.emit();
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
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