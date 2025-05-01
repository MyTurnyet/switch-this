import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { Toast, ToastProvider, useToast } from '../toast';

// Mock component to test useToast hook
const ToastDemo = () => {
  const { toast } = useToast();
  
  return (
    <div>
      <button 
        onClick={() => toast({ title: 'Success', description: 'Operation completed', variant: 'success' })}
        data-testid="success-toast"
      >
        Show Success Toast
      </button>
      <button 
        onClick={() => toast({ title: 'Error', description: 'Something went wrong', variant: 'error' })}
        data-testid="error-toast"
      >
        Show Error Toast
      </button>
      <button 
        onClick={() => toast({ title: 'Info', description: 'Just FYI' })}
        data-testid="info-toast"
      >
        Show Info Toast
      </button>
    </div>
  );
};

describe('Toast Component', () => {
  beforeEach(() => {
    // Clear any previous toasts
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders toast with correct content', async () => {
    render(
      <ToastProvider>
        <ToastDemo />
      </ToastProvider>
    );
    
    // Click button to show toast
    fireEvent.click(screen.getByTestId('success-toast'));
    
    // Verify toast is shown with correct content
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
    
    // Auto-dismiss should happen after default timeout
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Toast should be removed
    await waitFor(() => {
      expect(screen.queryByText('Success')).not.toBeInTheDocument();
    });
  });

  it('supports different toast variants', () => {
    render(
      <ToastProvider>
        <ToastDemo />
      </ToastProvider>
    );
    
    // Show error toast
    fireEvent.click(screen.getByTestId('error-toast'));
    
    // Verify error toast has the appropriate styling
    const toast = screen.getByText('Error').closest('[role="alert"]');
    expect(toast).toHaveClass('bg-red-100');
    
    // Dismiss current toast
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Show info toast
    fireEvent.click(screen.getByTestId('info-toast'));
    
    // Verify info toast exists and has default styling
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('allows dismissing toast manually', () => {
    render(
      <ToastProvider>
        <ToastDemo />
      </ToastProvider>
    );
    
    // Show success toast
    fireEvent.click(screen.getByTestId('success-toast'));
    
    // Find close button and click it
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    
    // Toast should be removed immediately
    expect(screen.queryByText('Success')).not.toBeInTheDocument();
  });

  it('stacks multiple toasts', () => {
    render(
      <ToastProvider>
        <ToastDemo />
      </ToastProvider>
    );
    
    // Show multiple toasts
    fireEvent.click(screen.getByTestId('success-toast'));
    fireEvent.click(screen.getByTestId('error-toast'));
    fireEvent.click(screen.getByTestId('info-toast'));
    
    // All toasts should be visible
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
    
    // Toasts container should have appropriate stacking class
    const toastsContainer = screen.getAllByRole('alert')[0].parentElement;
    expect(toastsContainer).toHaveClass('space-y-2');
  });
}); 