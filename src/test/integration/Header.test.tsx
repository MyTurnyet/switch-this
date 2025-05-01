import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/shared/components/Header';

describe('Header Integration', () => {
  it('renders with all navigation elements', () => {
    render(<Header />);
    
    // Check for logo/title
    const title = screen.getByText('Switch This');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('text-2xl', 'font-bold');
    
    // Check for main navigation links
    const homeLink = screen.getByText('Home');
    const aboutLink = screen.getByText('About');
    const layoutStateLink = screen.getByText('Layout State');
    const adminButton = screen.getByText('Admin');
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(aboutLink).toHaveAttribute('href', '/about');
    expect(layoutStateLink).toHaveAttribute('href', '/layout-state');
    
    // Admin should be a button rather than a link
    expect(adminButton.tagName).toBe('BUTTON');
  });

  it('displays admin dropdown links when clicking Admin', () => {
    render(<Header />);
    
    // No dropdown items visible initially
    expect(screen.queryByText('Industries')).not.toBeInTheDocument();
    
    // Click admin button
    const adminButton = screen.getByText('Admin');
    fireEvent.click(adminButton);
    
    // Check dropdown links appear
    const industriesLink = screen.getByText('Industries');
    const rollingStockLink = screen.getByText('Rolling Stock');
    const trainRoutesLink = screen.getByText('Train Routes');
    
    expect(industriesLink).toHaveAttribute('href', '/industries');
    expect(rollingStockLink).toHaveAttribute('href', '/rolling-stock');
    expect(trainRoutesLink).toHaveAttribute('href', '/train-routes');
  });

  it('has proper semantic structure', () => {
    render(<Header />);
    
    const header = screen.getByRole('banner');
    const nav = screen.getByRole('navigation');
    
    expect(header).toBeInTheDocument();
    expect(nav).toBeInTheDocument();
    expect(header.contains(nav)).toBe(true);
  });

  it('applies proper styling for modern look', () => {
    render(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-white', 'border-b', 'border-gray-200', 'sticky', 'top-0', 'z-50');
    
    const logo = screen.getByText('Switch This');
    expect(logo).toHaveClass('bg-gradient-to-r', 'from-primary-600', 'to-secondary-600', 'bg-clip-text', 'text-transparent');
  });

  it('closes dropdown when clicking outside', () => {
    render(<Header />);
    
    // Open dropdown
    const adminButton = screen.getByText('Admin');
    fireEvent.click(adminButton);
    
    // Verify it's open
    expect(screen.getByText('Industries')).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    // Verify it's closed
    expect(screen.queryByText('Industries')).not.toBeInTheDocument();
  });
}); 