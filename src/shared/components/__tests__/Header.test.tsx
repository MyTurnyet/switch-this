import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header', () => {
  it('renders the Switch This logo', () => {
    render(<Header />);
    const logo = screen.getByText('Switch This');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('href', '/');
  });

  it('renders all navigation links', () => {
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
    
    // Get all links except the logo
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
}); 