import { MongoDbProvider } from '../mongodb.provider';
import { createMockMongoService } from '@/test/utils/mongodb-test-utils';
import { ObjectId } from 'mongodb';

describe('MongoDB Testing Example', () => {
  it('demonstrates how to mock the MongoDB service', async () => {
    // Create a mock MongoDB service
    const mockMongoService = createMockMongoService();
    
    // Create a provider with the mock service
    const provider = new MongoDbProvider(mockMongoService);
    
    // Set up the mock to return specific data
    const mockLocation = {
      _id: new ObjectId('507f1f77bcf86cd799439011'),
      stationName: 'Test Station',
      locationType: 'ON_LAYOUT'
    };
    
    // Get the mock collection and configure its behavior
    const mockCollection = mockMongoService.getLocationsCollection();
    // Use jest.fn() directly to set the mock implementation
    (mockCollection.findOne as jest.Mock).mockResolvedValue(mockLocation);
    
    // Use the provider in the code being tested
    const service = provider.getService();
    await service.connect();
    
    // Perform the operation
    const locationsCollection = service.getLocationsCollection();
    // Use a proper MongoDB filter object instead of a string
    const filter = { _id: new ObjectId('507f1f77bcf86cd799439011') };
    const location = await locationsCollection.findOne(filter);
    
    // Assertions
    expect(service.connect).toHaveBeenCalled();
    expect(service.getLocationsCollection).toHaveBeenCalled();
    expect(mockCollection.findOne).toHaveBeenCalled();
    
    // Verify returned data
    expect(location).toEqual(expect.objectContaining({
      stationName: 'Test Station',
      locationType: 'ON_LAYOUT'
    }));
  });
}); 