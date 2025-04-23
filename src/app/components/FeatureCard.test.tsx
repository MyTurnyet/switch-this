import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FeatureCard } from './FeatureCard';
import { theme } from '../theme';

describe('FeatureCard', () => {
  const testProps = {
    title: 'Test Feature',
    description: 'This is a test feature description'
  };

  it('renders the title', () => {
    render(<FeatureCard {...testProps} />);
    const title = screen.getByRole('heading', { name: testProps.title });
    expect(title).toBeInTheDocument();
    expect(title).toHaveStyle({
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: theme.spacing.md
    });
  });

  it('renders the description', () => {
    render(<FeatureCard {...testProps} />);
    const description = screen.getByText(testProps.description);
    expect(description).toBeInTheDocument();
    expect(description).toHaveStyle({
      fontSize: '1.125rem',
      lineHeight: '1.6'
    });
  });

  it('applies hover effects', () => {
    render(<FeatureCard {...testProps} />);
    const card = screen.getByTestId('feature-card');
    
    // Hover state
    fireEvent.mouseEnter(card);
    expect(card).toHaveStyle({
      transform: 'translateY(-8px)'
    });

    // Back to initial state
    fireEvent.mouseLeave(card);
    expect(card).toHaveStyle({
      transform: 'translateY(0)'
    });
  });
}); 