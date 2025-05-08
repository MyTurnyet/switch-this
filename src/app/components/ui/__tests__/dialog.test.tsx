import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog, ConfirmDialog } from '../dialog';

describe('Dialog Component', () => {
  // Mock document.body.style operations
  beforeEach(() => {
    // Mock the document.body.style.overflow setter/getter
    Object.defineProperty(document.body.style, 'overflow', {
      configurable: true,
      get: jest.fn(() => ''),
      set: jest.fn(),
    });
  });

  it('renders nothing when isOpen is false', () => {
    render(<Dialog isOpen={false} onClose={() => {}}>Test Content</Dialog>);
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
  });

  it('renders content when isOpen is true', () => {
    render(<Dialog isOpen={true} onClose={() => {}}>Test Content</Dialog>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders title and description when provided', () => {
    render(
      <Dialog 
        isOpen={true} 
        onClose={() => {}} 
        title="Dialog Title" 
        description="Dialog Description"
      >
        Test Content
      </Dialog>
    );
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Dialog Description')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(
      <Dialog 
        isOpen={true} 
        onClose={() => {}} 
        footer={<button>Footer Button</button>}
      >
        Test Content
      </Dialog>
    );
    expect(screen.getByText('Footer Button')).toBeInTheDocument();
  });

  it('calls onClose when ESC key is pressed', () => {
    const handleClose = jest.fn();
    render(<Dialog isOpen={true} onClose={handleClose}>Test Content</Dialog>);
    
    // Simulate pressing ESC key
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside the dialog if closeOnClickOutside is true', () => {
    const handleClose = jest.fn();
    render(
      <Dialog isOpen={true} onClose={handleClose} closeOnClickOutside={true}>
        Test Content
      </Dialog>
    );
    
    // Simulate clicking on the backdrop
    fireEvent.click(screen.getByRole('dialog'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking outside if closeOnClickOutside is false', () => {
    const handleClose = jest.fn();
    render(
      <Dialog isOpen={true} onClose={handleClose} closeOnClickOutside={false}>
        Test Content
      </Dialog>
    );
    
    // Simulate clicking on the backdrop
    fireEvent.click(screen.getByRole('dialog'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('does not call onClose when clicking on the dialog content', () => {
    const handleClose = jest.fn();
    const { container } = render(
      <Dialog isOpen={true} onClose={handleClose}>
        Test Content
      </Dialog>
    );
    
    // Get the dialog content div (the direct child of the dialog)
    const dialogContent = container.querySelector('div[role="dialog"] > div');
    expect(dialogContent).toBeInTheDocument();
    
    // Simulate clicking on the dialog content
    if (dialogContent) {
      fireEvent.click(dialogContent);
      expect(handleClose).not.toHaveBeenCalled();
    }
  });

  it('calls onClose when clicking the close button if showCloseButton is true', () => {
    const handleClose = jest.fn();
    render(
      <Dialog 
        isOpen={true} 
        onClose={handleClose} 
        title="Dialog Title"
        showCloseButton={true}
      >
        Test Content
      </Dialog>
    );
    
    // Find and click the close button
    const closeButton = screen.getByLabelText('Close dialog');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not render the close button when showCloseButton is false', () => {
    render(
      <Dialog 
        isOpen={true} 
        onClose={() => {}} 
        title="Dialog Title"
        showCloseButton={false}
      >
        Test Content
      </Dialog>
    );
    
    expect(screen.queryByLabelText('Close dialog')).not.toBeInTheDocument();
  });

  it('applies different size classes correctly', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;
    
    for (const size of sizes) {
      const { container, unmount } = render(
        <Dialog isOpen={true} onClose={() => {}} size={size}>
          Content
        </Dialog>
      );
      
      // Check that the appropriate size class is applied
      const dialogContent = container.querySelector('div[role="dialog"] > div');
      expect(dialogContent).toHaveClass(
        size === 'sm' ? 'max-w-sm' :
        size === 'md' ? 'max-w-md' :
        size === 'lg' ? 'max-w-lg' :
        size === 'xl' ? 'max-w-xl' :
        'max-w-full'
      );
      
      unmount();
    }
  });

  it('applies contentClassName to the content container', () => {
    const { container } = render(
      <Dialog 
        isOpen={true} 
        onClose={() => {}} 
        contentClassName="custom-content-class"
      >
        Dialog with custom content class
      </Dialog>
    );
    
    const contentContainer = container.querySelector('.px-6.py-4');
    expect(contentContainer).toHaveClass('custom-content-class');
  });

  it('has scrollable content with proper overflow and max-height classes', () => {
    const { container } = render(
      <Dialog isOpen={true} onClose={() => {}}>
        <div style={{ height: '1000px' }}>Tall content that should be scrollable</div>
      </Dialog>
    );
    
    const contentContainer = container.querySelector('.px-6.py-4');
    expect(contentContainer).toHaveClass('overflow-y-auto');
    expect(contentContainer).toHaveClass('max-h-[calc(100vh-10rem)]');
  });

  it('applies headerClassName to the header container', () => {
    const { container } = render(
      <Dialog 
        isOpen={true} 
        onClose={() => {}} 
        title="Dialog Title"
        headerClassName="custom-header-class"
      >
        Dialog with custom header class
      </Dialog>
    );
    
    const headerContainer = container.querySelector('.border-b.border-gray-200');
    expect(headerContainer).toHaveClass('custom-header-class');
  });

  it('applies footerClassName to the footer container', () => {
    const { container } = render(
      <Dialog 
        isOpen={true} 
        onClose={() => {}} 
        footer={<button>Footer Button</button>}
        footerClassName="custom-footer-class"
      >
        Dialog with custom footer class
      </Dialog>
    );
    
    const footerContainer = container.querySelector('.bg-gray-50');
    expect(footerContainer).toHaveClass('custom-footer-class');
  });

  it('applies titleClassName to the title element', () => {
    const { container } = render(
      <Dialog 
        isOpen={true} 
        onClose={() => {}} 
        title="Dialog Title"
        titleClassName="custom-title-class"
      >
        Dialog with custom title class
      </Dialog>
    );
    
    const titleElement = container.querySelector('h3');
    expect(titleElement).toHaveClass('custom-title-class');
  });

  it('applies descriptionClassName to the description element', () => {
    const { container } = render(
      <Dialog 
        isOpen={true} 
        onClose={() => {}} 
        title="Dialog Title"
        description="Dialog Description"
        descriptionClassName="custom-description-class"
      >
        Dialog with custom description class
      </Dialog>
    );
    
    const descriptionElement = container.querySelector('p');
    expect(descriptionElement).toHaveClass('custom-description-class');
  });

  it('cleans up event listeners when unmounted', async () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = render(
      <Dialog isOpen={true} onClose={() => {}}>
        Test Content
      </Dialog>
    );
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalled();
    removeEventListenerSpy.mockRestore();
  });
});

describe('ConfirmDialog Component', () => {
  it('renders confirm and cancel buttons', () => {
    render(
      <ConfirmDialog 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={() => {}}
        title="Confirm Action"
      >
        Are you sure?
      </ConfirmDialog>
    );
    
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('allows customizing confirm and cancel button text', () => {
    render(
      <ConfirmDialog 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={() => {}}
        confirmText="Yes, do it"
        cancelText="No, go back"
      >
        Are you sure?
      </ConfirmDialog>
    );
    
    expect(screen.getByText('Yes, do it')).toBeInTheDocument();
    expect(screen.getByText('No, go back')).toBeInTheDocument();
  });

  it('calls onConfirm and onClose when confirm button is clicked', () => {
    const handleConfirm = jest.fn();
    const handleClose = jest.fn();
    
    render(
      <ConfirmDialog 
        isOpen={true} 
        onConfirm={handleConfirm} 
        onClose={handleClose}
      >
        Are you sure?
      </ConfirmDialog>
    );
    
    fireEvent.click(screen.getByText('Confirm'));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    const handleConfirm = jest.fn();
    const handleClose = jest.fn();
    
    render(
      <ConfirmDialog 
        isOpen={true} 
        onConfirm={handleConfirm} 
        onClose={handleClose}
      >
        Are you sure?
      </ConfirmDialog>
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(handleConfirm).not.toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders confirm button with danger variant when destructive is true', () => {
    render(
      <ConfirmDialog 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={() => {}}
        destructive={true}
      >
        Are you sure?
      </ConfirmDialog>
    );
    
    // Find the confirm button with variant="danger"
    const confirmButtons = screen.getAllByRole('button');
    // Assuming the confirm button is the second button (after cancel)
    expect(confirmButtons[1]).toHaveTextContent('Confirm');
    // Look for any class that contains "danger" or similar indicator
    const hasErrorClass = confirmButtons[1].className.includes('danger') || 
                          confirmButtons[1].className.includes('red') ||
                          confirmButtons[1].className.includes('error');
    expect(hasErrorClass).toBeTruthy();
  });

  it('passes through Dialog props to the underlying Dialog component', () => {
    render(
      <ConfirmDialog 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={() => {}}
        size="lg"
        className="custom-confirm-dialog"
        title="Custom Title"
      >
        Are you sure?
      </ConfirmDialog>
    );
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    // Check that the dialog container has the custom class
    // This test is more flexible as it checks if the class is present anywhere in the tree
    const dialogContainer = screen.getByRole('dialog').parentElement;
    expect(dialogContainer?.innerHTML).toContain('custom-confirm-dialog');
  });
}); 