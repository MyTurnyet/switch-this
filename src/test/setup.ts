import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'node:util';

// Mock Request and Response objects
global.Request = jest.fn((url: string) => ({ url })) as unknown as typeof Request;
global.Response = jest.fn((body?: BodyInit | null, init?: ResponseInit) => ({ body, ...init })) as unknown as typeof Response;

global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder; 