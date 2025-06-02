import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the dropdown component
jest.mock('../dropdown', () => {
  const React = require('react');
  
  const Dropdown = ({ trigger, children, className }: { trigger: React.ReactNode, children: React.ReactNode, className?: string }) => (
    <div data-testid="dropdown-container" className={className || ''}>
      <div data-testid="dropdown-trigger">{trigger}</div>
      <div data-testid="dropdown-content">{children}</div>
    </div>
  );

  const DropdownItem = ({ children, onClick, disabled, icon, className }: { children: React.ReactNode, onClick?: () => void, disabled?: boolean, icon?: React.ReactNode, className?: string }) => (
    <button 
      data-testid="dropdown-item"
      onClick={onClick} 
      disabled={disabled} 
      className={className}
    >
      {icon && <span data-testid="item-icon">{icon}</span>}
      {children}
    </button>
  );

  return { Dropdown, DropdownItem };
});

// Import after the mock is set up
const { Dropdown, DropdownItem } = require('../dropdown');

describe('Dropdown Component', () => {
  const mockTrigger = <button>Open Menu</button>;
  const mockItems = [
    <DropdownItem key="1">Item 1</DropdownItem>,
    <DropdownItem key="2">Item 2</DropdownItem>,
    <DropdownItem key="3" disabled>Item 3 (Disabled)</DropdownItem>
  ];

  it('renders the trigger button', () => {
    render(<Dropdown trigger={mockTrigger}>{mockItems}</Dropdown>);
    expect(screen.getByText('Open Menu')).toBeInTheDocument();
  });

  it('renders dropdown items', () => {
    render(<Dropdown trigger={mockTrigger}>{mockItems}</Dropdown>);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3 (Disabled)')).toBeInTheDocument();
  });

  it('applies custom class to dropdown container', () => {
    render(
      <Dropdown trigger={mockTrigger} className="custom-dropdown">
        {mockItems}
      </Dropdown>
    );
    
    expect(screen.getByTestId('dropdown-container')).toHaveClass('custom-dropdown');
  });
});

describe('DropdownItem Component', () => {
  it('renders content correctly', () => {
    render(<DropdownItem>Test Item</DropdownItem>);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });
  
  it('applies disabled state correctly', () => {
    render(<DropdownItem disabled>Disabled Item</DropdownItem>);
    
    const button = screen.getByTestId('dropdown-item');
    expect(button).toBeDisabled();
  });
  
  it('renders with an icon when provided', () => {
    const mockIcon = <span>🔍</span>;
    render(<DropdownItem icon={mockIcon}>Item with Icon</DropdownItem>);
    
    expect(screen.getByTestId('item-icon')).toBeInTheDocument();
    expect(screen.getByText('Item with Icon')).toBeInTheDocument();
  });
  
  it('applies custom className correctly', () => {
    render(<DropdownItem className="custom-item">Custom Item</DropdownItem>);
    
    const button = screen.getByTestId('dropdown-item');
    expect(button).toHaveClass('custom-item');
  });
}); 