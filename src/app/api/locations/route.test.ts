import { MongoClient } from 'mongodb';
import { GET } from './route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

jest.mock('mongodb');

const mockLocations = [
  { id: 1, name: 'Location 1' },
  { id: 2, name: 'Location 2' },
];

describe('Locations API', () => {
  let mockClient: jest.Mock;
  let mockConnect: jest.Mock;
  let mockClose: jest.Mock;
  let mockFind: jest.Mock;
  let mockToArray: jest.Mock;
  let mockCollection: jest.Mock;
  let mockDb: jest.Mock;

  beforeEach(() => {
    mockToArray = jest.fn().mockResolvedValue(mockLocations);
    mockFind = jest.fn().mockReturnValue({ toArray: mockToArray });
    mockCollection = jest.fn().mockReturnValue({ find: mockFind });
    mockDb = jest.fn().mockReturnValue({ collection: mockCollection });
    mockConnect = jest.fn().mockResolvedValue(undefined);
    mockClose = jest.fn().mockResolvedValue(undefined);

    mockClient = jest.fn().mockImplementation(() => ({
      connect: mockConnect,
      close: mockClose,
      db: mockDb,
    }));

    (MongoClient as unknown as jest.Mock).mockImplementation((uri) => {
      return mockClient(uri);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns locations successfully', async () => {
    const response = await GET({} as Request);
    
    expect(mockConnect).toHaveBeenCalled();
    expect(mockDb).toHaveBeenCalledWith('switch-this');
    expect(mockCollection).toHaveBeenCalledWith('locations');
    expect(mockFind).toHaveBeenCalledWith({});
    expect(response).toEqual({ data: mockLocations });
    expect(mockClose).toHaveBeenCalled();
  });

  it('returns empty array when no locations exist', async () => {
    mockToArray.mockResolvedValueOnce([]);
    
    const response = await GET({} as Request);
    
    expect(response).toEqual({ data: [] });
    expect(mockClose).toHaveBeenCalled();
  });

  it('handles database connection error', async () => {
    mockConnect.mockRejectedValueOnce(new Error('Connection failed'));
    
    const response = await GET({} as Request);
    
    expect(response).toEqual({
      data: { error: 'Failed to fetch locations' },
      options: { status: 500 }
    });
    expect(mockClose).toHaveBeenCalled();
  });

  it('handles database query error', async () => {
    mockFind.mockImplementationOnce(() => {
      throw new Error('Query failed');
    });
    
    const response = await GET({} as Request);
    
    expect(response).toEqual({
      data: { error: 'Failed to fetch locations' },
      options: { status: 500 }
    });
    expect(mockClose).toHaveBeenCalled();
  });

  it('uses default MongoDB URI when environment variable is not set', async () => {
    const originalEnv = process.env.MONGODB_URI;
    delete process.env.MONGODB_URI;
    
    await GET({} as Request);
    
    expect(mockClient).toHaveBeenCalledWith('mongodb://localhost:27017');
    
    process.env.MONGODB_URI = originalEnv;
  });

  it('uses environment variable MongoDB URI when available', async () => {
    const originalEnv = process.env.MONGODB_URI;
    process.env.MONGODB_URI = 'mongodb://test-server:27017';
    
    await GET({} as Request);
    
    expect(mockClient).toHaveBeenCalledWith('mongodb://test-server:27017');
    
    process.env.MONGODB_URI = originalEnv;
  });
}); 