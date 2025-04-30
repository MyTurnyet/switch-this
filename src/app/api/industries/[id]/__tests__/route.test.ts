import { NextResponse } from 'next/server';
import { DELETE, GET, PUT } from '../route';
import { MongoDbService } from '@/lib/services/mongodb.service';
import { getMongoDbService } from '@/lib/services/mongodb.provider';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn()
  }
}));

// Mock MongoDbService provider
jest.mock('@/lib/services/mongodb.provider', () => {
  return {
    getMongoDbService: jest.fn()
  };
});

describe('Industry API Routes', () => {
  let mockMongoService: MongoDbService;
  const mockParams = { params: { id: '1' } };
  const mockObjectId = { toString: () => '1' };
  
  // Mock industry data
  const mockIndustry = {
    _id: mockObjectId,
    name: 'Test Industry',
    industryType: 'FREIGHT'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock collections
    const mockIndustriesCollection = {
      findOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn()
    };
    
    // Setup mock MongoDB service
    mockMongoService = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      getIndustriesCollection: jest.fn().mockReturnValue(mockIndustriesCollection),
      toObjectId: jest.fn().mockReturnValue(mockObjectId),
      // Add other required methods
      getCollection: jest.fn(),
      getRollingStockCollection: jest.fn(),
      getLocationsCollection: jest.fn(),
      getTrainRoutesCollection: jest.fn(),
      getLayoutStateCollection: jest.fn()
    } as unknown as MongoDbService;
    
    // Inject our mock
    (getMongoDbService as jest.Mock).mockReturnValue(mockMongoService);
  });

  describe('GET /api/industries/[id]', () => {
    it('should return an industry when found', async () => {
      // Setup the mock to return an industry
      const mockCollection = mockMongoService.getIndustriesCollection();
      (mockCollection.findOne as jest.Mock).mockResolvedValueOnce(mockIndustry);
      
      // Call the API
      await GET({} as Request, mockParams);
      
      // Verify MongoDB calls
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getIndustriesCollection).toHaveBeenCalled();
      // Use expect.objectContaining instead of exact matching to avoid reference issues
      expect(mockCollection.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: mockObjectId })
      );
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(mockIndustry);
    });

    it('should return 404 when industry not found', async () => {
      // Setup the mock to return null (industry not found)
      const mockCollection = mockMongoService.getIndustriesCollection();
      (mockCollection.findOne as jest.Mock).mockResolvedValueOnce(null);
      
      // Call the API
      await GET({} as Request, mockParams);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Industry not found' },
        { status: 404 }
      );
    });

    it('should handle database errors', async () => {
      // Setup the mock to throw an error
      (mockMongoService.connect as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('DB error')));
      
      // Call the API
      await GET({} as Request, mockParams);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch industry' },
        { status: 500 }
      );
    });
  });

  describe('PUT /api/industries/[id]', () => {
    const updateData = {
      name: 'Updated Industry',
      industryType: 'YARD'
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(updateData)
    };

    it('should update an industry successfully', async () => {
      // Setup mocks
      const mockCollection = mockMongoService.getIndustriesCollection();
      (mockCollection.updateOne as jest.Mock).mockResolvedValueOnce({ matchedCount: 1 });
      
      // After update, findOne returns the updated industry
      const updatedIndustry = { ...mockIndustry, ...updateData };
      (mockCollection.findOne as jest.Mock).mockResolvedValueOnce(updatedIndustry);
      
      // Call the API
      await PUT(mockRequest as unknown as Request, mockParams);
      
      // Verify MongoDB calls
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getIndustriesCollection).toHaveBeenCalled();
      // Use expect.objectContaining for more flexible assertions
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: mockObjectId }),
        expect.objectContaining({ $set: updateData })
      );
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(updatedIndustry);
    });

    it('should return 404 when industry not found', async () => {
      // Setup mock to indicate no documents matched
      const mockCollection = mockMongoService.getIndustriesCollection();
      (mockCollection.updateOne as jest.Mock).mockResolvedValueOnce({ matchedCount: 0 });
      
      // Call the API
      await PUT(mockRequest as unknown as Request, mockParams);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Industry not found' },
        { status: 404 }
      );
    });

    it('should handle database errors', async () => {
      // Setup mock to throw an error
      (mockMongoService.connect as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('DB error')));
      
      // Call the API
      await PUT(mockRequest as unknown as Request, mockParams);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to update industry' },
        { status: 500 }
      );
    });
  });

  describe('DELETE /api/industries/[id]', () => {
    it('should delete an industry successfully', async () => {
      // Setup mock to indicate one document was deleted
      const mockCollection = mockMongoService.getIndustriesCollection();
      (mockCollection.deleteOne as jest.Mock).mockResolvedValueOnce({ deletedCount: 1 });
      
      // Call the API
      await DELETE({} as Request, mockParams);
      
      // Verify MongoDB calls
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getIndustriesCollection).toHaveBeenCalled();
      // Use expect.objectContaining for more flexible assertions
      expect(mockCollection.deleteOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: mockObjectId })
      );
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith({ message: 'Industry deleted successfully' });
    });

    it('should return 404 when industry not found', async () => {
      // Setup mock to indicate no documents were deleted
      const mockCollection = mockMongoService.getIndustriesCollection();
      (mockCollection.deleteOne as jest.Mock).mockResolvedValueOnce({ deletedCount: 0 });
      
      // Call the API
      await DELETE({} as Request, mockParams);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Industry not found' },
        { status: 404 }
      );
    });

    it('should handle database errors', async () => {
      // Setup mock to throw an error
      (mockMongoService.connect as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('DB error')));
      
      // Call the API
      await DELETE({} as Request, mockParams);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to delete industry' },
        { status: 500 }
      );
    });
  });
}); 