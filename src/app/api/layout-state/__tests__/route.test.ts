import { NextRequest } from 'next/server';
import { jest } from '@jest/globals';

// Define a properly typed mock Response class
class MockResponse {
  body: string;
  parsedBody: unknown;
  status: number;
  headers: Record<string, string>;
  constructor(body: string, options?: ResponseInit) {
    this.body = body;
    this.parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
    this.status = options?.status || 200;
    this.headers = (options?.headers as Record<string, string>) || {};
  }
  json() { return Promise.resolve(this.parsedBody); }
  error() { return this as unknown as Response; }
  redirect() { return this as unknown as Response; }
}

// Mock Response constructor
// Use the custom MockResponse class
global.Response = MockResponse as unknown as typeof Response;

// Create mock collections first
// Add a local type for layout state used in tests
// This matches the shape returned by the API

type TestLayoutState = {
  _id?: string;
  industries?: Array<{ _id: string; tracks: unknown[] }>;
  updatedAt?: string;
  exists?: boolean;
  error?: string;
};

// Define explicit function types for each method

type FindOneFn = (
  filter?: Partial<TestLayoutState>,
  options?: { sort?: Record<string, 1 | -1> }
) => Promise<TestLayoutState | null>;

type InsertOneFn = (
  doc: Omit<TestLayoutState, '_id'>
) => Promise<{ acknowledged: boolean; insertedId: { toString: () => string } }>;

type UpdateOneFn = (
  filter: Partial<TestLayoutState>,
  update: { $set: Partial<TestLayoutState> }
) => Promise<{ matchedCount: number }>;

interface MockLayoutStateCollection {
  findOne: (
    filter?: Partial<TestLayoutState>,
    options?: { sort?: Record<string, 1 | -1> }
  ) => Promise<TestLayoutState | null>;
  insertOne: (
    doc: Omit<TestLayoutState, '_id'>
  ) => Promise<{ acknowledged: boolean; insertedId: { toString: () => string } }>;
  updateOne: (
    filter: Partial<TestLayoutState>,
    update: { $set: Partial<TestLayoutState> }
  ) => Promise<{ matchedCount: number }>;
}

const mockCollection: MockLayoutStateCollection = {
  findOne: jest.fn() as MockLayoutStateCollection['findOne'],
  insertOne: jest.fn() as MockLayoutStateCollection['insertOne'],
  updateOne: jest.fn() as MockLayoutStateCollection['updateOne'],
};

// Create mockMongoService before it's used in mock implementation
// Explicit interface for the mock Mongo service
interface MockMongoService {
  connect: jest.MockedFunction<() => Promise<void>>;
  close: jest.MockedFunction<() => Promise<void>>;
  getLayoutStateCollection: jest.MockedFunction<() => MockLayoutStateCollection>;
}

const mockMongoService: MockMongoService = {
  connect: jest.fn(),
  close: jest.fn(),
  getLayoutStateCollection: jest.fn().mockReturnValue(mockCollection) as jest.MockedFunction<() => MockLayoutStateCollection>
};

// Mock the MongoDB service module
jest.mock('@/lib/services/mongodb.service', () => ({
  MongoDbService: jest.fn().mockImplementation(() => mockMongoService)
}));

// Create the custom ObjectId mock function with a throw-on-invalid capability
const mockObjectId = jest.fn().mockImplementation((id) => {
  // Specifically throw for 'invalid-id'
  if (id === 'invalid-id') {
    throw new Error('Invalid ObjectId');
  }
  return {
    toString: () => id || 'mock-id',
    toHexString: () => id || 'mock-id'
  };
});

// Mock ObjectId
jest.mock('mongodb', () => {
  const original = jest.requireActual('mongodb') || {};
  return {
    ...original,
    ObjectId: mockObjectId
  };
});

// Import modules after mocks
// import { ObjectId } from 'mongodb';

// Import API routes after all mocks are set up
let GET: (req?: NextRequest, context?: any) => Promise<Response>;
let POST: (req: NextRequest, context?: any) => Promise<Response>;
let OPTIONS: (req?: NextRequest, context?: any) => Promise<Response>;

// Load the actual module after all mocks are in place
jest.isolateModules(() => {
  const routeModule = require('../route');
  GET = routeModule.GET;
  POST = routeModule.POST;
  OPTIONS = routeModule.OPTIONS;
});

describe('Layout State API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET', () => {
    it('should return layout state from the database', async () => {
      // Mock data
      const mockLayoutState = {
        _id: 'mock-layout-id-123',
        industries: [{ _id: 'ind-1', tracks: [] }],
        updatedAt: '2025-05-06T16:16:03.299Z'
      };
      
      // Configure the mock
      mockCollection.findOne.mockResolvedValueOnce(mockLayoutState);
      
      // Call the API
      const response = await GET() as unknown as MockResponse;
      
      // Verify the result
      expect((response.parsedBody as TestLayoutState).industries).toEqual(mockLayoutState.industries);
      expect(mockCollection.findOne).toHaveBeenCalledWith({}, { sort: { updatedAt: -1 } });
      expect(mockMongoService.close).toHaveBeenCalled();
    });
    
    it('should return exists:false when no layout state exists', async () => {
      // Configure the mock to return null (no state exists)
      mockCollection.findOne.mockResolvedValueOnce(null);
      
      // Call the API
      const response = await GET() as unknown as MockResponse;
      
      // Verify the result
      expect((response.parsedBody as TestLayoutState).exists).toBe(false);
      expect(mockMongoService.close).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Configure the mock to throw an error
      mockCollection.findOne.mockRejectedValueOnce(new Error('Database error'));
      
      // Call the API
      const response = await GET() as unknown as MockResponse;
      
      // Verify error response
      expect((response.parsedBody as TestLayoutState).error).toBe('Failed to fetch layout state');
      expect(response.status).toBe(500);
      expect(mockMongoService.close).toHaveBeenCalled();
    });
  });
  
  describe('POST', () => {
    it('should update existing layout state', async () => {
      // Setup existing layout ID
      const layoutId = 'mock-layout-id-123';
      
      // Mock request data
      const requestData = {
        _id: layoutId,
        industries: [{ _id: 'ind-1', tracks: [] }]
      };
      
      // Mock response after update
      const updatedState = {
        ...requestData,
        updatedAt: '2025-05-06T16:16:03.299Z'
      };
      
      // Configure mocks
      mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 1 });
      mockCollection.findOne.mockResolvedValueOnce(updatedState);
      
      // Create mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce(requestData)
      } as unknown as NextRequest;
      
      // Call the API
      const response = await POST(mockRequest) as unknown as MockResponse;
      
      // Verify the response includes the original data with added timestamp
      expect(response.status).toBe(200);
      expect((response.parsedBody as TestLayoutState)._id).toBe(layoutId);
      expect((response.parsedBody as TestLayoutState).industries).toEqual(requestData.industries);
      expect((response.parsedBody as TestLayoutState).updatedAt).toBeDefined();
      
      // Verify DB operations
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.anything() },
        { $set: expect.objectContaining({
          industries: requestData.industries,
          updatedAt: expect.any(String)
        })}
      );
      expect(mockMongoService.close).toHaveBeenCalled();
    });
    
    it('should create new layout state when no _id is provided', async () => {
      // Mock request data without ID
      const requestData = {
        industries: [{ _id: 'ind-1', tracks: [] }]
      };
      
      // Mock insertOne response
      const mockInsertedId = { toString: () => 'new-mock-id' };
      mockCollection.insertOne.mockResolvedValueOnce({
        acknowledged: true,
        insertedId: mockInsertedId
      });
      
      // Create mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce(requestData)
      } as unknown as NextRequest;
      
      // Call the API
      const response = await POST(mockRequest) as unknown as MockResponse;
      
      // Verify the response
      expect(response.status).toBe(201);
      expect((response.parsedBody as TestLayoutState).industries).toEqual(requestData.industries);
      expect((response.parsedBody as TestLayoutState)._id).toBeDefined();
      expect((response.parsedBody as TestLayoutState).updatedAt).toBeDefined();
      
      // Verify insertOne was called
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          industries: requestData.industries,
          updatedAt: expect.anything()
        })
      );
      expect(mockMongoService.close).toHaveBeenCalled();
    });
    
    it('should handle database errors during save', async () => {
      // Mock request with ID
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          _id: 'mock-layout-id-123'
        })
      } as unknown as NextRequest;
      
      // Configure updateOne to throw error
      mockCollection.updateOne.mockRejectedValueOnce(new Error('Database error'));
      
      // Call the API
      const response = await POST(mockRequest) as unknown as MockResponse;
      
      // Verify error response
      expect((response.parsedBody as TestLayoutState).error).toBe('Failed to save layout state');
      expect(response.status).toBe(500);
      
      // Verify close was called
      expect(mockMongoService.close).toHaveBeenCalled();
    });
    
    it('should handle invalid ID format', async () => {
      // Create mock request with invalid ID
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          _id: 'invalid-id'
        })
      } as unknown as NextRequest;
      
      // Call the API - our mockObjectId will throw for 'invalid-id'
      const response = await POST(mockRequest) as unknown as MockResponse;
      
      // Verify error response
      expect((response.parsedBody as TestLayoutState).error).toBe('Invalid layout state ID format');
      expect(response.status).toBe(400);
    });
  });
  
  describe('OPTIONS', () => {
    it('should return CORS headers', async () => {
      const response = await OPTIONS() as unknown as MockResponse;
      
      expect(response.status).toBe(200);
      expect(response.headers).toEqual(expect.objectContaining({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With',
      }));
    });
  });
}); 