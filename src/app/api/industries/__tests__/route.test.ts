import { GET } from '../route';
import { db } from '@/shared/db';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options = {}) => ({
      json: () => Promise.resolve(data),
      status: options.status || 200,
    })),
  },
}));

jest.mock('@/shared/db', () => ({
  db: {
    collection: jest.fn().mockReturnValue(Promise.resolve({
      find: jest.fn().mockReturnValue({
        toArray: jest.fn(),
      }),
    })),
  },
}));

describe('GET /api/industries', () => {
  let mockToArray: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockToArray = jest.fn();
  });

  it('returns industries from the database', async () => {
    const mockIndustries = [
      { _id: '1', name: 'Industry 1' },
      { _id: '2', name: 'Industry 2' },
    ];

    const mockCollection = await db.collection('industries');
    mockCollection.find().toArray = mockToArray.mockResolvedValueOnce(mockIndustries);

    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockIndustries);
  });

  it('handles database errors', async () => {
    const mockCollection = await db.collection('industries');
    mockCollection.find().toArray = mockToArray.mockRejectedValueOnce(new Error('Connection failed'));

    const response = await GET();
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Failed to fetch industries' });
  });
}); 