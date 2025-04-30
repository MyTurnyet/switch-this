import { GET, PUT, DELETE } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { getMongoDbService } from '@/lib/services/mongodb.provider';

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
    getMongoDbService: jest.fn()
  };
});

describe('Rolling Stock [id] API Route', () => {
  let mockMongoService: MongoDbService;
  const mockParams = { params: { id: 'mock-id' } };
  const mockObjectId = 'mock-id';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock collections
    const mockRollingStockCollection = {
      findOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn()
    };
    
    // Setup mock MongoDB service
    mockMongoService = {
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
    (getMongoDbService as jest.Mock).mockReturnValue(mockMongoService);
  });

  describe('GET', () => {
    it('should return a rolling stock item by id', async () => {
      // Setup mock to return a rolling stock item
      const mockRollingStock = { _id: 'mock-id', roadName: 'TEST', roadNumber: '12345' };
      const mockCollection = mockMongoService.getRollingStockCollection();
      (mockCollection.findOne as jest.Mock).mockResolvedValueOnce(mockRollingStock);
      
      // Create a mock request
      const mockRequest = {} as NextRequest;
      
      // Call the API
      const response = await GET(mockRequest, mockParams);
      
      // Verify MongoDB was called correctly
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getRollingStockCollection).toHaveBeenCalled();
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
      const mockCollection = mockMongoService.getRollingStockCollection();
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
      const mockCollection = mockMongoService.getRollingStockCollection();
      (mockCollection.updateOne as jest.Mock).mockResolvedValueOnce({ matchedCount: 1 });
      
      // Create a mock request with update data
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({ roadName: 'UPDATED', roadNumber: '54321' })
      } as unknown as NextRequest;
      
      // Call the API
      const response = await PUT(mockRequest, mockParams);
      
      // Verify MongoDB was called correctly
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getRollingStockCollection).toHaveBeenCalled();
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
      const mockCollection = mockMongoService.getRollingStockCollection();
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
      const mockCollection = mockMongoService.getRollingStockCollection();
      (mockCollection.deleteOne as jest.Mock).mockResolvedValueOnce({ deletedCount: 1 });
      
      // Create a mock request
      const mockRequest = {} as NextRequest;
      
      // Call the API
      const response = await DELETE(mockRequest, mockParams);
      
      // Verify MongoDB was called correctly
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getRollingStockCollection).toHaveBeenCalled();
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
      const mockCollection = mockMongoService.getRollingStockCollection();
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
}); 