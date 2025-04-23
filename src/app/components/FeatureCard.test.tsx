import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FeatureCard } from './FeatureCard';

describe('FeatureCard', () => {
  const testProps = {
    title: 'Test Feature',
    description: 'This is a test feature description'
  };

  it('renders the title', () => {
    render(<FeatureCard {...testProps} />);
    const title = screen.getByRole('heading', { name: testProps.title });
    expect(title).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<FeatureCard {...testProps} />);
    const description = screen.getByText(testProps.description);
    expect(description).toBeInTheDocument();
  });
}); 