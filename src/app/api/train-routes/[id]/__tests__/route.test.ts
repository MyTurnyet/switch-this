import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { GET, PUT, DELETE } from '../route';
import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { IMongoDbService } from '@/lib/services/mongodb.interface';

import { FakeMongoDbService, createMongoDbTestSetup } from '@/test/utils/mongodb-test-utils';
// Using FakeMongoDbService from test utils instead of custom mocks

// Now mock the MongoDB provider
// MongoDB provider mocking is now handled by createMongoDbTestSetup()



// Using FakeMongoDbService from test utils instead of custom mocks

// Now mock the MongoDB provider
// Mock removed and replaced with proper declaration



// Define the mock service before jest.mock
const mockFindOne = jest.fn();
const mockUpdateOne = jest.fn();
const mockDeleteOne = jest.fn();
const mockClose = jest.fn();
const mockConnect = jest.fn();

const mockCollection = {
  findOne: mockFindOne,
  updateOne: mockUpdateOne,
  deleteOne: mockDeleteOne
};

const mockGetTrainRoutesCollection = jest.fn().mockReturnValue(mockCollection);

const fakeMongoService: IMongoDbService = {
  connect: mockConnect,
  close: mockClose,
  getCollection: jest.fn(),
  getRollingStockCollection: jest.fn(),
  getIndustriesCollection: jest.fn(),
  getLocationsCollection: jest.fn(),
  getTrainRoutesCollection: mockGetTrainRoutesCollection,
  getLayoutStateCollection: jest.fn(),
  getSwitchlistsCollection: jest.fn(),
  toObjectId: jest.fn().mockImplementation(id => new ObjectId(id))
};

// Mock NextResponse and MongoDB first, before any variable declarations
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: jest.fn().mockImplementation((body, options = {}) => ({
        status: options.status || 200,
        json: async () => body,
      }))
    }
  };
});

// Mock MongoDB provider
// Mock removed and replaced with proper declaration

// Get a reference to the mocked json function after mocking
const jsonMock = jest.requireMock('next/server').NextResponse.json;

describe('Train Route API Endpoints', () => {
  beforeAll(() => {
    const mockProvider = new MongoDbProvider(fakeMongoService);
    (MongoDbProvider as jest.Mock).mockReturnValue(mockProvider);
  });
  
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
    jsonMock.mockClear();
    mockFindOne.mockReset();
    mockUpdateOne.mockReset();
    mockDeleteOne.mockReset();
    mockConnect.mockReset();
    mockClose.mockReset();
  });
  
  describe('GET', () => {
    it('should return a train route when it exists', async () => {
      // Arrange
      const mockTrainRoute = {
        _id: new ObjectId('123456789012345678901234'),
        name: 'Test Route',
        routeNumber: 'TR101',
        routeType: 'MIXED',
        originatingYardId: new ObjectId('123456789012345678901234'),
        terminatingYardId: new ObjectId('123456789012345678901234'),
        stations: [new ObjectId('123456789012345678901234')],
        ownerId: new ObjectId('123456789012345678901234')
      };
      
      mockFindOne.mockResolvedValue(mockTrainRoute);
      
      // Act
      const result = await GET(
        {} as NextRequest,
        { params: { id: '123456789012345678901234' } }
      );
      const data = await result.json();
      
      // Assert
      expect(mockConnect).toHaveBeenCalled();
      expect(mockGetTrainRoutesCollection).toHaveBeenCalled();
      expect(mockFindOne).toHaveBeenCalledWith({ 
        _id: expect.any(ObjectId) 
      });
      expect(data).toEqual(mockTrainRoute);
      expect(mockClose).toHaveBeenCalled();
    });
    
    it('should return 404 when the train route does not exist', async () => {
      // Arrange
      mockFindOne.mockResolvedValue(null);
      
      // Act
      const result = await GET(
        {} as NextRequest,
        { params: { id: '123456789012345678901234' } }
      );
      
      // Assert
      expect(jsonMock).toHaveBeenCalledWith(
        { error: 'Train route not found' },
        { status: 404 }
      );
      expect(result.status).toBe(404);
      expect(mockClose).toHaveBeenCalled();
    });
    
    it('should handle errors', async () => {
      // Arrange
      mockConnect.mockRejectedValue(new Error('DB error'));
      
      // Act
      const result = await GET(
        {} as NextRequest,
        { params: { id: '123456789012345678901234' } }
      );
      
      // Assert
      expect(jsonMock).toHaveBeenCalledWith(
        { error: 'Failed to fetch train route' },
        { status: 500 }
      );
      expect(result.status).toBe(500);
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
        json: jest.fn().mockResolvedValue(trainRouteData)
      } as unknown as NextRequest;
      
      const mockUpdatedTrainRoute = {
        _id: new ObjectId('123456789012345678901234'),
        name: 'Updated Route',
        routeNumber: 'TR102',
        routeType: 'PASSENGER',
        originatingYardId: new ObjectId('123456789012345678901234'),
        terminatingYardId: new ObjectId('123456789012345678901234'),
        stations: [new ObjectId('123456789012345678901234')],
        ownerId: new ObjectId('123456789012345678901234')
      };
      
      // Important - mock the update to return 1 matched document
      mockUpdateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
      mockFindOne.mockResolvedValue(mockUpdatedTrainRoute);
      
      // Act
      const result = await PUT(
        mockRequest,
        { params: { id: '123456789012345678901234' } }
      );
      const data = await result.json();
      
      // Assert
      expect(mockRequest.json).toHaveBeenCalled();
      expect(mockConnect).toHaveBeenCalled();
      expect(mockUpdateOne).toHaveBeenCalled();
      expect(mockUpdateOne).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        { $set: expect.any(Object) }
      );
      expect(data).toEqual(mockUpdatedTrainRoute);
      expect(mockClose).toHaveBeenCalled();
    });
    
    it('should return 404 when the train route does not exist', async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'Updated Route',
          routeNumber: 'TR102',
          routeType: 'PASSENGER',
          originatingYardId: '123456789012345678901234',
          terminatingYardId: '123456789012345678901234',
          stations: ['123456789012345678901234']
        })
      } as unknown as NextRequest;
      
      // Important - mock matchedCount: 0 to indicate no document was found
      mockUpdateOne.mockResolvedValue({ matchedCount: 0, modifiedCount: 0 });
      
      // Act
      const result = await PUT(
        mockRequest,
        { params: { id: '123456789012345678901234' } }
      );
      
      // Assert
      expect(jsonMock).toHaveBeenCalledWith(
        { error: 'Train route not found' },
        { status: 404 }
      );
      expect(result.status).toBe(404);
      expect(mockClose).toHaveBeenCalled();
    });
    
    it('should return 400 for invalid train route data', async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          // Missing required fields
          name: 'Invalid Route'
        })
      } as unknown as NextRequest;
      
      // Act
      const result = await PUT(
        mockRequest,
        { params: { id: '123456789012345678901234' } }
      );
      
      // Assert
      expect(jsonMock).toHaveBeenCalledWith(
        { error: 'Invalid train route data' },
        { status: 400 }
      );
      expect(result.status).toBe(400);
    });
    
    it('should handle errors', async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      } as unknown as NextRequest;
      
      // Act
      const result = await PUT(
        mockRequest,
        { params: { id: '123456789012345678901234' } }
      );
      
      // Assert
      expect(jsonMock).toHaveBeenCalledWith(
        { error: 'Failed to update train route' },
        { status: 500 }
      );
      expect(result.status).toBe(500);
    });
  });
  
  describe('DELETE', () => {
    it('should delete a train route when it exists', async () => {
      // Arrange
      // Important - mock deletedCount: 1 to indicate document was deleted
      mockDeleteOne.mockResolvedValue({ deletedCount: 1 });
      
      // Act
      const result = await DELETE(
        {} as NextRequest,
        { params: { id: '123456789012345678901234' } }
      );
      const data = await result.json();
      
      // Assert
      expect(mockConnect).toHaveBeenCalled();
      expect(mockDeleteOne).toHaveBeenCalled();
      expect(mockDeleteOne).toHaveBeenCalledWith({ 
        _id: expect.any(ObjectId) 
      });
      expect(data).toEqual({ success: true });
      expect(mockClose).toHaveBeenCalled();
    });
    
    it('should return a 404 when the train route does not exist', async () => {
      // Arrange
      // Important - mock deletedCount: 0 to indicate no document was found/deleted
      mockDeleteOne.mockResolvedValue({ deletedCount: 0 });
      
      // Act
      const result = await DELETE(
        {} as NextRequest,
        { params: { id: '123456789012345678901234' } }
      );
      
      // Assert
      expect(jsonMock).toHaveBeenCalledWith(
        { error: 'Train route not found' },
        { status: 404 }
      );
      expect(result.status).toBe(404);
      expect(mockClose).toHaveBeenCalled();
    });
    
    it('should handle errors', async () => {
      // Arrange
      mockConnect.mockRejectedValue(new Error('DB error'));
      
      // Act
      const result = await DELETE(
        {} as NextRequest,
        { params: { id: '123456789012345678901234' } }
      );
      
      // Assert
      expect(jsonMock).toHaveBeenCalledWith(
        { error: 'Failed to delete train route' },
        { status: 500 }
      );
      expect(result.status).toBe(500);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    fakeMongoService.clearCallHistory();
  });
}); 