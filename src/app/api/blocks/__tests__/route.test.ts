import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';

// Set environment variable to use fake MongoDB
process.env.USE_FAKE_MONGO = 'true';

// We need to import the client first to make sure our mocks take effect
import { getMongoService, resetMongoService } from '@/lib/services/mongodb.client';
import { FakeMongoDbService } from '@/test/utils/mongodb-test-utils';

// Define a properly typed mock Response interface
interface MockResponse {
  body: string;
  parsedBody: any;
  status: number;
  headers: Record<string, string>;
}

// Mock Response constructor
global.Response = jest.fn().mockImplementation((body, options) => {
  const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
  return {
    body,
    parsedBody,
    status: options?.status || 200,
    headers: options?.headers || {}
  } as MockResponse;
});

// Mock collections
const mockBlocksCollection = {
  find: jest.fn().mockReturnThis(),
  toArray: jest.fn(),
  findOne: jest.fn(),
  insertOne: jest.fn()
};

// Mock MongoDB service
const mockMongoService = {
  connect: jest.fn(),
  close: jest.fn(),
  getBlocksCollection: jest.fn().mockReturnValue(mockBlocksCollection),
  toObjectId: jest.fn(id => id)
};

// Mock getMongoService to return our mock
jest.mock('@/lib/services/mongodb.client', () => {
  const originalModule = jest.requireActual('@/lib/services/mongodb.client');
  return {
    ...originalModule,
    getMongoService: jest.fn(() => mockMongoService)
  };
});

// Import module after mocking dependencies
import { GET, POST } from '../route';

describe('Blocks API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the MongoDB service to ensure clean state
    resetMongoService();
    
    // Set up mock data for blocks
    mockBlocksCollection.toArray.mockResolvedValue([
      { _id: 'block1', blockName: 'ECHO', description: 'Echo District' },
      { _id: 'block2', blockName: 'YARD', description: 'Main Yard' }
    ]);
  });

  describe('GET /api/blocks', () => {
    it('returns all blocks', async () => {
      // Set up our expected results
      const mockBlocks = [
        { _id: 'block1', blockName: 'ECHO', description: 'Echo District' },
        { _id: 'block2', blockName: 'YARD', description: 'Main Yard' }
      ];
      mockBlocksCollection.toArray.mockResolvedValueOnce(mockBlocks);
      
      const response = await GET(undefined, mockMongoService);
      const data = JSON.parse(response.body as string);
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockBlocks);
      
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getBlocksCollection).toHaveBeenCalled();
      expect(mockBlocksCollection.find).toHaveBeenCalled();
      expect(mockBlocksCollection.toArray).toHaveBeenCalled();
      expect(mockMongoService.close).toHaveBeenCalled();
    });

    it('handles errors during fetch', async () => {
      // Make the mock throw an error when fetching blocks
      mockBlocksCollection.toArray.mockRejectedValueOnce(new Error('Database error'));
      
      const response = await GET(undefined, mockMongoService);
      const data = JSON.parse(response.body as string);
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch blocks');
      expect(mockMongoService.close).toHaveBeenCalled();
    });
  });

  describe('POST /api/blocks', () => {
    const mockRequest = (body: object) => {
      return {
        json: jest.fn().mockResolvedValue(body)
      } as unknown as NextRequest;
    };

    it('creates a new block successfully', async () => {
      const newBlock = {
        blockName: 'NEW_BLOCK',
        description: 'New block description',
        ownerId: 'owner1'
      };
      
      const insertedBlock = {
        _id: 'newblock',
        ...newBlock
      };
      
      mockBlocksCollection.findOne.mockResolvedValueOnce(null); // No duplicate
      mockBlocksCollection.insertOne.mockResolvedValueOnce({ insertedId: 'newblock' });
      mockBlocksCollection.findOne.mockResolvedValueOnce(insertedBlock);
      
      const request = mockRequest(newBlock);
      const response = await POST(request as Request, mockMongoService);
      const data = JSON.parse(response.body as string);
      
      expect(response.status).toBe(201);
      expect(data._id).toBe('newblock');
      expect(data.blockName).toBe('NEW_BLOCK');
      
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockBlocksCollection.findOne).toHaveBeenCalled();
      expect(mockBlocksCollection.insertOne).toHaveBeenCalled();
      expect(mockMongoService.close).toHaveBeenCalled();
    });

    it('rejects block with missing name', async () => {
      const request = mockRequest({ description: 'Missing block name' });
      const response = await POST(request as Request, mockMongoService);
      const data = JSON.parse(response.body as string);
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Block name is required');
      expect(mockBlocksCollection.insertOne).not.toHaveBeenCalled();
    });

    it('rejects duplicate block name', async () => {
      const existingBlock = {
        blockName: 'ECHO',
        description: 'Duplicate name'
      };
      
      mockBlocksCollection.findOne.mockResolvedValueOnce({ _id: 'block1', ...existingBlock });
      
      const request = mockRequest(existingBlock);
      const response = await POST(request as Request, mockMongoService);
      const data = JSON.parse(response.body as string);
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('A block with this name already exists');
      expect(mockBlocksCollection.insertOne).not.toHaveBeenCalled();
    });

    it('handles errors during creation', async () => {
      const newBlock = {
        blockName: 'ERROR_BLOCK',
        description: 'Block with error'
      };
      
      mockBlocksCollection.findOne.mockResolvedValueOnce(null); // No duplicate
      mockBlocksCollection.insertOne.mockRejectedValueOnce(new Error('Database error'));
      
      const request = mockRequest(newBlock);
      const response = await POST(request as Request, mockMongoService);
      const data = JSON.parse(response.body as string);
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Database error');
      expect(mockMongoService.close).toHaveBeenCalled();
    });
  });
}); 