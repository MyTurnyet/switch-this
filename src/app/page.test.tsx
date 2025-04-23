import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './page';
import { ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('Home', () => {
  it('renders the main heading', () => {
    renderWithTheme(<Home />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Model Railroad Switchlist Generator');
  });

  it('renders the description text', () => {
    renderWithTheme(<Home />);
    const description = screen.getByText(/Generate and manage switchlists/i);
    expect(description).toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    renderWithTheme(<Home />);
    expect(screen.getAllByTestId('feature-card')).toHaveLength(3);
  });

  it('renders the main container', () => {
    renderWithTheme(<Home />);
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });
}); 