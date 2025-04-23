import React from 'react';
import { render, screen } from '@testing-library/react';
import Navigation from './Navigation';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../styles/theme';

describe('Navigation', () => {
  const renderNavigation = () => {
    return render(
      <ThemeProvider theme={theme}>
        <Navigation />
      </ThemeProvider>
    );
  };

  it('renders the navigation bar with correct title', () => {
    renderNavigation();
    expect(screen.getByText('Switchlist Generator')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    renderNavigation();
    expect(screen.getByText('Rolling Stock')).toBeInTheDocument();
    expect(screen.getByText('Industries')).toBeInTheDocument();
    expect(screen.getByText('Locations')).toBeInTheDocument();
    expect(screen.getByText('Layout State')).toBeInTheDocument();
  });

  it('has correct href attributes for navigation links', () => {
    renderNavigation();
    expect(screen.getByText('Rolling Stock').closest('a')).toHaveAttribute('href', '/rolling-stock');
    expect(screen.getByText('Industries').closest('a')).toHaveAttribute('href', '/industries');
    expect(screen.getByText('Locations').closest('a')).toHaveAttribute('href', '/locations');
    expect(screen.getByText('Layout State').closest('a')).toHaveAttribute('href', '/layout-state');
  });
}); 