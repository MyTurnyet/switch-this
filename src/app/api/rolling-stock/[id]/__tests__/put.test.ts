import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
// import { FakeMongoDbService } from '@/test/utils/mongodb-test-utils';

// Create a fake MongoDB service instance
// const fakeMongoService = new FakeMongoDbService();

// Define mocks for MongoDB collections
const mockCollection = {
  findOne: jest.fn() as jest.Mock<any, any>,
  updateOne: jest.fn() as jest.Mock<any, any>
};

// Mock the MongoDB service module
jest.mock('@/lib/services/mongodb.service', () => ({
  MongoDbService: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    getRollingStockCollection: jest.fn().mockReturnValue(mockCollection),
    toObjectId: jest.fn(id => new ObjectId(id))
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

// This will be loaded dynamically in tests
let PUT: (request: NextRequest, context: { params: { id: string } }) => Promise<Response>;

describe('Rolling Stock API - PUT', () => {
  let mockRequestJson: jest.Mock;
  let mockRequest: NextRequest;
  let mockParams: { params: { id: string } };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configure mocks
    mockRequestJson = jest.fn();
    mockRequest = {
      json: mockRequestJson
    } as unknown as NextRequest;

    mockParams = { params: { id: '507f1f77bcf86cd799439011' } };
    
    // Load the route handlers after setting up mocks
    jest.isolateModules(() => {
      const routeModule = require('../route');
      PUT = routeModule.PUT;
    });
  });

  it('updates rolling stock with a new CarDestination', async () => {
    // Set up mock request data with a CarDestination
    const mockRollingStockData = {
      roadName: 'BNSF',
      roadNumber: '12345',
      aarType: 'Boxcar',
      description: 'Test boxcar',
      homeYard: 'yard1',
      destination: {
        immediateDestination: {
          locationId: 'loc3', // Fiddle yard
          industryId: 'ind3',  // Yard industry
          trackId: 'track3'    // Yard track
        },
        finalDestination: {
          locationId: 'loc2', // Chicago
          industryId: 'ind2',  // Chicago steel mill
          trackId: 'track2'    // Industry track
        }
      }
    };

    mockRequestJson.mockResolvedValue(mockRollingStockData);
    mockCollection.findOne.mockResolvedValueOnce({ _id: mockParams.params.id, ...mockRollingStockData });
    mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 1 });

    const response = await PUT(mockRequest, mockParams) as MockResponse;

    // Verify that the request data was sanitized (removing _id)
    expect(mockCollection.updateOne).toHaveBeenCalled();
    const updateArgs = mockCollection.updateOne.mock.calls[0];
    
    // Specifically check that the destination object was correctly passed
    expect(updateArgs[1].$set.destination).toEqual({
      immediateDestination: {
        locationId: 'loc3',
        industryId: 'ind3',
        trackId: 'track3'
      },
      finalDestination: {
        locationId: 'loc2',
        industryId: 'ind2',
        trackId: 'track2'
      }
    });
    
    // Verify the response
    expect(response.status).toBe(200);
    expect(response.parsedBody).toEqual({ message: 'Rolling stock updated successfully' });
  }, 30000); // Increase timeout

  it('updates rolling stock with only immediateDestination (no finalDestination)', async () => {
    // Set up mock request data with only immediateDestination
    const mockRollingStockData = {
      roadName: 'UP',
      roadNumber: '54321',
      aarType: 'Tanker',
      description: 'Test tanker',
      homeYard: 'yard1',
      destination: {
        immediateDestination: {
          locationId: 'loc1', // On-layout location
          industryId: 'ind1',  // Industry
          trackId: 'track1'    // Industry track
        }
        // No finalDestination - direct routing to on-layout location
      }
    };

    mockRequestJson.mockResolvedValue(mockRollingStockData);
    mockCollection.findOne.mockResolvedValueOnce({ _id: mockParams.params.id, ...mockRollingStockData });
    mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 1 });

    const response = await PUT(mockRequest, mockParams) as MockResponse;

    // Verify the update was called with the correct destination
    const updateArgs = mockCollection.updateOne.mock.calls[0];
    expect(updateArgs[1].$set.destination).toEqual({
      immediateDestination: {
        locationId: 'loc1',
        industryId: 'ind1',
        trackId: 'track1'
      }
      // finalDestination should not be present
    });
    
    // Verify the response
    expect(response.status).toBe(200);
  }, 30000); // Increase timeout

  it('handles case when rolling stock has current location but no destination', async () => {
    // Set up mock request data with currentLocation but no destination
    const mockRollingStockData = {
      roadName: 'CN',
      roadNumber: '78901',
      aarType: 'Hopper',
      description: 'Test hopper',
      homeYard: 'yard1',
      currentLocation: {
        industryId: 'ind1',
        trackId: 'track1'
      }
      // No destination - static car
    };

    mockRequestJson.mockResolvedValue(mockRollingStockData);
    mockCollection.findOne.mockResolvedValueOnce({ _id: mockParams.params.id, ...mockRollingStockData });
    mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 1 });

    const response = await PUT(mockRequest, mockParams) as MockResponse;

    // Verify the update was called with the correct data
    const updateArgs = mockCollection.updateOne.mock.calls[0];
    expect(updateArgs[1].$set.currentLocation).toEqual({
      industryId: 'ind1',
      trackId: 'track1'
    });
    expect(updateArgs[1].$set.destination).toBeUndefined();
    
    // Verify the response
    expect(response.status).toBe(200);
  }, 30000); // Increase timeout

  it('returns 404 when rolling stock is not found', async () => {
    // Set up mock to simulate no rolling stock found
    mockCollection.findOne.mockResolvedValueOnce(null);

    mockRequestJson.mockResolvedValue({
      roadName: 'Test',
      roadNumber: '12345'
    });

    const response = await PUT(mockRequest, mockParams) as MockResponse;

    // Verify error response
    expect(response.status).toBe(404);
    expect(response.parsedBody).toEqual({ error: 'Rolling stock not found' });
  }, 30000); // Increase timeout

  it('handles errors properly', async () => {
    // Mock a database error
    const connectMock = jest.fn().mockRejectedValue(new Error('Database connection error'));
    
    jest.mock('@/lib/services/mongodb.service', () => ({
      MongoDbService: jest.fn().mockImplementation(() => ({
        connect: connectMock,
        close: jest.fn().mockResolvedValue(undefined),
        getRollingStockCollection: jest.fn().mockReturnValue(mockCollection),
        toObjectId: jest.fn(id => new ObjectId(id))
      }))
    }), { virtual: true });

    mockRequestJson.mockResolvedValue({
      roadName: 'Test',
      roadNumber: '12345'
    });

    // Need to reload the module to get the mocked connect behavior
    jest.isolateModules(() => {
      const routeModule = require('../route');
      PUT = routeModule.PUT;
    });

    const response = await PUT(mockRequest, mockParams) as MockResponse;

    // Verify error response
    expect(response.status).toBe(500);
    expect(response.parsedBody).toEqual({ error: 'Failed to update rolling stock' });
  }, 30000); // Increase timeout
}); 