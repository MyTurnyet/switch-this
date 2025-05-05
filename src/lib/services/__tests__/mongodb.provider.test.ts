import { MongoDbProvider } from '../mongodb.provider';
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
      getSwitchlistsCollection: jest.fn(),
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
  let mongoDbProvider: MongoDbProvider;
  let mockMongoService: MongoDbService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockMongoService = new MongoDbService();
    mongoDbProvider = new MongoDbProvider(mockMongoService);
  });
  
  it('should return the MongoDB service instance', () => {
    const service = mongoDbProvider.getService();
    // Instead of instanceof check (which is problematic with mocks), check if it has the expected methods
    expect(service).toBeTruthy();
    expect(service.connect).toBeDefined();
    expect(service.getIndustriesCollection).toBeDefined();
    // MongoDbService constructor should be called once for our initial service
    expect(MongoDbService).toHaveBeenCalledTimes(1);
  });
  
  it('should return the same MongoDB service instance on subsequent calls', () => {
    const service1 = mongoDbProvider.getService();
    const service2 = mongoDbProvider.getService();
    
    expect(service1).toBe(service2);
    expect(MongoDbService).toHaveBeenCalledTimes(1);
  });
  
  it('should create a new provider when a new service is needed', () => {
    const firstProvider = new MongoDbProvider(mockMongoService);
    const firstService = firstProvider.getService();
    
    // Create a new service and provider
    const newMockService = new MongoDbService();
    const secondProvider = new MongoDbProvider(newMockService);
    const secondService = secondProvider.getService();
    
    // Services should be different because they come from different providers
    expect(firstService).not.toBe(secondService);
    // But each provider should consistently return its own service
    expect(firstProvider.getService()).toBe(firstService);
    expect(secondProvider.getService()).toBe(secondService);
    
    expect(MongoDbService).toHaveBeenCalledTimes(2);
  });
  
  it('should accept a service in the constructor', () => {
    const customService = new MongoDbService();
    const providerWithInjection = new MongoDbProvider(customService);
    
    const service = providerWithInjection.getService();
    expect(service).toBe(customService);
  });
}); 