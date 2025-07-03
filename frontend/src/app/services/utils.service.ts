import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  /**
   * Formata valor monetário para exibição
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Formata data para exibição
   */
  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR').format(dateObj);
  }

  /**
   * Formata data para input HTML
   */
  formatDateForInput(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  }

  /**
   * Valida CPF
   */
  isValidCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]/g, '');
    
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

  /**
   * Valida CNPJ
   */
  isValidCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
      return false;
    }

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(cnpj.charAt(12))) return false;

    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    return digit2 === parseInt(cnpj.charAt(13));
  }

  /**
   * Valida documento (CPF ou CNPJ)
   */
  isValidDocument(document: string): boolean {
    const cleanDoc = document.replace(/[^\d]/g, '');
    return cleanDoc.length === 11 ? this.isValidCPF(cleanDoc) : this.isValidCNPJ(cleanDoc);
  }

  /**
   * Formata CPF
   */
  formatCPF(cpf: string): string {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formata CNPJ
   */
  formatCNPJ(cnpj: string): string {
    cnpj = cnpj.replace(/[^\d]/g, '');
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Formata documento (CPF ou CNPJ)
   */
  formatDocument(document: string): string {
    const cleanDoc = document.replace(/[^\d]/g, '');
    return cleanDoc.length === 11 ? this.formatCPF(cleanDoc) : this.formatCNPJ(cleanDoc);
  }

  /**
   * Determina o tipo do documento
   */
  getDocumentType(document: string): 'CPF' | 'CNPJ' | 'INVALID' {
    const cleanDoc = document.replace(/[^\d]/g, '');
    if (cleanDoc.length === 11 && this.isValidCPF(cleanDoc)) return 'CPF';
    if (cleanDoc.length === 14 && this.isValidCNPJ(cleanDoc)) return 'CNPJ';
    return 'INVALID';
  }
}