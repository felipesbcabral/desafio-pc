import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface PageTransition {
  from: string;
  to: string;
  direction: 'forward' | 'backward' | 'none';
  animation: 'slide' | 'fade' | 'scale' | 'none';
}

@Injectable({
  providedIn: 'root'
})
export class PageTransitionService {
  private currentTransition = new BehaviorSubject<PageTransition>({
    from: '',
    to: '',
    direction: 'none',
    animation: 'fade'
  });

  private routeHistory: string[] = [];
  private isTransitioning = new BehaviorSubject<boolean>(false);

  constructor(private router: Router) {
    this.setupRouterListener();
  }

  get transition$(): Observable<PageTransition> {
    return this.currentTransition.asObservable();
  }

  get isTransitioning$(): Observable<boolean> {
    return this.isTransitioning.asObservable();
  }

  private setupRouterListener(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.handleRouteChange(event.url);
      });
  }

  private handleRouteChange(newRoute: string): void {
    const previousRoute = this.routeHistory[this.routeHistory.length - 1] || '';
    
    // Determine direction based on route hierarchy
    const direction = this.getTransitionDirection(previousRoute, newRoute);
    
    // Determine animation type based on route
    const animation = this.getAnimationType(previousRoute, newRoute);

    const transition: PageTransition = {
      from: previousRoute,
      to: newRoute,
      direction,
      animation
    };

    this.currentTransition.next(transition);
    this.routeHistory.push(newRoute);

    // Keep only last 10 routes in history
    if (this.routeHistory.length > 10) {
      this.routeHistory = this.routeHistory.slice(-10);
    }
  }

  private getTransitionDirection(from: string, to: string): 'forward' | 'backward' | 'none' {
    // Define route hierarchy for determining direction
    const routeHierarchy = [
      '/',
      '/dashboard',
      '/debt-titles',
      '/debt-titles/new',
      '/debt-titles/edit'
    ];

    const fromIndex = routeHierarchy.findIndex(route => from.startsWith(route));
    const toIndex = routeHierarchy.findIndex(route => to.startsWith(route));

    if (fromIndex === -1 || toIndex === -1) {
      return 'none';
    }

    if (toIndex > fromIndex) {
      return 'forward';
    } else if (toIndex < fromIndex) {
      return 'backward';
    }

    return 'none';
  }

  private getAnimationType(from: string, to: string): 'slide' | 'fade' | 'scale' | 'none' {
    // Modal routes use scale animation
    if (to.includes('modal') || from.includes('modal')) {
      return 'scale';
    }

    // Form routes use slide animation
    if (to.includes('new') || to.includes('edit') || to.includes('form')) {
      return 'slide';
    }

    // Default to fade for most transitions
    return 'fade';
  }

  startTransition(): void {
    this.isTransitioning.next(true);
  }

  endTransition(): void {
    this.isTransitioning.next(false);
  }

  // Manual transition trigger for programmatic navigation
  navigateWithTransition(
    route: string, 
    animation: 'slide' | 'fade' | 'scale' = 'fade',
    direction: 'forward' | 'backward' = 'forward'
  ): void {
    const currentRoute = this.router.url;
    
    const transition: PageTransition = {
      from: currentRoute,
      to: route,
      direction,
      animation
    };

    this.currentTransition.next(transition);
    this.startTransition();
    
    this.router.navigate([route]).then(() => {
      setTimeout(() => {
        this.endTransition();
      }, 300); // Match animation duration
    });
  }

  // Get current transition state
  getCurrentTransition(): PageTransition {
    return this.currentTransition.value;
  }

  // Clear transition history
  clearHistory(): void {
    this.routeHistory = [];
  }
}