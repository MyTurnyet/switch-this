import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import type { UpdateResult, DeleteResult } from 'mongodb';
import { FakeMongoDbService } from '@/test/utils/mongodb-test-utils';

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

// Declare route handler variables
let GET: (req: NextRequest, context: { params: Record<string, string> }) => Promise<Response>;
let PUT: (req: NextRequest, context: { params: Record<string, string> }) => Promise<Response>;
let DELETE: (req: NextRequest, context: { params: Record<string, string> }) => Promise<Response>;

// Load the route handlers module in isolation
jest.isolateModules(() => {
  const routeModule = require('../route');
  GET = routeModule.GET;
  PUT = routeModule.PUT;
  DELETE = routeModule.DELETE;
});

describe('Train Route API Endpoints', () => {
  const mockParams = { id: '123456789012345678901234' };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset all collection mocks
    const trainRoutesCollection = fakeMongoService.getTrainRoutesCollection();
    jest.spyOn(trainRoutesCollection, 'findOne').mockReset();
    jest.spyOn(trainRoutesCollection, 'updateOne').mockReset();
    jest.spyOn(trainRoutesCollection, 'deleteOne').mockReset();
  });
  
  describe('GET', () => {
    it('should return a train route when it exists', async () => {
      // Arrange
      const mockTrainRoute = {
        _id: '123456789012345678901234',
        name: 'Test Route',
        routeNumber: 'TR101',
        routeType: 'MIXED',
        originatingYardId: '123456789012345678901234',
        terminatingYardId: '123456789012345678901234',
        stations: ['123456789012345678901234'],
        ownerId: '123456789012345678901234'
      };
      
      const trainRoutesCollection = fakeMongoService.getTrainRoutesCollection();
      jest.spyOn(trainRoutesCollection, 'findOne').mockResolvedValueOnce(mockTrainRoute);
      
      // Act
      const response = await GET(
        {} as NextRequest,
        { params: mockParams }
      );
      
      // Assert
      expect(fakeMongoService.connect).toHaveBeenCalled();
      expect((response as unknown as MockResponse).parsedBody).toEqual(mockTrainRoute);
      expect((response as unknown as MockResponse).status).toBe(200);
      expect(fakeMongoService.close).toHaveBeenCalled();
    });
    
    it('should return 404 when the train route does not exist', async () => {
      // Arrange
      const trainRoutesCollection = fakeMongoService.getTrainRoutesCollection();
      jest.spyOn(trainRoutesCollection, 'findOne').mockResolvedValueOnce(null);
      
      // Act
      const response = await GET(
        {} as NextRequest,
        { params: mockParams }
      );
      
      // Assert
      expect((response as unknown as MockResponse).parsedBody).toEqual({ error: 'Train route not found' });
      expect((response as unknown as MockResponse).status).toBe(404);
      expect(fakeMongoService.close).toHaveBeenCalled();
    });
    
    it('should handle errors', async () => {
      // Arrange
      jest.spyOn(fakeMongoService, 'connect').mockRejectedValueOnce(new Error('DB error'));
      
      // Act
      const response = await GET(
        {} as NextRequest,
        { params: mockParams }
      );
      
      // Assert
      expect((response as unknown as MockResponse).parsedBody).toEqual({ error: 'Failed to fetch train route' });
      expect((response as unknown as MockResponse).status).toBe(500);
    });
  });
  
  describe('PUT', () => {
    it('should update a train route when it exists', async () => {
      // Arrange
      const trainRouteData = {
        name: 'Updated Route',
        routeNumber: 'TR102',
        routeType: 'PASSENGER',
        originatingYardId: '123456789012345678901234',
        terminatingYardId: '123456789012345678901234',
        stations: ['123456789012345678901234']
      };
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue(trainRouteData as unknown)
      } as unknown as NextRequest;
      
      const mockUpdatedTrainRoute = {
        _id: '123456789012345678901234',
        name: 'Updated Route',
        routeNumber: 'TR102',
        routeType: 'PASSENGER',
        originatingYardId: '123456789012345678901234',
        terminatingYardId: '123456789012345678901234',
        stations: ['123456789012345678901234'],
        ownerId: '123456789012345678901234'
      };
      
      const trainRoutesCollection = fakeMongoService.getTrainRoutesCollection();
      // Mock updateOne to return 1 matched document
      jest.spyOn(trainRoutesCollection, 'updateOne').mockResolvedValueOnce({
        matchedCount: 1,
        modifiedCount: 1,
        acknowledged: true,
        upsertedCount: 0,
        upsertedId: null
      } as unknown as UpdateResult);
      
      jest.spyOn(trainRoutesCollection, 'findOne').mockResolvedValueOnce(mockUpdatedTrainRoute);
      
      // Act
      const response = await PUT(
        mockRequest,
        { params: mockParams }
      );
      
      // Assert
      expect(mockRequest.json).toHaveBeenCalled();
      expect(fakeMongoService.connect).toHaveBeenCalled();
      expect(trainRoutesCollection.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: expect.anything() }),
        expect.objectContaining({ $set: expect.anything() })
      );
      expect((response as unknown as MockResponse).parsedBody).toEqual(mockUpdatedTrainRoute);
      expect((response as unknown as MockResponse).status).toBe(200);
      expect(fakeMongoService.close).toHaveBeenCalled();
    });
    
    it('should return 404 when the train route does not exist', async () => {
      // Arrange
      const mockUpdateData = {
        name: 'Updated Route',
        routeNumber: 'TR102',
        routeType: 'PASSENGER',
        originatingYardId: '123456789012345678901234',
        terminatingYardId: '123456789012345678901234',
        stations: ['123456789012345678901234']
      };
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue(mockUpdateData as unknown)
      } as unknown as NextRequest;
      
      const trainRoutesCollection = fakeMongoService.getTrainRoutesCollection();
      // Mock matchedCount: 0 to indicate no document was found
      jest.spyOn(trainRoutesCollection, 'updateOne').mockResolvedValueOnce({
        matchedCount: 0,
        modifiedCount: 0,
        acknowledged: true,
        upsertedCount: 0,
        upsertedId: null
      } as unknown as UpdateResult);
      
      // Act
      const response = await PUT(
        mockRequest,
        { params: mockParams }
      );
      
      // Assert
      expect((response as unknown as MockResponse).parsedBody).toEqual({ error: 'Train route not found' });
      expect((response as unknown as MockResponse).status).toBe(404);
      expect(fakeMongoService.close).toHaveBeenCalled();
    });
    
    it('should handle errors', async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON') as unknown)
      } as unknown as NextRequest;
      
      // Act
      const response = await PUT(
        mockRequest,
        { params: mockParams }
      );
      
      // Assert
      expect((response as unknown as MockResponse).parsedBody).toEqual({ error: 'Failed to update train route' });
      expect((response as unknown as MockResponse).status).toBe(500);
    });
  });
  
  describe('DELETE', () => {
    it('should delete a train route when it exists', async () => {
      // Arrange
      const trainRoutesCollection = fakeMongoService.getTrainRoutesCollection();
      // Mock deletedCount: 1 to indicate document was deleted
      jest.spyOn(trainRoutesCollection, 'deleteOne').mockResolvedValueOnce({
        deletedCount: 1,
        acknowledged: true
      } as unknown as DeleteResult);
      
      // Act
      const response = await DELETE(
        {} as NextRequest,
        { params: mockParams }
      );
      
      // Assert
      expect(fakeMongoService.connect).toHaveBeenCalled();
      expect(trainRoutesCollection.deleteOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: expect.anything() })
      );
      expect((response as unknown as MockResponse).parsedBody).toEqual({ success: true });
      expect((response as unknown as MockResponse).status).toBe(200);
      expect(fakeMongoService.close).toHaveBeenCalled();
    });
    
    it('should return a 404 when the train route does not exist', async () => {
      // Arrange
      const trainRoutesCollection = fakeMongoService.getTrainRoutesCollection();
      // Mock deletedCount: 0 to indicate no document was found/deleted
      jest.spyOn(trainRoutesCollection, 'deleteOne').mockResolvedValueOnce({
        deletedCount: 0,
        acknowledged: true
      } as unknown as DeleteResult);
      
      // Act
      const response = await DELETE(
        {} as NextRequest,
        { params: mockParams }
      );
      
      // Assert
      expect((response as unknown as MockResponse).parsedBody).toEqual({ error: 'Train route not found' });
      expect((response as unknown as MockResponse).status).toBe(404);
      expect(fakeMongoService.close).toHaveBeenCalled();
    });
    
    it('should handle errors', async () => {
      // Arrange
      jest.spyOn(fakeMongoService, 'connect').mockRejectedValueOnce(new Error('DB error'));
      
      // Act
      const response = await DELETE(
        {} as NextRequest,
        { params: mockParams }
      );
      
      // Assert
      expect((response as unknown as MockResponse).parsedBody).toEqual({ error: 'Failed to delete train route' });
      expect((response as unknown as MockResponse).status).toBe(500);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    fakeMongoService.clearCallHistory();
  });
}); 