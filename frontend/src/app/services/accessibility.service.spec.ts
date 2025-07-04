import { TestBed } from '@angular/core/testing';
import { AccessibilityService } from './accessibility.service';

describe('AccessibilityService', () => {
  let service: AccessibilityService;
  let mockElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessibilityService);
    
    // Mock DOM elements
    mockElement = document.createElement('div');
    mockElement.id = 'test-element';
    document.body.appendChild(mockElement);
  });

  afterEach(() => {
    // Clean up DOM
    if (mockElement.parentNode) {
      mockElement.parentNode.removeChild(mockElement);
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('announce', () => {
    it('should emit announcement for screen readers', () => {
      const message = 'Test announcement';
      let receivedMessage = '';
      
      service.announcements$.subscribe(announcement => {
        receivedMessage = announcement.message;
      });
      
      service.announce(message);
      
      expect(receivedMessage).toBe(message);
    });

    it('should use polite priority by default', () => {
      const message = 'Test announcement';
      let receivedPriority = '';
      
      service.announcements$.subscribe(announcement => {
        receivedPriority = announcement.priority;
      });
      
      service.announce(message);
      
      expect(receivedPriority).toBe('polite');
    });

    it('should use assertive priority when specified', () => {
      const message = 'Urgent announcement';
      let receivedPriority = '';
      
      service.announcements$.subscribe(announcement => {
        receivedPriority = announcement.priority;
      });
      
      service.announce(message, 'assertive');
      
      expect(receivedPriority).toBe('assertive');
    });
  });

  describe('setFocus', () => {
    it('should set focus to element by selector', () => {
      spyOn(mockElement, 'focus');
      
      service.setFocus('#test-element');
      
      expect(mockElement.focus).toHaveBeenCalled();
    });

    it('should handle non-existent elements gracefully', () => {
      expect(() => {
        service.setFocus('#non-existent');
      }).not.toThrow();
    });
  });

  describe('addAriaLabel', () => {
    it('should add aria-label to element', () => {
      const label = 'Test label';
      
      service.addAriaLabel('#test-element', label);
      
      expect(mockElement.getAttribute('aria-label')).toBe(label);
    });

    it('should handle non-existent elements gracefully', () => {
      expect(() => {
        service.addAriaLabel('#non-existent', 'label');
      }).not.toThrow();
    });
  });

  describe('addAriaDescription', () => {
    it('should add aria-describedby to element', () => {
      const description = 'Test description';
      
      service.addAriaDescription('#test-element', description);
      
      const describedBy = mockElement.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      
      const descriptionElement = document.getElementById(describedBy!);
      expect(descriptionElement?.textContent).toBe(description);
    });
  });

  describe('validateContrast', () => {
    it('should return true for sufficient contrast', () => {
      const result = service.validateContrast('#000000', '#ffffff');
      expect(result.isValid).toBe(true);
      expect(result.ratio).toBeGreaterThan(4.5);
    });

    it('should return false for insufficient contrast', () => {
      const result = service.validateContrast('#888888', '#999999');
      expect(result.isValid).toBe(false);
      expect(result.ratio).toBeLessThan(4.5);
    });

    it('should handle invalid color formats', () => {
      const result = service.validateContrast('invalid', 'color');
      expect(result.isValid).toBe(false);
      expect(result.ratio).toBe(1);
    });
  });

  describe('setupKeyboardNavigation', () => {
    it('should add keyboard event listeners to container', () => {
      spyOn(mockElement, 'addEventListener');
      
      service.setupKeyboardNavigation('#test-element');
      
      expect(mockElement.addEventListener).toHaveBeenCalledWith('keydown', jasmine.any(Function));
    });
  });

  describe('manageFocusTrap', () => {
    it('should trap focus within container', () => {
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      mockElement.appendChild(button1);
      mockElement.appendChild(button2);
      
      service.manageFocusTrap('#test-element', true);
      
      // Simulate Tab key on last focusable element
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      spyOn(event, 'preventDefault');
      spyOn(button1, 'focus');
      
      button2.dispatchEvent(event);
      
      // Focus should cycle back to first element
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });
});