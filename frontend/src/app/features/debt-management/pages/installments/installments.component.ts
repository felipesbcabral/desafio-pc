import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideIconsModule } from '../../../../core/modules/lucide-icons.module';
import { PaschoCardComponent } from '../../../../shared/components/pascho-card/pascho-card.component';
import { PaschoButtonComponent } from '../../../../shared/components/pascho-button/pascho-button.component';
import { PaschoInputComponent } from '../../../../shared/components/pascho-input/pascho-input.component';

@Component({
  selector: 'app-installments',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideIconsModule,
    PaschoCardComponent,
    PaschoButtonComponent,
    PaschoInputComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">Gerenciar Parcelas</h1>
          <p class="text-secondary-600 mt-1">Título #12345 - João Silva</p>
        </div>
        <div class="mt-4 sm:mt-0">
          <app-pascho-button
            label="Voltar ao Título"
            variant="secondary"
            leftIcon="arrow-left"
            [routerLink]="['/debts/1']"
          ></app-pascho-button>
        </div>
      </div>
      
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <app-pascho-card variant="compact">
          <div class="text-center">
            <div class="text-2xl font-bold text-secondary-900">5</div>
            <div class="text-sm text-secondary-600">Total de Parcelas</div>
          </div>
        </app-pascho-card>
        
        <app-pascho-card variant="compact">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">2</div>
            <div class="text-sm text-secondary-600">Pagas</div>
          </div>
        </app-pascho-card>
        
        <app-pascho-card variant="compact">
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">1</div>
            <div class="text-sm text-secondary-600">Em Atraso</div>
          </div>
        </app-pascho-card>
        
        <app-pascho-card variant="compact">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">2</div>
            <div class="text-sm text-secondary-600">Pendentes</div>
          </div>
        </app-pascho-card>
      </div>
      
      <!-- Payment Form -->
      <app-pascho-card title="Registrar Pagamento" subtitle="Marque uma parcela como paga">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <app-pascho-input
            label="Parcela"
            value="3/5 - Em Atraso"
            [disabled]="true"
          ></app-pascho-input>
          
          <app-pascho-input
            label="Valor Pago"
            type="number"
            placeholder="0,00"
            prefix="R$"
            [required]="true"
          ></app-pascho-input>
          
          <app-pascho-input
            label="Data do Pagamento"
            type="text"
            [required]="true"
          ></app-pascho-input>
        </div>
        
        <div class="mt-4">
          <app-pascho-input
            label="Observações"
            type="textarea"
            placeholder="Observações sobre o pagamento"
            [rows]="2"
          ></app-pascho-input>
        </div>
        
        <div class="flex justify-end mt-6">
          <app-pascho-button
            label="Registrar Pagamento"
            variant="success"
            leftIcon="check-circle"
          ></app-pascho-button>
        </div>
      </app-pascho-card>
      
      <!-- Installments List -->
      <app-pascho-card title="Lista de Parcelas">
        <div class="space-y-4">
          <!-- Parcela 1 - Paga -->
          <div class="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <lucide-icon name="check" [size]="20" class="text-white"></lucide-icon>
              </div>
              <div>
                <div class="font-medium text-green-800">Parcela 1 de 5</div>
                <div class="text-sm text-green-600">Paga em 15/02/2024</div>
                <div class="text-xs text-green-500">Pagamento pontual</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-green-800">R$ 1.000,00</div>
              <div class="text-sm text-green-600">Venc: 15/02/2024</div>
              <div class="text-xs text-green-500">Sem juros</div>
            </div>
            <div class="flex space-x-2">
              <app-pascho-button
                label="Detalhes"
                variant="secondary"
                size="sm"
                leftIcon="eye"
              ></app-pascho-button>
            </div>
          </div>
          
          <!-- Parcela 2 - Paga -->
          <div class="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <lucide-icon name="check" [size]="20" class="text-white"></lucide-icon>
              </div>
              <div>
                <div class="font-medium text-green-800">Parcela 2 de 5</div>
                <div class="text-sm text-green-600">Paga em 20/03/2024</div>
                <div class="text-xs text-yellow-600">Pagamento com atraso de 5 dias</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-green-800">R$ 1.500,00</div>
              <div class="text-sm text-green-600">Venc: 15/03/2024</div>
              <div class="text-xs text-yellow-600">Com juros: R$ 500,00</div>
            </div>
            <div class="flex space-x-2">
              <app-pascho-button
                label="Detalhes"
                variant="secondary"
                size="sm"
                leftIcon="eye"
              ></app-pascho-button>
            </div>
          </div>
          
          <!-- Parcela 3 - Em Atraso -->
          <div class="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <lucide-icon name="alert-circle" [size]="20" class="text-white"></lucide-icon>
              </div>
              <div>
                <div class="font-medium text-red-800">Parcela 3 de 5</div>
                <div class="text-sm text-red-600">Em atraso há 45 dias</div>
                <div class="text-xs text-red-500">Valor atualizado com juros e multa</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-red-800">R$ 1.250,00</div>
              <div class="text-sm text-red-600">Venc: 15/04/2024</div>
              <div class="text-xs text-red-500">Original: R$ 1.000,00</div>
            </div>
            <div class="flex space-x-2">
              <app-pascho-button
                label="Pagar"
                variant="success"
                size="sm"
                leftIcon="credit-card"
              ></app-pascho-button>
              <app-pascho-button
                label="Detalhes"
                variant="secondary"
                size="sm"
                leftIcon="eye"
              ></app-pascho-button>
            </div>
          </div>
          
          <!-- Parcela 4 - Pendente -->
          <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <lucide-icon name="clock" [size]="20" class="text-white"></lucide-icon>
              </div>
              <div>
                <div class="font-medium text-blue-800">Parcela 4 de 5</div>
                <div class="text-sm text-blue-600">Vence em 30 dias</div>
                <div class="text-xs text-blue-500">Aguardando vencimento</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-blue-800">R$ 1.000,00</div>
              <div class="text-sm text-blue-600">Venc: 15/05/2024</div>
              <div class="text-xs text-blue-500">Valor original</div>
            </div>
            <div class="flex space-x-2">
              <app-pascho-button
                label="Pagar Antecipado"
                variant="secondary"
                size="sm"
                leftIcon="zap"
              ></app-pascho-button>
              <app-pascho-button
                label="Detalhes"
                variant="secondary"
                size="sm"
                leftIcon="eye"
              ></app-pascho-button>
            </div>
          </div>
          
          <!-- Parcela 5 - Pendente -->
          <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <lucide-icon name="clock" [size]="20" class="text-white"></lucide-icon>
              </div>
              <div>
                <div class="font-medium text-blue-800">Parcela 5 de 5</div>
                <div class="text-sm text-blue-600">Vence em 60 dias</div>
                <div class="text-xs text-blue-500">Última parcela</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-blue-800">R$ 1.000,00</div>
              <div class="text-sm text-blue-600">Venc: 15/06/2024</div>
              <div class="text-xs text-blue-500">Valor original</div>
            </div>
            <div class="flex space-x-2">
              <app-pascho-button
                label="Pagar Antecipado"
                variant="secondary"
                size="sm"
                leftIcon="zap"
              ></app-pascho-button>
              <app-pascho-button
                label="Detalhes"
                variant="secondary"
                size="sm"
                leftIcon="eye"
              ></app-pascho-button>
            </div>
          </div>
        </div>
      </app-pascho-card>
      
      <!-- Actions -->
      <app-pascho-card title="Ações Rápidas">
        <div class="flex flex-wrap gap-3">
          <app-pascho-button
            label="Quitar Todas"
            variant="success"
            leftIcon="check-circle-2"
          ></app-pascho-button>
          <app-pascho-button
            label="Renegociar"
            variant="outline-danger"
            leftIcon="handshake"
          ></app-pascho-button>
          <app-pascho-button
            label="Gerar Boleto"
            variant="secondary"
            leftIcon="file-text"
          ></app-pascho-button>
          <app-pascho-button
            label="Enviar Cobrança"
            variant="primary"
            leftIcon="mail"
          ></app-pascho-button>
          <app-pascho-button
            label="Histórico"
            variant="secondary"
            leftIcon="history"
          ></app-pascho-button>
        </div>
      </app-pascho-card>
    </div>
  `
})
export class InstallmentsComponent {}