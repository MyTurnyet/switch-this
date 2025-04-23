import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FeatureCard } from './FeatureCard';
import { ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';

const theme = createTheme();

const testProps = {
  title: 'Test Title',
  description: 'Test Description'
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
    renderWithTheme(<FeatureCard {...testProps} />);
    const title = screen.getByRole('heading', { name: testProps.title });
    expect(title).toBeInTheDocument();
  });

  it('renders the description', () => {
    renderWithTheme(<FeatureCard {...testProps} />);
    const description = screen.getByText(testProps.description);
    expect(description).toBeInTheDocument();
  });

  it('has the correct test id', () => {
    renderWithTheme(<FeatureCard {...testProps} />);
    expect(screen.getByTestId('feature-card')).toBeInTheDocument();
  });
}); 