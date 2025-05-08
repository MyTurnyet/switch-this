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

// Create a mock ObjectId class
class MockObjectId {
  id: string;
  
  constructor(id: string) {
    this.id = id;
  }
  
  toString() {
    return this.id;
  }
}

// Create mock collections
const rollingStockCollection = {
  find: jest.fn(),
  updateOne: jest.fn(),
};

const industriesCollection = {
  find: jest.fn(),
  updateMany: jest.fn(),
  updateOne: jest.fn(),
};

// Create mockMongoService before it's used
const mockMongoService = {
  connect: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  getRollingStockCollection: jest.fn().mockReturnValue(rollingStockCollection),
  getIndustriesCollection: jest.fn().mockReturnValue(industriesCollection),
  toObjectId: jest.fn(id => new MockObjectId(id))
};

// Set up MongoDB service mock
jest.mock('@/lib/services/mongodb.service', () => ({
  MongoDbService: jest.fn().mockImplementation(() => mockMongoService)
}));

// Mock the ObjectId constructor
jest.mock('mongodb', () => {
  return {
    ...jest.requireActual('mongodb'),
    ObjectId: jest.fn().mockImplementation((id) => new MockObjectId(id))
  };
});

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
    
    // Set up mock data for rolling stock
    const mockRollingStock = [
      { 
        _id: '1', 
        roadName: 'TEST', 
        roadNumber: '1001', 
        homeYard: 'yard1',
        aarType: 'XM'
      },
      { 
        _id: '2', 
        roadName: 'TEST', 
        roadNumber: '1002', 
        homeYard: 'freight1',
        aarType: 'FM'
      },
      { 
        _id: '3', 
        roadName: 'TEST', 
        roadNumber: '1003', 
        homeYard: 'industry1',
        aarType: 'HK'
      }
    ];
    
    // Set up mock data for industries
    const mockIndustries = [
      {
        _id: 'yard1',
        name: 'Yard 1',
        industryType: 'YARD',
        tracks: [{ _id: 'track1', acceptedCarTypes: [], placedCars: [] }]
      },
      {
        _id: 'freight1',
        name: 'Freight 1',
        industryType: 'FREIGHT',
        tracks: [{ _id: 'track2', acceptedCarTypes: [], placedCars: [] }]
      },
      {
        _id: 'industry1',
        name: 'Industry 1',
        industryType: 'INDUSTRY',
        tracks: [{ _id: 'track3', acceptedCarTypes: [], placedCars: [] }]
      }
    ];
    
    // Configure mocks
    rollingStockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockRollingStock)
    });
    
    industriesCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockIndustries)
    });
    
    rollingStockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
    industriesCollection.updateMany.mockResolvedValue({ modifiedCount: 1 });
    industriesCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

    // Reset connect method to default success implementation
    mockMongoService.connect.mockResolvedValue(undefined);
  });
  
  it('should reset rolling stock to their home yards or industry tracks', async () => {
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
    
    // Verify cars are updated with new locations
    expect(rollingStockCollection.updateOne).toHaveBeenCalledWith(
      { _id: expect.anything() },
      expect.objectContaining({ 
        $unset: expect.any(Object) 
      })
    );
    
    // Verify a second call to updateOne is made with car location
    expect(rollingStockCollection.updateOne).toHaveBeenCalledWith(
      { _id: expect.anything() },
      expect.objectContaining({ 
        $set: expect.objectContaining({
          currentLocation: expect.any(Object)
        })
      })
    );
    
    // Verify that cars are placed at their tracks
    expect(industriesCollection.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ 
        _id: expect.anything(),
        "tracks._id": expect.anything()
      }),
      expect.objectContaining({ 
        $push: expect.any(Object) 
      })
    );
    
    // Verify that all cars have been processed (3 cars = 6 updates - 3 for clearing, 3 for placing)
    expect(rollingStockCollection.updateOne).toHaveBeenCalledTimes(6);
    
    // Verify that all industries have been updated to place cars
    expect(industriesCollection.updateOne).toHaveBeenCalledTimes(6);
    
    // Verify connection is closed
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