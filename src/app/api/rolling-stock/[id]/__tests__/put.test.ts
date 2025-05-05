import { PUT } from '../route';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { FakeMongoDbService } from '@/test/utils/mongodb-test-utils';

// Mock the MongoDB service
jest.mock('@/lib/services/mongodb.service', () => ({
  MongoDbService: jest.fn().mockImplementation(() => {
    return new FakeMongoDbService();
  })
}));

describe('Rolling Stock API - PUT', () => {
  type MockCollection = {
    updateOne: jest.Mock;
  };

  let fakeMongoService: FakeMongoDbService;
  let mockCollection: MockCollection;
  let mockRequestJson: jest.Mock;
  let mockRequest: NextRequest;
  let mockParams: { id: string };
  
  beforeEach(() => {
    // Set up mock collection
    mockCollection = {
      updateOne: jest.fn().mockResolvedValue({ matchedCount: 1 })
    };

    // Use FakeMongoDbService
    fakeMongoService = new FakeMongoDbService();
    fakeMongoService.isConnected = true;
    
    // Configure mocks
    jest.spyOn(fakeMongoService, 'getRollingStockCollection').mockReturnValue(mockCollection as any);
    jest.spyOn(fakeMongoService, 'toObjectId').mockImplementation((id: string) => new ObjectId(id));
    
    // Mock the MongoDbService constructor
    jest.mock('@/lib/services/mongodb.service', () => ({
      MongoDbService: jest.fn().mockImplementation(() => fakeMongoService)
    }));

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

  afterEach(() => {
    jest.clearAllMocks();
    fakeMongoService.clearCallHistory();
  });
}); 