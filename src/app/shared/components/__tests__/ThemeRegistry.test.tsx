import React from 'react';
import { render, screen } from '@testing-library/react';
import ThemeRegistry from '../ThemeRegistry';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

describe('ThemeRegistry', () => {
  it('renders children and navigation', () => {
    const testContent = 'Test Content';
    render(
      <ThemeProvider theme={theme}>
        <ThemeRegistry>
          <div>{testContent}</div>
        </ThemeRegistry>
      </ThemeProvider>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
    expect(screen.getByText('Switchlist Generator')).toBeInTheDocument();
  });

  it('applies theme to children', () => {
    const testContent = 'Test Content';
    render(
      <ThemeProvider theme={theme}>
        <ThemeRegistry>
          <div>{testContent}</div>
        </ThemeRegistry>
      </ThemeProvider>
    );

    const appBar = screen.getByRole('banner');
    expect(appBar).toHaveStyle({ backgroundColor: 'white' });
  });
}); 