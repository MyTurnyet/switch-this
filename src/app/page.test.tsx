import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './page';
import { theme } from './theme';

describe('Home', () => {
  beforeEach(() => {
    render(<Home />);
  });

  it('renders the main heading', () => {
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Model Railroad Switchlist Generator');
    expect(heading).toHaveStyle({
      fontSize: '3rem',
      fontWeight: '800',
      marginBottom: theme.spacing.md
    });
  });

  it('renders the description text with correct styling', () => {
    const description = screen.getByText(/Generate and manage switchlists/i);
    expect(description).toBeInTheDocument();
    expect(description).toHaveStyle({
      color: theme.colors.text.secondary,
      fontSize: '1.5rem',
      lineHeight: '1.6'
    });
  });

  it('renders three feature cards', () => {
    const features = [
      'Switchlist Management',
      'Rolling Stock Tracking',
      'Operations Planning'
    ];

    features.forEach(feature => {
      const featureHeading = screen.getByRole('heading', { name: feature });
      expect(featureHeading).toBeInTheDocument();
    });
  });

  it('applies correct layout styles', () => {
    const main = screen.getByRole('main');
    expect(main).toHaveStyle({
      minHeight: '100vh',
      padding: theme.spacing.xl
    });

    const grid = main.querySelector('div > div:last-child');
    expect(grid).toHaveStyle({
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: theme.spacing.xl,
      padding: theme.spacing.lg
    });
  });
}); 