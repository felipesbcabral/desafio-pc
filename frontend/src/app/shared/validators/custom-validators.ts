import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CustomValidators {
  /**
   * Validador para CPF ou CNPJ
   */
  static cpfOrCnpj(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length === 11) {
      return CustomValidators.validateCPF(cleanValue) ? null : { cpfOrCnpj: { message: 'CPF inválido' } };
    } else if (cleanValue.length === 14) {
      return CustomValidators.validateCNPJ(cleanValue) ? null : { cpfOrCnpj: { message: 'CNPJ inválido' } };
    }
    
    return { cpfOrCnpj: { message: 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos' } };
  }

  /**
   * Valida CPF
   */
  private static validateCPF(cpf: string): boolean {
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Calcula o primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (parseInt(cpf.charAt(9)) !== digit1) return false;
    
    // Calcula o segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return parseInt(cpf.charAt(10)) === digit2;
  }

  /**
   * Valida CNPJ
   */
  private static validateCNPJ(cnpj: string): boolean {
    if (cnpj.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Calcula o primeiro dígito verificador
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights1[i];
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (parseInt(cnpj.charAt(12)) !== digit1) return false;
    
    // Calcula o segundo dígito verificador
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights2[i];
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return parseInt(cnpj.charAt(13)) === digit2;
  }

  /**
   * Alias para cpfOrCnpj (compatibilidade)
   */
  static cpfCnpj = CustomValidators.cpfOrCnpj;

  /**
   * Formata documento (CPF ou CNPJ) para exibição
   */
  static formatDocument(document: string): string {
    if (!document) return '';
    
    const cleanValue = document.replace(/\D/g, '');
    
    if (cleanValue.length === 11) {
      // Formato CPF: 000.000.000-00
      return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cleanValue.length === 14) {
      // Formato CNPJ: 00.000.000/0000-00
      return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return document; // Retorna sem formatação se não for CPF nem CNPJ
  }

  /**
   * Validador para valores positivos
   */
  static positiveValue(control: AbstractControl): ValidationErrors | null {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { positiveValue: { message: 'O valor deve ser maior que zero' } };
    }
    return null;
  }



  /**
   * Validador para formato de data DD/MM/AAAA
   */
  static dateFormat(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = value.match(dateRegex);

    if (!match) {
      return { dateFormat: { message: 'Data deve estar no formato DD/MM/AAAA' } };
    }

    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // Verifica se a data é válida
    if (
      date.getDate() !== parseInt(day) ||
      date.getMonth() !== parseInt(month) - 1 ||
      date.getFullYear() !== parseInt(year)
    ) {
      return { dateFormat: { message: 'Data inválida' } };
    }

    return null;
  }





}