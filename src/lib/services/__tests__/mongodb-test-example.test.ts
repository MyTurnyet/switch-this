import { FakeMongoService } from '../__mocks__/FakeMongoService';
import { ObjectId } from 'mongodb';

describe('MongoDB Testing Example', () => {
  it('demonstrates how to use the FakeMongoService', async () => {
    // Create a FakeMongoService instance
    const fakeMongoService = new FakeMongoService();
    
    // Spy on connect method
    jest.spyOn(fakeMongoService, 'connect');
    
    // Set up the mock data
    const mockLocation = {
      _id: new ObjectId('507f1f77bcf86cd799439011'),
      stationName: 'Test Station',
      locationType: 'ON_LAYOUT'
    };
    
    // Get the mock collection and configure its behavior - connect first
    await fakeMongoService.connect();
    const locationsCollection = fakeMongoService.getLocationsCollection();
    (locationsCollection.findOne as jest.Mock).mockResolvedValue(mockLocation);
    
    // Perform the operation
    const filter = { _id: new ObjectId('507f1f77bcf86cd799439011') };
    const location = await locationsCollection.findOne(filter);
    
    // Assertions
    expect(fakeMongoService.connect).toHaveBeenCalled();
    expect(locationsCollection.findOne).toHaveBeenCalledWith(filter);
    
    // Verify returned data
    expect(location).toEqual(expect.objectContaining({
      stationName: 'Test Station',
      locationType: 'ON_LAYOUT'
    }));
  });
  
  it('demonstrates using the FakeMongoService helper methods', async () => {
    // Create a FakeMongoService instance
    const fakeMongoService = new FakeMongoService();
    
    // Connect first to ensure we can get collections
    await fakeMongoService.connect();
    
    // Set up the mock data
    const mockLocation = {
      _id: new ObjectId('507f1f77bcf86cd799439011'),
      stationName: 'Test Station',
      locationType: 'ON_LAYOUT'
    };
    
    // Get the mock collection and configure its behavior
    const locationsCollection = fakeMongoService.getLocationsCollection();
    (locationsCollection.findOne as jest.Mock).mockResolvedValue(mockLocation);
    
    // Perform the operation
    const filter = { _id: new ObjectId('507f1f77bcf86cd799439011') };
    const location = await locationsCollection.findOne(filter);
    
    // Assertions
    expect(locationsCollection.findOne).toHaveBeenCalledWith(filter);
    
    // Verify returned data
    expect(location).toEqual(expect.objectContaining({
      stationName: 'Test Station',
      locationType: 'ON_LAYOUT'
    }));
    
    // Clean up when done
    await fakeMongoService.close();
  });
}); 