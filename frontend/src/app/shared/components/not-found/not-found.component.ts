import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideIconsModule } from '../../../core/modules/lucide-icons.module';
import { PaschoButtonComponent } from '../pascho-button/pascho-button.component';
import { PaschoCardComponent } from '../pascho-card/pascho-card.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideIconsModule,
    PaschoButtonComponent,
    PaschoCardComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="max-w-md w-full">
        <app-pascho-card class="text-center">
          <div class="py-8">
            <!-- 404 Icon -->
            <div class="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <lucide-icon name="search-x" [size]="48" class="text-primary-600"></lucide-icon>
            </div>
            
            <!-- Error Code -->
            <h1 class="text-6xl font-bold text-secondary-900 mb-2">404</h1>
            
            <!-- Error Message -->
            <h2 class="text-xl font-semibold text-secondary-700 mb-2">
              Página não encontrada
            </h2>
            
            <p class="text-secondary-600 mb-8">
              A página que você está procurando não existe ou foi movida.
            </p>
            
            <!-- Actions -->
            <div class="space-y-3">
              <app-pascho-button
                label="Voltar ao Dashboard"
                variant="primary"
                leftIcon="home"
                [routerLink]="['/dashboard']"
                [fullWidth]="true"
              ></app-pascho-button>
              
              <app-pascho-button
                label="Voltar à página anterior"
                variant="secondary"
                leftIcon="arrow-left"
                (clicked)="goBack()"
                [fullWidth]="true"
              ></app-pascho-button>
            </div>
            
            <!-- Help Links -->
            <div class="mt-8 pt-6 border-t border-gray-200">
              <p class="text-sm text-secondary-600 mb-3">Precisa de ajuda?</p>
              <div class="flex justify-center space-x-4 text-sm">
                <a
                  [routerLink]="['/dashboard']"
                  class="text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Dashboard
                </a>
                <span class="text-gray-300">|</span>
                <a
                  [routerLink]="['/debts']"
                  class="text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Títulos
                </a>
                <span class="text-gray-300">|</span>
                <a
                  [routerLink]="['/settings']"
                  class="text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Configurações
                </a>
              </div>
            </div>
          </div>
        </app-pascho-card>
      </div>
    </div>
  `,
  styles: [`
    /* Animation for the icon */
    lucide-icon {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
    
    /* Smooth transitions */
    .transition-colors {
      transition-property: color;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 200ms;
    }
  `]
})
export class NotFoundComponent {
  goBack(): void {
    window.history.back();
  }
}