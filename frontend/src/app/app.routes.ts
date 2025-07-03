import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from './components/dashboard/dashboard';
import { DebtTitleList } from './components/debt-title/debt-title-list/debt-title-list';
import { DebtTitleForm } from './components/debt-title/debt-title-form/debt-title-form';
import { DebtTitleDetail } from './components/debt-title/debt-title-detail/debt-title-detail';
import { NotFound } from './shared/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'debt-titles', component: DebtTitleList },
      { path: 'debt-titles/new', component: DebtTitleForm },
      { path: 'debt-titles/edit/:id', component: DebtTitleForm },
      { path: 'debt-titles/:id', component: DebtTitleDetail },
    ]
  },
  { path: '404', component: NotFound },
  { path: '**', redirectTo: '/404' }
];
