import { GET } from '../route';
import { getMongoDbService } from '@/lib/services/mongodb.provider';
import { NextResponse } from 'next/server';
import { LocationType } from '@/app/shared/types/models';

// Mock the mongodb provider
jest.mock('@/lib/services/mongodb.provider', () => ({
  getMongoDbService: jest.fn()
}));

describe('Locations API', () => {
  type MockLocation = {
    _id: string;
    stationName: string;
    block: string;
    ownerId: string;
    locationType?: LocationType;
  };

  type MockMongoService = {
    connect: jest.Mock;
    close: jest.Mock;
    getLocationsCollection: jest.Mock;
  };

  type MockCollection = {
    find: jest.Mock;
    toArray: jest.Mock;
  };

  let mockMongoService: MockMongoService;
  let mockCollection: MockCollection;
  let mockLocationsData: MockLocation[];

  beforeEach(() => {
    // Set up mock location data
    mockLocationsData = [
      {
        _id: 'loc1',
        stationName: 'Echo Lake, WA',
        block: 'ECHO',
        ownerId: 'owner1'
      },
      {
        _id: 'loc2',
        stationName: 'Chicago, IL',
        block: 'EAST',
        ownerId: 'owner1'
      },
      {
        _id: 'loc3',
        stationName: 'Echo Lake Yard',
        block: 'ECHO',
        ownerId: 'owner1'
      },
      {
        _id: 'loc4',
        stationName: 'Portland, OR',
        block: 'SOUTH',
        ownerId: 'owner1'
      },
      {
        _id: 'loc5',
        stationName: 'High Bridge, WA',
        block: 'ECHO',
        ownerId: 'owner1'
      }
    ];

    // Set up mock MongoDB service and collection
    mockCollection = {
      find: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue(mockLocationsData)
    };

    mockMongoService = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      getLocationsCollection: jest.fn().mockReturnValue(mockCollection)
    };

    (getMongoDbService as jest.Mock).mockReturnValue(mockMongoService);
  });

  it('returns locations with correctly assigned location types', async () => {
    // Mock NextResponse.json to capture the returned data
    const mockJson = jest.fn().mockReturnValue({});
    (NextResponse.json as jest.Mock) = mockJson;

    await GET();

    // Verify that the MongoDB service methods were called correctly
    expect(mockMongoService.connect).toHaveBeenCalled();
    expect(mockMongoService.getLocationsCollection).toHaveBeenCalled();
    expect(mockMongoService.close).toHaveBeenCalled();

    // Verify that NextResponse.json was called with the enhanced locations
    expect(mockJson).toHaveBeenCalled();
    
    // Get the data that was passed to NextResponse.json
    const enhancedLocations = mockJson.mock.calls[0][0] as MockLocation[];
    
    // Verify that location types were correctly assigned
    expect(enhancedLocations).toHaveLength(5);
    
    // Check specific locations
    const echoLake = enhancedLocations.find(loc => loc._id === 'loc1');
    const chicago = enhancedLocations.find(loc => loc._id === 'loc2');
    const echoLakeYard = enhancedLocations.find(loc => loc._id === 'loc3');
    const portland = enhancedLocations.find(loc => loc._id === 'loc4');
    const highBridge = enhancedLocations.find(loc => loc._id === 'loc5');
    
    expect(echoLake?.locationType).toBe(LocationType.ON_LAYOUT);
    expect(chicago?.locationType).toBe(LocationType.OFF_LAYOUT);
    expect(echoLakeYard?.locationType).toBe(LocationType.FIDDLE_YARD);
    expect(portland?.locationType).toBe(LocationType.OFF_LAYOUT);
    expect(highBridge?.locationType).toBe(LocationType.ON_LAYOUT);
  });

  it('respects existing location types if already set', async () => {
    // Modify mock data to include some locations with already set location types
    mockLocationsData = [
      {
        _id: 'loc1',
        stationName: 'Echo Lake, WA',
        block: 'ECHO',
        locationType: LocationType.OFF_LAYOUT, // Explicitly set as OFF_LAYOUT even though it would normally be ON_LAYOUT
        ownerId: 'owner1'
      },
      {
        _id: 'loc2',
        stationName: 'Chicago, IL',
        block: 'EAST',
        ownerId: 'owner1'
      }
    ];

    mockCollection.toArray.mockResolvedValue(mockLocationsData);

    // Mock NextResponse.json to capture the returned data
    const mockJson = jest.fn().mockReturnValue({});
    (NextResponse.json as jest.Mock) = mockJson;

    await GET();

    // Get the data that was passed to NextResponse.json
    const enhancedLocations = mockJson.mock.calls[0][0] as MockLocation[];
    
    // Verify that existing location types were respected
    const echoLake = enhancedLocations.find(loc => loc._id === 'loc1');
    const chicago = enhancedLocations.find(loc => loc._id === 'loc2');
    
    expect(echoLake?.locationType).toBe(LocationType.OFF_LAYOUT); // Should keep the explicit setting
    expect(chicago?.locationType).toBe(LocationType.OFF_LAYOUT); // Should get the default for Chicago
  });

  it('handles errors properly', async () => {
    // Mock a database error
    mockMongoService.connect.mockRejectedValue(new Error('Database connection error'));

    // Mock NextResponse.json to capture the returned error
    const mockJson = jest.fn().mockReturnValue({});
    (NextResponse.json as jest.Mock) = mockJson;

    await GET();

    // Verify error response
    expect(mockJson).toHaveBeenCalledWith(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  });
}); 