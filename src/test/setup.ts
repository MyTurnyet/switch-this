import '@testing-library/jest-dom';

// Mock Request and Response objects
global.Request = jest.fn((url: string) => ({ url })) as unknown as typeof Request;
global.Response = jest.fn((body?: BodyInit | null, init?: ResponseInit) => ({ body, ...init })) as unknown as typeof Response; 