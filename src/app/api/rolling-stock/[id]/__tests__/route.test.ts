import { GET, PUT, DELETE } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { ObjectId } from 'mongodb';

import { FakeMongoDbService, createMongoDbTestSetup } from '@/test/utils/mongodb-test-utils';
// Using FakeMongoDbService from test utils instead of custom mocks

// Now mock the MongoDB provider
// MongoDB provider mocking is now handled by createMongoDbTestSetup()



// Using FakeMongoDbService from test utils instead of custom mocks

// Now mock the MongoDB provider
// Mock removed and replaced with proper declaration




// Create a MongoDB provider and service that will be used throughout this file
const mongoDbProvider = new MongoDbProvider(new MongoDbService());

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      json: () => data,
      status: options?.status || 200
    }))
  }
}));

// Mock MongoDbService provider
jest.mock('@/lib/services/mongodb.provider', () => {
  return {
    MongoDbProvider: jest.fn().mockImplementation(() => ({
    getService: jest.fn().mockReturnValue(fakeMongoService)
  })),
  };
});

describe('Rolling Stock [id] API Route', () => {
  let fakeMongoService: MongoDbService;
  const mockParams = { params: { id: 'mock-id' } };
  const mockObjectId = 'mock-id';
  
  beforeEach(() => {
  // Setup mock collections for this test
  beforeEach(() => {
    // Configure the fake service collections
    const rollingStockCollection = fakeMongoService.getRollingStockCollection();
    const industriesCollection = fakeMongoService.getIndustriesCollection();
    const locationsCollection = fakeMongoService.getLocationsCollection();
    const trainRoutesCollection = fakeMongoService.getTrainRoutesCollection();
    const switchlistsCollection = fakeMongoService.getSwitchlistsCollection();
    
    // Configure collection methods as needed for specific tests
    // Example: rollingStockCollection.find.mockImplementation(() => ({ toArray: jest.fn().mockResolvedValue([mockRollingStock]) }));
  });

    jest.clearAllMocks();
    
    // Create mock collections
    const mockRollingStockCollection = {
      findOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn()
    };
    
    // Setup mock MongoDB service
    fakeMongoService = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      getRollingStockCollection: jest.fn().mockReturnValue(mockRollingStockCollection),
      toObjectId: jest.fn().mockReturnValue(mockObjectId),
      // Add other required methods
      getCollection: jest.fn(),
      getIndustriesCollection: jest.fn(),
      getLocationsCollection: jest.fn(),
      getTrainRoutesCollection: jest.fn(),
      getLayoutStateCollection: jest.fn()
    } as unknown as MongoDbService;
    
    // Inject our mock
    const mockProvider = new MongoDbProvider(fakeMongoService);
  (MongoDbProvider as jest.Mock).mockReturnValue(mockProvider);
  });

  describe('GET', () => {
    it('should return a rolling stock item by id', async () => {
      // Setup mock to return a rolling stock item
      const mockRollingStock = { _id: 'mock-id', roadName: 'TEST', roadNumber: '12345' };
      const mockCollection = fakeMongoService.getRollingStockCollection();
      (mockCollection.findOne as jest.Mock).mockResolvedValueOnce(mockRollingStock);
      
      // Create a mock request
      const mockRequest = {} as NextRequest;
      
      // Call the API
      const response = await GET(mockRequest, mockParams);
      
      // Verify MongoDB was called correctly
      expect(fakeMongoService.connect).toHaveBeenCalled();
      expect(fakeMongoService.getRollingStockCollection).toHaveBeenCalled();
      expect(mockCollection.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: mockObjectId })
      );
      
      // Extract the JSON response
      const responseData = await response.json();
      
      // Verify the response
      expect(responseData).toEqual({ _id: 'mock-id', roadName: 'TEST', roadNumber: '12345' });
    });
    
    it('should return 404 when rolling stock is not found', async () => {
      // Setup mock to return null (item not found)
      const mockCollection = fakeMongoService.getRollingStockCollection();
      (mockCollection.findOne as jest.Mock).mockResolvedValueOnce(null);
      
      // Create a mock request
      const mockRequest = {} as NextRequest;
      
      // Call the API
      const response = await GET(mockRequest, mockParams);
      
      // Verify response status
      expect(response.status).toBe(404);
      expect(response.json()).toEqual({ error: 'Rolling stock not found' });
    });
  });

  describe('PUT', () => {
    it('should update a rolling stock item', async () => {
      // Setup mocks for a successful update
      const mockCollection = fakeMongoService.getRollingStockCollection();
      (mockCollection.updateOne as jest.Mock).mockResolvedValueOnce({ matchedCount: 1 });
      
      // Create a mock request with update data
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({ roadName: 'UPDATED', roadNumber: '54321' })
      } as unknown as NextRequest;
      
      // Call the API
      const response = await PUT(mockRequest, mockParams);
      
      // Verify MongoDB was called correctly
      expect(fakeMongoService.connect).toHaveBeenCalled();
      expect(fakeMongoService.getRollingStockCollection).toHaveBeenCalled();
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: mockObjectId }),
        expect.objectContaining({ $set: { roadName: 'UPDATED', roadNumber: '54321' } })
      );
      
      // Extract the JSON response
      const responseData = await response.json();
      
      // Verify the response
      expect(responseData).toEqual({ message: 'Rolling stock updated successfully' });
    });
    
    it('should return 404 when rolling stock is not found', async () => {
      // Setup mock to indicate no documents matched for update
      const mockCollection = fakeMongoService.getRollingStockCollection();
      (mockCollection.updateOne as jest.Mock).mockResolvedValueOnce({ matchedCount: 0 });
      
      // Create a mock request with update data
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({ roadName: 'UPDATED' })
      } as unknown as NextRequest;
      
      // Call the API
      const response = await PUT(mockRequest, mockParams);
      
      // Verify response
      expect(response.status).toBe(404);
      expect(response.json()).toEqual({ error: 'Rolling stock not found' });
    });
  });

  describe('DELETE', () => {
    it('should delete a rolling stock item', async () => {
      // Setup mock for successful deletion
      const mockCollection = fakeMongoService.getRollingStockCollection();
      (mockCollection.deleteOne as jest.Mock).mockResolvedValueOnce({ deletedCount: 1 });
      
      // Create a mock request
      const mockRequest = {} as NextRequest;
      
      // Call the API
      const response = await DELETE(mockRequest, mockParams);
      
      // Verify MongoDB was called correctly
      expect(fakeMongoService.connect).toHaveBeenCalled();
      expect(fakeMongoService.getRollingStockCollection).toHaveBeenCalled();
      expect(mockCollection.deleteOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: mockObjectId })
      );
      
      // Extract the JSON response
      const responseData = await response.json();
      
      // Verify the response
      expect(responseData).toEqual({ message: 'Rolling stock deleted successfully' });
    });
    
    it('should return 404 when rolling stock is not found', async () => {
      // Setup mock to indicate no documents deleted
      const mockCollection = fakeMongoService.getRollingStockCollection();
      (mockCollection.deleteOne as jest.Mock).mockResolvedValueOnce({ deletedCount: 0 });
      
      // Create a mock request
      const mockRequest = {} as NextRequest;
      
      // Call the API
      const response = await DELETE(mockRequest, mockParams);
      
      // Verify response
      expect(response.status).toBe(404);
      expect(response.json()).toEqual({ error: 'Rolling stock not found' });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    fakeMongoService.clearCallHistory();
  });
});

describe('Rolling Stock API - PUT', () => {
  type MockMongoService = {
    connect: jest.Mock;
    close: jest.Mock;
    getRollingStockCollection: jest.Mock;
    toObjectId: jest.Mock;
  };

  type MockCollection = {
    updateOne: jest.Mock;
  };

  let fakeMongoService: MockMongoService;
  let mockCollection: MockCollection;
  let mockRequestJson: jest.Mock;
  let mockRequest: NextRequest;
  let mockParams: { id: string };
  
  beforeEach(() => {
    // Set up mock MongoDB service and collection
    mockCollection = {
      updateOne: jest.fn().mockResolvedValue({ matchedCount: 1 })
    };

    fakeMongoService = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      getRollingStockCollection: jest.fn().mockReturnValue(mockCollection),
      toObjectId: jest.fn().mockImplementation((id: string) => new ObjectId(id))
    };

    const mockProvider = new MongoDbProvider(fakeMongoService);
  (MongoDbProvider as jest.Mock).mockReturnValue(mockProvider);

    // Set up mock request
    mockRequestJson = jest.fn();
    mockRequest = {
      json: mockRequestJson
    } as unknown as NextRequest;

    mockParams = { id: '507f1f77bcf86cd799439011' };
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

    // Mock NextResponse.json to capture the returned data
    const mockJson = jest.fn().mockReturnValue({});
    (NextResponse.json as jest.Mock) = mockJson;

    await PUT(mockRequest, { params: mockParams });

    // Verify that the MongoDB service methods were called correctly
    expect(fakeMongoService.connect).toHaveBeenCalled();
    expect(fakeMongoService.getRollingStockCollection).toHaveBeenCalled();
    expect(fakeMongoService.close).toHaveBeenCalled();

    // Verify that the request data was sanitized (removing _id)
    expect(mockCollection.updateOne).toHaveBeenCalled();
    const updateArgs = mockCollection.updateOne.mock.calls[0];
    
    // First arg should be the query
    expect(updateArgs[0]).toEqual({ _id: expect.any(ObjectId) });
    
    // Second arg should be the update with $set
    expect(updateArgs[1]).toEqual({ 
      $set: {
        ...mockRollingStockData,
        // _id should not be present
      }
    });
    
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
    
    // Verify success response
    expect(mockJson).toHaveBeenCalledWith({ message: 'Rolling stock updated successfully' });
  });

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

    // Mock NextResponse.json
    const mockJson = jest.fn().mockReturnValue({});
    (NextResponse.json as jest.Mock) = mockJson;

    await PUT(mockRequest, { params: mockParams });

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
  });

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

    // Mock NextResponse.json
    const mockJson = jest.fn().mockReturnValue({});
    (NextResponse.json as jest.Mock) = mockJson;

    await PUT(mockRequest, { params: mockParams });

    // Verify the update was called with the correct data
    const updateArgs = mockCollection.updateOne.mock.calls[0];
    expect(updateArgs[1].$set.currentLocation).toEqual({
      industryId: 'ind1',
      trackId: 'track1'
    });
    expect(updateArgs[1].$set.destination).toBeUndefined();
  });

  it('returns 404 when rolling stock is not found', async () => {
    // Set up mock to simulate no rolling stock found
    mockCollection.updateOne.mockResolvedValue({ matchedCount: 0 });

    mockRequestJson.mockResolvedValue({
      roadName: 'Test',
      roadNumber: '12345'
    });

    // Mock NextResponse.json
    const mockJson = jest.fn().mockReturnValue({});
    (NextResponse.json as jest.Mock) = mockJson;

    await PUT(mockRequest, { params: mockParams });

    // Verify error response
    expect(mockJson).toHaveBeenCalledWith(
      { error: 'Rolling stock not found' },
      { status: 404 }
    );
  });

  it('handles errors properly', async () => {
    // Mock a database error
    fakeMongoService.connect.mockRejectedValue(new Error('Database connection error'));

    mockRequestJson.mockResolvedValue({
      roadName: 'Test',
      roadNumber: '12345'
    });

    // Mock NextResponse.json
    const mockJson = jest.fn().mockReturnValue({});
    (NextResponse.json as jest.Mock) = mockJson;

    await PUT(mockRequest, { params: mockParams });

    // Verify error response
    expect(mockJson).toHaveBeenCalledWith(
      { error: 'Failed to update rolling stock' },
      { status: 500 }
    );
  });
}); 