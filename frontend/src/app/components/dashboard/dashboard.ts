import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { DebtTitleService } from '../../services/debt-title.service';
import { NotificationService } from '../../services/notification.service';
import { DebtTitle } from '../../models/debt-title.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    ButtonComponent,
    CardComponent
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
        // Dados mock para demonstração quando API não está disponível
        this.loadMockData();
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

  private loadMockData(): void {
    // Dados mock para demonstração
    this.totalTitles = 15;
    this.overdueTitles = 3;
    this.totalValue = 125000.50;
    this.overdueValue = 25000.00;
    
    this.recentTitles = [
      {
        id: '1',
        titleNumber: 'TIT-001',
        originalValue: 5000.00,
        updatedValue: 5250.00,
        dueDate: '2024-01-15',
        interestRatePerDay: 0.1,
        penaltyRate: 2.0,
        debtorName: 'João Silva',
        debtorDocument: '123.456.789-00',
        debtorDocumentType: 'CPF',
        createdAt: '2023-12-01',
        installmentCount: 1,
        daysOverdue: 0,
        isOverdue: false,
        installments: []
      },
      {
        id: '2',
        titleNumber: 'TIT-002',
        originalValue: 3500.00,
        updatedValue: 3675.00,
        dueDate: '2024-02-20',
        interestRatePerDay: 0.1,
        penaltyRate: 2.0,
        debtorName: 'Maria Santos',
        debtorDocument: '987.654.321-00',
        debtorDocumentType: 'CPF',
        createdAt: '2023-12-05',
        installmentCount: 1,
        daysOverdue: 0,
        isOverdue: false,
        installments: []
      },
      {
        id: '3',
        titleNumber: 'TIT-003',
        originalValue: 7500.00,
        updatedValue: 7875.00,
        dueDate: '2024-03-10',
        interestRatePerDay: 0.1,
        penaltyRate: 2.0,
        debtorName: 'Pedro Costa',
        debtorDocument: '456.789.123-00',
        debtorDocumentType: 'CPF',
        createdAt: '2023-12-10',
        installmentCount: 1,
        daysOverdue: 0,
        isOverdue: false,
        installments: []
      }
    ];
  }

  showOverdueTitles(): void {
    this.notificationService.info('Redirecionando para títulos em atraso...');
    // Implementar navegação para títulos em atraso
  }
}
