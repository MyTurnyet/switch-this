import { render, screen } from '@testing-library/react';
import { Locations } from '../Locations';
import locationsData from '../../data/locations.json';
import { ThemeProvider, createTheme } from '@mui/material';
import React from 'react';

const theme = createTheme();

describe('Locations', () => {
  it('displays all blocks as section headers', () => {
    render(
      <ThemeProvider theme={theme}>
        <Locations />
      </ThemeProvider>
    );
    
    const uniqueBlocks = Array.from(new Set(locationsData.map(location => location.block)));
    uniqueBlocks.forEach(block => {
      expect(screen.getByText(block)).toBeInTheDocument();
    });
  });

  it('displays all locations under their respective blocks', () => {
    render(
      <ThemeProvider theme={theme}>
        <Locations />
      </ThemeProvider>
    );
    
    locationsData.forEach(location => {
      expect(screen.getByText(location.stationName)).toBeInTheDocument();
    });
  });
}); 