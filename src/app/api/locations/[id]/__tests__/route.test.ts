import { GET, PUT, DELETE } from '../route';
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

describe('Location ID API', () => {
  type MockLocation = {
    _id: string;
    stationName: string;
    block: string;
    ownerId: string;
    locationType?: LocationType;
    description?: string;
  };

  // Define common mock types
  type MockCollection = {
    find: jest.Mock;
    findOne: jest.Mock;
    insertOne: jest.Mock;
    updateOne: jest.Mock;
    deleteOne: jest.Mock;
    toArray: jest.Mock;
  };

  type MockMongoService = {
    connect: jest.Mock;
    close: jest.Mock;
    getLocationsCollection: jest.Mock;
    toObjectId: jest.Mock;
    getIndustriesCollection: jest.Mock;
  };

  let fakeMongoService: MockMongoService;
  let mockCollection: MockCollection;
  let mockLocation: MockLocation;

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
    mockLocation = {
      _id: 'loc1',
      stationName: 'Echo Lake, WA',
      block: 'ECHO',
      locationType: LocationType.ON_LAYOUT,
      ownerId: 'owner1',
      description: 'A beautiful lake'
    };

    // Set up mock MongoDB service and collection
    mockCollection = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockResolvedValue(mockLocation),
      insertOne: jest.fn().mockResolvedValue({ insertedId: 'new-loc-id' }),
      updateOne: jest.fn().mockResolvedValue({ matchedCount: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      toArray: jest.fn().mockResolvedValue([mockLocation])
    };

    fakeMongoService = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      getLocationsCollection: jest.fn().mockReturnValue(mockCollection),
      toObjectId: jest.fn().mockImplementation((id) => id), // Simple pass-through for tests
      getIndustriesCollection: jest.fn().mockReturnValue({ countDocuments: jest.fn().mockResolvedValue(0) })
    };

    const mockProvider = new MongoDbProvider(fakeMongoService);
  (MongoDbProvider as jest.Mock).mockReturnValue(mockProvider);

    // Mock NextResponse.json
    (NextResponse.json as jest.Mock) = jest.fn().mockImplementation((data) => ({ data }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should retrieve a location by ID', async () => {
      const request = {} as Request;
      const params = { id: 'loc1' };

      await GET(request, { params });

      // Verify that the MongoDB service methods were called correctly
      expect(fakeMongoService.connect).toHaveBeenCalled();
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 'loc1' });
      expect(fakeMongoService.close).toHaveBeenCalled();
      
      // Verify that NextResponse.json was called with the found location
      expect(NextResponse.json).toHaveBeenCalledWith(
        mockLocation, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
          }
        }
      );
    });

    it('should return 404 when location is not found', async () => {
      // No location found
      mockCollection.findOne.mockResolvedValue(null);
      
      const request = {} as Request;
      const params = { id: 'nonexistent-id' };

      await GET(request, { params });

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Location not found' },
        { 
          status: 404,
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
      fakeMongoService.connect.mockRejectedValue(new Error('Connection error'));

      const request = {} as Request;
      const params = { id: 'loc1' };

      await GET(request, { params });

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch location' },
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

  describe('PUT', () => {
    it('should update a location successfully', async () => {
      const updatedLocation = {
        _id: 'loc1',
        stationName: 'Updated Echo Lake, WA',
        block: 'ECHO',
        locationType: LocationType.ON_LAYOUT,
        ownerId: 'owner1',
        description: 'Updated description'
      };

      const request = {
        json: jest.fn().mockResolvedValue(updatedLocation)
      } as unknown as Request;

      const params = { id: 'loc1' };

      // Mock findOne to return the updated location after update
      mockCollection.findOne.mockResolvedValue(updatedLocation);

      await PUT(request, { params });

      // Verify that the MongoDB service methods were called correctly
      expect(fakeMongoService.connect).toHaveBeenCalled();
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 'loc1' },
        { $set: expect.objectContaining({
            stationName: 'Updated Echo Lake, WA',
            description: 'Updated description'
          })
        }
      );
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 'loc1' });

      // Verify that NextResponse.json was called with the updated location
      expect(NextResponse.json).toHaveBeenCalledWith(
        updatedLocation,
        {
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
        block: 'ECHO',
        locationType: LocationType.ON_LAYOUT
      };

      const request = {
        json: jest.fn().mockResolvedValue(invalidLocation)
      } as unknown as Request;

      const params = { id: 'loc1' };

      await PUT(request, { params });

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
        stationName: 'Echo Lake, WA',
        locationType: LocationType.ON_LAYOUT
      };

      const request = {
        json: jest.fn().mockResolvedValue(invalidLocation)
      } as unknown as Request;

      const params = { id: 'loc1' };

      await PUT(request, { params });

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

    it('should return 404 when location to update is not found', async () => {
      mockCollection.updateOne.mockResolvedValue({ matchedCount: 0 });

      const request = {
        json: jest.fn().mockResolvedValue({
          stationName: 'Echo Lake, WA',
          block: 'ECHO',
          locationType: LocationType.ON_LAYOUT
        })
      } as unknown as Request;

      const params = { id: 'nonexistent-id' };

      await PUT(request, { params });

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Location not found' },
        { 
          status: 404,
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
      fakeMongoService.connect.mockRejectedValue(new Error('Connection error'));

      const request = {
        json: jest.fn().mockResolvedValue({
          stationName: 'Echo Lake, WA',
          block: 'ECHO',
          locationType: LocationType.ON_LAYOUT
        })
      } as unknown as Request;

      const params = { id: 'loc1' };

      await PUT(request, { params });

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to update location' },
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

  describe('DELETE', () => {
    let mockIndustriesCollection: { countDocuments: jest.Mock };
    
    beforeEach(() => {
      // Set up the mock industries collection
      mockIndustriesCollection = {
        countDocuments: jest.fn().mockResolvedValue(0) // By default, no industries reference the location
      };
      
      // Add the getIndustriesCollection method to the mock service
      fakeMongoService.getIndustriesCollection = jest.fn().mockReturnValue(mockIndustriesCollection);
      
      // Set up the successful case for finding a location
      mockCollection.findOne.mockResolvedValue({ ...mockLocation });
      
      // Set up the successful case for deleting a location
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });
    });
    
    it('should delete a location successfully', async () => {
      const request = {} as Request;
      const params = { id: 'loc1' };

      await DELETE(request, { params });

      // Verify that the MongoDB service methods were called correctly
      expect(fakeMongoService.connect).toHaveBeenCalled();
      expect(mockCollection.findOne).toHaveBeenCalled(); // Check if location exists
      expect(fakeMongoService.getIndustriesCollection).toHaveBeenCalled(); // Check references
      expect(mockIndustriesCollection.countDocuments).toHaveBeenCalled(); // Count references
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: expect.anything() });
      expect(fakeMongoService.close).toHaveBeenCalled();

      // Verify that NextResponse.json was called with success response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: true },
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

    it('should return 404 when location to delete is not found', async () => {
      // No location found
      mockCollection.findOne.mockResolvedValue(null);
      
      const request = {} as Request;
      const params = { id: 'nonexistent-id' };

      await DELETE(request, { params });

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Location not found' },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
          }
        }
      );
    });
    
    it('should return 409 when location is referenced by industries', async () => {
      // Set up industries referencing this location
      mockIndustriesCollection.countDocuments.mockResolvedValue(2); // 2 industries reference this location
      
      const request = {} as Request;
      const params = { id: 'loc1' };

      await DELETE(request, { params });

      expect(NextResponse.json).toHaveBeenCalledWith(
        { 
          error: 'Cannot delete location: it is being used by industries',
          referencedCount: 2
        },
        { 
          status: 409,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
          }
        }
      );
      
      // The location should not be deleted
      expect(mockCollection.deleteOne).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      fakeMongoService.connect.mockRejectedValue(new Error('Connection error'));

      const request = {} as Request;
      const params = { id: 'loc1' };

      await DELETE(request, { params });

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Connection error' },
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