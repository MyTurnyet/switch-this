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
    expect(card).toHaveClass(
      'bg-white',
      'p-8',
      'rounded-xl',
      'shadow-lg',
      'hover:shadow-xl',
      'transition-all',
      'duration-300',
      'transform',
      'hover:-translate-y-1',
      'border',
      'border-gray-100'
    );
    
    const countContainer = screen.getByText('0').parentElement;
    expect(countContainer).toHaveClass(
      'text-5xl',
      'font-bold',
      'text-indigo-600',
      'mb-2'
    );
    
    const labelElement = screen.getByText('Test');
    expect(labelElement).toHaveClass(
      'text-gray-600',
      'text-lg',
      'font-medium'
    );
  });

  it('shows loading animation when isLoading is true', () => {
    render(<StatCard count={0} label="Test" isLoading={true} />);
    
    const loadingElement = screen.getByText('...');
    expect(loadingElement).toHaveClass('animate-pulse');
  });

  it('applies gradient text to the count when not loading', () => {
    render(<StatCard count={42} label="Test" />);
    
    const countElement = screen.getByText('42');
    expect(countElement).toHaveClass(
      'bg-gradient-to-r',
      'from-indigo-600',
      'to-blue-600',
      'bg-clip-text',
      'text-transparent'
    );
  });
}); 