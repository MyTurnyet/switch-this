import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { GET, PUT, DELETE } from '../route';
import { getMongoDbService } from '@/lib/services/mongodb.provider';

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
jest.mock('@/lib/services/mongodb.provider', () => ({
  getMongoDbService: jest.fn()
}));

// Get a reference to the mocked json function after mocking
const jsonMock = jest.requireMock('next/server').NextResponse.json;

describe('Train Route API Endpoints', () => {
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
  
  const mockMongoService = {
    connect: mockConnect,
    getTrainRoutesCollection: mockGetTrainRoutesCollection,
    close: mockClose
  };
  
  beforeAll(() => {
    (getMongoDbService as jest.Mock).mockReturnValue(mockMongoService);
  });
  
  beforeEach(() => {
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
}); 