import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CarTypeBadge from './CarTypeBadge';

describe('CarTypeBadge', () => {
  it('renders car type and count correctly', () => {
    render(<CarTypeBadge type="FB" count={5} description="Flatcar BlhHd" />);
    
    // Check that both type and count are displayed
    expect(screen.getByText('FB')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('applies correct styling', () => {
    render(<CarTypeBadge type="FB" count={5} description="Flatcar BlhHd" />);
    const badge = screen.getByText('FB').parentElement;
    
    // Check basic styling
    expect(badge).toHaveStyle({
      display: 'inline-flex',
      border: '1px solid',
      padding: '4px 8px 4px 8px'
    });
  });

  it('shows description in tooltip', () => {
    render(<CarTypeBadge type="FB" count={5} description="Flatcar BlhHd" />);
    
    // Check that tooltip content is present in the DOM
    expect(screen.getByLabelText('Flatcar BlhHd')).toBeInTheDocument();
  });

  it('shows default tooltip when description is empty', () => {
    render(<CarTypeBadge type="FB" count={5} description="" />);
    
    // Check that default tooltip content is present in the DOM
    expect(screen.getByLabelText('FB car')).toBeInTheDocument();
  });

  it('handles different car types and counts', () => {
    const { rerender } = render(<CarTypeBadge type="FBC" count={1} description="Flatcar" />);
    expect(screen.getByText('FBC')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByLabelText('Flatcar')).toBeInTheDocument();
    
    rerender(<CarTypeBadge type="BOX" count={10} description="Boxcar" />);
    expect(screen.getByText('BOX')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByLabelText('Boxcar')).toBeInTheDocument();
  });
}); 