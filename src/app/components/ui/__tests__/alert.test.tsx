import React from 'react';
import { render, screen } from '@testing-library/react';
import { Alert } from '../alert';

describe('Alert Component', () => {
  it('renders with default variant', () => {
    render(<Alert>Default alert content</Alert>);
    expect(screen.getByText('Default alert content')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    // Testing different variants
    const { rerender } = render(<Alert variant="info">Info variant</Alert>);
    expect(screen.getByText('Info variant')).toBeInTheDocument();
    
    rerender(<Alert variant="success">Success variant</Alert>);
    expect(screen.getByText('Success variant')).toBeInTheDocument();
    
    rerender(<Alert variant="warning">Warning variant</Alert>);
    expect(screen.getByText('Warning variant')).toBeInTheDocument();
    
    rerender(<Alert variant="error">Error variant</Alert>);
    expect(screen.getByText('Error variant')).toBeInTheDocument();
    
    rerender(<Alert variant="primary">Primary variant</Alert>);
    expect(screen.getByText('Primary variant')).toBeInTheDocument();
    
    rerender(<Alert variant="secondary">Secondary variant</Alert>);
    expect(screen.getByText('Secondary variant')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(
      <Alert title="Alert Title">
        Alert Description
      </Alert>
    );
    
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
    expect(screen.getByText('Alert Description')).toBeInTheDocument();
  });

  it('applies custom classNames', () => {
    // Mock implementation - just test that the custom class is passed to the component
    // Instead of trying to check the actual DOM structure which may be complex
    const { container } = render(
      <Alert className="custom-class">
        Alert with custom class
      </Alert>
    );
    
    // Verify the component contains our expected text
    expect(screen.getByText('Alert with custom class')).toBeInTheDocument();
    
    // Verify our custom class was applied somewhere in the component tree
    expect(container.innerHTML).toContain('custom-class');
  });
  
  it('renders with custom icon', () => {
    const customIcon = <svg data-testid="custom-icon" />;
    render(
      <Alert icon={customIcon}>
        Alert with custom icon
      </Alert>
    );
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
  
  it('renders close button when onClose is provided', () => {
    const handleClose = jest.fn();
    render(
      <Alert onClose={handleClose}>
        Dismissible alert
      </Alert>
    );
    
    expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
  });
}); 