import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { ObjectId, UpdateResult, DeleteResult } from 'mongodb';
import { FakeMongoDbService } from '@/test/utils/mongodb-test-utils';

// Create a fake MongoDB service instance
const fakeMongoService = new FakeMongoDbService();
fakeMongoService.clearCallHistory();

// Set up mock data
const mockObjectIdString = '123456789012345678901234';
const mockObjectId = new ObjectId(mockObjectIdString);

// Define mocks for MongoDB collections
const mockCollection = {
  findOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn()
};

// Mock the industries collection with proper result type
const mockIndustriesCollection = {
  updateMany: jest.fn().mockResolvedValue({ acknowledged: true, modifiedCount: 1 } as unknown as UpdateResult)
};

// Mock the MongoDB service module
jest.mock('@/lib/services/mongodb.service', () => {
  return {
    MongoDbService: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(undefined as never),
      close: jest.fn().mockResolvedValue(undefined as never),
      getRollingStockCollection: jest.fn().mockReturnValue(mockCollection),
      getIndustriesCollection: jest.fn().mockReturnValue(mockIndustriesCollection),
      toObjectId: jest.fn((_id: string) => mockObjectId)
    }))
  };
});

// Define a properly typed mock Response interface that matches the actual Response
interface MockResponse {
  body: string;
  parsedBody: Record<string, unknown>;
  status: number;
  headers: Record<string, string>;
  json: () => Promise<Record<string, unknown>>;
  ok: boolean;
  redirected: boolean;
  type: string;
  url: string;
}

// Mock Response constructor for testing
global.Response = jest.fn().mockImplementation((body, options: ResponseInit = {}) => {
  const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
  
  // Create mock response object with required properties
  const response = {
    body,
    parsedBody,
    status: options.status || 200,
    headers: options.headers || {},
    json: () => Promise.resolve(parsedBody),
    ok: (options.status || 200) >= 200 && (options.status || 200) < 300,
    redirected: false,
    type: 'basic',
    url: ''
  } as MockResponse;
  
  return response;
}) as unknown as typeof Response;

// These will be loaded dynamically in tests
let GET: (request: NextRequest, context: { params: { id: string } }) => Promise<Response>;
let PUT: (request: NextRequest, context: { params: { id: string } }) => Promise<Response>;
let DELETE: (request: NextRequest, context: { params: { id: string } }) => Promise<Response>;

describe('Rolling Stock API Routes', () => {
  let mockRequest: NextRequest;
  let mockParams: { params: { id: string } };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create request and params
    mockRequest = {} as NextRequest;
    mockParams = { params: { id: mockObjectIdString } };

    // Set default findOne response to a successful find
    mockCollection.findOne.mockResolvedValue({ _id: mockObjectId } as never);
    
    // Load the route handlers after setting up mocks
    jest.isolateModules(() => {
      const routeModule = require('../route');
      GET = routeModule.GET;
      PUT = routeModule.PUT;
      DELETE = routeModule.DELETE;
    });
  });

  describe('GET', () => {
    it('should return a rolling stock item by ID', async () => {
      // Mock findOne to return a rolling stock item with ObjectId
      const mockRollingStockData = { _id: mockObjectId, roadName: 'TEST', roadNumber: '12345' };
      mockCollection.findOne.mockResolvedValueOnce(mockRollingStockData as never);
      
      // Call the API
      const response = await GET(mockRequest, mockParams) as unknown as MockResponse;
      
      // The API will convert ObjectId to string in the response, so we should expect string format
      const expectedResponse = { 
        _id: mockObjectIdString, 
        roadName: 'TEST', 
        roadNumber: '12345' 
      };
      
      // Verify the response
      expect(response.parsedBody).toEqual(expectedResponse);
      expect(response.status).toBe(200);
      
      // Verify the MongoDB calls
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: mockObjectId });
    }, 30000); // Increase timeout
    
    it('should return 404 when rolling stock is not found', async () => {
      // Mock findOne to return null (item not found)
      mockCollection.findOne.mockResolvedValueOnce(null as never);
      
      // Call the API
      const response = await GET(mockRequest, mockParams) as unknown as MockResponse;
      
      // Verify the response
      expect(response.parsedBody).toEqual({ error: 'Rolling stock not found' });
      expect(response.status).toBe(404);
    }, 30000); // Increase timeout
    
    it('should handle errors', async () => {
      // Mock findOne to throw an error
      mockCollection.findOne.mockRejectedValueOnce(new Error('Database error') as never);
      
      // Call the API
      const response = await GET(mockRequest, mockParams) as unknown as MockResponse;
      
      // Verify the response
      expect(response.parsedBody).toEqual({ error: 'Failed to fetch rolling stock item' });
      expect(response.status).toBe(500);
    }, 30000); // Increase timeout
  });
  
  describe('PUT', () => {
    it('should update a rolling stock item', async () => {
      // Create a mock request with update data
      const updateData = {
        roadName: 'UPDATED',
        roadNumber: '54321',
        aarType: 'XM',
        description: 'Updated boxcar',
        homeYard: 'Updated Yard'
      };
      
      mockRequest = {
        json: jest.fn().mockResolvedValue(updateData as never)
      } as unknown as NextRequest;
      
      // Mock findOne and updateOne to indicate success
      mockCollection.findOne.mockResolvedValueOnce({ _id: mockObjectId } as never);
      mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 1 } as unknown as UpdateResult);
      
      // Call the API
      const response = await PUT(mockRequest, mockParams) as unknown as MockResponse;
      
      // Verify the response
      expect(response.parsedBody).toEqual({ message: 'Rolling stock updated successfully' });
      expect(response.status).toBe(200);
      
      // Verify the MongoDB calls
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: mockObjectId });
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: mockObjectId },
        { $set: expect.objectContaining(updateData) }
      );
    }, 30000); // Increase timeout
    
    it('should return 404 when rolling stock to update is not found', async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue({ roadName: 'UPDATED' } as never)
      } as unknown as NextRequest;
      
      // Mock findOne to return null
      mockCollection.findOne.mockResolvedValueOnce(null as never);
      
      // Call the API
      const response = await PUT(mockRequest, mockParams) as unknown as MockResponse;
      
      // Verify the response
      expect(response.parsedBody).toEqual({ error: 'Rolling stock not found' });
      expect(response.status).toBe(404);
    }, 30000); // Increase timeout
    
    it('should handle errors during update', async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue({ roadName: 'UPDATED' } as never)
      } as unknown as NextRequest;
      
      // Mock findOne to succeed but updateOne to fail
      mockCollection.findOne.mockResolvedValueOnce({ _id: mockObjectId } as never);
      mockCollection.updateOne.mockRejectedValueOnce(new Error('Database error') as never);
      
      // Call the API
      const response = await PUT(mockRequest, mockParams) as unknown as MockResponse;
      
      // Verify the response
      expect(response.parsedBody).toEqual({ error: 'Failed to update rolling stock' });
      expect(response.status).toBe(500);
    }, 30000); // Increase timeout
    
    it('should properly update car destination and location', async () => {
      // Create a mock request with destination update
      const updateData = {
        roadName: 'UPDATED',
        destination: {
          immediateDestination: {
            locationId: 'loc1',
            industryId: 'ind1',
            trackId: 'track1'
          },
          finalDestination: {
            locationId: 'loc2',
            industryId: 'ind2',
            trackId: 'track2'
          }
        },
        currentLocation: {
          industryId: 'ind3',
          trackId: 'track3'
        }
      };
      
      mockRequest = {
        json: jest.fn().mockResolvedValue(updateData as never)
      } as unknown as NextRequest;
      
      // Mock findOne and updateOne to indicate success
      mockCollection.findOne.mockResolvedValueOnce({ _id: mockObjectId } as never);
      mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 1 } as unknown as UpdateResult);
      
      // Call the API
      const response = await PUT(mockRequest, mockParams) as unknown as MockResponse;
      
      // Verify the response
      expect(response.parsedBody).toEqual({ message: 'Rolling stock updated successfully' });
      expect(response.status).toBe(200);
      
      // Verify the MongoDB calls
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: mockObjectId },
        { $set: expect.objectContaining({
          destination: updateData.destination,
          currentLocation: updateData.currentLocation
        })}
      );
    }, 30000); // Increase timeout
  });

  describe('DELETE', () => {
    it('should return 404 when rolling stock is not found for deletion', async () => {
      // Mock findOne to indicate no matches
      mockCollection.findOne.mockResolvedValueOnce(null as never);
      
      // Call the API
      const response = await DELETE(mockRequest, mockParams) as unknown as MockResponse;
      
      // Verify the response
      expect(response.parsedBody).toEqual({ error: 'Rolling stock not found' });
      expect(response.status).toBe(404);
    }, 30000); // Increase timeout
    
    it('handles errors during deletion', async () => {
      // Mock findOne to succeed but deleteOne to fail
      mockCollection.findOne.mockResolvedValueOnce({ _id: mockObjectId } as never);
      mockCollection.deleteOne.mockRejectedValueOnce(new Error('Database error') as never);
      
      // Call the API
      const response = await DELETE(mockRequest, mockParams) as unknown as MockResponse;
      
      // Verify the error response
      expect(response.parsedBody).toEqual({ error: 'Failed to delete rolling stock' });
      expect(response.status).toBe(500);
      
      // Verify the MongoDB calls
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: mockObjectId });
    }, 30000); // Increase timeout
  });
}); 