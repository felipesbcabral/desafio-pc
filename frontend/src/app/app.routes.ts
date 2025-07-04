import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from './components/dashboard/dashboard';
import { DebtTitleList } from './components/debt-title/debt-title-list/debt-title-list';
import { DebtTitleFormComponent } from './components/debt-title/debt-title-form/debt-title-form';
import { DebtTitleDetail } from './components/debt-title/debt-title-detail/debt-title-detail';
import { NotFound } from './shared/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        component: Dashboard,
        data: { animation: 'Dashboard' }
      },
      { 
        path: 'debt-titles', 
        component: DebtTitleList,
        data: { animation: 'DebtTitleList' }
      },
      { 
        path: 'debt-titles/new', 
        component: DebtTitleFormComponent,
        data: { animation: 'DebtTitleForm' }
      },
      { 
        path: 'debt-titles/:id/edit', 
        component: DebtTitleFormComponent,
        data: { animation: 'DebtTitleForm' }
      },
      { 
        path: 'debt-titles/:id', 
        component: DebtTitleDetail,
        data: { animation: 'DebtTitleDetail' }
      },
    ]
  },
  { 
    path: '404', 
    component: NotFound,
    data: { animation: 'NotFound' }
  },
  { path: '**', redirectTo: '/404' }
];
