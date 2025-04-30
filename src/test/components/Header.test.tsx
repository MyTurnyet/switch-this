import { render, screen } from '@testing-library/react';
import Header from '@/shared/components/Header';

describe('Header', () => {
  it('renders the site title', () => {
    render(<Header />);
    const titleElement = screen.getByText(/Switch This/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);
    const homeLink = screen.getByText(/Home/i);
    const aboutLink = screen.getByText(/About/i);
    const layoutStateLink = screen.getByText(/Layout State/i);
    const industriesLink = screen.getByText(/Industries/i);
    
    expect(homeLink).toBeInTheDocument();
    expect(aboutLink).toBeInTheDocument();
    expect(layoutStateLink).toBeInTheDocument();
    expect(industriesLink).toBeInTheDocument();
  });

  it('has correct navigation links with proper href attributes', () => {
    render(<Header />);
    const homeLink = screen.getByText(/Home/i);
    const aboutLink = screen.getByText(/About/i);
    const layoutStateLink = screen.getByText(/Layout State/i);
    const industriesLink = screen.getByText(/Industries/i);
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(aboutLink).toHaveAttribute('href', '/about');
    expect(layoutStateLink).toHaveAttribute('href', '/layout-state');
    expect(industriesLink).toHaveAttribute('href', '/industries');
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
}); 