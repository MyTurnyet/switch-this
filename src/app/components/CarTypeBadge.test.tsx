import React from 'react';
import { render, screen } from '@testing-library/react';
import CarTypeBadge from './CarTypeBadge';

describe('CarTypeBadge', () => {
  it('renders car type and count correctly', () => {
    render(<CarTypeBadge type="FB" count={5} />);
    
    // Check that both type and count are displayed
    expect(screen.getByText('FB')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('applies correct styling', () => {
    render(<CarTypeBadge type="FB" count={5} />);
    const badge = screen.getByText('FB').parentElement;
    
    // Check basic styling
    expect(badge).toHaveStyle({
      display: 'inline-flex',
      border: '1px solid',
      padding: '4px 8px 4px 8px'
    });
  });

  it('shows tooltip on hover', () => {
    render(<CarTypeBadge type="FB" count={5} />);
    
    // Check that tooltip content is present in the DOM
    expect(screen.getByLabelText('FB: 5 cars')).toBeInTheDocument();
  });

  it('handles different car types and counts', () => {
    const { rerender } = render(<CarTypeBadge type="FBC" count={1} />);
    expect(screen.getByText('FBC')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    
    rerender(<CarTypeBadge type="BOX" count={10} />);
    expect(screen.getByText('BOX')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
}); 