import { jest } from '@jest/globals';
import { GET, PUT, DELETE } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { createMockMongoService } from '@/test/utils/mongodb-test-utils';
import { Collection, Document } from 'mongodb';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn()
  }
}));

// Mock the MongoDB provider
jest.mock('@/lib/services/mongodb.provider', () => {
  return {
    MongoDbProvider: jest.fn().mockImplementation(() => ({
      getService: jest.fn().mockReturnValue(createMockMongoService())
    }))
  };
});

describe('Rolling Stock [id] API Route', () => {
  let mockRequest: NextRequest;
  let mockRequestJson: jest.Mock;
  let mockMongoService: ReturnType<typeof createMockMongoService>;
  let mockCollection: jest.Mocked<Collection<Document>>;
  let mockParams: { params: { id: string } };
  let mockObjectId: string;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock request
    mockRequestJson = jest.fn();
    mockRequest = {
      json: mockRequestJson
    } as unknown as NextRequest;
    
    // Setup mock ObjectId and params
    mockObjectId = '507f1f77bcf86cd799439011';
    mockParams = { params: { id: mockObjectId } };
    
    // Setup MongoDB mock
    mockMongoService = createMockMongoService();
    mockCollection = mockMongoService.getRollingStockCollection() as jest.Mocked<Collection<Document>>;
    
    // Mock toObjectId to return the string directly for easier testing
    (mockMongoService.toObjectId as jest.Mock).mockImplementation((id) => id);
  });

  describe('GET', () => {
    it('should return a rolling stock item by id', async () => {
      // Setup mock to return a rolling stock item
      const mockRollingStock = { _id: mockObjectId, roadName: 'TEST', roadNumber: '12345' };
      (mockCollection.findOne as jest.Mock).mockResolvedValue(mockRollingStock);
      
      // Call the API
      await GET(mockRequest, mockParams);
      
      // Verify MongoDB was called correctly
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getRollingStockCollection).toHaveBeenCalled();
      expect(mockCollection.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: mockObjectId })
      );
      
      // Verify the response
      expect(NextResponse.json).toHaveBeenCalledWith(mockRollingStock);
    });
    
    it('should return 404 when rolling stock is not found', async () => {
      // Setup mock to return null (item not found)
      (mockCollection.findOne as jest.Mock).mockResolvedValue(null);
      
      // Call the API
      await GET(mockRequest, mockParams);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Rolling stock not found' },
        { status: 404 }
      );
    });
    
    it('should handle database errors', async () => {
      // Setup mock to throw an error
      mockMongoService.connect.mockRejectedValue(new Error('Database error'));
      
      // Call the API
      await GET(mockRequest, mockParams);
      
      // Verify error response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch rolling stock' },
        { status: 500 }
      );
    });
  });

  describe('PUT', () => {
    it('should update a rolling stock item', async () => {
      // Setup mock for update
      const updateData = { roadName: 'UPDATED', roadNumber: '54321' };
      mockRequestJson.mockResolvedValue(updateData);
      
      // Mock successful update
      (mockCollection.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
      
      // Call the API
      await PUT(mockRequest, mockParams);
      
      // Verify MongoDB was called correctly
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getRollingStockCollection).toHaveBeenCalled();
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: mockObjectId },
        { $set: updateData }
      );
      
      // Verify the response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: 'Rolling stock updated successfully' }
      );
    });
    
    it('should return 404 when rolling stock is not found for update', async () => {
      // Setup mock request
      mockRequestJson.mockResolvedValue({ roadName: 'UPDATED' });
      
      // Mock no matches found
      (mockCollection.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 0 });
      
      // Call the API
      await PUT(mockRequest, mockParams);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Rolling stock not found' },
        { status: 404 }
      );
    });
    
    it('should handle database errors during update', async () => {
      // Setup mock request
      mockRequestJson.mockResolvedValue({ roadName: 'UPDATED' });
      
      // Setup mock to throw an error
      mockMongoService.connect.mockRejectedValue(new Error('Database error'));
      
      // Call the API
      await PUT(mockRequest, mockParams);
      
      // Verify error response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to update rolling stock' },
        { status: 500 }
      );
    });

    it('should update rolling stock with a CarDestination', async () => {
      // Set up mock request data with a CarDestination
      const updateData = {
        roadName: 'BNSF',
        roadNumber: '12345',
        aarType: 'Boxcar',
        description: 'Test boxcar',
        homeYard: 'yard1',
        destination: {
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
        }
      };
      
      mockRequestJson.mockResolvedValue(updateData);
      
      // Mock successful update
      (mockCollection.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
      
      // Call the API
      await PUT(mockRequest, mockParams);
      
      // Verify MongoDB was called correctly with destination
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: mockObjectId },
        { $set: expect.objectContaining({
          destination: expect.objectContaining({
            immediateDestination: expect.any(Object),
            finalDestination: expect.any(Object)
          })
        })}
      );
      
      // Verify the response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: 'Rolling stock updated successfully' }
      );
    });
  });

  describe('DELETE', () => {
    it('should delete a rolling stock item', async () => {
      // Setup mock for successful deletion
      (mockCollection.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });
      
      // Call the API
      await DELETE(mockRequest, mockParams);
      
      // Verify MongoDB was called correctly
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getRollingStockCollection).toHaveBeenCalled();
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: mockObjectId });
      
      // Verify the response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: 'Rolling stock deleted successfully' }
      );
    });
    
    it('should return 404 when rolling stock is not found for deletion', async () => {
      // Setup mock to indicate no documents deleted
      (mockCollection.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });
      
      // Call the API
      await DELETE(mockRequest, mockParams);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Rolling stock not found' },
        { status: 404 }
      );
    });
    
    it('should handle database errors during deletion', async () => {
      // Setup mock to throw an error
      mockMongoService.connect.mockRejectedValue(new Error('Database error'));
      
      // Call the API
      await DELETE(mockRequest, mockParams);
      
      // Verify error response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to delete rolling stock' },
        { status: 500 }
      );
    });
  });
}); 