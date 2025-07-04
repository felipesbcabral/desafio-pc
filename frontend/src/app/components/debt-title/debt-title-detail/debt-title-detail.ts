import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil, switchMap, of } from 'rxjs';
import { CardComponent } from '../../../shared/components/card/card.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { DebtTitleService } from '../../../services/debt-title.service';
import { NotificationService } from '../../../services/notification.service';
import { DebtTitle } from '../../../models/debt-title.model';

@Component({
  selector: 'app-debt-title-detail',
  imports: [CommonModule, RouterModule, CardComponent, LoadingComponent, MatTableModule, MatTabsModule, MatIconModule, MatButtonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './debt-title-detail.html',
  styleUrl: './debt-title-detail.scss'
})
export class DebtTitleDetail implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  title: DebtTitle | null = null;
  isLoading: boolean = false;


  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: string | Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }



  formatStatus(title: any): string {
    if (!title.status) return 'Pendente';
    switch (title.status.toLowerCase()) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Em Atraso';
      case 'cancelled': return 'Cancelado';
      default: return title.status;
    }
  }

  getStatusClass(title: any): string {
    if (!title.status) return 'pending';
    switch (title.status.toLowerCase()) {
      case 'paid': return 'paid';
      case 'pending': return 'pending';
      case 'overdue': return 'overdue';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private debtTitleService: DebtTitleService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadTitleDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTitleDetails(): void {
    this.isLoading = true;
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          const titleId = params['id'];
          if (!titleId) {
            return of(null);
          }
          return this.debtTitleService.getById(titleId);
        })
      )
      .subscribe({
        next: (title) => {
          this.isLoading = false;
          this.title = title;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erro ao carregar título:', error);
          this.notificationService.error('Erro ao carregar detalhes do título');
        }
      });
  }



  confirmDelete(): void {
    if (!this.title) return;
    
    if (confirm('Tem certeza que deseja excluir este título de dívida?')) {
      this.isLoading = true;
      
      this.debtTitleService.delete(this.title.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.notificationService.success('Título de dívida excluído com sucesso!');
            this.router.navigate(['/debt-titles']);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Erro ao excluir título:', error);
            this.notificationService.error('Erro ao excluir título de dívida');
          }
        });
    }
  }
}
