import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle } from '../toggle';

describe('Toggle', () => {
  test('renders toggle with label when provided', () => {
    render(
      <Toggle checked={false} onChange={() => {}} label="Toggle Label" />
    );
    
    expect(screen.getByTestId('toggle-label')).toHaveTextContent('Toggle Label');
  });
  
  test('renders toggle without label when not provided', () => {
    render(
      <Toggle checked={false} onChange={() => {}} />
    );
    
    expect(screen.queryByTestId('toggle-label')).not.toBeInTheDocument();
  });
  
  test('renders toggle in checked state when checked is true', () => {
    render(
      <Toggle checked={true} onChange={() => {}} color="primary" />
    );
    
    // Check that background color is applied for checked state
    const toggle = screen.getByTestId('toggle-input').nextElementSibling;
    expect(toggle).toHaveClass('bg-primary-600');
  });
  
  test('renders toggle in unchecked state when checked is false', () => {
    render(
      <Toggle checked={false} onChange={() => {}} />
    );
    
    // Check that background color is gray for unchecked state
    const toggle = screen.getByTestId('toggle-input').nextElementSibling;
    expect(toggle).toHaveClass('bg-gray-300');
  });

  test('calls onChange handler when toggled', () => {
    const handleChange = jest.fn();
    render(
      <Toggle checked={false} onChange={handleChange} />
    );
    
    fireEvent.click(screen.getByTestId('toggle-input'));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true);
  });
  
  test('is disabled when disabled prop is true', () => {
    render(
      <Toggle checked={false} onChange={() => {}} disabled={true} />
    );
    
    expect(screen.getByTestId('toggle-input')).toBeDisabled();
    expect(screen.getByTestId('toggle-input').closest('label')).toHaveClass('opacity-50');
  });
  
  test('applies small size properly', () => {
    render(
      <Toggle checked={false} onChange={() => {}} size="sm" />
    );
    
    const toggle = screen.getByTestId('toggle-input').nextElementSibling;
    expect(toggle).toHaveClass('w-8', 'h-4');
  });
  
  test('applies medium size properly', () => {
    render(
      <Toggle checked={false} onChange={() => {}} size="md" />
    );
    
    const toggle = screen.getByTestId('toggle-input').nextElementSibling;
    expect(toggle).toHaveClass('w-11', 'h-6');
  });
  
  test('applies large size properly', () => {
    render(
      <Toggle checked={false} onChange={() => {}} size="lg" />
    );
    
    const toggle = screen.getByTestId('toggle-input').nextElementSibling;
    expect(toggle).toHaveClass('w-14', 'h-7');
  });
  
  test('applies different color variants', () => {
    const { rerender } = render(
      <Toggle checked={true} onChange={() => {}} color="primary" />
    );
    
    let toggle = screen.getByTestId('toggle-input').nextElementSibling;
    expect(toggle).toHaveClass('bg-primary-600');
    
    rerender(
      <Toggle checked={true} onChange={() => {}} color="secondary" />
    );
    toggle = screen.getByTestId('toggle-input').nextElementSibling;
    expect(toggle).toHaveClass('bg-secondary-600');
    
    rerender(
      <Toggle checked={true} onChange={() => {}} color="success" />
    );
    toggle = screen.getByTestId('toggle-input').nextElementSibling;
    expect(toggle).toHaveClass('bg-green-600');
    
    rerender(
      <Toggle checked={true} onChange={() => {}} color="danger" />
    );
    toggle = screen.getByTestId('toggle-input').nextElementSibling;
    expect(toggle).toHaveClass('bg-red-600');
  });
  
  test('applies custom class names', () => {
    render(
      <Toggle 
        checked={false} 
        onChange={() => {}} 
        className="custom-class" 
        labelClassName="custom-label-class" 
      />
    );
    
    expect(screen.getByTestId('toggle-input').closest('label')).toHaveClass('custom-class');
  });
}); 