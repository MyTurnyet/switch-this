import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { GET, PUT } from '../route';

// Mock MongoDB client
jest.mock('mongodb', () => {
  const findOneMock = jest.fn();
  const updateOneMock = jest.fn().mockResolvedValue({ matchedCount: 1 });
  
  const mockCollection = {
    findOne: findOneMock,
    updateOne: updateOneMock
  };

  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
  };
  
  const mockClient = {
    db: jest.fn().mockReturnValue(mockDb),
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
  };

  return {
    MongoClient: jest.fn().mockImplementation(() => mockClient),
    ObjectId: jest.fn(id => ({ toString: () => id })),
  };
});

// Mock Next.js response
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

describe('Industry API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/industries/[id]', () => {
    it('should return an industry when found', async () => {
      // Mock data
      const mockIndustry = { 
        _id: new ObjectId('5f7e6c935f7e6c935f7e6c93'),
        name: 'Test Industry', 
        industryType: 'FREIGHT' 
      };
      
      // Mock MongoDB response
      const { MongoClient } = require('mongodb');
      const mockClient = new MongoClient();
      const mockCollection = mockClient.db().collection();
      mockCollection.findOne.mockResolvedValueOnce(mockIndustry);
      
      // Call the API
      await GET({} as Request, { params: { id: '5f7e6c935f7e6c935f7e6c93' } });
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(mockIndustry);
    });

    it('should return 404 when industry not found', async () => {
      // Mock MongoDB response
      const { MongoClient } = require('mongodb');
      const mockClient = new MongoClient();
      const mockCollection = mockClient.db().collection();
      mockCollection.findOne.mockResolvedValueOnce(null);
      
      // Call the API
      await GET({} as Request, { params: { id: 'nonexistent-id' } });
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Industry not found' },
        { status: 404 }
      );
    });

    it('should handle database errors', async () => {
      // Mock error
      const { MongoClient } = require('mongodb');
      const mockClient = new MongoClient();
      const mockCollection = mockClient.db().collection();
      mockCollection.findOne.mockRejectedValueOnce(new Error('Database error'));
      
      // Call the API
      await GET({} as Request, { params: { id: '5f7e6c935f7e6c935f7e6c93' } });
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch industry' },
        { status: 500 }
      );
    });
  });

  describe('PUT /api/industries/[id]', () => {
    it('should update an industry successfully', async () => {
      // Mock data
      const updateData = { 
        name: 'Updated Industry',
        industryType: 'YARD'
      };
      
      const updatedIndustry = { 
        _id: new ObjectId('5f7e6c935f7e6c935f7e6c93'),
        ...updateData 
      };
      
      // Mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce(updateData)
      };
      
      // Mock MongoDB responses
      const { MongoClient } = require('mongodb');
      const mockClient = new MongoClient();
      const mockCollection = mockClient.db().collection();
      mockCollection.findOne.mockResolvedValueOnce(updatedIndustry);
      
      // Call the API
      await PUT(mockRequest as unknown as Request, { params: { id: '5f7e6c935f7e6c935f7e6c93' } });
      
      // Verify MongoDB calls
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.anything() },
        { $set: updateData }
      );
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(updatedIndustry);
    });

    it('should return 400 when name is missing', async () => {
      // Mock data without name
      const invalidData = { 
        industryType: 'YARD'
      };
      
      // Mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce(invalidData)
      };
      
      // Call the API
      await PUT(mockRequest as unknown as Request, { params: { id: '5f7e6c935f7e6c935f7e6c93' } });
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Industry name is required' },
        { status: 400 }
      );
    });

    it('should return 404 when industry not found', async () => {
      // Mock data
      const updateData = { 
        name: 'Updated Industry'
      };
      
      // Mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce(updateData)
      };
      
      // Mock MongoDB response for non-existent industry
      const { MongoClient } = require('mongodb');
      const mockClient = new MongoClient();
      const mockCollection = mockClient.db().collection();
      mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 0 });
      
      // Call the API
      await PUT(mockRequest as unknown as Request, { params: { id: 'nonexistent-id' } });
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Industry not found' },
        { status: 404 }
      );
    });

    it('should handle database errors', async () => {
      // Mock data
      const updateData = { 
        name: 'Updated Industry'
      };
      
      // Mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce(updateData)
      };
      
      // Mock MongoDB error
      const { MongoClient } = require('mongodb');
      const mockClient = new MongoClient();
      const mockCollection = mockClient.db().collection();
      mockCollection.updateOne.mockRejectedValueOnce(new Error('Database error'));
      
      // Call the API
      await PUT(mockRequest as unknown as Request, { params: { id: '5f7e6c935f7e6c935f7e6c93' } });
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to update industry' },
        { status: 500 }
      );
    });
  });
}); 