import { describe, it } from '@jest/globals';
import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../page';
import { renderWithTheme } from '@shared/test-utils/render-with-theme';

jest.mock('../shared/components/FeatureCard', () => ({
  FeatureCard: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="feature-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}));

describe('Home', () => {
  it('renders the main heading', () => {
    renderWithTheme(<Home />);
    const heading = screen.getByText('Model Railroad Switchlist Generator');
    expect(heading).toBeInTheDocument();
  });

  it('renders the description', () => {
    renderWithTheme(<Home />);
    const description = screen.getByText(/Generate and manage switchlists for your model railroad with ease/);
    expect(description).toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    renderWithTheme(<Home />);
    const featureCards = screen.getAllByTestId('feature-card');
    expect(featureCards).toHaveLength(3);
  });

  it('renders the main container', () => {
    renderWithTheme(<Home />);
    const mainElements = screen.getAllByRole('main');
    expect(mainElements.length).toBeGreaterThan(0);
    expect(mainElements[0]).toBeInTheDocument();
  });
}); 