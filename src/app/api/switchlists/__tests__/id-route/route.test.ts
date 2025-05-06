import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import path from 'path';

// Mock MongoDB service
const mockSwitchlistCollection = {
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
  getSwitchlistsCollection: jest.fn().mockReturnValue(mockSwitchlistCollection),
  getTrainRoutesCollection: jest.fn().mockReturnValue(mockTrainRoutesCollection)
};

// Mock the MongoDbService module to return our mock service
jest.mock('@/lib/services/mongodb.service', () => {
  return {
    MongoDbService: jest.fn().mockImplementation(() => mockMongoService)
  };
});

// Mock Response constructor
global.Response = jest.fn().mockImplementation((body, options) => {
  const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
  return {
    body,
    parsedBody,
    status: options?.status || 200,
    headers: options?.headers || {}
  };
});

// Mock ObjectId
jest.mock('mongodb', () => {
  return {
    ObjectId: jest.fn((id) => {
      return {
        toString: () => id || 'mock-id'
      };
    })
  };
});

// Manually load the route module to avoid dynamic path issues with Jest
const routeModule = require(
  path.resolve(process.cwd(), 'src/app/api/switchlists/[id]/route.ts')
);
const { GET, PUT, DELETE } = routeModule;

describe('Switchlist By ID API Routes', () => {
  const mockParams = { id: '123456789012345678901234' };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configure ObjectId mock
    (ObjectId as unknown as jest.Mock).mockImplementation((id) => ({ 
      toString: () => id 
    }));
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
      
      mockSwitchlistCollection.findOne.mockResolvedValueOnce(mockSwitchlist);
      
      const mockRequest = {} as NextRequest;
      const response = await GET(mockRequest, { params: mockParams });
      
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getSwitchlistsCollection).toHaveBeenCalled();
      expect(mockSwitchlistCollection.findOne).toHaveBeenCalled();
      expect(response.parsedBody).toEqual(mockSwitchlist);
      expect(response.status).toBe(200);
    });
    
    it('should return 404 if switchlist not found', async () => {
      mockSwitchlistCollection.findOne.mockResolvedValueOnce(null);
      
      const mockRequest = {} as NextRequest;
      const response = await GET(mockRequest, { params: mockParams });
      
      expect(response.parsedBody).toEqual({ error: 'Switchlist not found' });
      expect(response.status).toBe(404);
    });
    
    it('should handle invalid ID format', async () => {
      const invalidParams = { id: 'invalid-id' };
      const mockRequest = {} as NextRequest;
      
      // Make ObjectId constructor throw an error
      (ObjectId as unknown as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid ObjectId');
      });
      
      const response = await GET(mockRequest, { params: invalidParams });
      
      expect(response.parsedBody).toEqual({ error: 'Invalid ID format' });
      expect(response.status).toBe(400);
    });
    
    it('should handle errors', async () => {
      const mockError = new Error('Database error');
      mockSwitchlistCollection.findOne.mockRejectedValueOnce(mockError);
      
      const mockRequest = {} as NextRequest;
      const response = await GET(mockRequest, { params: mockParams });
      
      expect(response.parsedBody).toEqual({ error: 'Failed to fetch switchlist' });
      expect(response.status).toBe(500);
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
      
      mockSwitchlistCollection.findOne
        .mockResolvedValueOnce(mockExistingSwitchlist)  // First findOne to check existence
        .mockResolvedValueOnce(mockUpdatedSwitchlist);  // Second findOne after update
      
      mockSwitchlistCollection.updateOne.mockResolvedValueOnce({ matchedCount: 1 });
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'Updated Name',
          status: 'IN_PROGRESS'
        })
      } as unknown as NextRequest;
      
      const response = await PUT(mockRequest, { params: mockParams });
      
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockSwitchlistCollection.findOne).toHaveBeenCalledTimes(2);
      expect(mockSwitchlistCollection.updateOne).toHaveBeenCalledWith(
        expect.anything(),
        { $set: expect.objectContaining({
          name: 'Updated Name',
          status: 'IN_PROGRESS'
        })}
      );
      expect(response.parsedBody).toEqual(mockUpdatedSwitchlist);
      expect(response.status).toBe(200);
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
      
      mockSwitchlistCollection.findOne.mockResolvedValueOnce(mockExistingSwitchlist);
      mockTrainRoutesCollection.findOne.mockResolvedValueOnce(null); // Train route not found
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          trainRouteId: 'nonexistent'
        })
      } as unknown as NextRequest;
      
      const response = await PUT(mockRequest, { params: mockParams });
      
      expect(mockTrainRoutesCollection.findOne).toHaveBeenCalled();
      expect(response.parsedBody).toEqual({ error: 'Train route not found' });
      expect(response.status).toBe(404);
    });
    
    it('should return 404 if switchlist to update not found', async () => {
      mockSwitchlistCollection.findOne.mockResolvedValueOnce(null);
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'Updated Name'
        })
      } as unknown as NextRequest;
      
      const response = await PUT(mockRequest, { params: mockParams });
      
      expect(response.parsedBody).toEqual({ error: 'Switchlist not found' });
      expect(response.status).toBe(404);
    });
  });
  
  describe('DELETE', () => {
    it('should delete a switchlist', async () => {
      mockSwitchlistCollection.findOne.mockResolvedValueOnce({
        _id: '123456789012345678901234',
        name: 'Test Switchlist'
      });
      
      mockSwitchlistCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });
      
      const mockRequest = {} as NextRequest;
      const response = await DELETE(mockRequest, { params: mockParams });
      
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockSwitchlistCollection.findOne).toHaveBeenCalled();
      expect(mockSwitchlistCollection.deleteOne).toHaveBeenCalled();
      expect(response.parsedBody).toEqual({ message: 'Switchlist deleted successfully' });
      expect(response.status).toBe(200);
    });
    
    it('should return 404 if switchlist to delete not found', async () => {
      mockSwitchlistCollection.findOne.mockResolvedValueOnce(null);
      
      const mockRequest = {} as NextRequest;
      const response = await DELETE(mockRequest, { params: mockParams });
      
      expect(response.parsedBody).toEqual({ error: 'Switchlist not found' });
      expect(response.status).toBe(404);
    });
    
    it('should handle delete failure', async () => {
      mockSwitchlistCollection.findOne.mockResolvedValueOnce({
        _id: '123456789012345678901234',
        name: 'Test Switchlist'
      });
      
      const mockError = new Error('Database error');
      mockSwitchlistCollection.deleteOne.mockRejectedValueOnce(mockError);
      
      const mockRequest = {} as NextRequest;
      const response = await DELETE(mockRequest, { params: mockParams });
      
      expect(response.parsedBody).toEqual({ error: 'Failed to delete switchlist' });
      expect(response.status).toBe(500);
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
}); 