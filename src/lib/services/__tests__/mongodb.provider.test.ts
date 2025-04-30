import { getMongoDbService, resetMongoDbService, setMongoDbService } from '../mongodb.provider';
import { MongoDbService } from '../mongodb.service';

// Mock the MongoDbService constructor
jest.mock('../mongodb.service', () => {
  // Create a mock constructor function
  const MockMongoDbService = jest.fn().mockImplementation(() => {
    return {
      connect: jest.fn(),
      close: jest.fn(),
      getCollection: jest.fn(),
      getRollingStockCollection: jest.fn(),
      getIndustriesCollection: jest.fn(),
      getLocationsCollection: jest.fn(),
      getTrainRoutesCollection: jest.fn(),
      getLayoutStateCollection: jest.fn(),
      toObjectId: jest.fn()
    };
  });
  
  // Manually add a prototype to make instanceof checks work
  MockMongoDbService.prototype = { constructor: MockMongoDbService };
  
  return {
    // Use named export to match the original
    MongoDbService: MockMongoDbService
  };
});

describe('MongoDb Provider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMongoDbService();
  });
  
  it('should create a MongoDB service instance if none exists', () => {
    const service = getMongoDbService();
    // Instead of instanceof check (which is problematic with mocks), check if it has the expected methods
    expect(service).toBeTruthy();
    expect(service.connect).toBeDefined();
    expect(service.getIndustriesCollection).toBeDefined();
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