import '@testing-library/jest-dom';

// Mock for @mui/material
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    // Add any specific component mocks if needed
  };
}); 