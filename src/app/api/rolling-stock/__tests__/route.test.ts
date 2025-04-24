import { GET } from '../route';
import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

// Mock data
const mockRollingStock = [
  {
    _id: { $oid: 'car1' },
    roadName: 'BNSF',
    roadNumber: 1234,
    aarType: 'BOX',
    description: 'Box Car',
    color: 'Red',
    note: '',
    homeYard: { $oid: 'yard1' },
    ownerId: { $oid: 'owner1' }
  }
];

// Mock MongoDB
jest.mock('mongodb', () => {
  return {
    MongoClient: jest.fn().mockImplementation(() => ({
      connect: jest.fn(),
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(mockRollingStock)
          })
        })
      })
    }))
  };
});

// Mock NextResponse
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: jest.fn().mockImplementation((data) => ({ json: () => data }))
    }
  };
});

describe('Rolling Stock API', () => {
  it('returns rolling stock from the database', async () => {
    const mockRequest = new Request('http://localhost:3000/api/rolling-stock');
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(data).toEqual(mockRollingStock);
  });
}); 