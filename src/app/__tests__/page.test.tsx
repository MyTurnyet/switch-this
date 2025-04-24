import { render, screen } from '@testing-library/react';
import Home from '../page';

// Mock the Dashboard component since we're focusing on page structure
jest.mock('../components/Dashboard', () => {
  return {
    Dashboard: () => <div data-testid="mock-dashboard">Mock Dashboard</div>,
  };
});

describe('Home Page', () => {
  it('renders the dashboard component', () => {
    render(<Home />);
    const dashboard = screen.getByTestId('mock-dashboard');
    expect(dashboard).toBeInTheDocument();
  });

  it('maintains proper layout structure', () => {
    render(<Home />);
    const container = screen.getByTestId('mock-dashboard').parentElement;
    expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
  });
}); 