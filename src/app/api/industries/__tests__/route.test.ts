import { NextResponse } from 'next/server';
import { GET, POST } from '../route';
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
// Using FakeMongoDbService from test utils instead of custom mocks

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn()
  }
}));

// Mock MongoDbService provider
// Mock removed and replaced with proper declaration
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: 'new-id',
          name: 'New Industry'
        }),
        { status: 201 }
      );
    });

    it('should validate name is required', async () => {
      // Mock request with missing name
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          locationId: 'loc1',
          blockName: 'Block A',
          industryType: 'FREIGHT'
        })
      };
      
      // Call the API
      await POST(mockRequest as unknown as Request);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Industry name is required' },
        { status: 400 }
      );
    });

    it('should validate locationId is required', async () => {
      // Mock request with missing locationId
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          name: 'New Industry',
          blockName: 'Block A',
          industryType: 'FREIGHT'
        })
      };
      
      // Call the API
      await POST(mockRequest as unknown as Request);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Location ID is required' },
        { status: 400 }
      );
    });

    it('should validate industryType is required', async () => {
      // Mock request with missing industryType
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          name: 'New Industry',
          locationId: 'loc1',
          blockName: 'Block A'
        })
      };
      
      // Call the API
      await POST(mockRequest as unknown as Request);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Industry type is required' },
        { status: 400 }
      );
    });

    it('should validate blockName is required', async () => {
      // Mock request with missing blockName
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          name: 'New Industry',
          locationId: 'loc1',
          industryType: 'FREIGHT'
        })
      };
      
      // Call the API
      await POST(mockRequest as unknown as Request);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Block name is required' },
        { status: 400 }
      );
    });

    it('should handle database errors gracefully', async () => {
      // Mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValueOnce({
          name: 'New Industry',
          locationId: 'loc1',
          blockName: 'Block A',
          industryType: 'FREIGHT'
        })
      };
      
      // Get the mock collection and override the insertOne method to reject
      const mockCollection = fakeMongoService.getIndustriesCollection();
      (mockCollection.insertOne as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Insert error')));
      
      // Call the API
      await POST(mockRequest as unknown as Request);
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to create industry' },
        { status: 500 }
      );
    });
  });
}); 