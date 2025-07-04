import { trigger, state, style, transition, animate, keyframes, query, stagger } from '@angular/animations';

// Animação de fade in/out
export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms ease-out', style({ opacity: 0 }))
  ])
]);

// Animação de slide in/out
export const slideInOut = trigger('slideInOut', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)', opacity: 0 }),
    animate('400ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('400ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
  ])
]);

// Animação de scale in/out
export const scaleInOut = trigger('scaleInOut', [
  transition(':enter', [
    style({ transform: 'scale(0.8)', opacity: 0 }),
    animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('250ms ease-in', style({ transform: 'scale(0.8)', opacity: 0 }))
  ])
]);

// Animação de bounce
export const bounceIn = trigger('bounceIn', [
  transition(':enter', [
    animate('600ms ease-in-out', keyframes([
      style({ transform: 'scale(0.3)', opacity: 0, offset: 0 }),
      style({ transform: 'scale(1.05)', opacity: 0.8, offset: 0.5 }),
      style({ transform: 'scale(0.95)', opacity: 1, offset: 0.7 }),
      style({ transform: 'scale(1)', opacity: 1, offset: 1 })
    ]))
  ])
]);

// Animação de shake (para erros)
export const shake = trigger('shake', [
  state('error', style({ transform: 'translateX(0)' })),
  transition('* => error', [
    animate('600ms ease-in-out', keyframes([
      style({ transform: 'translateX(0)', offset: 0 }),
      style({ transform: 'translateX(-10px)', offset: 0.1 }),
      style({ transform: 'translateX(10px)', offset: 0.2 }),
      style({ transform: 'translateX(-10px)', offset: 0.3 }),
      style({ transform: 'translateX(10px)', offset: 0.4 }),
      style({ transform: 'translateX(-10px)', offset: 0.5 }),
      style({ transform: 'translateX(10px)', offset: 0.6 }),
      style({ transform: 'translateX(-10px)', offset: 0.7 }),
      style({ transform: 'translateX(10px)', offset: 0.8 }),
      style({ transform: 'translateX(0)', offset: 1 })
    ]))
  ])
]);

// Animação de lista staggered
export const listAnimation = trigger('listAnimation', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(-15px)' }),
      stagger('50ms', animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0px)' })))
    ], { optional: true })
  ])
]);

// Animação de loading pulse
export const pulse = trigger('pulse', [
  state('loading', style({ transform: 'scale(1)' })),
  transition('* => loading', [
    animate('1s ease-in-out', keyframes([
      style({ transform: 'scale(1)', opacity: 1, offset: 0 }),
      style({ transform: 'scale(1.05)', opacity: 0.8, offset: 0.5 }),
      style({ transform: 'scale(1)', opacity: 1, offset: 1 })
    ]))
  ])
]);

// Animação de hover
export const hoverScale = trigger('hoverScale', [
  state('normal', style({ transform: 'scale(1)' })),
  state('hovered', style({ transform: 'scale(1.02)' })),
  transition('normal <=> hovered', animate('200ms ease-in-out'))
]);

// Animação de rotação para loading
export const rotate = trigger('rotate', [
  transition('* => *', [
    animate('1s linear', keyframes([
      style({ transform: 'rotate(0deg)', offset: 0 }),
      style({ transform: 'rotate(360deg)', offset: 1 })
    ]))
  ])
]);

// Animação de slide up para modais
export const slideUp = trigger('slideUp', [
  transition(':enter', [
    style({ transform: 'translateY(100%)', opacity: 0 }),
    animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ transform: 'translateY(100%)', opacity: 0 }))
  ])
]);

// Animação de progress bar
export const progressBar = trigger('progressBar', [
  transition('* => *', [
    style({ width: '0%' }),
    animate('500ms ease-out')
  ])
]);

// Animações de transição de página
export const pageSlideIn = trigger('pageSlideIn', [
  transition(':enter', [
    query(':self', [
      style({ transform: 'translateX(100%)', opacity: 0 }),
      animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
        style({ transform: 'translateX(0)', opacity: 1 }))
    ])
  ])
]);

export const pageSlideOut = trigger('pageSlideOut', [
  transition(':leave', [
    query(':self', [
      style({ transform: 'translateX(0)', opacity: 1 }),
      animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
        style({ transform: 'translateX(-100%)', opacity: 0 }))
    ])
  ])
]);

export const pageFadeIn = trigger('pageFadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in-out', style({ opacity: 1 }))
  ])
]);

export const pageFadeOut = trigger('pageFadeOut', [
  transition(':leave', [
    animate('300ms ease-in-out', style({ opacity: 0 }))
  ])
]);

// Animação de roteamento completa
export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      })
    ], { optional: true }),
    
    query(':enter', [
      style({ transform: 'translateX(100%)', opacity: 0 })
    ], { optional: true }),
    
    query(':leave', [
      animate('300ms ease-in-out', 
        style({ transform: 'translateX(-100%)', opacity: 0 }))
    ], { optional: true }),
    
    query(':enter', [
      animate('300ms ease-in-out', 
        style({ transform: 'translateX(0)', opacity: 1 }))
    ], { optional: true })
  ])
]);

// Micro-interações
export const buttonPress = trigger('buttonPress', [
  transition('* => pressed', [
    animate('100ms ease-in', style({ transform: 'scale(0.95)' }))
  ]),
  transition('pressed => *', [
    animate('100ms ease-out', style({ transform: 'scale(1)' }))
  ])
]);

export const cardHover = trigger('cardHover', [
  state('normal', style({ 
    transform: 'translateY(0) scale(1)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  })),
  state('hovered', style({ 
    transform: 'translateY(-2px) scale(1.01)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
  })),
  transition('normal <=> hovered', animate('200ms cubic-bezier(0.4, 0, 0.2, 1)'))
]);

// Animação de loading skeleton
export const skeletonPulse = trigger('skeletonPulse', [
  transition('* => *', [
    animate('1.5s ease-in-out', keyframes([
      style({ opacity: 1, offset: 0 }),
      style({ opacity: 0.5, offset: 0.5 }),
      style({ opacity: 1, offset: 1 })
    ]))
  ])
]);

// Animação de notificação
export const notificationSlide = trigger('notificationSlide', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
      style({ transform: 'translateX(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('250ms ease-in', 
      style({ transform: 'translateX(100%)', opacity: 0 }))
  ])
]);