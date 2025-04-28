import { POST } from '../route';

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://test-uri';

// Mock MongoDB
jest.mock('mongodb', () => {
  const mockUpdateOne = jest.fn().mockResolvedValue({ acknowledged: true });
  const mockToArray = jest.fn();
  const mockFind = jest.fn().mockReturnValue({ toArray: mockToArray });
  const mockCollection = jest.fn().mockReturnValue({
    find: mockFind,
    updateOne: mockUpdateOne
  });
  const mockDb = jest.fn().mockReturnValue({
    collection: mockCollection
  });
  const mockClose = jest.fn();

  return {
    MongoClient: {
      connect: jest.fn().mockResolvedValue({
        db: mockDb,
        close: mockClose
      })
    },
    ObjectId: jest.fn().mockImplementation((id) => ({ toString: () => id }))
  };
});

// Mock NextResponse
jest.mock('next/server', () => {
  interface ResponseData {
    message?: string;
    error?: string;
    [key: string]: unknown;
  }

  interface ResponseOptions {
    status?: number;
  }

  class MockNextResponse {
    private data: ResponseData;
    public status: number;

    constructor(data: ResponseData, options: ResponseOptions = {}) {
      this.data = data;
      this.status = options.status || 200;
    }
    json() {
      return Promise.resolve(this.data);
    }
  }
  return {
    NextResponse: {
      json: (data: ResponseData, options?: ResponseOptions) => new MockNextResponse(data, options)
    }
  };
});

describe('POST /api/rolling-stock/reset', () => {
  const mockRollingStock = [
    { _id: '1', homeYard: 'yard1', currentLocation: { industryId: 'yard2', trackId: 'track1' } },
    { _id: '2', homeYard: 'yard1', currentLocation: { industryId: 'yard2', trackId: 'track1' } },
    { _id: '3', homeYard: 'yard2', currentLocation: { industryId: 'yard1', trackId: 'track2' } }
  ];

  const mockIndustries = [
    {
      _id: 'yard1',
      industryType: 'YARD',
      tracks: [
        { _id: 'track1' },
        { _id: 'track2' }
      ]
    },
    {
      _id: 'yard2',
      industryType: 'YARD',
      tracks: [
        { _id: 'track3' },
        { _id: 'track4' }
      ]
    }
  ];

  beforeEach(async () => {
    jest.clearAllMocks();
    const { MongoClient } = jest.requireMock('mongodb');
    const client = await MongoClient.connect();
    const mockDb = client.db();
    const mockCollection = mockDb.collection();
    mockCollection.find().toArray
      .mockResolvedValueOnce(mockRollingStock)  // First call for rolling stock
      .mockResolvedValueOnce(mockIndustries);   // Second call for industries
  });

  it('should place cars on tracks with the fewest cars in their home yard', async () => {
    const response = await POST();
    const responseData = await response.json();

    expect(responseData).toEqual({ success: true });
    const { MongoClient } = jest.requireMock('mongodb');
    const client = await MongoClient.connect();
    const mockDb = client.db();
    expect(mockDb.collection).toHaveBeenCalledWith('rollingStock');
    expect(mockDb.collection).toHaveBeenCalledWith('industries');
    expect(mockDb.collection().updateOne).toHaveBeenCalledTimes(8);
    expect(client.close).toHaveBeenCalled();
  });

  it('should place cars on tracks and return success', async () => {
    const response = await POST();
    expect(response).toBeDefined();
    expect(typeof response.json).toBe('function');
    const data = await response.json();
    expect(data).toEqual({ success: true });
  });

  it('should handle errors gracefully', async () => {
    const { MongoClient } = jest.requireMock('mongodb');
    MongoClient.connect.mockRejectedValueOnce(new Error('Database connection failed'));

    const response = await POST();
    expect(response).toBeDefined();
    expect(typeof response.json).toBe('function');
    const data = await response.json();
    expect(data).toEqual({ error: 'Failed to reset rolling stock' });
    expect(response.status).toBe(500);
  });
}); 