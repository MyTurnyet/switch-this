import { POST } from '../route';
import { NextResponse } from 'next/server';
import { FakeMongoDbService } from '@/test/utils/mongodb-test-utils';

// Set up mock database collections
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
    // Additional mocked rolling stock...
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
        // Additional tracks...
      ],
    },
    // Additional industries...
  ]),
  updateOne: jest.fn().mockResolvedValue({ acknowledged: true })
};

// Create a fake MongoDB service instance
const fakeMongoService = new FakeMongoDbService();
fakeMongoService.isConnected = true;

// Configure the mocks
jest.spyOn(fakeMongoService, 'connect').mockResolvedValue();
jest.spyOn(fakeMongoService, 'close').mockResolvedValue();
jest.spyOn(fakeMongoService, 'getRollingStockCollection').mockReturnValue(rollingStockCollection as any);
jest.spyOn(fakeMongoService, 'getIndustriesCollection').mockReturnValue(industriesCollection as any);
jest.spyOn(fakeMongoService, 'toObjectId').mockImplementation(id => id as any);

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      status: options?.status || 200,
      body: data,
    })),
  },
}));

// Mock MongoDB service - now with fakeMongoService already initialized
jest.mock('@/lib/services/mongodb.service', () => ({
  MongoDbService: jest.fn().mockImplementation(() => fakeMongoService)
}));

describe('Rolling Stock Reset API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    (fakeMongoService.connect as jest.Mock).mockRejectedValueOnce(new Error('Database connection failed'));

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
  });
}); 