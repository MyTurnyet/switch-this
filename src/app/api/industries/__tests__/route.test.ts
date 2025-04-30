import { NextResponse } from 'next/server';
import { GET, POST } from '../route';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn()
  }
}));

// Mock MongoDB client
jest.mock('mongodb', () => {
  const mockCollection = {
    find: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockResolvedValue([
      { _id: '1', name: 'Test Industry' }
    ]),
    insertOne: jest.fn().mockResolvedValue({ 
      insertedId: 'new-id' 
    })
  };

  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection)
  };

  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    db: jest.fn().mockReturnValue(mockDb),
    close: jest.fn().mockResolvedValue(undefined)
  };

  return {
    MongoClient: jest.fn().mockImplementation(() => mockClient),
    ObjectId: jest.fn(id => id)
  };
});

describe('Industries API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/industries', () => {
    it('should return industries from the database', async () => {
      // Call the API
      await GET();
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith([
        { _id: '1', name: 'Test Industry' }
      ]);
    });

    it('should handle errors gracefully', async () => {
      // Mock error
      const { MongoClient } = require('mongodb');
      MongoClient().connect.mockRejectedValueOnce(new Error('DB connection error'));
      
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
      
      // Verify data validation and insertion
      const { MongoClient } = require('mongodb');
      const mockCollection = MongoClient().db().collection();
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
      
      // Mock DB error
      const { MongoClient } = require('mongodb');
      MongoClient().db().collection().insertOne.mockRejectedValueOnce(new Error('Insert error'));
      
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