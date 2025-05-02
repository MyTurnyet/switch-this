import { GET, PUT, DELETE } from '../route';
import { getMongoDbService } from '@/lib/services/mongodb.provider';
import { NextResponse } from 'next/server';
import { LocationType } from '@/app/shared/types/models';

// Mock the mongodb provider
jest.mock('@/lib/services/mongodb.provider', () => ({
  getMongoDbService: jest.fn()
}));

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
  };

  let mockMongoService: MockMongoService;
  let mockCollection: MockCollection;
  let mockLocation: MockLocation;

  beforeEach(() => {
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

    mockMongoService = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      getLocationsCollection: jest.fn().mockReturnValue(mockCollection),
      toObjectId: jest.fn().mockImplementation((id) => id) // Simple pass-through for tests
    };

    (getMongoDbService as jest.Mock).mockReturnValue(mockMongoService);

    // Mock NextResponse.json
    (NextResponse.json as jest.Mock) = jest.fn().mockImplementation((data) => ({ data }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return a location by ID', async () => {
      const request = {} as Request;
      const params = { id: 'loc1' };

      await GET(request, { params });

      // Verify that the MongoDB service methods were called correctly
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getLocationsCollection).toHaveBeenCalled();
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 'loc1' });
      expect(mockMongoService.close).toHaveBeenCalled();

      // Verify that NextResponse.json was called with the location
      expect(NextResponse.json).toHaveBeenCalledWith(mockLocation);
    });

    it('should return 404 when location is not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const request = {} as Request;
      const params = { id: 'nonexistent-id' };

      await GET(request, { params });

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Location not found' },
        { status: 404 }
      );
    });

    it('should handle errors gracefully', async () => {
      mockMongoService.connect.mockRejectedValue(new Error('Connection error'));

      const request = {} as Request;
      const params = { id: 'loc1' };

      await GET(request, { params });

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch location' },
        { status: 500 }
      );
    });
  });

  describe('PUT', () => {
    it('should update a location successfully', async () => {
      const updatedLocation = {
        ...mockLocation,
        stationName: 'Updated Echo Lake, WA',
        description: 'Updated description'
      };

      // Mock the request body
      const request = {
        json: jest.fn().mockResolvedValue(updatedLocation)
      } as unknown as Request;

      const params = { id: 'loc1' };

      // Mock findOne to return the updated location after update
      mockCollection.findOne.mockResolvedValue(updatedLocation);

      await PUT(request, { params });

      // Verify that the MongoDB service methods were called correctly
      expect(mockMongoService.connect).toHaveBeenCalled();
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
      expect(NextResponse.json).toHaveBeenCalledWith(updatedLocation);
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
        { status: 400 }
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
        { status: 400 }
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
        { status: 404 }
      );
    });

    it('should handle errors gracefully', async () => {
      mockMongoService.connect.mockRejectedValue(new Error('Connection error'));

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
        { status: 500 }
      );
    });
  });

  describe('DELETE', () => {
    it('should delete a location successfully', async () => {
      const request = {} as Request;
      const params = { id: 'loc1' };

      await DELETE(request, { params });

      // Verify that the MongoDB service methods were called correctly
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: 'loc1' });
      expect(mockMongoService.close).toHaveBeenCalled();

      // Verify that NextResponse.json was called with success response
      expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return 404 when location to delete is not found', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const request = {} as Request;
      const params = { id: 'nonexistent-id' };

      await DELETE(request, { params });

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Location not found' },
        { status: 404 }
      );
    });

    it('should handle errors gracefully', async () => {
      mockMongoService.connect.mockRejectedValue(new Error('Connection error'));

      const request = {} as Request;
      const params = { id: 'loc1' };

      await DELETE(request, { params });

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to delete location' },
        { status: 500 }
      );
    });
  });
}); 