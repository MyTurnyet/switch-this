import { jest } from '@jest/globals';
import { Request } from 'next/dist/compiled/@edge-runtime/primitives';
import type { UpdateResult, DeleteResult } from 'mongodb';
import { FakeMongoDbService } from '@/test/utils/mongodb-test-utils';
import { LocationType } from '@/app/shared/types/models';

// Define a properly typed mock Response interface
interface MockResponse {
  body: string;
  parsedBody: Record<string, unknown>;
  status: number;
  headers: Record<string, string>;
  json: () => Promise<Record<string, unknown>>;
}

// Extend FakeMongoDbService type for test purposes
interface ExtendedFakeMongoDbService extends FakeMongoDbService {
  clearCallHistory?: () => void;
}

// Create a fake MongoDB service instance
const fakeMongoService = new FakeMongoDbService() as ExtendedFakeMongoDbService;

// Add clearCallHistory method if it doesn't exist
if (!fakeMongoService.clearCallHistory) {
  fakeMongoService.clearCallHistory = jest.fn();
}

// Mock Response constructor
jest.spyOn(global, 'Response').mockImplementation((body, options = {}) => {
  const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
  return {
    body,
    parsedBody,
    status: (options as ResponseInit)?.status || 200,
    headers: (options as ResponseInit)?.headers || {},
    json: async () => parsedBody
  } as unknown as Response;
});

// Mock MongoDB ObjectId
jest.mock('mongodb', () => {
  const mockObjectId = jest.fn().mockImplementation((id) => ({
    toString: () => id || 'mock-id',
    toHexString: () => id || 'mock-id'
  }));
  
  return {
    ObjectId: mockObjectId
  };
});

// Mock MongoDB service
jest.mock('@/lib/services/mongodb.service', () => {
  return {
    MongoDbService: jest.fn().mockImplementation(() => {
      return fakeMongoService;
    })
  };
});

// Also mock toObjectId for the fake service
fakeMongoService.toObjectId = jest.fn().mockImplementation(id => id);

// Declare route handler variables
let GET: (req: Request, context: { params: Record<string, string> }) => Promise<Response>;
let PUT: (req: Request, context: { params: Record<string, string> }) => Promise<Response>;
let DELETE: (req: Request, context: { params: Record<string, string> }) => Promise<Response>;

// Load the route handlers module in isolation
jest.isolateModules(() => {
  const routeModule = require('../route');
  GET = routeModule.GET;
  PUT = routeModule.PUT;
  DELETE = routeModule.DELETE;
});

describe('Location ID API', () => {
  const mockParams = { id: '123456789012345678901234' };
  let mockLocation: Record<string, unknown>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mock location data
    mockLocation = {
      _id: '123456789012345678901234',
      stationName: 'Echo Lake, WA',
      block: 'ECHO',
      locationType: LocationType.ON_LAYOUT,
      ownerId: 'owner1',
      description: 'A beautiful lake'
    };

    // Reset all collection mocks
    const locationsCollection = fakeMongoService.getLocationsCollection();
    
    // Spy on the collection methods
    jest.spyOn(fakeMongoService, 'getLocationsCollection');
    jest.spyOn(locationsCollection, 'findOne').mockReset();
    jest.spyOn(locationsCollection, 'updateOne').mockReset();
    jest.spyOn(locationsCollection, 'deleteOne').mockReset();
    
    const industriesCollection = fakeMongoService.getIndustriesCollection();
    jest.spyOn(fakeMongoService, 'getIndustriesCollection');
    jest.spyOn(industriesCollection, 'countDocuments').mockReset();
    
    // Set default mock responses
    jest.spyOn(locationsCollection, 'findOne').mockResolvedValue(mockLocation);
    jest.spyOn(locationsCollection, 'updateOne').mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
      acknowledged: true,
      upsertedCount: 0,
      upsertedId: null
    } as unknown as UpdateResult);
    jest.spyOn(locationsCollection, 'deleteOne').mockResolvedValue({
      deletedCount: 1,
      acknowledged: true
    } as unknown as DeleteResult);
    jest.spyOn(industriesCollection, 'countDocuments').mockResolvedValue(0);
  });

  describe('GET', () => {
    it('should retrieve a location by ID', async () => {
      const request = {} as Request;

      const response = await GET(request, { params: mockParams });

      // Verify that the MongoDB service methods were called correctly
      expect(fakeMongoService.connect).toHaveBeenCalled();
      expect(fakeMongoService.getLocationsCollection).toHaveBeenCalled();
      expect(fakeMongoService.getLocationsCollection().findOne).toHaveBeenCalled();
      expect((response as unknown as MockResponse).parsedBody).toEqual(mockLocation);
      expect((response as unknown as MockResponse).status).toBe(200);
      expect(fakeMongoService.close).toHaveBeenCalled();
    }, 10000);

    it('should return 404 when location is not found', async () => {
      // No location found
      const locationsCollection = fakeMongoService.getLocationsCollection();
      jest.spyOn(locationsCollection, 'findOne').mockResolvedValueOnce(null);
      
      const request = {} as Request;

      const response = await GET(request, { params: mockParams });

      expect((response as unknown as MockResponse).parsedBody).toEqual({ error: 'Location not found' });
      expect((response as unknown as MockResponse).status).toBe(404);
    }, 10000);

    it('should handle errors gracefully', async () => {
      jest.spyOn(fakeMongoService, 'connect').mockRejectedValueOnce(new Error('Connection error'));

      const request = {} as Request;

      const response = await GET(request, { params: mockParams });

      expect((response as unknown as MockResponse).parsedBody).toEqual({ error: 'Failed to fetch location' });
      expect((response as unknown as MockResponse).status).toBe(500);
    }, 10000);
  });

  describe('PUT', () => {
    it('should update a location successfully', async () => {
      const updatedLocation = {
        _id: '123456789012345678901234',
        stationName: 'Updated Echo Lake, WA',
        block: 'ECHO',
        locationType: LocationType.ON_LAYOUT,
        ownerId: 'owner1',
        description: 'Updated description'
      };

      const request = {
        json: jest.fn().mockResolvedValue(updatedLocation)
      } as unknown as Request;

      // Mock findOne to return the updated location after update
      const locationsCollection = fakeMongoService.getLocationsCollection();
      jest.spyOn(locationsCollection, 'findOne').mockResolvedValueOnce(updatedLocation);

      const response = await PUT(request, { params: mockParams });

      // Verify that the MongoDB service methods were called correctly
      expect(fakeMongoService.connect).toHaveBeenCalled();
      expect(fakeMongoService.getLocationsCollection().updateOne).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ $set: expect.anything() })
      );
      expect(fakeMongoService.getLocationsCollection().findOne).toHaveBeenCalled();

      // Verify the response
      expect((response as unknown as MockResponse).parsedBody).toEqual(updatedLocation);
      expect((response as unknown as MockResponse).status).toBe(200);
    }, 10000);

    it('should return 400 for invalid input - missing station name', async () => {
      const invalidLocation = {
        block: 'ECHO',
        locationType: LocationType.ON_LAYOUT
      };

      const request = {
        json: jest.fn().mockResolvedValue(invalidLocation)
      } as unknown as Request;

      const response = await PUT(request, { params: mockParams });

      expect((response as unknown as MockResponse).parsedBody).toEqual({ error: 'Station name is required' });
      expect((response as unknown as MockResponse).status).toBe(400);
    }, 10000);

    it('should return 404 when location to update is not found', async () => {
      const locationsCollection = fakeMongoService.getLocationsCollection();
      jest.spyOn(locationsCollection, 'updateOne').mockResolvedValueOnce({
        matchedCount: 0,
        modifiedCount: 0,
        acknowledged: true,
        upsertedCount: 0,
        upsertedId: null
      } as unknown as UpdateResult);

      const request = {
        json: jest.fn().mockResolvedValue({
          stationName: 'Updated Station',
          block: 'UPDATED',
          locationType: LocationType.ON_LAYOUT
        })
      } as unknown as Request;

      const response = await PUT(request, { params: mockParams });

      expect((response as unknown as MockResponse).parsedBody).toEqual({ error: 'Location not found' });
      expect((response as unknown as MockResponse).status).toBe(404);
    }, 10000);

    it('should handle errors gracefully', async () => {
      jest.spyOn(fakeMongoService, 'connect').mockRejectedValueOnce(new Error('Connection error'));

      const request = {
        json: jest.fn().mockResolvedValue({
          stationName: 'Updated Station',
          block: 'UPDATED',
          locationType: LocationType.ON_LAYOUT
        })
      } as unknown as Request;

      const response = await PUT(request, { params: mockParams });

      expect((response as unknown as MockResponse).parsedBody).toEqual({ error: 'Failed to update location' });
      expect((response as unknown as MockResponse).status).toBe(500);
    }, 10000);
  });
  
  describe('DELETE', () => {    
    it('should delete a location successfully', async () => {
      const request = {} as Request;

      const response = await DELETE(request, { params: mockParams });

      expect(fakeMongoService.connect).toHaveBeenCalled();
      expect(fakeMongoService.getLocationsCollection().findOne).toHaveBeenCalled();
      expect(fakeMongoService.getLocationsCollection().deleteOne).toHaveBeenCalled();
      expect((response as unknown as MockResponse).parsedBody).toEqual({ success: true });
      expect((response as unknown as MockResponse).status).toBe(200);
    }, 10000);

    it('should return 404 when location to delete is not found', async () => {
      // No location found
      const locationsCollection = fakeMongoService.getLocationsCollection();
      jest.spyOn(locationsCollection, 'findOne').mockResolvedValueOnce(null);
      
      const request = {} as Request;

      const response = await DELETE(request, { params: mockParams });

      expect((response as unknown as MockResponse).parsedBody).toEqual({ error: 'Location not found' });
      expect((response as unknown as MockResponse).status).toBe(404);
    }, 10000);

    it('should return 409 when location is referenced by industries', async () => {
      // Set up industries referencing this location
      const industriesCollection = fakeMongoService.getIndustriesCollection();
      jest.spyOn(industriesCollection, 'countDocuments').mockResolvedValueOnce(2); // 2 industries reference this location
      
      const request = {} as Request;

      const response = await DELETE(request, { params: mockParams });

      expect((response as unknown as MockResponse).parsedBody).toEqual({
        error: 'Cannot delete location: it is being used by industries',
        referencedCount: 2
      });
      expect((response as unknown as MockResponse).status).toBe(409);
    }, 10000);

    it('should handle errors gracefully', async () => {
      jest.spyOn(fakeMongoService, 'connect').mockRejectedValueOnce(new Error('Connection error'));

      const request = {} as Request;

      const response = await DELETE(request, { params: mockParams });

      expect((response as unknown as MockResponse).parsedBody).toEqual({ error: 'Connection error' });
      expect((response as unknown as MockResponse).status).toBe(500);
    }, 10000);
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (fakeMongoService.clearCallHistory) {
      fakeMongoService.clearCallHistory();
    }
  });
}); 