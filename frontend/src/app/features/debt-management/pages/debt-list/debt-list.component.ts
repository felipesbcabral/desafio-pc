import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideIconsModule } from '../../../../core/modules/lucide-icons.module';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { PaschoCardComponent } from '../../../../shared/components/pascho-card/pascho-card.component';
import { PaschoButtonComponent } from '../../../../shared/components/pascho-button/pascho-button.component';
import { PaschoInputComponent } from '../../../../shared/components/pascho-input/pascho-input.component';
import { DebtService } from '../../../../core/services/debt.service';
import { ConnectivityService } from '../../../../core/services/connectivity.service';
import { Debt, DebtFilter, DebtStatus } from '../../../../core/models/debt.model';

@Component({
  selector: 'app-debt-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
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
          <h1 class="text-2xl font-bold text-secondary-900">Títulos de Dívida</h1>
          <p class="text-secondary-600 mt-1">Gerencie todos os títulos de dívida do sistema</p>
        </div>
        <div class="mt-4 sm:mt-0 flex items-center space-x-3">
          <!-- Indicador de conectividade -->
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 rounded-full" [class]="isOnline ? 'bg-green-500' : 'bg-red-500'"></div>
            <span class="text-sm text-secondary-600">{{ isOnline ? 'Online' : 'Offline' }}</span>
          </div>
          <app-pascho-button
            label="Novo Título"
            variant="primary"
            leftIcon="plus"
            [routerLink]="['/debts/new']"
            [disabled]="!isOnline"
          ></app-pascho-button>
        </div>
      </div>
      
      <!-- Filters -->
      <app-pascho-card title="Filtros">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="mt-1">
            <app-pascho-input
              label="Buscar por devedor"
              placeholder="Nome ou documento"
              [clearable]="true"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange($event)"
            ></app-pascho-input>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2">Status</label>
            <select 
              [(ngModel)]="selectedStatus" 
              (ngModelChange)="applyFilters()"
              class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-10">
              <option value="">Todos os status</option>
              <option value="ACTIVE">Ativo</option>
              <option value="OVERDUE">Em atraso</option>
              <option value="PAID">Pago</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2">Apenas em atraso</label>
            <input 
              type="checkbox" 
              [(ngModel)]="overdueOnly" 
              (ngModelChange)="applyFilters()"
              class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500">
            <span class="ml-2 text-sm text-secondary-600">Mostrar apenas títulos em atraso</span>
          </div>
        </div>
        
        <div class="flex justify-end mt-4 space-x-3">
          <app-pascho-button
            label="Limpar"
            variant="secondary"
            size="sm"
            (click)="clearFilters()"
          ></app-pascho-button>
          <app-pascho-button
            label="Atualizar"
            variant="primary"
            size="sm"
            leftIcon="refresh-cw"
            [loading]="loading"
            (click)="loadDebts()"
          ></app-pascho-button>
        </div>
      </app-pascho-card>
      
      <!-- Results -->
      <app-pascho-card 
        [title]="'Resultados'" 
        [subtitle]="debts.length + ' títulos encontrados'">
        
        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-12">
          <lucide-icon name="loader-2" [size]="48" class="text-primary-500 mx-auto mb-4 animate-spin"></lucide-icon>
          <p class="text-secondary-600">Carregando títulos...</p>
        </div>
        
        <!-- Error State -->
        <div *ngIf="error && !loading" class="text-center py-12">
          <lucide-icon name="alert-circle" [size]="48" class="text-red-500 mx-auto mb-4"></lucide-icon>
          <h3 class="text-lg font-medium text-secondary-900 mb-2">Erro ao carregar títulos</h3>
          <p class="text-secondary-600 mb-4">{{ error }}</p>
          <app-pascho-button
            label="Tentar novamente"
            variant="primary"
            leftIcon="RefreshCw"
            (click)="loadDebts()"
          ></app-pascho-button>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="!loading && !error && debts.length === 0" class="text-center py-12">
          <lucide-icon name="file-text" [size]="64" class="text-gray-400 mx-auto mb-4"></lucide-icon>
          <h3 class="text-lg font-medium text-secondary-900 mb-2">Nenhum título encontrado</h3>
          <p class="text-secondary-600 mb-6">Não há títulos que correspondam aos filtros aplicados.</p>
          <div class="space-x-3">
            <app-pascho-button
              label="Novo Título"
              variant="primary"
              leftIcon="Plus"
              [routerLink]="['/debts/new']"
              [disabled]="!isOnline"
            ></app-pascho-button>
            <app-pascho-button
              label="Limpar Filtros"
              variant="secondary"
              leftIcon="x"
              (click)="clearFilters()"
            ></app-pascho-button>
          </div>
        </div>
        
        <!-- Data Table -->
        <div *ngIf="!loading && !error && debts.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devedor</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parcelas</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let debt of debts; trackBy: trackByDebtId" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ debt.debtNumber }}</div>
                  <div class="text-sm text-gray-500">{{ debt.createdAt | date:'dd/MM/yyyy' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ debt.debtor.name }}</div>
                  <div class="text-sm text-gray-500">{{ debt.debtor.document }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ debt.originalValue | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</div>
                  <div class="text-sm text-gray-500" *ngIf="debt.currentValue !== debt.originalValue">
                    Atual: {{ debt.currentValue | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" 
                        [ngClass]="getStatusClass(debt.status)">
                    {{ getStatusLabel(debt.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ debt.paidInstallments }}/{{ debt.totalInstallments }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <app-pascho-button
                    label="Ver"
                    variant="secondary"
                    size="sm"
                    leftIcon="eye"
                    [routerLink]="['/debts', debt.id]"
                  ></app-pascho-button>
                  <app-pascho-button
                    label="Editar"
                    variant="secondary"
                    size="sm"
                    leftIcon="edit"
                    [routerLink]="['/debts', debt.id, 'edit']"
                    [disabled]="!isOnline"
                  ></app-pascho-button>
                  <app-pascho-button
                    label="Excluir"
                    variant="danger"
                    size="sm"
                    leftIcon="trash-2"
                    (click)="deleteDebt(debt)"
                    [disabled]="!isOnline"
                  ></app-pascho-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </app-pascho-card>
    </div>
  `
})
export class DebtListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  
  debts: Debt[] = [];
  loading = false;
  error: string | null = null;
  isOnline = true;
  
  // Filtros
  searchTerm = '';
  selectedStatus = '';
  overdueOnly = false;
  
  constructor(
    private debtService: DebtService,
    private connectivityService: ConnectivityService,
    private router: Router
  ) {
    // Configurar busca com debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilters();
    });
  }
  
  ngOnInit() {
    // Monitorar conectividade
    this.connectivityService.isOnline$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOnline => {
        this.isOnline = isOnline;
        if (isOnline && this.debts.length === 0) {
          this.loadDebts();
        }
      });
    
    // Monitorar navegação para atualizar dados quando voltar para esta página
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        filter((event: NavigationEnd) => event.url === '/debts' || event.url.startsWith('/debts?')),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        // Recarregar dados quando voltar para a página de lista
        if (this.isOnline) {
          this.loadDebts();
        }
      });
    
    // Inscrever-se nos observables do serviço para atualizações automáticas
    this.debtService.debts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(debts => {
        this.debts = debts;
      });
    
    this.debtService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });
    
    // Carregar dados iniciais apenas se não há dados em cache
    if (!this.debtService.hasCache()) {
      this.loadDebts();
    } else {
      // Se há cache, usar os dados do cache
      this.debts = this.debtService.getCachedDebts();
    }
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadDebts() {
    if (!this.isOnline) {
      this.error = 'Sem conexão com a internet';
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    const filter = this.buildFilter();
    
    this.debtService.getDebts(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.debts = response.debts;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message || 'Erro ao carregar títulos';
          this.loading = false;
        }
      });
  }
  
  onSearchChange(term: string) {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }
  
  applyFilters() {
    this.loadDebts();
  }
  
  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.overdueOnly = false;
    this.loadDebts();
  }
  
  deleteDebt(debt: Debt) {
    if (!debt.id || !this.isOnline) return;
    
    if (confirm(`Tem certeza que deseja excluir o título ${debt.debtNumber}?`)) {
      this.debtService.deleteDebt(debt.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadDebts(); // Recarregar lista
          },
          error: (error) => {
            alert('Erro ao excluir título: ' + error.message);
          }
        });
    }
  }
  
  trackByDebtId(index: number, debt: Debt): string {
    return debt.id || index.toString();
  }
  
  getStatusClass(status: DebtStatus): string {
    switch (status) {
      case DebtStatus.ACTIVE:
        return 'bg-blue-100 text-blue-800';
      case DebtStatus.OVERDUE:
        return 'bg-red-100 text-red-800';
      case DebtStatus.PAID:
        return 'bg-green-100 text-green-800';
      case DebtStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  getStatusLabel(status: DebtStatus): string {
    switch (status) {
      case DebtStatus.ACTIVE:
        return 'Ativo';
      case DebtStatus.OVERDUE:
        return 'Em Atraso';
      case DebtStatus.PAID:
        return 'Pago';
      case DebtStatus.CANCELLED:
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  }
  
  private buildFilter(): DebtFilter {
    const filter: DebtFilter = {};
    
    if (this.searchTerm.trim()) {
      // Verificar se é documento ou nome
      if (/^\d/.test(this.searchTerm)) {
        filter.debtorDocument = this.searchTerm;
      } else {
        filter.debtorName = this.searchTerm;
      }
    }
    
    if (this.selectedStatus) {
      filter.status = [this.selectedStatus as DebtStatus];
    }
    
    if (this.overdueOnly) {
      filter.overdueOnly = true;
    }
    
    return filter;
  }
}