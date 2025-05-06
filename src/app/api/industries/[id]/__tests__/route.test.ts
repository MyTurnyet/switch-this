import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { FakeMongoDbService } from '@/test/utils/mongodb-test-utils';

// Create a fake MongoDB service instance
const fakeMongoService = new FakeMongoDbService();

// Set up test data
const mockObjectIdString = '123456789012345678901234';
const mockObjectId = new ObjectId(mockObjectIdString);
const mockIndustry = {
  _id: mockObjectIdString,
  name: 'Test Industry',
  industryType: 'Manufacturing',
  locationId: 'loc1'
};

// Set up mock collections
const mockCollection = {
  findOne: jest.fn().mockResolvedValue(mockIndustry),
  updateOne: jest.fn().mockResolvedValue({ matchedCount: 1 }),
  deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
};

// Mock the MongoDB service module and the ObjectId constructor
jest.mock('@/lib/services/mongodb.service', () => ({
  MongoDbService: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    getIndustriesCollection: jest.fn().mockReturnValue(mockCollection),
    toObjectId: jest.fn(id => mockObjectId)
  }))
}));

// Define a properly typed mock Response interface
interface MockResponse {
  body: string;
  parsedBody: any;
  status: number;
  headers: Record<string, string>;
  json: () => Promise<Record<string, unknown>>;
}

// Mock Response constructor for testing
global.Response = jest.fn().mockImplementation((body, options) => {
  const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
  return {
    body,
    parsedBody,
    status: options?.status || 200,
    headers: options?.headers || {},
    json: () => Promise.resolve(parsedBody)
  } as MockResponse;
});

// These will be loaded dynamically in tests
let GET: (request: NextRequest, context: { params: { id: string } }) => Promise<Response>;
let PUT: (request: NextRequest, context: { params: { id: string } }) => Promise<Response>;
let DELETE: (request: NextRequest, context: { params: { id: string } }) => Promise<Response>;

describe('Industry API', () => {
  let mockRequest: NextRequest;
  let mockParams: { params: { id: string } };
  let mockPutRequest: NextRequest;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {} as NextRequest;
    mockParams = { params: { id: mockObjectIdString } };
    
    // Set up the PUT request mock with json method
    mockPutRequest = {
      json: jest.fn().mockResolvedValue({
        name: 'Updated Industry',
        industryType: 'Warehouse',
        locationId: 'loc2'
      })
    } as unknown as NextRequest;
    
    // Load the route handlers after setting up mocks
    jest.isolateModules(() => {
      const routeModule = require('../route');
      GET = routeModule.GET;
      PUT = routeModule.PUT;
      DELETE = routeModule.DELETE;
    });
  });

  describe('GET', () => {
    it('should retrieve an industry by ID', async () => {
      // Execute the function
      const response = await GET(mockRequest, mockParams) as MockResponse;
      
      // Verify that the response contains the mock industry
      expect(response.status).toBe(200);
      expect(response.parsedBody).toEqual(mockIndustry);
      
      // Verify that the correct MongoDB calls were made
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: mockObjectId });
    }, 30000); // Increase timeout

    it('should return 404 when industry is not found', async () => {
      // Mock the findOne method to return null
      mockCollection.findOne.mockResolvedValueOnce(null);
      
      // Execute the function
      const response = await GET(mockRequest, mockParams) as MockResponse;
      
      // Verify 404 response
      expect(response.status).toBe(404);
      expect(response.parsedBody).toEqual({ error: 'Industry not found' });
    }, 30000); // Increase timeout

    it('should handle errors gracefully', async () => {
      // Mock the findOne method to throw an error
      mockCollection.findOne.mockRejectedValueOnce(new Error('Database connection error'));
      
      // Execute the function
      const response = await GET(mockRequest, mockParams) as MockResponse;
      
      // Verify error response
      expect(response.status).toBe(500);
      expect(response.parsedBody).toEqual({ error: 'Failed to fetch industry' });
    }, 30000); // Increase timeout
  });

  describe('PUT', () => {
    it('should update an industry successfully', async () => {
      // Execute the function
      const response = await PUT(mockPutRequest, mockParams) as MockResponse;
      
      // Verify success response
      expect(response.status).toBe(200);
      expect(response.parsedBody).toEqual({ message: 'Industry updated successfully' });
      
      // Verify MongoDB calls
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: mockObjectId },
        { $set: expect.any(Object) }
      );
    }, 30000); // Increase timeout

    it('should return 404 when industry is not found for update', async () => {
      // Mock the findOne method to return null (industry not found)
      mockCollection.findOne.mockResolvedValueOnce(null);
      
      // Execute the function
      const response = await PUT(mockPutRequest, mockParams) as MockResponse;
      
      // Verify 404 response
      expect(response.status).toBe(404);
      expect(response.parsedBody).toEqual({ error: 'Industry not found' });
    }, 30000); // Increase timeout

    it('should handle errors gracefully during update', async () => {
      // Mock the findOne method to throw an error
      mockCollection.findOne.mockRejectedValueOnce(new Error('Database connection error'));
      
      // Execute the function
      const response = await PUT(mockPutRequest, mockParams) as MockResponse;
      
      // Verify error response
      expect(response.status).toBe(500);
      expect(response.parsedBody).toEqual({ error: 'Failed to update industry' });
    }, 30000); // Increase timeout
  });

  describe('DELETE', () => {
    it('should delete an industry successfully', async () => {
      // Execute the function
      const response = await DELETE(mockRequest, mockParams) as MockResponse;
      
      // Verify success response
      expect(response.status).toBe(200);
      expect(response.parsedBody).toEqual({ message: 'Industry deleted successfully' });
      
      // Verify MongoDB calls
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: mockObjectId });
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: mockObjectId });
    }, 30000); // Increase timeout

    it('should return 404 when industry is not found for deletion', async () => {
      // Mock the findOne method to return null
      mockCollection.findOne.mockResolvedValueOnce(null);
      
      // Execute the function
      const response = await DELETE(mockRequest, mockParams) as MockResponse;
      
      // Verify 404 response
      expect(response.status).toBe(404);
      expect(response.parsedBody).toEqual({ error: 'Industry not found' });
    }, 30000); // Increase timeout

    it('should handle errors gracefully during deletion', async () => {
      // Mock the findOne method to throw an error
      mockCollection.findOne.mockRejectedValueOnce(new Error('Database connection error'));
      
      // Execute the function
      const response = await DELETE(mockRequest, mockParams) as MockResponse;
      
      // Verify error response
      expect(response.status).toBe(500);
      expect(response.parsedBody).toEqual({ error: 'Failed to delete industry' });
    }, 30000); // Increase timeout
  });
}); 