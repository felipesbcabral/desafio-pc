import { Routes } from '@angular/router';

export const debtManagementRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/debt-list/debt-list.component').then(m => m.DebtListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/debt-create/debt-create.component').then(m => m.DebtCreateComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/debt-detail/debt-detail.component').then(m => m.DebtDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/debt-edit/debt-edit.component').then(m => m.DebtEditComponent)
  },
  {
    path: ':id/installments',
    loadComponent: () => import('./pages/installments/installments.component').then(m => m.InstallmentsComponent)
  }
];