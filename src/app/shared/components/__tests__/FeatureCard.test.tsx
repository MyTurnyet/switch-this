import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FeatureCard } from '../FeatureCard';
import { ThemeProvider, createTheme } from '@mui/material';
import { Feature } from '../../types/feature';

const theme = createTheme();

const testFeature: Feature = {
  id: 'test-feature',
  title: 'Test Title',
  description: 'Test Description',
  icon: 'test-icon',
  status: 'active'
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('FeatureCard', () => {
  it('renders the title', () => {
    renderWithTheme(<FeatureCard feature={testFeature} />);
    const title = screen.getByRole('heading', { name: testFeature.title });
    expect(title).toBeInTheDocument();
  });

  it('renders the description', () => {
    renderWithTheme(<FeatureCard feature={testFeature} />);
    const description = screen.getByText(testFeature.description);
    expect(description).toBeInTheDocument();
  });

  it('has the correct test id', () => {
    renderWithTheme(<FeatureCard feature={testFeature} />);
    expect(screen.getByTestId('feature-card')).toBeInTheDocument();
  });
}); 