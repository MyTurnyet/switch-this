import { GET } from './route';

// Mock data
const mockLocations = [
  {
    _id: { $oid: 'loc1' },
    stationName: 'Test Station',
    block: 'A',
    ownerId: { $oid: 'owner1' }
  }
];

// Mock NextResponse
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: jest.fn().mockImplementation((data) => ({ json: () => data }))
    }
  };
});

// Mock MongoDB
jest.mock('mongodb', () => {
  const mockLocations = [
    {
      _id: { $oid: 'loc1' },
      stationName: 'Test Station',
      block: 'A',
      ownerId: { $oid: 'owner1' }
    }
  ];

  return {
    MongoClient: jest.fn().mockImplementation(() => ({
      connect: jest.fn(),
      close: jest.fn(),
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(mockLocations)
          })
        })
      })
    }))
  };
});

describe('Locations API', () => {
  it('returns locations from the database', async () => {
    const mockRequest = new Request('http://localhost:3000/api/locations');
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(data).toEqual(mockLocations);
  });
}); 