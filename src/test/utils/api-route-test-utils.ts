import { FakeMongoDbService } from './mongodb-test-utils';
import { ObjectId } from 'mongodb';

/**
 * Sets up NextResponse and MongoDB mocks for API route testing.
 * Should be called before importing the actual route handlers.
 */
export function setupApiRouteTest() {
  // Mock NextResponse.json
  const mockJson = jest.fn().mockImplementation((data, options) => {
    return { data, options, status: options?.status || 200 };
  });

  // Setup Jest mocks
  jest.mock('next/server', () => ({
    NextResponse: {
      json: mockJson
    }
  }));

  // Create a fake MongoDB service
  const fakeMongoService = new FakeMongoDbService();
  
  // Pre-connect to avoid having to connect in every test
  fakeMongoService.isConnected = true;
  
  // Mock the toObjectId to accept both string and ObjectId
  jest.spyOn(fakeMongoService, 'toObjectId').mockImplementation((id) => {
    if (typeof id === 'string') {
      return id as unknown as ObjectId;
    }
    return id;
  });

  // Mock the MongoDB service
  jest.mock('@/lib/services/mongodb.service', () => ({
    MongoDbService: jest.fn().mockImplementation(() => fakeMongoService)
  }), { virtual: true });

  return {
    mockJson,
    fakeMongoService
  };
}

/**
 * Creates a NextRequest mock with optional JSON body
 */
export function createMockNextRequest(jsonResponse?: unknown): Record<string, unknown> {
  const mockRequestJson = jest.fn().mockResolvedValue(jsonResponse || {});
  
  return {
    json: mockRequestJson,
    headers: new Map(),
    nextUrl: { searchParams: new URLSearchParams() }
  };
}

/**
 * Creates mock route parameters
 */
export function createMockRouteParams(params: Record<string, string>) {
  return { params };
} 