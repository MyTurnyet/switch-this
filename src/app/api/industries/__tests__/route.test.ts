import { NextResponse } from 'next/server';
import { GET, POST } from '../route';
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

describe('Industries API', () => {
  let mockMongoService: MongoDbService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock collections
    const mockIndustriesCollection = {
      find: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([
        { _id: '1', name: 'Test Industry' }
      ]),
      insertOne: jest.fn().mockResolvedValue({ 
        insertedId: 'new-id' 
      })
    };
    
    // Setup mock MongoDB service
    mockMongoService = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      getIndustriesCollection: jest.fn().mockReturnValue(mockIndustriesCollection),
      // Add other required methods
      getCollection: jest.fn(),
      getRollingStockCollection: jest.fn(),
      getLocationsCollection: jest.fn(),
      getTrainRoutesCollection: jest.fn(),
      getLayoutStateCollection: jest.fn(),
      toObjectId: jest.fn(id => id)
    } as unknown as MongoDbService;
    
    // Inject our mock
    (getMongoDbService as jest.Mock).mockReturnValue(mockMongoService);
  });

  describe('GET /api/industries', () => {
    it('should return industries from the database', async () => {
      // Call the API
      await GET();
      
      // Verify MongoDB connection was made
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getIndustriesCollection).toHaveBeenCalled();
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith([
        { _id: '1', name: 'Test Industry' }
      ]);
    });

    it('should handle errors gracefully', async () => {
      // Mock connection error
      (mockMongoService.connect as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('DB connection error')));
      
      // Call the API
      await GET();
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch industries' },
        { status: 500 }
      );
    });
  });

  describe('POST /api/industries', () => {
    it('should create a new industry', async () => {
      // Mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          name: 'New Industry',
          locationId: 'loc1',
          blockName: 'Block A',
          industryType: 'FREIGHT',
          tracks: [],
          ownerId: 'user1'
        })
      };
      
      // Call the API
      await POST(mockRequest as unknown as Request);
      
      // Verify connection
      expect(mockMongoService.connect).toHaveBeenCalled();
      
      // Verify correct collection was requested
      expect(mockMongoService.getIndustriesCollection).toHaveBeenCalled();
      
      // Get the mock collection
      const mockCollection = mockMongoService.getIndustriesCollection();
      
      // Verify data validation and insertion
      expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Industry',
        locationId: 'loc1',
        blockName: 'Block A',
        industryType: 'FREIGHT',
        tracks: [],
        ownerId: 'user1'
      }));
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: 'new-id',
          name: 'New Industry'
        }),
        { status: 201 }
      );
    });

    it('should validate name is required', async () => {
      // Mock request with missing name
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          locationId: 'loc1',
          blockName: 'Block A',
          industryType: 'FREIGHT'
        })
      };
      
      // Call the API
      await POST(mockRequest as unknown as Request);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Industry name is required' },
        { status: 400 }
      );
    });

    it('should validate locationId is required', async () => {
      // Mock request with missing locationId
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          name: 'New Industry',
          blockName: 'Block A',
          industryType: 'FREIGHT'
        })
      };
      
      // Call the API
      await POST(mockRequest as unknown as Request);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Location ID is required' },
        { status: 400 }
      );
    });

    it('should validate industryType is required', async () => {
      // Mock request with missing industryType
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          name: 'New Industry',
          locationId: 'loc1',
          blockName: 'Block A'
        })
      };
      
      // Call the API
      await POST(mockRequest as unknown as Request);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Industry type is required' },
        { status: 400 }
      );
    });

    it('should validate blockName is required', async () => {
      // Mock request with missing blockName
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          name: 'New Industry',
          locationId: 'loc1',
          industryType: 'FREIGHT'
        })
      };
      
      // Call the API
      await POST(mockRequest as unknown as Request);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Block name is required' },
        { status: 400 }
      );
    });

    it('should handle database errors gracefully', async () => {
      // Mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          name: 'New Industry',
          locationId: 'loc1',
          blockName: 'Block A',
          industryType: 'FREIGHT'
        })
      };
      
      // Get the mock collection and override the insertOne method to reject
      const mockCollection = mockMongoService.getIndustriesCollection();
      (mockCollection.insertOne as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Insert error')));
      
      // Call the API
      await POST(mockRequest as unknown as Request);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to create industry' },
        { status: 500 }
      );
    });
  });
}); 