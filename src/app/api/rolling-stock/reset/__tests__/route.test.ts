import { POST } from '../route';
import { NextResponse } from 'next/server';
import { MongoDbService } from '@/lib/services/mongodb.service';

// Using FakeMongoDbService from test utils instead of custom mocks

// Now mock the MongoDB provider
// MongoDB provider mocking is now handled by createMongoDbTestSetup()



// Using FakeMongoDbService from test utils instead of custom mocks

// Now mock the MongoDB provider
// Mock removed and replaced with proper declaration


import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';

import { FakeMongoDbService, createMongoDbTestSetup } from '@/test/utils/mongodb-test-utils';

// Create a MongoDB provider and service that will be used throughout this file
const mongoDbProvider = new MongoDbProvider(new MongoDbService());

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      status: options?.status || 200,
      body: data,
    })),
  },
}));

// Mock MongoDB service provider
jest.mock('@/lib/services/mongodb.provider', () => {
  return {
    MongoDbProvider: jest.fn().mockImplementation(() => ({
    getService: jest.fn().mockReturnValue(fakeMongoService)
  })),
  };
});

describe('Rolling Stock Reset API', () => {
  let fakeMongoService: jest.Mocked<MongoDbService>;
  
  beforeEach(() => {
  // Setup mock collections for this test
  beforeEach(() => {
    // Configure the fake service collections
    const rollingStockCollection = fakeMongoService.getRollingStockCollection();
    const industriesCollection = fakeMongoService.getIndustriesCollection();
    const locationsCollection = fakeMongoService.getLocationsCollection();
    const trainRoutesCollection = fakeMongoService.getTrainRoutesCollection();
    const switchlistsCollection = fakeMongoService.getSwitchlistsCollection();
    
    // Configure collection methods as needed for specific tests
    // Example: rollingStockCollection.find.mockImplementation(() => ({ toArray: jest.fn().mockResolvedValue([mockRollingStock]) }));
  });

    jest.clearAllMocks();
    
    // Create mock collections
    const rollingStockCollection = {
      find: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([
        // Mock rolling stock
        {
          _id: '1',
          roadName: 'BNSF',
          roadNumber: '1234',
          aarType: 'XM',
          description: 'Boxcar',
          color: 'RED',
          homeYard: 'yard1',
          ownerId: '1',
        },
        {
          _id: '2',
          roadName: 'UP',
          roadNumber: '5678',
          aarType: 'GS',
          description: 'Gondola',
          color: 'GREEN',
          homeYard: 'yard1',
          ownerId: '1',
        },
        {
          _id: '3',
          roadName: 'CSX',
          roadNumber: '9012',
          aarType: 'FM',
          description: 'Flatcar',
          color: 'BLUE',
          homeYard: 'yard2',
          ownerId: '1',
        },
      ]),
      updateOne: jest.fn().mockResolvedValue({ acknowledged: true })
    };
    
    const industriesCollection = {
      find: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([
        // Mock industries
        {
          _id: 'yard1',
          name: 'BNSF Yard',
          industryType: 'YARD',
          tracks: [
            {
              _id: 'track1',
              name: 'Track 1',
              maxCars: 4,
              capacity: 4,
              length: 100,
              placedCars: ['4', '5'],
              acceptedCarTypes: ['XM', 'GS', 'FM'],
            },
            {
              _id: 'track2',
              name: 'Track 2',
              maxCars: 4,
              capacity: 4,
              length: 100,
              placedCars: [],
              acceptedCarTypes: ['XM'],
            },
          ],
        },
        {
          _id: 'yard2',
          name: 'UP Yard',
          industryType: 'YARD',
          tracks: [
            {
              _id: 'track3',
              name: 'Track 3',
              maxCars: 4,
              capacity: 4,
              length: 100,
              placedCars: ['6'],
              acceptedCarTypes: ['FM'],
            },
          ],
        },
      ]),
      updateOne: jest.fn().mockResolvedValue({ acknowledged: true })
    };
    
    // Create mock MongoDB service
    fakeMongoService = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      getCollection: jest.fn(),
      getRollingStockCollection: jest.fn().mockReturnValue(rollingStockCollection),
      getIndustriesCollection: jest.fn().mockReturnValue(industriesCollection),
      getLocationsCollection: jest.fn(),
      getTrainRoutesCollection: jest.fn(),
      getLayoutStateCollection: jest.fn(),
      toObjectId: jest.fn(id => id)
    } as unknown as jest.Mocked<MongoDbService>;
    
    // Mock the getMongoDbService to return our mock
    const mockProvider = new MongoDbProvider(fakeMongoService);
  (MongoDbProvider as jest.Mock).mockReturnValue(mockProvider);
  });

  it('should reset rolling stock to their home yards on the least occupied tracks', async () => {
    // Call the API route handler
    const result = await POST();

    // Verify the response
    expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
    expect(result.status).toBe(200);
    
    // Verify the MongoDB service was used correctly
    expect(fakeMongoService.connect).toHaveBeenCalled();
    expect(fakeMongoService.getRollingStockCollection).toHaveBeenCalled();
    expect(fakeMongoService.getIndustriesCollection).toHaveBeenCalled();
    expect(fakeMongoService.close).toHaveBeenCalled();
    
    // Verify updateOne was called for the rolling stock
    const rollingStockCollection = fakeMongoService.getRollingStockCollection();
    expect(rollingStockCollection.updateOne).toHaveBeenCalledTimes(3);
  });

  it('should use the correct collection names', async () => {
    // Call the API route handler
    await POST();
    
    // Verify the correct collection methods were called
    expect(fakeMongoService.getRollingStockCollection).toHaveBeenCalled();
    expect(fakeMongoService.getIndustriesCollection).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    // Mock the connect method to throw an error
    fakeMongoService.connect.mockRejectedValueOnce(new Error('Database connection failed'));

    // Call the API route handler
    await POST();

    // Verify the error response
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to reset rolling stock' }, 
      { status: 500 }
    );
    
    // Verify close was still called for cleanup
    expect(fakeMongoService.close).toHaveBeenCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
    fakeMongoService.clearCallHistory();
  });
}); 