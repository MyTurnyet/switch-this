import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';

// Define a properly typed mock Response interface
interface MockResponse {
  body: string;
  parsedBody: any;
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
const rollingStockCollection = {
  find: jest.fn(),
  updateOne: jest.fn(),
};

const industriesCollection = {
  find: jest.fn(),
  updateMany: jest.fn(),
};

// Create mockMongoService before it's used
const mockMongoService = {
  connect: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  getRollingStockCollection: jest.fn().mockReturnValue(rollingStockCollection),
  getIndustriesCollection: jest.fn().mockReturnValue(industriesCollection),
  toObjectId: jest.fn(id => id)
};

// Set up MongoDB service mock
jest.mock('@/lib/services/mongodb.service', () => ({
  MongoDbService: jest.fn().mockImplementation(() => mockMongoService)
}));

// Import POST route after all mocks are set up
let POST: any;

// Load the actual module after all mocks are in place
jest.isolateModules(() => {
  const routeModule = require('../route');
  POST = routeModule.POST;
});

describe('Reset Rolling Stock Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mock data
    const mockRollingStock = [
      { 
        _id: { toString: () => '1' }, 
        roadName: 'TEST', 
        roadNumber: '1001', 
        homeYard: 'Test Yard',
        aarType: 'XM'
      },
      { 
        _id: { toString: () => '2' }, 
        roadName: 'TEST', 
        roadNumber: '1002', 
        homeYard: 'Test Yard',
        aarType: 'FM'
      }
    ];
    
    // Configure mocks
    rollingStockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockRollingStock)
    });
    
    rollingStockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
    industriesCollection.updateMany.mockResolvedValue({ modifiedCount: 1 });
  });
  
  it('should reset rolling stock to their home yards', async () => {
    // Call the route
    const mockRequest = {} as NextRequest;
    const response = await POST(mockRequest) as MockResponse;
    
    // Check the success response
    expect(response).toBeDefined();
    expect(response.parsedBody).toEqual({ 
      success: true, 
      message: 'All rolling stock reset to home yards' 
    });
    expect(response.status).toBe(200);
    
    // Verify MongoDB operations
    expect(mockMongoService.connect).toHaveBeenCalled();
    expect(mockMongoService.getRollingStockCollection).toHaveBeenCalled();
    expect(mockMongoService.getIndustriesCollection).toHaveBeenCalled();
    expect(rollingStockCollection.find).toHaveBeenCalled();
    expect(industriesCollection.updateMany).toHaveBeenCalledWith(
      { 'tracks.placedCars': { $exists: true, $ne: [] } },
      { $set: { 'tracks.$[].placedCars': [] } }
    );
    expect(rollingStockCollection.updateOne).toHaveBeenCalledTimes(2);
    expect(mockMongoService.close).toHaveBeenCalled();
  });
  
  it('should return an error response when something goes wrong', async () => {
    // Make getRollingStockCollection throw an error
    const errorMessage = 'Test error';
    mockMongoService.connect.mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });
    
    // Call the route
    const mockRequest = {} as NextRequest;
    const response = await POST(mockRequest) as MockResponse;
    
    // Check the error response
    expect(response).toBeDefined();
    expect(response.parsedBody).toEqual({ error: 'Failed to reset rolling stock' });
    expect(response.status).toBe(500);
    
    // Verify close was called despite the error
    expect(mockMongoService.close).toHaveBeenCalled();
  });
}); 