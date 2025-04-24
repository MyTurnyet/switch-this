import { GET } from '../route';
import { db } from '@/shared/db';

jest.mock('@/shared/db', () => ({
  db: {
    collection: jest.fn().mockReturnValue(Promise.resolve({
      find: jest.fn().mockReturnValue({
        toArray: jest.fn(),
      }),
    })),
  },
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, init) => ({
      ...new Response(),
      ...init,
      data,
      json: () => Promise.resolve(data),
    })),
  },
}));

describe('GET /api/rolling-stock', () => {
  let mockToArray: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockToArray = jest.fn();
  });

  it('returns rolling stock from the database', async () => {
    const mockRollingStock = [
      { _id: '1', name: 'Car 1' },
      { _id: '2', name: 'Car 2' },
    ];

    const mockCollection = await db.collection('rollingStock');
    mockCollection.find().toArray = mockToArray.mockResolvedValueOnce(mockRollingStock);

    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockRollingStock);
  });

  it('handles database errors', async () => {
    const mockCollection = await db.collection('rollingStock');
    mockCollection.find().toArray = mockToArray.mockRejectedValueOnce(new Error('Connection failed'));

    const response = await GET();
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Failed to fetch rolling stock' });
  });
}); 