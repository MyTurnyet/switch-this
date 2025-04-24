import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorView } from '@/app/components/ErrorView';

describe('ErrorView', () => {
  it('renders error message', () => {
    const testMessage = 'Test error message';
    render(<ErrorView message={testMessage} />);
    
    expect(screen.getByText(testMessage)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('applies error styling', () => {
    render(<ErrorView message="Test" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-red-100', 'border', 'border-red-400', 'text-red-700', 'rounded');
  });
}); 