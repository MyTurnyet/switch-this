import { POST } from '../route';
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

// Mock MongoDB
jest.mock('mongodb', () => {
  const updateOneMock = jest.fn().mockResolvedValue({ acknowledged: true });
  const findMock = jest.fn();
  findMock.mockReturnValue({
    toArray: jest.fn()
      .mockResolvedValueOnce([
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
      ])
      .mockResolvedValueOnce([
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
              placedCars: ['4', '5'],
            },
            {
              _id: 'track2',
              name: 'Track 2',
              maxCars: 4,
              placedCars: [],
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
              placedCars: ['6'],
            },
          ],
        },
      ]),
  });

  const mockCollection = {
    find: findMock,
    updateOne: updateOneMock,
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
    
    // Extract the mocked updateOne function
    const { MongoClient } = require('mongodb');
    const mockClient = await MongoClient.connect();
    const mockDb = mockClient.db();
    const mockCollection = mockDb.collection();
    const { updateOne } = mockCollection;
    
    // Verify the updateOne was called
    expect(updateOne).toHaveBeenCalled();
    
    // Verify the client was closed
    expect(mockClient.close).toHaveBeenCalled();
  });

  it('should use the correct collection names', async () => {
    // Call the API route handler
    await POST();
    
    // Extract the mocked collection function
    const { MongoClient } = require('mongodb');
    const mockClient = await MongoClient.connect();
    const mockDb = mockClient.db();
    
    // Verify the correct collection names were used
    expect(mockDb.collection).toHaveBeenCalledWith('rolling-stock');
    expect(mockDb.collection).toHaveBeenCalledWith('industries');
  });

  it('should handle errors gracefully', async () => {
    // Mock MongoDB to throw an error
    const { MongoClient } = require('mongodb');
    MongoClient.connect.mockRejectedValueOnce(new Error('Database connection failed'));

    // Call the API route handler
    await POST();

    // Verify the error response
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to reset rolling stock' }, 
      { status: 500 }
    );
  });
}); 