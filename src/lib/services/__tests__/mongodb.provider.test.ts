import { getMongoDbService, resetMongoDbService, setMongoDbService } from '../mongodb.provider';
import { MongoDbService } from '../mongodb.service';

// Mock the MongoDbService
jest.mock('../mongodb.service');

describe('MongoDb Provider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMongoDbService();
  });
  
  it('should create a MongoDB service instance if none exists', () => {
    const service = getMongoDbService();
    expect(service).toBeInstanceOf(MongoDbService);
    expect(MongoDbService).toHaveBeenCalledTimes(1);
  });
  
  it('should return the same MongoDB service instance on subsequent calls', () => {
    const service1 = getMongoDbService();
    const service2 = getMongoDbService();
    
    expect(service1).toBe(service2);
    expect(MongoDbService).toHaveBeenCalledTimes(1);
  });
  
  it('should reset the MongoDB service instance', () => {
    getMongoDbService(); // Create an instance
    resetMongoDbService(); // Reset it
    getMongoDbService(); // Create a new instance
    
    expect(MongoDbService).toHaveBeenCalledTimes(2);
  });
  
  it('should allow setting a custom MongoDB service instance', () => {
    const customService = new MongoDbService();
    setMongoDbService(customService);
    
    const service = getMongoDbService();
    expect(service).toBe(customService);
    // MongoDbService constructor should be called only once for our custom instance
    expect(MongoDbService).toHaveBeenCalledTimes(1);
  });
}); 