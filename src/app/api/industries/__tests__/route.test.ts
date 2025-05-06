import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { GET, POST } from '../route';
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

describe('Industries API', () => {
  let mockRequest: NextRequest;
  let mockRequestJson: jest.Mock;
  let mockMongoService: ReturnType<typeof createMockMongoService>;
  let mockCollection: jest.Mocked<Collection<Document>>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock request
    mockRequestJson = jest.fn();
    mockRequest = {
      json: mockRequestJson
    } as unknown as NextRequest;
    
    // Setup MongoDB mock
    mockMongoService = createMockMongoService();
    mockCollection = mockMongoService.getIndustriesCollection() as jest.Mocked<Collection<Document>>;
  });
  
  describe('GET', () => {
    it('should return all industries', async () => {
      // Mock industries data
      const mockIndustries = [
        { _id: '1', name: 'Industry 1', locationId: 'loc1', blockName: 'Block A', industryType: 'FREIGHT' },
        { _id: '2', name: 'Industry 2', locationId: 'loc2', blockName: 'Block B', industryType: 'PASSENGER' }
      ];
      
      // Setup mock responses
      (mockCollection.find as jest.Mock).mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockIndustries)
      });
      
      // Call the handler
      await GET();
      
      // Verify MongoDB methods were called
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getIndustriesCollection).toHaveBeenCalled();
      expect(mockCollection.find).toHaveBeenCalled();
      expect(mockMongoService.close).toHaveBeenCalled();
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(mockIndustries);
    });
    
    it('should handle errors gracefully', async () => {
      // Setup mock to throw an error
      mockMongoService.connect.mockRejectedValue(new Error('Database error'));
      
      // Call the handler
      await GET();
      
      // Verify error response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch industries' },
        { status: 500 }
      );
    });
  });
  
  describe('POST', () => {
    it('should create a new industry', async () => {
      // Mock data
      const newIndustry = {
        name: 'New Industry',
        locationId: 'loc1',
        blockName: 'Block A',
        industryType: 'FREIGHT'
      };
      
      // Mock request
      mockRequestJson.mockResolvedValue(newIndustry);
      
      // Setup mock responses for insertOne
      const mockInsertedId = 'new-id';
      (mockCollection.insertOne as jest.Mock).mockResolvedValue({ 
        insertedId: mockInsertedId, 
        acknowledged: true 
      });
      
      // Call the handler
      await POST(mockRequest);
      
      // Verify MongoDB methods were called
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getIndustriesCollection).toHaveBeenCalled();
      expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining(newIndustry));
      expect(mockMongoService.close).toHaveBeenCalled();
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: mockInsertedId,
          name: 'New Industry'
        }),
        { status: 201 }
      );
    });

    it('should validate name is required', async () => {
      // Mock request with missing name
      mockRequestJson.mockResolvedValue({
        locationId: 'loc1',
        blockName: 'Block A',
        industryType: 'FREIGHT'
      });
      
      // Call the handler
      await POST(mockRequest);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Industry name is required' },
        { status: 400 }
      );
    });

    it('should validate locationId is required', async () => {
      // Mock request with missing locationId
      mockRequestJson.mockResolvedValue({
        name: 'New Industry',
        blockName: 'Block A',
        industryType: 'FREIGHT'
      });
      
      // Call the handler
      await POST(mockRequest);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Location ID is required' },
        { status: 400 }
      );
    });

    it('should validate industryType is required', async () => {
      // Mock request with missing industryType
      mockRequestJson.mockResolvedValue({
        name: 'New Industry',
        locationId: 'loc1',
        blockName: 'Block A'
      });
      
      // Call the handler
      await POST(mockRequest);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Industry type is required' },
        { status: 400 }
      );
    });

    it('should validate blockName is required', async () => {
      // Mock request with missing blockName
      mockRequestJson.mockResolvedValue({
        name: 'New Industry',
        locationId: 'loc1',
        industryType: 'FREIGHT'
      });
      
      // Call the handler
      await POST(mockRequest);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Block name is required' },
        { status: 400 }
      );
    });

    it('should handle database errors gracefully', async () => {
      // Mock request
      mockRequestJson.mockResolvedValue({
        name: 'New Industry',
        locationId: 'loc1',
        blockName: 'Block A',
        industryType: 'FREIGHT'
      });
      
      // Setup mock to throw an error
      mockMongoService.connect.mockRejectedValue(new Error('Database error'));
      
      // Call the handler
      await POST(mockRequest);
      
      // Verify error response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Database error' },
        { status: 500 }
      );
    });
  });
}); 