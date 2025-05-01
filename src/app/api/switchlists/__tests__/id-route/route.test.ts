import { NextRequest, NextResponse } from 'next/server';
import { getMongoDbService } from '@/lib/services/mongodb.provider';
import { ObjectId } from 'mongodb';
import path from 'path';

// Manually load the route module to avoid dynamic path issues with Jest
const routeModule = require(
  path.resolve(process.cwd(), 'src/app/api/switchlists/[id]/route.ts')
);
const { GET, PUT, DELETE } = routeModule;

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

describe('Switchlist By ID API Routes', () => {
  // Mock MongoDB service implementation
  const mockCollection = {
    findOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn()
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
  
  const mockParams = { id: '123456789012345678901234' };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (getMongoDbService as jest.Mock).mockReturnValue(mockMongoService);
    (ObjectId as unknown as jest.Mock).mockImplementation((id) => ({ toString: () => id }));
  });
  
  describe('GET', () => {
    it('should return a switchlist by ID', async () => {
      const mockSwitchlist = {
        _id: '123456789012345678901234',
        name: 'Test Switchlist',
        trainRouteId: 'train1',
        createdAt: '2023-06-01T12:00:00Z',
        status: 'CREATED',
        ownerId: 'user1'
      };
      
      mockCollection.findOne.mockResolvedValueOnce(mockSwitchlist);
      
      const mockRequest = {} as NextRequest;
      await GET(mockRequest, { params: mockParams });
      
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getSwitchlistsCollection).toHaveBeenCalled();
      expect(mockCollection.findOne).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(mockSwitchlist);
    });
    
    it('should return 404 if switchlist not found', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);
      
      const mockRequest = {} as NextRequest;
      await GET(mockRequest, { params: mockParams });
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Switchlist not found' },
        { status: 404 }
      );
    });
    
    it('should handle invalid ID format', async () => {
      const invalidParams = { id: 'invalid-id' };
      const mockRequest = {} as NextRequest;
      
      // Make ObjectId constructor throw an error
      (ObjectId as unknown as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid ObjectId');
      });
      
      await GET(mockRequest, { params: invalidParams });
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    });
    
    it('should handle errors', async () => {
      const mockError = new Error('Database error');
      mockCollection.findOne.mockRejectedValueOnce(mockError);
      
      const mockRequest = {} as NextRequest;
      await GET(mockRequest, { params: mockParams });
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch switchlist' },
        { status: 500 }
      );
    });
  });
  
  describe('PUT', () => {
    it('should update a switchlist', async () => {
      const mockExistingSwitchlist = {
        _id: '123456789012345678901234',
        name: 'Original Name',
        trainRouteId: 'train1',
        createdAt: '2023-06-01T12:00:00Z',
        status: 'CREATED',
        ownerId: 'user1'
      };
      
      const mockUpdatedSwitchlist = {
        ...mockExistingSwitchlist,
        name: 'Updated Name',
        status: 'IN_PROGRESS'
      };
      
      mockCollection.findOne
        .mockResolvedValueOnce(mockExistingSwitchlist)  // First findOne to check existence
        .mockResolvedValueOnce(mockUpdatedSwitchlist);  // Second findOne after update
      
      mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 1 });
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'Updated Name',
          status: 'IN_PROGRESS'
        })
      } as unknown as NextRequest;
      
      await PUT(mockRequest, { params: mockParams });
      
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockCollection.findOne).toHaveBeenCalledTimes(2);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        expect.anything(),
        { $set: expect.objectContaining({
          name: 'Updated Name',
          status: 'IN_PROGRESS'
        })}
      );
      expect(NextResponse.json).toHaveBeenCalledWith(mockUpdatedSwitchlist);
    });
    
    it('should validate train route when updating trainRouteId', async () => {
      const mockExistingSwitchlist = {
        _id: '123456789012345678901234',
        name: 'Original Name',
        trainRouteId: 'train1',
        createdAt: '2023-06-01T12:00:00Z',
        status: 'CREATED',
        ownerId: 'user1'
      };
      
      mockCollection.findOne.mockResolvedValueOnce(mockExistingSwitchlist);
      mockTrainRoutesCollection.findOne.mockResolvedValueOnce(null); // Train route not found
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          trainRouteId: 'nonexistent'
        })
      } as unknown as NextRequest;
      
      await PUT(mockRequest, { params: mockParams });
      
      expect(mockTrainRoutesCollection.findOne).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Train route not found' },
        { status: 404 }
      );
    });
    
    it('should return 404 if switchlist to update not found', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'Updated Name'
        })
      } as unknown as NextRequest;
      
      await PUT(mockRequest, { params: mockParams });
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Switchlist not found' },
        { status: 404 }
      );
    });
  });
  
  describe('DELETE', () => {
    it('should delete a switchlist', async () => {
      const mockSwitchlist = {
        _id: '123456789012345678901234',
        name: 'Test Switchlist'
      };
      
      mockCollection.findOne.mockResolvedValueOnce(mockSwitchlist);
      mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });
      
      const mockRequest = {} as NextRequest;
      await DELETE(mockRequest, { params: mockParams });
      
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockCollection.findOne).toHaveBeenCalled();
      expect(mockCollection.deleteOne).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
    });
    
    it('should return 404 if switchlist to delete not found', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);
      
      const mockRequest = {} as NextRequest;
      await DELETE(mockRequest, { params: mockParams });
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Switchlist not found' },
        { status: 404 }
      );
    });
    
    it('should handle delete failure', async () => {
      const mockSwitchlist = {
        _id: '123456789012345678901234',
        name: 'Test Switchlist'
      };
      
      mockCollection.findOne.mockResolvedValueOnce(mockSwitchlist);
      mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 0 });
      
      const mockRequest = {} as NextRequest;
      await DELETE(mockRequest, { params: mockParams });
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to delete switchlist' },
        { status: 500 }
      );
    });
  });
}); 