import { GET } from '../route';
import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

// Mock data
const mockIndustries = [
  {
    _id: { $oid: 'ind1' },
    name: 'Test Industry',
    industryType: 'Manufacturing',
    locationId: { $oid: 'loc1' },
    ownerId: { $oid: 'owner1' },
    tracks: [{
      _id: { $oid: 'track1' },
      name: 'Track 1',
      maxCars: { $numberInt: '5' },
      placedCars: []
    }]
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
            toArray: jest.fn().mockResolvedValue(mockIndustries)
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

describe('Industries API', () => {
  it('returns industries from the database', async () => {
    const mockRequest = new Request('http://localhost:3000/api/industries');
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(data).toEqual(mockIndustries);
  });
}); 