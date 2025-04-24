import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import { TextEncoder, TextDecoder } from 'util';

// Add missing globals
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Request class
global.Request = class Request {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = options.headers || {};
    this.body = options.body;
  }
};

// Mock Response class
global.Response = class Response {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.statusText = options.statusText || 'OK';
    this.headers = options.headers || {};
  }

  json() {
    return Promise.resolve(this.body);
  }
};

// Mock NextResponse
global.NextResponse = {
  json: (data, options = {}) => new Response(data, options)
};

// Mock Material-UI useMediaQuery
jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue(false),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  mockFetch.mockReset();
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Learn more: https://github.com/testing-library/jest-dom 