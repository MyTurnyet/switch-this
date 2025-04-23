import { render, screen } from '@testing-library/react';
import Locations from '../../app/locations/page';
import locationsData from '../../data/locations.json';
import { ThemeProvider, createTheme } from '@mui/material';
import React from 'react';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('Locations', () => {
  it('displays all blocks as section headers', () => {
    renderWithTheme(<Locations />);
    
    const uniqueBlocks = Array.from(new Set(locationsData.map(location => location.block)));
    uniqueBlocks.forEach(block => {
      expect(screen.getByText(block)).toBeInTheDocument();
    });
  });

  it('displays all locations under their respective blocks', () => {
    renderWithTheme(<Locations />);
    
    locationsData.forEach(location => {
      expect(screen.getByText(location.stationName)).toBeInTheDocument();
    });
  });
}); 