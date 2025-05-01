import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Dropdown, DropdownItem } from '../dropdown';

describe('Dropdown Component', () => {
  it('renders the trigger button correctly', () => {
    render(
      <Dropdown trigger={<button>Menu</button>}>
        <DropdownItem>Item 1</DropdownItem>
        <DropdownItem>Item 2</DropdownItem>
      </Dropdown>
    );
    
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('does not show menu items initially', () => {
    render(
      <Dropdown trigger={<button>Menu</button>}>
        <DropdownItem>Item 1</DropdownItem>
        <DropdownItem>Item 2</DropdownItem>
      </Dropdown>
    );
    
    const menuItem1 = screen.getByText('Item 1');
    const menuItem2 = screen.getByText('Item 2');
    
    expect(menuItem1.closest('[role="menu"]')).toHaveClass('hidden');
    expect(menuItem2.closest('[role="menu"]')).toHaveClass('hidden');
  });

  it('shows menu items when trigger is clicked', async () => {
    render(
      <Dropdown trigger={<button>Menu</button>}>
        <DropdownItem>Item 1</DropdownItem>
        <DropdownItem>Item 2</DropdownItem>
      </Dropdown>
    );
    
    fireEvent.click(screen.getByText('Menu'));
    
    const menuItem1 = screen.getByText('Item 1');
    const menuItem2 = screen.getByText('Item 2');
    
    await waitFor(() => {
      expect(menuItem1.closest('[role="menu"]')).not.toHaveClass('hidden');
      expect(menuItem2.closest('[role="menu"]')).not.toHaveClass('hidden');
    });
  });

  it('calls onClick handler when dropdown item is clicked', async () => {
    const handleClick = jest.fn();
    
    render(
      <Dropdown trigger={<button>Menu</button>}>
        <DropdownItem onClick={handleClick}>Item 1</DropdownItem>
        <DropdownItem>Item 2</DropdownItem>
      </Dropdown>
    );
    
    // Open dropdown
    fireEvent.click(screen.getByText('Menu'));
    
    // Click item
    await waitFor(() => {
      fireEvent.click(screen.getByText('Item 1'));
    });
    
    expect(handleClick).toHaveBeenCalled();
  });

  it('closes dropdown when an item is clicked', async () => {
    render(
      <Dropdown trigger={<button>Menu</button>}>
        <DropdownItem>Item 1</DropdownItem>
        <DropdownItem>Item 2</DropdownItem>
      </Dropdown>
    );
    
    // Open dropdown
    fireEvent.click(screen.getByText('Menu'));
    
    const menuItem1 = screen.getByText('Item 1');
    
    // Verify it's open
    await waitFor(() => {
      expect(menuItem1.closest('[role="menu"]')).not.toHaveClass('hidden');
    });
    
    // Click item
    fireEvent.click(menuItem1);
    
    // Verify it's closed
    await waitFor(() => {
      expect(menuItem1.closest('[role="menu"]')).toHaveClass('hidden');
    });
  });

  it('supports custom className for dropdown items', async () => {
    render(
      <Dropdown trigger={<button>Menu</button>}>
        <DropdownItem className="custom-item">Item 1</DropdownItem>
      </Dropdown>
    );
    
    expect(screen.getByText('Item 1')).toHaveClass('custom-item');
  });

  it('supports disabled dropdown items', async () => {
    const handleClick = jest.fn();
    
    render(
      <Dropdown trigger={<button>Menu</button>}>
        <DropdownItem disabled onClick={handleClick}>Disabled Item</DropdownItem>
      </Dropdown>
    );
    
    expect(screen.getByText('Disabled Item')).toHaveClass('opacity-50');
    expect(screen.getByText('Disabled Item')).toBeDisabled();
  });
}); 