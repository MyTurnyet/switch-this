import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';

describe('Header', () => {
  it('renders the Switch This logo', () => {
    render(<Header />);
    const logo = screen.getByText('Switch This');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('href', '/');
  });

  it('renders main navigation links', () => {
    render(<Header />);
    
    const homeLink = screen.getByText('Home');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
    
    const aboutLink = screen.getByText('About');
    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink).toHaveAttribute('href', '/about');
    
    const layoutStateLink = screen.getByText('Layout State');
    expect(layoutStateLink).toBeInTheDocument();
    expect(layoutStateLink).toHaveAttribute('href', '/layout-state');
    
    const switchlistsLink = screen.getByText('Switchlists');
    expect(switchlistsLink).toBeInTheDocument();
    expect(switchlistsLink).toHaveAttribute('href', '/switchlists');
    
    // Check for Admin button
    const adminButton = screen.getByText('Admin');
    expect(adminButton).toBeInTheDocument();
  });

  it('shows admin dropdown links when admin is clicked', () => {
    render(<Header />);
    
    // Admin dropdown should initially be hidden
    expect(screen.queryByText('Industries')).not.toBeInTheDocument();
    expect(screen.queryByText('Rolling Stock')).not.toBeInTheDocument();
    expect(screen.queryByText('Train Routes')).not.toBeInTheDocument();
    
    // Click admin button
    const adminButton = screen.getByText('Admin');
    fireEvent.click(adminButton);
    
    // Now admin dropdown links should be visible
    const industriesLink = screen.getByText('Industries');
    expect(industriesLink).toBeInTheDocument();
    expect(industriesLink).toHaveAttribute('href', '/industries');
    
    const rollingStockLink = screen.getByText('Rolling Stock');
    expect(rollingStockLink).toBeInTheDocument();
    expect(rollingStockLink).toHaveAttribute('href', '/rolling-stock');
    
    const trainRoutesLink = screen.getByText('Train Routes');
    expect(trainRoutesLink).toBeInTheDocument();
    expect(trainRoutesLink).toHaveAttribute('href', '/train-routes');
  });

  it('applies correct styling to navigation links', () => {
    render(<Header />);
    
    // Get all main navigation links except the logo
    const navigationLinks = screen.getAllByRole('link').filter(link => 
      link.textContent !== 'Switch This'
    );
    
    navigationLinks.forEach(link => {
      expect(link).toHaveClass('text-gray-600');
      expect(link).toHaveClass('hover:text-primary-600');
      expect(link).toHaveClass('font-medium');
      expect(link).toHaveClass('transition-colors');
    });
  });

  it('closes the dropdown when clicking outside', () => {
    render(<Header />);
    
    // Click admin button to open dropdown
    const adminButton = screen.getByText('Admin');
    fireEvent.click(adminButton);
    
    // Verify dropdown is open
    expect(screen.getByText('Industries')).toBeInTheDocument();
    
    // Click outside (on the document body)
    fireEvent.mouseDown(document.body);
    
    // Dropdown should be closed
    expect(screen.queryByText('Industries')).not.toBeInTheDocument();
  });
}); 