import { GET, POST } from '../route';
import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { NextResponse } from 'next/server';
import { LocationType } from '@/app/shared/types/models';

import { FakeMongoDbService, createMongoDbTestSetup } from '@/test/utils/mongodb-test-utils';
// Using FakeMongoDbService from test utils instead of custom mocks

// Now mock the MongoDB provider
// MongoDB provider mocking is now handled by createMongoDbTestSetup()



// Using FakeMongoDbService from test utils instead of custom mocks

// Now mock the MongoDB provider
// Mock removed and replaced with proper declaration




// Create a MongoDB provider and service that will be used throughout this file
const mongoDbProvider = new MongoDbProvider(new MongoDbService());

// Mock the mongodb provider
// Using FakeMongoDbService from test utils instead of custom mocks

// Mock removed and replaced with proper declaration
  
  return {
    MongoDbProvider: MockMongoDbProvider,
    MongoDbProvider: jest.fn().mockImplementation(() => ({
    getService: jest.fn().mockReturnValue(fakeMongoService)
  })),
  };
});

describe('Locations API', () => {
  type MockLocation = {
    _id: string;
    stationName: string;
    block: string;
    ownerId: string;
    locationType?: LocationType;
  };

  // Define common mock types
  type MockCollection = {
    find: jest.Mock;
    findOne: jest.Mock;
    insertOne: jest.Mock;
    toArray: jest.Mock;
  };

  type MockMongoService = {
    connect: jest.Mock;
    close: jest.Mock;
    getLocationsCollection: jest.Mock;
    toObjectId: jest.Mock;
  };

  let fakeMongoService: MockMongoService;
  let mockCollection: MockCollection;
  let mockLocationsData: MockLocation[];

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
      findOne: jest.fn().mockImplementation((query) => {
        const id = query._id;
        return Promise.resolve(mockLocationsData.find(loc => loc._id === id) || null);
      }),
      insertOne: jest.fn().mockResolvedValue({ insertedId: 'new-loc-id' }),
      toArray: jest.fn().mockResolvedValue(mockLocationsData)
    };

    fakeMongoService = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      getLocationsCollection: jest.fn().mockReturnValue(mockCollection),
      toObjectId: jest.fn().mockImplementation((id) => id) // Simple pass-through for tests
    };

    const mockProvider = new MongoDbProvider(fakeMongoService);
  (MongoDbProvider as jest.Mock).mockReturnValue(mockProvider);

    // Mock NextResponse.json
    (NextResponse.json as jest.Mock) = jest.fn().mockImplementation((data, options) => ({ data, options }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns locations with correctly assigned location types', async () => {
      await GET();

      // Verify that the MongoDB service methods were called correctly
      expect(fakeMongoService.connect).toHaveBeenCalled();
      expect(fakeMongoService.getLocationsCollection).toHaveBeenCalled();
      expect(fakeMongoService.close).toHaveBeenCalled();

      // Verify that NextResponse.json was called with the enhanced locations
      expect(NextResponse.json).toHaveBeenCalled();
      
      // Get the data that was passed to NextResponse.json
      const enhancedLocations = (NextResponse.json as jest.Mock).mock.calls[0][0];
      
      // Verify that location types were correctly assigned
      expect(enhancedLocations).toHaveLength(5);
      
      // Check specific locations
      const echoLake = enhancedLocations.find((loc: MockLocation) => loc._id === 'loc1');
      const chicago = enhancedLocations.find((loc: MockLocation) => loc._id === 'loc2');
      const echoLakeYard = enhancedLocations.find((loc: MockLocation) => loc._id === 'loc3');
      const portland = enhancedLocations.find((loc: MockLocation) => loc._id === 'loc4');
      const highBridge = enhancedLocations.find((loc: MockLocation) => loc._id === 'loc5');
      
      expect(echoLake?.locationType).toBe(LocationType.ON_LAYOUT);
      expect(chicago?.locationType).toBe(LocationType.ON_LAYOUT);
      expect(echoLakeYard?.locationType).toBe(LocationType.FIDDLE_YARD);
      expect(portland?.locationType).toBe(LocationType.ON_LAYOUT);
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

      await GET();

      // Get the data that was passed to NextResponse.json
      const enhancedLocations = (NextResponse.json as jest.Mock).mock.calls[0][0];
      
      // Verify that existing location types were respected
      const echoLake = enhancedLocations.find((loc: MockLocation) => loc._id === 'loc1');
      const chicago = enhancedLocations.find((loc: MockLocation) => loc._id === 'loc2');
      
      expect(echoLake?.locationType).toBe(LocationType.OFF_LAYOUT); // Should keep the explicit setting
      expect(chicago?.locationType).toBe(LocationType.ON_LAYOUT); // Default for Chicago now is ON_LAYOUT
    });

    it('handles errors properly', async () => {
      // Mock a database error
      fakeMongoService.connect.mockRejectedValue(new Error('Database connection error'));

      await GET();

      // Verify error response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch locations' },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
          }
        }
      );
    });
  });

  describe('POST', () => {
    it('should create a new location successfully', async () => {
      const newLocation = {
        stationName: 'New Station',
        block: 'NEW',
        locationType: LocationType.ON_LAYOUT,
        ownerId: 'owner1'
      };

      const request = {
        json: jest.fn().mockResolvedValue(newLocation)
      } as unknown as Request;

      // Set up mocks for the improved implementation
      mockCollection.insertOne.mockResolvedValue({ 
        acknowledged: true,
        insertedId: 'new-loc-id' 
      });

      // Mock findOne to return the created location after insert
      const createdLocation = { ...newLocation, _id: 'new-loc-id' };
      mockCollection.findOne.mockResolvedValue(createdLocation);

      await POST(request);

      // Verify that the MongoDB service methods were called correctly
      expect(fakeMongoService.connect).toHaveBeenCalled();
      
      // We now expect insertOne to be called with a copied object
      expect(mockCollection.insertOne).toHaveBeenCalled();
      
      // We expect findOne to be called with the inserted ID
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: expect.anything() });
      
      // Verify that NextResponse.json was called with the created location
      expect(NextResponse.json).toHaveBeenCalledWith(
        createdLocation, 
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
          }
        }
      );
    });

    it('should return 400 for invalid input - missing station name', async () => {
      const invalidLocation = {
        block: 'NEW',
        locationType: LocationType.ON_LAYOUT
      };

      const request = {
        json: jest.fn().mockResolvedValue(invalidLocation)
      } as unknown as Request;

      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Station name is required' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
          }
        }
      );
    });

    it('should return 400 for invalid input - missing block', async () => {
      const invalidLocation = {
        stationName: 'New Station',
        locationType: LocationType.ON_LAYOUT
      };

      const request = {
        json: jest.fn().mockResolvedValue(invalidLocation)
      } as unknown as Request;

      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Block is required' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
          }
        }
      );
    });

    it('should return 400 for invalid input - invalid location type', async () => {
      const invalidLocation = {
        stationName: 'New Station',
        block: 'NEW',
        locationType: 'INVALID_TYPE'
      };

      const request = {
        json: jest.fn().mockResolvedValue(invalidLocation)
      } as unknown as Request;

      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Valid location type is required' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
          }
        }
      );
    });

    it('should handle errors gracefully', async () => {
      fakeMongoService.connect.mockRejectedValue(new Error('Database connection error'));

      const request = {
        json: jest.fn().mockResolvedValue({
          stationName: 'New Station',
          block: 'NEW',
          locationType: LocationType.ON_LAYOUT
        })
      } as unknown as Request;

      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Database connection error' },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
          }
        }
      );
    });
  });
}); 