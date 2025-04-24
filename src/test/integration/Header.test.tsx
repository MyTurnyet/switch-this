import { render, screen } from '@testing-library/react';
import Header from '@/shared/components/Header';

describe('Header Integration', () => {
  it('renders with all navigation elements', () => {
    render(<Header />);
    
    // Check for logo/title
    const title = screen.getByText('Switch This');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('text-2xl', 'font-bold');
    
    // Check for navigation links
    const homeLink = screen.getByText('Home');
    const aboutLink = screen.getByText('About');
    expect(homeLink).toHaveAttribute('href', '/');
    expect(aboutLink).toHaveAttribute('href', '/about');
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
}); 