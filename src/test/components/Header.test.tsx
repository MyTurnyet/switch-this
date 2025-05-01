import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/shared/components/Header';

describe('Header', () => {
  it('renders the site title', () => {
    render(<Header />);
    const titleElement = screen.getByText(/Switch This/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders main navigation links', () => {
    render(<Header />);
    const homeLink = screen.getByText(/Home/i);
    const aboutLink = screen.getByText(/About/i);
    const layoutStateLink = screen.getByText(/Layout State/i);
    const adminButton = screen.getByText(/Admin/i);
    
    expect(homeLink).toBeInTheDocument();
    expect(aboutLink).toBeInTheDocument();
    expect(layoutStateLink).toBeInTheDocument();
    expect(adminButton).toBeInTheDocument();
  });

  it('has correct navigation links with proper href attributes', () => {
    render(<Header />);
    const homeLink = screen.getByText(/Home/i);
    const aboutLink = screen.getByText(/About/i);
    const layoutStateLink = screen.getByText(/Layout State/i);
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(aboutLink).toHaveAttribute('href', '/about');
    expect(layoutStateLink).toHaveAttribute('href', '/layout-state');
  });

  it('shows admin dropdown items when admin is clicked', () => {
    render(<Header />);
    
    // Admin dropdown items should initially be hidden
    expect(screen.queryByText(/Industries/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Rolling Stock/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Train Routes/i)).not.toBeInTheDocument();
    
    // Click admin button
    const adminButton = screen.getByText(/Admin/i);
    fireEvent.click(adminButton);
    
    // Now admin dropdown links should be visible
    const industriesLink = screen.getByText(/Industries/i);
    const rollingStockLink = screen.getByText(/Rolling Stock/i);
    const trainRoutesLink = screen.getByText(/Train Routes/i);
    
    expect(industriesLink).toHaveAttribute('href', '/industries');
    expect(rollingStockLink).toHaveAttribute('href', '/rolling-stock');
    expect(trainRoutesLink).toHaveAttribute('href', '/train-routes');
  });

  it('applies correct styling classes', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    const nav = screen.getByRole('navigation');
    
    expect(header).toHaveClass('bg-white', 'border-b', 'border-gray-200', 'sticky', 'top-0', 'z-50');
    expect(nav).toHaveClass('container', 'mx-auto', 'px-4');
  });

  it('has proper semantic HTML structure', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    const nav = screen.getByRole('navigation');
    
    expect(header).toBeInTheDocument();
    expect(nav).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', () => {
    render(<Header />);
    
    // Open dropdown
    const adminButton = screen.getByText(/Admin/i);
    fireEvent.click(adminButton);
    
    // Verify it's open
    expect(screen.getByText(/Industries/i)).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    // Verify it's closed
    expect(screen.queryByText(/Industries/i)).not.toBeInTheDocument();
  });
}); 