import { GET, POST } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import { getMongoDbService } from '@/lib/services/mongodb.provider';
import { ObjectId } from 'mongodb';

// Mock the MongoDB service
jest.mock('@/lib/services/mongodb.provider', () => ({
  getMongoDbService: jest.fn()
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      data,
      status: options?.status || 200
    }))
  }
}));

// Mock ObjectId
jest.mock('mongodb', () => {
  return {
    ObjectId: jest.fn((id) => {
      return {
        toString: () => id
      };
    })
  };
});

describe('Switchlists API Routes', () => {
  // Mock MongoDB service implementation
  const mockCollection = {
    find: jest.fn().mockReturnThis(),
    toArray: jest.fn(),
    findOne: jest.fn(),
    insertOne: jest.fn()
  };
  
  const mockTrainRoutesCollection = {
    findOne: jest.fn()
  };
  
  const mockMongoService = {
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    getSwitchlistsCollection: jest.fn().mockReturnValue(mockCollection),
    getTrainRoutesCollection: jest.fn().mockReturnValue(mockTrainRoutesCollection)
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (getMongoDbService as jest.Mock).mockReturnValue(mockMongoService);
    (ObjectId as unknown as jest.Mock).mockImplementation((id) => ({ toString: () => id }));
  });
  
  describe('GET', () => {
    it('should return all switchlists', async () => {
      const mockSwitchlists = [
        { _id: '1', name: 'Switchlist 1' },
        { _id: '2', name: 'Switchlist 2' }
      ];
      
      mockCollection.toArray.mockResolvedValueOnce(mockSwitchlists);
      
      await GET();
      
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getSwitchlistsCollection).toHaveBeenCalled();
      expect(mockCollection.find).toHaveBeenCalledWith({});
      expect(mockCollection.toArray).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(mockSwitchlists);
      expect(mockMongoService.close).toHaveBeenCalled();
    });
    
    it('should handle errors', async () => {
      const mockError = new Error('Database error');
      mockCollection.toArray.mockRejectedValueOnce(mockError);
      
      await GET();
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch switchlists' },
        { status: 500 }
      );
    });
  });
  
  describe('POST', () => {
    it('should create a new switchlist', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          trainRouteId: '123',
          name: 'New Switchlist',
          notes: 'Test notes'
        })
      } as unknown as NextRequest;
      
      const mockTrainRoute = { _id: '123', name: 'Test Route' };
      mockTrainRoutesCollection.findOne.mockResolvedValueOnce(mockTrainRoute);
      
      const mockInsertResult = {
        acknowledged: true,
        insertedId: { toString: () => '456' }
      };
      mockCollection.insertOne.mockResolvedValueOnce(mockInsertResult);
      
      await POST(mockRequest);
      
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockTrainRoutesCollection.findOne).toHaveBeenCalled();
      expect(mockCollection.insertOne).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: '456',
          trainRouteId: '123',
          name: 'New Switchlist',
          notes: 'Test notes'
        }),
        { status: 201 }
      );
    });
    
    it('should validate required fields', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'New Switchlist'
          // Missing trainRouteId
        })
      } as unknown as NextRequest;
      
      await POST(mockRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Missing required fields: trainRouteId and name are required' },
        { status: 400 }
      );
    });
    
    it('should validate trainRouteId exists', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          trainRouteId: '123',
          name: 'New Switchlist'
        })
      } as unknown as NextRequest;
      
      // No train route found
      mockTrainRoutesCollection.findOne.mockResolvedValueOnce(null);
      
      await POST(mockRequest);
      
      expect(mockTrainRoutesCollection.findOne).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Train route not found' },
        { status: 404 }
      );
    });
    
    it('should handle errors', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          trainRouteId: '123',
          name: 'New Switchlist'
        })
      } as unknown as NextRequest;
      
      // Mock a database error during insert
      const mockError = new Error('Database error');
      mockTrainRoutesCollection.findOne.mockResolvedValueOnce({ _id: '123' });
      mockCollection.insertOne.mockRejectedValueOnce(mockError);
      
      await POST(mockRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to create switchlist' },
        { status: 500 }
      );
    });
    
    it('should handle invalid trainRouteId format', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          trainRouteId: 'invalid-id',
          name: 'New Switchlist'
        })
      } as unknown as NextRequest;
      
      // Make ObjectId constructor throw an error
      (ObjectId as unknown as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid ObjectId');
      });
      
      await POST(mockRequest);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid trainRouteId format' },
        { status: 400 }
      );
    });
  });
}); 