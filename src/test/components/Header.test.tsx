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
    
    expect(homeLink).toBeInTheDocument();
    expect(aboutLink).toBeInTheDocument();
  });

  it('has correct navigation links with proper href attributes', () => {
    render(<Header />);
    const homeLink = screen.getByText(/Home/i);
    const aboutLink = screen.getByText(/About/i);
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(aboutLink).toHaveAttribute('href', '/about');
  });

  it('applies correct styling classes', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    const nav = screen.getByRole('navigation');
    
    expect(header).toHaveClass('bg-white', 'shadow-md');
    expect(nav).toHaveClass('container', 'mx-auto', 'px-4', 'py-4');
  });

  it('has proper semantic HTML structure', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    const nav = screen.getByRole('navigation');
    
    expect(header).toBeInTheDocument();
    expect(nav).toBeInTheDocument();
  });
}); 