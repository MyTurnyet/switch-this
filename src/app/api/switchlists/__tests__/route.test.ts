import { NextRequest } from 'next/server';
import { jest } from '@jest/globals';

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

// Create the custom ObjectId mock function with a throw-on-invalid capability
const mockObjectId = jest.fn().mockImplementation((id) => {
  // Specifically throw for 'invalid-id-format'
  if (id === 'invalid-id-format') {
    throw new Error('Invalid ObjectId');
  }
  return {
    toString: () => id || 'new-id',
    toHexString: () => id || 'mock-id'
  };
});

// Mock MongoDB ObjectId
jest.mock('mongodb', () => {
  const original = jest.requireActual('mongodb');
  return {
    ...original,
    ObjectId: mockObjectId
  };
});

// Import ObjectId after the mock is set up
import { ObjectId } from 'mongodb';

// Create mocks for collections
const mockSwitchlistCollection = {
  find: jest.fn() as jest.Mock<any, any>,
  findOne: jest.fn() as jest.Mock<any, any>,
  insertOne: jest.fn() as jest.Mock<any, any>,
  updateOne: jest.fn() as jest.Mock<any, any>,
  deleteOne: jest.fn() as jest.Mock<any, any>
};

const mockTrainRoutesCollection = {
  findOne: jest.fn() as jest.Mock<any, any>
};

// Define mockMongoService
const mockMongoService = {
  connect: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  getSwitchlistsCollection: jest.fn().mockReturnValue(mockSwitchlistCollection),
  getTrainRoutesCollection: jest.fn().mockReturnValue(mockTrainRoutesCollection)
};

// Set up the MongoDB service mock
jest.mock('@/lib/services/mongodb.service', () => ({
  MongoDbService: jest.fn().mockImplementation(() => mockMongoService)
}));

// Import route handlers after all mocks are set up
let GET: (req?: NextRequest, context?: any) => Promise<Response>;
let POST: (req: NextRequest, context?: any) => Promise<Response>;

// Load the actual module after all mocks are in place
jest.isolateModules(() => {
  const routeModule = require('../route');
  GET = routeModule.GET;
  POST = routeModule.POST;
});

describe('Switchlists API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configure mock find to return an array of results
    mockSwitchlistCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([])
    });
  });

  describe('GET', () => {
    it('should return all switchlists', async () => {
      const mockSwitchlists = [
        { _id: '1', name: 'Test Switchlist 1' },
        { _id: '2', name: 'Test Switchlist 2' }
      ];
      
      // Configure mock to return switchlists
      mockSwitchlistCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockSwitchlists)
      });
      
      const response = await GET() as MockResponse;
      
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockMongoService.getSwitchlistsCollection).toHaveBeenCalled();
      expect(mockSwitchlistCollection.find).toHaveBeenCalled();
      expect(response.parsedBody).toEqual(mockSwitchlists);
      expect(response.status).toBe(200);
    });
    
    it('should handle errors', async () => {
      // Configure mock to throw an error
      mockSwitchlistCollection.find.mockReturnValue({
        toArray: jest.fn().mockRejectedValue(new Error('Database error'))
      });
      
      const response = await GET() as MockResponse;
      
      expect(response.parsedBody).toEqual({ error: 'Failed to fetch switchlists' });
      expect(response.status).toBe(500);
    });
  });
  
  describe('POST', () => {
    it('should create a new switchlist', async () => {
      const mockTrainRoute = { _id: 'train1', name: 'Test Train Route' };
      const mockSwitchlistData = {
        name: 'New Switchlist',
        trainRouteId: 'train1'
      };
      
      // Configure mocks for successful creation
      mockTrainRoutesCollection.findOne.mockResolvedValue(mockTrainRoute);
      mockSwitchlistCollection.insertOne.mockResolvedValue({
        acknowledged: true,
        insertedId: new ObjectId('123456789012345678901234')
      });
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue(mockSwitchlistData)
      } as unknown as NextRequest;
      
      const response = await POST(mockRequest) as MockResponse;
      
      expect(mockMongoService.connect).toHaveBeenCalled();
      expect(mockTrainRoutesCollection.findOne).toHaveBeenCalled();
      expect(mockSwitchlistCollection.insertOne).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.parsedBody).toHaveProperty('_id');
      expect(response.parsedBody).toHaveProperty('name', 'New Switchlist');
      expect(response.parsedBody).toHaveProperty('trainRouteId', 'train1');
    });
    
    it('should return 400 if required fields are missing', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          // Missing trainRouteId or name
        })
      } as unknown as NextRequest;
      
      const response = await POST(mockRequest) as MockResponse;
      
      expect(response.parsedBody).toEqual({ 
        error: 'Missing required fields: trainRouteId and name are required' 
      });
      expect(response.status).toBe(400);
    });
    
    it('should return 404 if train route not found', async () => {
      // Configure train route to not be found
      mockTrainRoutesCollection.findOne.mockResolvedValue(null);
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'New Switchlist',
          trainRouteId: 'nonexistent'
        })
      } as unknown as NextRequest;
      
      const response = await POST(mockRequest) as MockResponse;
      
      expect(mockTrainRoutesCollection.findOne).toHaveBeenCalled();
      expect(response.parsedBody).toEqual({ error: 'Train route not found' });
      expect(response.status).toBe(404);
    });
    
    it('should handle invalid trainRouteId format', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'New Switchlist',
          trainRouteId: 'invalid-id-format'
        })
      } as unknown as NextRequest;
      
      const response = await POST(mockRequest) as MockResponse;
      
      expect(response.parsedBody).toEqual({ error: 'Invalid trainRouteId format' });
      expect(response.status).toBe(400);
    });
    
    it('should handle database errors', async () => {
      mockTrainRoutesCollection.findOne.mockResolvedValue({ _id: 'train1' });
      mockSwitchlistCollection.insertOne.mockRejectedValue(new Error('Database error'));
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'New Switchlist',
          trainRouteId: 'train1'
        })
      } as unknown as NextRequest;
      
      const response = await POST(mockRequest) as MockResponse;
      
      expect(response.parsedBody).toEqual({ error: 'Failed to create switchlist' });
      expect(response.status).toBe(500);
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
}); 