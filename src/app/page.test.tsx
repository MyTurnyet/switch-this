import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './page';

describe('Home', () => {
  beforeEach(() => {
    render(<Home />);
  });

  it('renders the main heading', () => {
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Model Railroad Switchlist Generator');
  });

  it('renders the description text', () => {
    const description = screen.getByText(/Generate and manage switchlists/i);
    expect(description).toBeInTheDocument();
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
}); 