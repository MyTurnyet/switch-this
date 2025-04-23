import '@testing-library/jest-dom';
import { expect } from '@jest/globals';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Jest matchers
expect.extend(matchers);

// Mock for @mui/material
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    // Add any specific component mocks if needed
  };
}); 