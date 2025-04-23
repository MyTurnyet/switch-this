import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './page';

// Mock the Dashboard component
jest.mock('../components/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="mock-dashboard">Dashboard Component</div>;
  };
});

describe('Home Page', () => {
  beforeEach(() => {
    render(<Home />);
  });

  it('renders the main title', () => {
    const title = screen.getByText('Model Railroad Switchlist Generator');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('text-3xl', 'font-bold', 'text-gray-900');
  });

  it('renders the subtitle', () => {
    const subtitle = screen.getByText('Generate and manage switchlists for your model railroad layout');
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveClass('text-lg', 'text-gray-600');
  });

  it('renders the Dashboard component', () => {
    const dashboard = screen.getByTestId('mock-dashboard');
    expect(dashboard).toBeInTheDocument();
  });

  it('has the correct layout structure', () => {
    const main = screen.getByRole('main');
    expect(main).toHaveClass('min-h-screen', 'bg-gray-50');

    const container = main.firstChild as HTMLElement;
    expect(container).toHaveClass('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8', 'py-8');

    const card = screen.getByTestId('mock-dashboard').parentElement as HTMLElement;
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm', 'p-6');
  });
}); 