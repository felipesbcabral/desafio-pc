import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { DebtTitleService } from '../../services/debt-title.service';
import { NotificationService } from '../../services/notification.service';
import { DebtTitle } from '../../models/debt-title.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private debtTitleService = inject(DebtTitleService);
  private notificationService = inject(NotificationService);

  totalTitles = 0;
  overdueTitles = 0;
  totalValue = 0;
  overdueValue = 0;
  recentTitles: DebtTitle[] = [];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Carregar todos os títulos
    this.debtTitleService.getAll().subscribe({
      next: (titles) => {
        this.totalTitles = titles.length;
        this.totalValue = titles.reduce((sum, title) => sum + title.originalValue, 0);
        this.recentTitles = titles.slice(0, 5); // Últimos 5 títulos
      },
      error: (error) => {
        console.error('Erro ao carregar títulos:', error);
      }
    });

    // Carregar títulos em atraso
    this.debtTitleService.getOverdue().subscribe({
      next: (overdueTitles) => {
        this.overdueTitles = overdueTitles.length;
        this.overdueValue = overdueTitles.reduce((sum, title) => sum + title.originalValue, 0);
      },
      error: (error) => {
        console.error('Erro ao carregar títulos em atraso:', error);
      }
    });
  }

  showOverdueTitles(): void {
    this.notificationService.info('Redirecionando para títulos em atraso...');
    // Implementar navegação para títulos em atraso
  }
}
