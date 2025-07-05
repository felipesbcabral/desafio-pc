import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/debt-management/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'debts',
        loadChildren: () => import('./features/debt-management/debt-management.routes').then(m => m.debtManagementRoutes)
      },

    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
