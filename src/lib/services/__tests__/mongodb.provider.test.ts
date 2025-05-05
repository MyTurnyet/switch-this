import { MongoDbProvider } from '../mongodb.provider';
import { IMongoDbService } from '../mongodb.interface';
import { Document, ObjectId } from 'mongodb';
import { FakeMongoDbService } from '@/test/utils/mongodb-test-utils';

describe('MongoDb Provider', () => {
  let mongoDbProvider: MongoDbProvider;
  let mockMongoService: IMongoDbService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockMongoService = new FakeMongoDbService();
    mongoDbProvider = new MongoDbProvider(mockMongoService);
  });
  
  describe('Modern approach', () => {
    it('should return the MongoDB service instance', () => {
      const service = mongoDbProvider.getService();
      // Instead of instanceof check (which is problematic with mocks), check if it has the expected methods
      expect(service).toBeTruthy();
      expect(service.connect).toBeDefined();
      expect(service.getIndustriesCollection).toBeDefined();
      // No need to check MongoDbService constructor since we're using the Fake
    });
    
    it('should return the same MongoDB service instance on subsequent calls', () => {
      const service1 = mongoDbProvider.getService();
      const service2 = mongoDbProvider.getService();
      
      expect(service1).toBe(service2);
    });
    
    it('should create a new provider when a new service is needed', () => {
      const firstProvider = new MongoDbProvider(mockMongoService);
      const firstService = firstProvider.getService();
      
      // Create a new service and provider
      const newMockService = new FakeMongoDbService();
      const secondProvider = new MongoDbProvider(newMockService);
      const secondService = secondProvider.getService();
      
      // Services should be different because they come from different providers
      expect(firstService).not.toBe(secondService);
      // But each provider should consistently return its own service
      expect(firstProvider.getService()).toBe(firstService);
      expect(secondProvider.getService()).toBe(secondService);
    });
    
    it('should accept a service in the constructor', () => {
      const customService = new FakeMongoDbService();
      const providerWithInjection = new MongoDbProvider(customService);
      
      const service = providerWithInjection.getService();
      expect(service).toBe(customService);
    });
  });
  
  describe('Using FakeMongoDbService', () => {
    let fakeMongoService: FakeMongoDbService;
    let providerWithFake: MongoDbProvider;
    
    beforeEach(() => {
      fakeMongoService = new FakeMongoDbService();
      providerWithFake = new MongoDbProvider(fakeMongoService);
    });
    
    it('should work with a fake service implementation', () => {
      const service = providerWithFake.getService();
      expect(service).toBe(fakeMongoService);
    });
    
    it('should connect and retrieve collections', async () => {
      const service = providerWithFake.getService() as FakeMongoDbService;
      
      // Connect to MongoDB
      await service.connect();
      expect(service.isConnected).toBe(true);
      
      // Get a collection
      const collection = service.getCollection('testCollection');
      expect(collection).toBeTruthy();
      expect(service.callHistory).toContainEqual({ 
        method: 'getCollection', 
        args: ['testCollection'] 
      });
      
      // Insert a document
      await collection.insertOne({ name: 'Test Document' } as unknown as Document);
      
      // Find documents
      const findResult = collection.find();
      const documents = await findResult.toArray();
      expect(documents.length).toBe(1);
      expect(documents[0].name).toBe('Test Document');
      
      // Close connection
      await service.close();
      expect(service.isConnected).toBe(false);
    });
    
    it('should throw an error when trying to get a collection without connecting', () => {
      const service = providerWithFake.getService() as FakeMongoDbService;
      
      // Trying to get a collection without connecting should throw an error
      expect(() => {
        service.getCollection('testCollection');
      }).toThrow('Not connected to MongoDB');
    });
    
    it('should convert string to ObjectId', () => {
      const service = providerWithFake.getService() as FakeMongoDbService;
      const validId = '507f1f77bcf86cd799439011';
      
      const objectId = service.toObjectId(validId);
      expect(objectId).toBeInstanceOf(ObjectId);
      expect(service.callHistory).toContainEqual({ 
        method: 'toObjectId', 
        args: [validId] 
      });
    });
    
    it('should throw an error for invalid ObjectId', () => {
      const service = providerWithFake.getService() as FakeMongoDbService;
      const invalidId = 'invalid';
      
      expect(() => {
        service.toObjectId(invalidId);
      }).toThrow('Invalid ObjectId');
    });
  });
}); 