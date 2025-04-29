import { GET, POST } from '../route';
import { NextResponse } from 'next/server';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      status: options?.status || 200,
      body: data,
    })),
  },
}));

// Mock MongoDB client
jest.mock('mongodb', () => {
  const findOneMock = jest.fn();
  const updateOneMock = jest.fn().mockResolvedValue({ acknowledged: true });
  const insertOneMock = jest.fn().mockResolvedValue({ 
    acknowledged: true,
    insertedId: 'test-id'
  });
  
  const mockCollection = {
    findOne: findOneMock,
    updateOne: updateOneMock,
    insertOne: insertOneMock
  };

  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
  };
  
  const mockClient = {
    db: jest.fn().mockReturnValue(mockDb),
    close: jest.fn().mockResolvedValue(undefined),
  };

  return {
    MongoClient: {
      connect: jest.fn().mockResolvedValue(mockClient),
    },
    ObjectId: jest.fn(id => id),
  };
});

describe('Layout State API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET', () => {
    it('should return layout state from the database', async () => {
      // Setup mock data
      const mockLayoutState = {
        _id: 'layout-1',
        industries: [{ _id: 'ind-1', tracks: [] }],
        updatedAt: new Date()
      };
      
      // Configure mock
      const { MongoClient } = require('mongodb');
      const mockClient = await MongoClient.connect();
      const mockDb = mockClient.db();
      const mockCollection = mockDb.collection();
      mockCollection.findOne.mockResolvedValueOnce(mockLayoutState);
      
      // Call the API
      await GET();
      
      // Verify the result
      expect(NextResponse.json).toHaveBeenCalledWith(mockLayoutState);
      expect(mockCollection.findOne).toHaveBeenCalledWith({}, { sort: { updatedAt: -1 } });
      expect(mockClient.close).toHaveBeenCalled();
    });
    
    it('should return exists:false when no layout state exists', async () => {
      // Configure mock to return null (no state found)
      const { MongoClient } = require('mongodb');
      const mockClient = await MongoClient.connect();
      const mockDb = mockClient.db();
      const mockCollection = mockDb.collection();
      mockCollection.findOne.mockResolvedValueOnce(null);
      
      // Call the API
      await GET();
      
      // Verify the result
      expect(NextResponse.json).toHaveBeenCalledWith({ exists: false });
      expect(mockClient.close).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Configure mock to throw an error
      const { MongoClient } = require('mongodb');
      MongoClient.connect.mockRejectedValueOnce(new Error('Database connection error'));
      
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
      const mockData = {
        _id: 'layout-1',
        industries: [{ _id: 'ind-1', tracks: [] }]
      };
      
      // Create request with mock data
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce(mockData)
      };
      
      // Call the API
      await POST(mockRequest as unknown as Request);
      
      // Verify updateOne was called with correct params
      const { MongoClient } = require('mongodb');
      const mockClient = await MongoClient.connect();
      const mockDb = mockClient.db();
      const mockCollection = mockDb.collection();
      
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 'layout-1' },
        { $set: expect.objectContaining({
          _id: 'layout-1',
          industries: [{ _id: 'ind-1', tracks: [] }],
          updatedAt: expect.any(Date)
        })},
        { upsert: true }
      );
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: 'layout-1',
          industries: [{ _id: 'ind-1', tracks: [] }],
          updatedAt: expect.any(Date)
        })
      );
      
      expect(mockClient.close).toHaveBeenCalled();
    });
    
    it('should create new layout state when no _id is provided', async () => {
      // Setup mock data without an _id
      const mockData = {
        industries: [{ _id: 'ind-1', tracks: [] }]
      };
      
      // Create request with mock data
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce(mockData)
      };
      
      // Call the API
      await POST(mockRequest as unknown as Request);
      
      // Verify insertOne was called
      const { MongoClient } = require('mongodb');
      const mockClient = await MongoClient.connect();
      const mockDb = mockClient.db();
      const mockCollection = mockDb.collection();
      
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          industries: [{ _id: 'ind-1', tracks: [] }],
          updatedAt: expect.any(Date)
        })
      );
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: 'test-id',
          industries: [{ _id: 'ind-1', tracks: [] }],
          updatedAt: expect.any(Date)
        })
      );
      
      expect(mockClient.close).toHaveBeenCalled();
    });
    
    it('should handle database errors during save', async () => {
      // Create request with mock data
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({ industries: [] })
      };
      
      // Configure mock to throw an error
      const { MongoClient } = require('mongodb');
      MongoClient.connect.mockRejectedValueOnce(new Error('Database connection error'));
      
      // Call the API
      await POST(mockRequest as unknown as Request);
      
      // Verify error response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to save layout state' },
        { status: 500 }
      );
    });
  });
}); 