import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { render } from '@testing-library/react';
import React from 'react';

const theme = createTheme();

const customRender = (ui: React.ReactElement) => {
  return {
    ...render(
      <ThemeProvider theme={theme}>
        {ui}
      </ThemeProvider>
    ),
  };
};

export * from '@testing-library/react';
export { customRender as render }; 