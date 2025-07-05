import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, RouterModule } from '@angular/router';
import { LucideIconsModule } from '../../core/modules/lucide-icons.module';
import { Subject, takeUntil, filter } from 'rxjs';
import { PaschoButtonComponent } from '../../shared/components/pascho-button/pascho-button.component';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: {
    text: string;
    variant: 'primary' | 'success' | 'danger' | 'warning';
  };
  children?: MenuItem[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    LucideIconsModule,
    PaschoButtonComponent
  ],

  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div class="flex items-center justify-between px-4 py-3">
          <!-- Left side -->
          <div class="flex items-center space-x-4">
            <!-- Mobile menu button -->
            <button
              class="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              (click)="toggleMobileSidebar()"
              aria-label="Toggle menu"
            >
              <lucide-icon name="Menu" [size]="20"></lucide-icon>
            </button>
            
            <!-- Logo -->
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <lucide-icon name="CreditCard" [size]="20" class="text-white"></lucide-icon>
              </div>
              <div class="hidden sm:block">
                <h1 class="text-xl font-bold text-secondary-900">DebtManager</h1>
                <p class="text-xs text-secondary-600">Paschoalotto</p>
              </div>
            </div>
          </div>
          
          <!-- Center - Breadcrumb -->
          <nav class="hidden md:flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
            <span class="text-secondary-500">{{ currentPageTitle }}</span>
          </nav>
          
          <!-- Right side -->
          <div class="flex items-center space-x-3">
            <!-- Notifications -->
            <button
              class="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Notificações"
            >
              <lucide-icon name="Bell" [size]="20"></lucide-icon>
              <span class="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            
            <!-- User menu -->
            <div class="relative">
              <button
                class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                (click)="toggleUserMenu()"
                aria-label="Menu do usuário"
              >
                <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <lucide-icon name="User" [size]="16" class="text-primary-600"></lucide-icon>
                </div>
                <span class="hidden sm:block text-sm font-medium text-secondary-700">Admin</span>
                <lucide-icon name="ChevronDown" [size]="16" class="text-gray-400"></lucide-icon>
              </button>
              
              <!-- User dropdown -->
              <div
                *ngIf="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              >
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <lucide-icon name="User" [size]="16" class="inline mr-2"></lucide-icon>
                  Perfil
                </a>
                <hr class="my-1">
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <lucide-icon name="LogOut" [size]="16" class="inline mr-2"></lucide-icon>
                  Sair
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <!-- Mobile sidebar overlay -->
      <div
        *ngIf="showMobileSidebar"
        class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        (click)="closeMobileSidebar()"
      ></div>
      
      <!-- Sidebar -->
      <aside
        class="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-30"
        [class.translate-x-0]="showMobileSidebar"
        [class.-translate-x-full]="!showMobileSidebar"
        [class.lg:translate-x-0]="true"
      >
        <nav class="h-full overflow-y-auto py-4">
          <ul class="space-y-1 px-3">
            <li *ngFor="let item of menuItems">
              <a
                [routerLink]="item.route"
                class="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                [class.bg-primary-100]="isActiveRoute(item.route)"
                [class.text-primary-700]="isActiveRoute(item.route)"
                [class.text-gray-700]="!isActiveRoute(item.route)"
                [class.hover:bg-gray-100]="!isActiveRoute(item.route)"
                (click)="closeMobileSidebar()"
              >
                <div class="flex items-center space-x-3">
                  <lucide-icon [name]="item.icon" [size]="18"></lucide-icon>
                  <span>{{ item.label }}</span>
                </div>
                <span
                  *ngIf="item.badge"
                  class="px-2 py-0.5 text-xs rounded-full"
                  [class.bg-primary-100]="item.badge.variant === 'primary'"
                  [class.text-primary-800]="item.badge.variant === 'primary'"
                  [class.bg-success-100]="item.badge.variant === 'success'"
                  [class.text-success-800]="item.badge.variant === 'success'"
                  [class.bg-danger-100]="item.badge.variant === 'danger'"
                  [class.text-danger-800]="item.badge.variant === 'danger'"
                  [class.bg-yellow-100]="item.badge.variant === 'warning'"
                  [class.text-yellow-800]="item.badge.variant === 'warning'"
                >
                  {{ item.badge.text }}
                </span>
              </a>
            </li>
          </ul>
          
          <!-- Footer -->
          <div class="absolute bottom-4 left-3 right-3">
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="flex items-center space-x-2 text-xs text-gray-600">
                <lucide-icon name="Info" [size]="14"></lucide-icon>
                <span>v1.0.0</span>
              </div>
            </div>
          </div>
        </nav>
      </aside>
      
      <!-- Main content -->
      <main class="lg:ml-64 pt-16 min-h-screen">
        <div class="p-6">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* Custom scrollbar for sidebar */
    nav {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 #f1f5f9;
    }
    
    nav::-webkit-scrollbar {
      width: 6px;
    }
    
    nav::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    
    nav::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }
    
    nav::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    
    /* Smooth transitions */
    .transition-transform {
      transition-property: transform;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 300ms;
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  showMobileSidebar = false;
  showUserMenu = false;
  currentPageTitle = 'Dashboard';
  
  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      route: '/dashboard'
    },
    {
      label: 'Títulos',
      icon: 'FileText',
      route: '/debts',
      badge: {
        text: '12',
        variant: 'primary'
      }
    },
    {
      label: 'Novo Título',
      icon: 'PlusCircle',
      route: '/debts/new'
    }
  ];
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    // Listen to route changes to update page title
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.url);
      });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        this.showUserMenu = false;
      }
    });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  toggleMobileSidebar() {
    this.showMobileSidebar = !this.showMobileSidebar;
  }
  
  closeMobileSidebar() {
    this.showMobileSidebar = false;
  }
  
  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }
  
  isActiveRoute(route: string): boolean {
    return this.router.url.startsWith(route);
  }
  
  private updatePageTitle(url: string) {
    const routeTitleMap: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/debts': 'Títulos de Dívida',
      '/debts/new': 'Novo Título'
    };
    
    // Find the most specific route match
    const matchedRoute = Object.keys(routeTitleMap)
      .sort((a, b) => b.length - a.length)
      .find(route => url.startsWith(route));
    
    this.currentPageTitle = matchedRoute ? routeTitleMap[matchedRoute] : 'DebtManager';
  }
}