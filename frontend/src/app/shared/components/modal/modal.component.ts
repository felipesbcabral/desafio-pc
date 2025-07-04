import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent],
  template: `
    <div 
      *ngIf="isOpen" 
      class="modal-overlay"
      [class.animate-fadeIn]="isOpen"
      (click)="onOverlayClick($event)"
      role="dialog"
      [attr.aria-modal]="true"
      [attr.aria-labelledby]="title ? 'modal-title' : null"
      [attr.aria-describedby]="'modal-content'"
    >
      <div 
        #modalContent
        [class]="modalClasses"
        (click)="$event.stopPropagation()"
        tabindex="-1"
      >
        <!-- Header -->
        <div *ngIf="title || showCloseButton" class="modal-header">
          <h2 *ngIf="title" id="modal-title" class="modal-title">{{ title }}</h2>
          <app-button 
            *ngIf="showCloseButton"
            variant="ghost" 
            size="sm"
            class="modal-close-button"
            (clicked)="close()"
            [attr.aria-label]="'Fechar modal'"
          >
            <app-icon name="close" size="sm"></app-icon>
          </app-button>
        </div>
        
        <!-- Content -->
        <div id="modal-content" class="modal-content">
          <ng-content></ng-content>
        </div>
        
        <!-- Footer -->
        <div *ngIf="hasFooter" class="modal-footer">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() title?: string;
  @Input() size: ModalSize = 'md';
  @Input() showCloseButton: boolean = true;
  @Input() closeOnOverlayClick: boolean = true;
  @Input() closeOnEscape: boolean = true;
  @Input() hasFooter: boolean = false;
  @Input() preventBodyScroll: boolean = true;
  
  @Output() modalClose = new EventEmitter<void>();
  @Output() modalOpen = new EventEmitter<void>();
  
  @ViewChild('modalContent') modalContentRef!: ElementRef;
  
  private originalBodyOverflow?: string;
  private focusedElementBeforeOpen?: HTMLElement;

  get modalClasses(): string {
    const classes = [
      'modal-content-wrapper',
      `modal-${this.size}`,
      'animate-fadeIn'
    ];
    return classes.join(' ');
  }

  ngOnInit(): void {
    if (this.isOpen) {
      this.handleOpen();
    }
  }

  ngOnDestroy(): void {
    this.restoreBodyScroll();
    this.restoreFocus();
    this.removeEventListeners();
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.handleOpen();
    } else {
      this.handleClose();
    }
  }

  private handleOpen(): void {
    this.storeFocusedElement();
    this.preventBodyScrollIfNeeded();
    this.addEventListeners();
    
    // Focus the modal content after a short delay to ensure it's rendered
    setTimeout(() => {
      this.focusModal();
    }, 100);
    
    this.modalOpen.emit();
  }

  private handleClose(): void {
    this.restoreBodyScroll();
    this.restoreFocus();
    this.removeEventListeners();
  }

  private storeFocusedElement(): void {
    this.focusedElementBeforeOpen = document.activeElement as HTMLElement;
  }

  private restoreFocus(): void {
    if (this.focusedElementBeforeOpen) {
      this.focusedElementBeforeOpen.focus();
    }
  }

  private focusModal(): void {
    if (this.modalContentRef?.nativeElement) {
      this.modalContentRef.nativeElement.focus();
    }
  }

  private preventBodyScrollIfNeeded(): void {
    if (this.preventBodyScroll) {
      this.originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
  }

  private restoreBodyScroll(): void {
    if (this.preventBodyScroll && this.originalBodyOverflow !== undefined) {
      document.body.style.overflow = this.originalBodyOverflow;
    }
  }

  private addEventListeners(): void {
    if (this.closeOnEscape) {
      document.addEventListener('keydown', this.handleEscapeKey);
    }
  }

  private removeEventListeners(): void {
    document.removeEventListener('keydown', this.handleEscapeKey);
  }

  private handleEscapeKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.isOpen) {
      this.close();
    }
  };

  onOverlayClick(event: Event): void {
    if (this.closeOnOverlayClick && event.target === event.currentTarget) {
      this.close();
    }
  }

  close(): void {
    this.modalClose.emit();
  }

  open(): void {
    // This method can be called programmatically
    // The parent component should handle setting isOpen to true
  }
}