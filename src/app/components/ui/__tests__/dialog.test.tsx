import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog, ConfirmDialog } from '../dialog';

describe('Dialog', () => {
  test('renders nothing when isOpen is false', () => {
    render(
      <Dialog isOpen={false} onClose={() => {}}>
        Dialog content
      </Dialog>
    );
    
    expect(screen.queryByText('Dialog content')).not.toBeInTheDocument();
  });

  test('renders content when isOpen is true', () => {
    render(
      <Dialog isOpen={true} onClose={() => {}}>
        Dialog content
      </Dialog>
    );
    
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  test('renders title and description when provided', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        title="Dialog Title"
        description="Dialog description"
      >
        Dialog content
      </Dialog>
    );
    
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Dialog description')).toBeInTheDocument();
  });

  test('calls onClose when backdrop is clicked', () => {
    const onClose = jest.fn();
    render(
      <Dialog isOpen={true} onClose={onClose} closeOnClickOutside={true}>
        Dialog content
      </Dialog>
    );
    
    fireEvent.click(screen.getByTestId('dialog-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('does not call onClose when dialog content is clicked', () => {
    const onClose = jest.fn();
    render(
      <Dialog isOpen={true} onClose={onClose}>
        Dialog content
      </Dialog>
    );
    
    fireEvent.click(screen.getByText('Dialog content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  test('does not call onClose when backdrop is clicked and closeOnClickOutside is false', () => {
    const onClose = jest.fn();
    render(
      <Dialog isOpen={true} onClose={onClose} closeOnClickOutside={false}>
        Dialog content
      </Dialog>
    );
    
    fireEvent.click(screen.getByTestId('dialog-backdrop'));
    expect(onClose).not.toHaveBeenCalled();
  });

  test('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(
      <Dialog isOpen={true} onClose={onClose} showCloseButton={true}>
        Dialog content
      </Dialog>
    );
    
    fireEvent.click(screen.getByTestId('dialog-close-button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('applies different size classes correctly', () => {
    const { rerender } = render(
      <Dialog isOpen={true} onClose={() => {}} size="sm">
        Dialog content
      </Dialog>
    );
    
    expect(screen.getByRole('dialog')).toHaveClass('max-w-sm');
    
    rerender(
      <Dialog isOpen={true} onClose={() => {}} size="lg">
        Dialog content
      </Dialog>
    );
    
    expect(screen.getByRole('dialog')).toHaveClass('max-w-lg');
  });

  test('renders footer when provided', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        footer={<button>Footer Button</button>}
      >
        Dialog content
      </Dialog>
    );
    
    expect(screen.getByText('Footer Button')).toBeInTheDocument();
  });

  test('calls onClose when escape key is pressed', () => {
    const onClose = jest.fn();
    render(
      <Dialog isOpen={true} onClose={onClose}>
        Dialog content
      </Dialog>
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('ConfirmDialog', () => {
  test('renders confirm and cancel buttons', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        confirmText="Yes"
        cancelText="No"
      >
        Confirm dialog content
      </ConfirmDialog>
    );
    
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  test('calls onConfirm and onClose when confirm button is clicked', () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
      >
        Confirm dialog content
      </ConfirmDialog>
    );
    
    fireEvent.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when cancel button is clicked', () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
      >
        Confirm dialog content
      </ConfirmDialog>
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('uses destructive variant for confirm button when destructive is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        destructive={true}
      >
        Confirm dialog content
      </ConfirmDialog>
    );
    
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton.closest('button')).toHaveClass('bg-red-600');
  });
}); 