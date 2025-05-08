import { NextRequest } from 'next/server';
import { LocationType } from '@/app/shared/types/models';
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
  getLocationsCollection: jest.fn().mockReturnValue(mockCollection)
};

// Mock the MongoDB service
jest.mock('@/lib/services/mongodb.service', () => ({
  MongoDbService: jest.fn().mockImplementation(() => mockMongoService)
}));

// Import route handlers after mocks are set up
let GET_HANDLER: (req?: NextRequest) => Promise<Response>;
let POST_HANDLER: (req: Request) => Promise<Response>;
let OPTIONS_HANDLER: () => Response;

// Load the actual module after all mocks are in place
jest.isolateModules(() => {
  const routeModule = require('../route');
  GET_HANDLER = routeModule.GET;
  POST_HANDLER = routeModule.POST;
  OPTIONS_HANDLER = routeModule.OPTIONS;
});

describe('Locations API', () => {
  // Define the mock location data type
  type MockLocation = {
    _id: string;
    stationName: string;
    block: string;
    locationType?: string;
    ownerId?: string;
  };

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
    it('returns all locations with correct location types', async () => {
      // Mock data - some with locationType, some without
      const mockLocations: MockLocation[] = [
        { _id: '1', stationName: 'Echo Lake, WA', block: 'A', locationType: LocationType.ON_LAYOUT },
        { _id: '2', stationName: 'Chicago Yard', block: 'B' }, // Should get FIDDLE_YARD
        { _id: '3', stationName: 'Portland, OR', block: 'C' }, // Should get ON_LAYOUT
      ];
      
      // Setup mock responses
      mockCollection.find().toArray.mockResolvedValue(mockLocations);
      
      // Call the handler
      const response = await GET_HANDLER() as MockResponse;

      // Verify MongoDB methods were called
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getLocationsCollection).toHaveBeenCalled();
      expect(mockMongoService.close).toHaveBeenCalled();
      
      // Verify response
      const enhancedLocations = response.parsedBody as MockLocation[];
      
      // Check that location types were assigned correctly
      expect(enhancedLocations[0].locationType).toBe(LocationType.ON_LAYOUT); // Kept existing
      expect(enhancedLocations[1].locationType).toBe(LocationType.FIDDLE_YARD); // Assigned based on "Yard"
      expect(enhancedLocations[2].locationType).toBe(LocationType.ON_LAYOUT); // Default
    });

    it('handles errors gracefully', async () => {
      // Setup mock to throw an error
      mockMongoService.connect.mockRejectedValue(new Error('Database error'));
      
      // Call the handler
      const response = await GET_HANDLER() as MockResponse;

      // Verify error response
      expect(response.parsedBody).toEqual({ error: 'Failed to fetch locations' });
      expect(response.status).toBe(500);
    });
  });

  describe('POST', () => {
    it('creates a new location', async () => {
      // Clear mocks before test
      jest.clearAllMocks();
      
      // Mock data
      const newLocation = {
        stationName: 'New Station',
        blockId: 'block123',
        locationType: LocationType.ON_LAYOUT
      };
      
      // Set up validations to pass
      mockRequestJson.mockResolvedValue(newLocation);
      
      // Setup mock responses
      const mockInsertedId = '123abc';
      mockCollection.insertOne.mockResolvedValue({ 
        insertedId: mockInsertedId, 
        acknowledged: true 
      });
      
      // Mock findOne to return the new location
      const createdLocation = { ...newLocation, _id: mockInsertedId };
      mockCollection.findOne.mockResolvedValue(createdLocation);
      
      // Force the service mock to connect and return the collection
      mockMongoService.connect.mockResolvedValue(undefined);
      mockMongoService.getLocationsCollection.mockReturnValue(mockCollection);
      
      // Create a proper mock request
      const mockReq = {
        json: jest.fn().mockResolvedValue(newLocation)
      };
      
      // Call the handler with the properly mocked request
      const response = await POST_HANDLER(mockReq as unknown as Request) as MockResponse;

      // Verify MongoDB methods were called
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getLocationsCollection).toHaveBeenCalled();
      expect(mockCollection.insertOne).toHaveBeenCalled();
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: mockInsertedId });
      expect(mockMongoService.close).toHaveBeenCalled();

      // Verify response
      expect(response.parsedBody).toEqual(createdLocation);
      expect(response.status).toBe(200);
    });

    it('validates required fields', async () => {
      // Test cases for validation
      const testCases = [
        {
          data: { blockId: 'block123', locationType: LocationType.ON_LAYOUT },
          error: 'Station name is required'
        },
        {
          data: { stationName: 'Test', locationType: LocationType.ON_LAYOUT },
          error: 'Block is required'
        },
        {
          data: { stationName: 'Test', blockId: 'block123', locationType: 'INVALID' },
          error: 'Valid location type is required'
        }
      ];

      for (const { data, error } of testCases) {
        jest.clearAllMocks();
        mockRequestJson.mockResolvedValue(data);
        
        // Call the handler
        const response = await POST_HANDLER(mockRequest as unknown as Request) as MockResponse;

        // Verify validation error
        expect(response.parsedBody).toEqual({ error });
        expect(response.status).toBe(400);
      }
    });

    it('handles errors gracefully', async () => {
      // Mock data
      const newLocation = {
        stationName: 'New Station',
        blockId: 'block123',
        locationType: LocationType.ON_LAYOUT
      };
      
      // Mock request
      mockRequestJson.mockResolvedValue(newLocation);
      
      // Setup mock to throw an error
      mockMongoService.connect.mockRejectedValue(new Error('Database error'));
      
      // Call the handler
      const response = await POST_HANDLER(mockRequest as unknown as Request) as MockResponse;

      // Verify error response
      expect(response.parsedBody).toEqual({ error: 'Database error' });
      expect(response.status).toBe(500);
    });
  });

  describe('OPTIONS', () => {
    it('returns CORS headers', async () => {
      // Call the handler
      const response = await OPTIONS_HANDLER() as MockResponse;

      // Verify CORS headers are present
      expect(response.status).toBe(200);
      expect(response.headers).toEqual(expect.objectContaining({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With',
      }));
    });
  });
}); 