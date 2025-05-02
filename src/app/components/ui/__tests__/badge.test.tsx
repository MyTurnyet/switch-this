import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';

describe('Badge Component', () => {
  it('renders children correctly', () => {
    render(<Badge>Badge Text</Badge>);
    expect(screen.getByText('Badge Text')).toBeInTheDocument();
  });

  it('renders with default props', () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText('Default Badge');
    expect(badge).toHaveClass('bg-primary-100');
    expect(badge).toHaveClass('text-primary-800');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);
    const badge = screen.getByText('Custom Badge');
    expect(badge).toHaveClass('custom-class');
  });

  it('renders all variants correctly', () => {
    const variants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'gray'] as const;
    
    const { rerender } = render(<Badge>Variant Badge</Badge>);
    
    for (const variant of variants) {
      rerender(<Badge variant={variant}>Variant Badge</Badge>);
      const badge = screen.getByText('Variant Badge');
      
      if (variant === 'primary') {
        expect(badge).toHaveClass('bg-primary-100');
        expect(badge).toHaveClass('text-primary-800');
      } else if (variant === 'secondary') {
        expect(badge).toHaveClass('bg-secondary-100');
        expect(badge).toHaveClass('text-secondary-800');
      } else if (variant === 'success') {
        expect(badge).toHaveClass('bg-green-100');
        expect(badge).toHaveClass('text-green-800');
      } else if (variant === 'danger') {
        expect(badge).toHaveClass('bg-red-100');
        expect(badge).toHaveClass('text-red-800');
      } else if (variant === 'warning') {
        expect(badge).toHaveClass('bg-amber-100');
        expect(badge).toHaveClass('text-amber-800');
      } else if (variant === 'info') {
        expect(badge).toHaveClass('bg-blue-100');
        expect(badge).toHaveClass('text-blue-800');
      } else if (variant === 'gray') {
        expect(badge).toHaveClass('bg-gray-100');
        expect(badge).toHaveClass('text-gray-800');
      }
    }
  });

  it('renders all sizes correctly', () => {
    const sizes = ['xs', 'sm', 'md', 'lg'] as const;
    
    const { rerender } = render(<Badge>Size Badge</Badge>);
    
    for (const size of sizes) {
      rerender(<Badge size={size}>Size Badge</Badge>);
      const badge = screen.getByText('Size Badge');
      
      if (size === 'xs') {
        expect(badge).toHaveClass('text-xs px-1.5 py-0.5');
      } else if (size === 'sm') {
        expect(badge).toHaveClass('text-xs px-2 py-0.5');
      } else if (size === 'md') {
        expect(badge).toHaveClass('text-sm px-2.5 py-0.5');
      } else if (size === 'lg') {
        expect(badge).toHaveClass('text-base px-3 py-1');
      }
    }
  });

  it('renders outlined badges correctly', () => {
    const variants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'gray'] as const;
    
    const { rerender } = render(<Badge outlined>Outlined Badge</Badge>);
    let badge = screen.getByText('Outlined Badge');
    expect(badge).toHaveClass('bg-white');
    expect(badge).toHaveClass('border');
    
    for (const variant of variants) {
      rerender(<Badge variant={variant} outlined>Outlined Badge</Badge>);
      badge = screen.getByText('Outlined Badge');
      
      if (variant === 'primary') {
        expect(badge).toHaveClass('text-primary-700');
        expect(badge).toHaveClass('border-primary-300');
      } else if (variant === 'secondary') {
        expect(badge).toHaveClass('text-secondary-700');
        expect(badge).toHaveClass('border-secondary-300');
      } else if (variant === 'success') {
        expect(badge).toHaveClass('text-green-700');
        expect(badge).toHaveClass('border-green-300');
      } else if (variant === 'danger') {
        expect(badge).toHaveClass('text-red-700');
        expect(badge).toHaveClass('border-red-300');
      } else if (variant === 'warning') {
        expect(badge).toHaveClass('text-amber-700');
        expect(badge).toHaveClass('border-amber-300');
      } else if (variant === 'info') {
        expect(badge).toHaveClass('text-blue-700');
        expect(badge).toHaveClass('border-blue-300');
      } else if (variant === 'gray') {
        expect(badge).toHaveClass('text-gray-700');
        expect(badge).toHaveClass('border-gray-300');
      }
    }
  });

  it('combines variant, size and outlined props correctly', () => {
    render(
      <Badge 
        variant="success" 
        size="lg" 
        outlined
      >
        Combined Badge
      </Badge>
    );
    
    const badge = screen.getByText('Combined Badge');
    expect(badge).toHaveClass('bg-white');
    expect(badge).toHaveClass('text-green-700');
    expect(badge).toHaveClass('border-green-300');
    expect(badge).toHaveClass('text-base');
    expect(badge).toHaveClass('px-3');
    expect(badge).toHaveClass('py-1');
  });
}); 