import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '../route';
import { MongoClient } from 'mongodb';

// Mock MongoDB client
jest.mock('mongodb', () => {
  const mockUpdateOne = jest.fn().mockResolvedValue({ matchedCount: 1 });
  const mockFindOne = jest.fn().mockResolvedValue({ _id: 'mock-id', roadName: 'TEST', roadNumber: '12345' });
  const mockDeleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
  const mockCollection = {
    findOne: mockFindOne,
    updateOne: mockUpdateOne,
    deleteOne: mockDeleteOne
  };
  
  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection)
  };
  
  const mockClient = {
    connect: jest.fn().mockResolvedValue(true),
    db: jest.fn().mockReturnValue(mockDb),
    close: jest.fn().mockResolvedValue(true)
  };
  
  return {
    MongoClient: jest.fn().mockImplementation(() => mockClient),
    ObjectId: jest.fn(id => id)
  };
});

// Mock NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextRequest: jest.fn(),
    NextResponse: {
      json: jest.fn().mockImplementation((data, options) => ({
        json: () => data,
        status: options?.status || 200
      }))
    }
  };
});

describe('Rolling Stock [id] API Route', () => {
  const mockParams = { id: 'mock-id' };
  const mockRequest = {
    json: jest.fn().mockResolvedValue({ roadName: 'TEST', roadNumber: '12345' })
  } as unknown as NextRequest;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET', () => {
    it('should return a rolling stock item by id', async () => {
      const response = await GET(mockRequest, { params: mockParams });
      
      expect(response.json()).toEqual({ _id: 'mock-id', roadName: 'TEST', roadNumber: '12345' });
    });
    
    it('should return 404 when rolling stock is not found', async () => {
      // Setup mock to return null for this test
      const mockClient = new MongoClient('');
      const mockCollection = mockClient.db().collection();
      mockCollection.findOne = jest.fn().mockResolvedValue(null);
      
      const response = await GET(mockRequest, { params: mockParams });
      
      expect(response.status).toBe(404);
      expect(response.json()).toEqual({ error: 'Rolling stock not found' });
    });
  });
  
  describe('PUT', () => {
    it('should update a rolling stock item', async () => {
      const response = await PUT(mockRequest, { params: mockParams });
      
      expect(response.json()).toEqual({ message: 'Rolling stock updated successfully' });
    });
    
    it('should return 404 when rolling stock is not found', async () => {
      // Setup mock to return matchedCount 0 for this test
      const mockClient = new MongoClient('');
      const mockCollection = mockClient.db().collection();
      mockCollection.updateOne = jest.fn().mockResolvedValue({ matchedCount: 0 });
      
      const response = await PUT(mockRequest, { params: mockParams });
      
      expect(response.status).toBe(404);
      expect(response.json()).toEqual({ error: 'Rolling stock not found' });
    });
  });
  
  describe('DELETE', () => {
    it('should delete a rolling stock item', async () => {
      const response = await DELETE(mockRequest, { params: mockParams });
      
      expect(response.json()).toEqual({ message: 'Rolling stock deleted successfully' });
    });
    
    it('should return 404 when rolling stock is not found', async () => {
      // Setup mock to return deletedCount 0 for this test
      const mockClient = new MongoClient('');
      const mockCollection = mockClient.db().collection();
      mockCollection.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 0 });
      
      const response = await DELETE(mockRequest, { params: mockParams });
      
      expect(response.status).toBe(404);
      expect(response.json()).toEqual({ error: 'Rolling stock not found' });
    });
  });
}); 