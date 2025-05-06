import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { jest } from '@jest/globals';

// Define a properly typed mock Response interface
interface MockResponse {
  body: string;
  parsedBody: unknown;
  status: number;
  headers: Record<string, string>;
}

// Mock Response constructor
global.Response = jest.fn().mockImplementation((body, options) => {
  const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
  return {
    body,
    parsedBody,
    status: options?.status || 200,
    headers: options?.headers || {}
  } as MockResponse;
});

// Create mock collections
const mockCollection = {
  find: jest.fn(),
  findOne: jest.fn(),
  insertOne: jest.fn(),
  deleteOne: jest.fn()
};

// Set up mock implementation for find
mockCollection.find.mockReturnValue({
  toArray: jest.fn()
});

// Create mockMongoService
const mockMongoService = {
  connect: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  getIndustriesCollection: jest.fn().mockReturnValue(mockCollection)
};

// Mock the MongoDB service
jest.mock('@/lib/services/mongodb.service', () => ({
  MongoDbService: jest.fn().mockImplementation(() => mockMongoService)
}));

// Import route handlers after mocks are set up
let GET_HANDLER: (req?: NextRequest) => Promise<Response>;
let POST_HANDLER: (req: NextRequest) => Promise<Response>;

// Load the actual module after all mocks are in place
jest.isolateModules(() => {
  const routeModule = require('../route');
  GET_HANDLER = routeModule.GET;
  POST_HANDLER = routeModule.POST;
});

describe('Industries API', () => {
  let mockRequest: NextRequest;
  let mockRequestJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock request
    mockRequestJson = jest.fn();
    mockRequest = {
      json: mockRequestJson
    } as unknown as NextRequest;
  });
  
  describe('GET', () => {
    it('should return all industries', async () => {
      // Mock industries data
      const mockIndustries = [
        { _id: '1', name: 'Industry 1', locationId: 'loc1', blockName: 'Block A', industryType: 'FREIGHT' },
        { _id: '2', name: 'Industry 2', locationId: 'loc2', blockName: 'Block B', industryType: 'PASSENGER' }
      ];
      
      // Setup mock responses
      mockCollection.find().toArray.mockResolvedValue(mockIndustries);
      
      // Call the handler
      const response = await GET_HANDLER() as MockResponse;
      
      // Verify MongoDB methods were called
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getIndustriesCollection).toHaveBeenCalled();
      expect(mockMongoService.close).toHaveBeenCalled();
      
      // Verify response
      expect(response.parsedBody).toEqual(mockIndustries);
      expect(response.status).toBe(200);
    });
    
    it('should handle errors gracefully', async () => {
      // Setup mock to throw an error
      mockMongoService.connect.mockRejectedValue(new Error('Database error'));
      
      // Call the handler
      const response = await GET_HANDLER() as MockResponse;
      
      // Verify error response
      expect(response.parsedBody).toEqual({ error: 'Failed to retrieve industries' });
      expect(response.status).toBe(500);
    });
  });
  
  describe('POST', () => {
    it('should create a new industry', async () => {
      // Clear mocks before test
      jest.clearAllMocks();
      
      // Mock data
      const newIndustry = {
        name: 'New Industry',
        locationId: 'loc1',
        blockName: 'Block A',
        industryType: 'FREIGHT'
      };
      
      // Set up validations to pass
      mockRequestJson.mockResolvedValue(newIndustry);
      
      // Setup mock responses for insertOne
      const mockInsertedId = 'new-id';
      mockCollection.insertOne.mockResolvedValue({ 
        insertedId: mockInsertedId, 
        acknowledged: true 
      });
      
      // Force the service mock to connect and return the collection
      mockMongoService.connect.mockResolvedValue(undefined);
      mockMongoService.getIndustriesCollection.mockReturnValue(mockCollection);
      
      // Call the handler
      const response = await POST_HANDLER(mockRequest) as MockResponse;
      
      // Verify MongoDB methods were called
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getIndustriesCollection).toHaveBeenCalled();
      expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining(newIndustry));
      expect(mockMongoService.close).toHaveBeenCalled();
      
      // Verify response
      expect(response.parsedBody).toEqual(expect.objectContaining({
        _id: mockInsertedId,
        name: 'New Industry'
      }));
      expect(response.status).toBe(201);
    });

    it('should validate name is required', async () => {
      // Mock request with missing name
      mockRequestJson.mockResolvedValue({
        locationId: 'loc1',
        blockName: 'Block A',
        industryType: 'FREIGHT'
      });
      
      // Call the handler
      const response = await POST_HANDLER(mockRequest) as MockResponse;
      
      // Verify response
      expect(response.parsedBody).toEqual({ error: 'Industry name is required' });
      expect(response.status).toBe(400);
    });

    it('should validate locationId is required', async () => {
      // Mock request with missing locationId
      mockRequestJson.mockResolvedValue({
        name: 'New Industry',
        blockName: 'Block A',
        industryType: 'FREIGHT'
      });
      
      // Call the handler
      const response = await POST_HANDLER(mockRequest) as MockResponse;
      
      // Verify response
      expect(response.parsedBody).toEqual({ error: 'Location ID is required' });
      expect(response.status).toBe(400);
    });

    it('should validate industryType is required', async () => {
      // Mock request with missing industryType
      mockRequestJson.mockResolvedValue({
        name: 'New Industry',
        locationId: 'loc1',
        blockName: 'Block A'
      });
      
      // Call the handler
      const response = await POST_HANDLER(mockRequest) as MockResponse;
      
      // Verify response
      expect(response.parsedBody).toEqual({ error: 'Industry type is required' });
      expect(response.status).toBe(400);
    });

    it('should validate blockName is required', async () => {
      // Mock request with missing blockName
      mockRequestJson.mockResolvedValue({
        name: 'New Industry',
        locationId: 'loc1',
        industryType: 'FREIGHT'
      });
      
      // Call the handler
      const response = await POST_HANDLER(mockRequest) as MockResponse;
      
      // Verify response
      expect(response.parsedBody).toEqual({ error: 'Block name is required' });
      expect(response.status).toBe(400);
    });

    it('should handle database errors gracefully', async () => {
      // Mock request
      mockRequestJson.mockResolvedValue({
        name: 'New Industry',
        locationId: 'loc1',
        blockName: 'Block A',
        industryType: 'FREIGHT'
      });
      
      // Setup mock to throw an error
      mockMongoService.connect.mockRejectedValue(new Error('Database error'));
      
      // Call the handler
      const response = await POST_HANDLER(mockRequest) as MockResponse;
      
      // Verify error response
      expect(response.parsedBody).toEqual({ error: 'Database error' });
      expect(response.status).toBe(500);
    });
  });
}); 