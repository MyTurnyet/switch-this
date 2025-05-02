import React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from '../input';

describe('Input Component', () => {
  it('renders a basic input correctly', () => {
    render(<Input placeholder="Enter value" />);
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" placeholder="Test" />);
    const input = screen.getByPlaceholderText('Test');
    expect(input).toHaveClass('custom-class');
  });

  it('renders with a label', () => {
    render(<Input label="Username" placeholder="Enter username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  it('renders with an error message', () => {
    render(<Input error="This field is required" placeholder="Test" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText('Test');
    expect(input).toHaveClass('border-red-500');
    expect(input).toHaveClass('focus:border-red-500');
    expect(input).toHaveClass('focus:ring-red-500');
  });

  it('renders as fullWidth', () => {
    render(<Input fullWidth placeholder="Test" />);
    const container = screen.getByPlaceholderText('Test').closest('div')?.parentElement;
    expect(container).toHaveClass('w-full');
  });

  it('renders with leftIcon', () => {
    const leftIcon = <svg data-testid="left-icon" />;
    render(<Input leftIcon={leftIcon} placeholder="Test" />);
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('Test');
    expect(input).toHaveClass('pl-10');
  });

  it('renders with rightIcon', () => {
    const rightIcon = <svg data-testid="right-icon" />;
    render(<Input rightIcon={rightIcon} placeholder="Test" />);
    
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('Test');
    expect(input).toHaveClass('pr-10');
  });

  it('does not show rightIcon when error is present', () => {
    const rightIcon = <svg data-testid="right-icon" />;
    render(<Input rightIcon={rightIcon} error="Error message" placeholder="Test" />);
    
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    // Should show error icon instead
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('applies disabled styles when disabled', () => {
    render(<Input disabled placeholder="Test" />);
    const input = screen.getByPlaceholderText('Test');
    
    expect(input).toBeDisabled();
    expect(input).toHaveClass('cursor-not-allowed');
    expect(input).toHaveClass('bg-gray-50');
    expect(input).toHaveClass('text-gray-500');
  });

  it('forwards ref to the input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} placeholder="Test" />);
    
    expect(ref.current).toEqual(screen.getByPlaceholderText('Test'));
  });

  it('passes HTML attributes to the input element', () => {
    render(
      <Input 
        placeholder="Test" 
        id="test-id"
        name="test-name"
        type="email"
        maxLength={50}
        autoComplete="off"
        required
      />
    );
    
    const input = screen.getByPlaceholderText('Test');
    expect(input).toHaveAttribute('id', 'test-id');
    expect(input).toHaveAttribute('name', 'test-name');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('maxLength', '50');
    expect(input).toHaveAttribute('autoComplete', 'off');
    expect(input).toHaveAttribute('required');
  });
}); 