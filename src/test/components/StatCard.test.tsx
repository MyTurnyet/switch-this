import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatCard } from '@/app/components/StatCard';

describe('StatCard', () => {
  it('renders the count and label correctly', () => {
    const testCount = 42;
    const testLabel = 'Test Statistic';
    
    render(<StatCard count={testCount} label={testLabel} />);
    
    expect(screen.getByText(testCount.toString())).toBeInTheDocument();
    expect(screen.getByText(testLabel)).toBeInTheDocument();
  });

  it('applies the correct styling classes', () => {
    render(<StatCard count={0} label="Test" />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveClass('bg-white', 'p-6', 'rounded-lg', 'shadow-md');
    
    const countElement = screen.getByText('0');
    expect(countElement).toHaveClass('text-4xl', 'font-bold', 'text-blue-600');
    
    const labelElement = screen.getByText('Test');
    expect(labelElement).toHaveClass('text-gray-600', 'mt-2');
  });
}); 