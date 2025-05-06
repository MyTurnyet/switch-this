import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { GET, POST } from '../route';
import { createMockMongoService } from '@/test/utils/mongodb-test-utils';
import { Collection, Document, ObjectId } from 'mongodb';

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

describe('Layout State API', () => {
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
    mockCollection = mockMongoService.getLayoutStateCollection() as jest.Mocked<Collection<Document>>;
  });
  
  describe('GET', () => {
    it('should return layout state from the database', async () => {
      // Setup mock data
      const mockLayoutState = {
        _id: new ObjectId().toString(),
        industries: [{ _id: 'ind-1', tracks: [] }],
        updatedAt: new Date()
      };
      
      // Configure mock
      (mockCollection.findOne as jest.Mock).mockResolvedValue(mockLayoutState);
      
      // Call the API
      await GET();
      
      // Verify the result
      expect(NextResponse.json).toHaveBeenCalledWith(mockLayoutState);
      expect(mockCollection.findOne).toHaveBeenCalledWith({}, { sort: { updatedAt: -1 } });
      expect(mockMongoService.close).toHaveBeenCalled();
    });
    
    it('should return exists:false when no layout state exists', async () => {
      // Configure mock to return null (no state found)
      (mockCollection.findOne as jest.Mock).mockResolvedValue(null);
      
      // Call the API
      await GET();
      
      // Verify the result
      expect(NextResponse.json).toHaveBeenCalledWith({ exists: false });
      expect(mockMongoService.close).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Configure mock to throw an error
      mockMongoService.connect.mockRejectedValue(new Error('Database connection error'));
      
      // Call the API
      await GET();
      
      // Verify error response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch layout state' },
        { status: 500 }
      );
    });
  });
  
  describe('POST', () => {
    it('should update existing layout state', async () => {
      // Setup mock data with an existing _id
      const layoutId = new ObjectId().toString();
      const mockData = {
        _id: layoutId,
        industries: [{ _id: 'ind-1', tracks: [] }]
      };
      
      // Create request with mock data
      mockRequestJson.mockResolvedValue(mockData);
      
      // Mock updateOne to show success
      (mockCollection.updateOne as jest.Mock).mockResolvedValue({ 
        acknowledged: true, 
        modifiedCount: 1 
      });
      
      // Call the API
      await POST(mockRequest);
      
      // Verify updateOne was called with correct params
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: layoutId },
        { $set: expect.objectContaining({
          _id: layoutId,
          industries: [{ _id: 'ind-1', tracks: [] }],
          updatedAt: expect.any(Date)
        })},
        { upsert: true }
      );
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: layoutId,
          industries: [{ _id: 'ind-1', tracks: [] }],
          updatedAt: expect.any(Date)
        })
      );
      
      expect(mockMongoService.close).toHaveBeenCalled();
    });
    
    it('should create new layout state when no _id is provided', async () => {
      // Setup mock data without an _id
      const mockData = {
        industries: [{ _id: 'ind-1', tracks: [] }]
      };
      
      // Create request with mock data
      mockRequestJson.mockResolvedValue(mockData);
      
      // Mock insertOne to return an ID
      const insertedId = new ObjectId().toString();
      (mockCollection.insertOne as jest.Mock).mockResolvedValue({ 
        acknowledged: true,
        insertedId
      });
      
      // Call the API
      await POST(mockRequest);
      
      // Verify insertOne was called
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          industries: [{ _id: 'ind-1', tracks: [] }],
          updatedAt: expect.any(Date)
        })
      );
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          industries: [{ _id: 'ind-1', tracks: [] }],
          updatedAt: expect.any(Date)
        })
      );
      
      expect(mockMongoService.close).toHaveBeenCalled();
    });
    
    it('should handle database errors during save', async () => {
      // Create request with mock data
      mockRequestJson.mockResolvedValue({ industries: [] });
      
      // Configure mock to throw an error
      mockMongoService.connect.mockRejectedValue(new Error('Database connection error'));
      
      // Call the API
      await POST(mockRequest);
      
      // Verify error response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to save layout state' },
        { status: 500 }
      );
    });
  });
}); 