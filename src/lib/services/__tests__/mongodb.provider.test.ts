import { MongoDbProvider, getMongoDbService, resetMongoDbService, setMongoDbService } from '../mongodb.provider';
import { IMongoDbService } from '../mongodb.interface';
import { Collection, Document, ObjectId } from 'mongodb';

interface MockDocument extends Document {
  name?: string;
  [key: string]: unknown;
}

/**
 * FakeMongoDbService implements IMongoDbService for testing
 * 
 * A proper Fake test double that maintains some state and behavior,
 * but doesn't depend on the real MongoDB implementation.
 */
class FakeMongoDbService implements IMongoDbService {
  isConnected = false;
  collections: Record<string, Collection<MockDocument>> = {};
  
  // Track method calls for verification in tests
  callHistory: { method: string; args: unknown[] }[] = [];
  
  private recordCall(method: string, ...args: unknown[]) {
    this.callHistory.push({ method, args });
  }
  
  async connect(): Promise<void> {
    this.recordCall('connect');
    this.isConnected = true;
    return Promise.resolve();
  }
  
  async close(): Promise<void> {
    this.recordCall('close');
    this.isConnected = false;
    return Promise.resolve();
  }
  
  getCollection<T extends Document = Document>(collectionName: string): Collection<T> {
    this.recordCall('getCollection', collectionName);
    
    if (!this.isConnected) {
      throw new Error('Not connected to MongoDB');
    }
    
    if (!this.collections[collectionName]) {
      this.collections[collectionName] = this.createMockCollection(collectionName);
    }
    
    return this.collections[collectionName] as unknown as Collection<T>;
  }
  
  toObjectId(id: string): ObjectId {
    this.recordCall('toObjectId', id);
    if (!id || id.length !== 24) {
      throw new Error('Invalid ObjectId');
    }
    return new ObjectId(id);
  }
  
  getRollingStockCollection<T extends Document = Document>(): Collection<T> {
    this.recordCall('getRollingStockCollection');
    return this.getCollection<T>('rollingStock');
  }
  
  getIndustriesCollection<T extends Document = Document>(): Collection<T> {
    this.recordCall('getIndustriesCollection');
    return this.getCollection<T>('industries');
  }
  
  getLocationsCollection<T extends Document = Document>(): Collection<T> {
    this.recordCall('getLocationsCollection');
    return this.getCollection<T>('locations');
  }
  
  getTrainRoutesCollection<T extends Document = Document>(): Collection<T> {
    this.recordCall('getTrainRoutesCollection');
    return this.getCollection<T>('trainRoutes');
  }
  
  getLayoutStateCollection<T extends Document = Document>(): Collection<T> {
    this.recordCall('getLayoutStateCollection');
    return this.getCollection<T>('layoutState');
  }
  
  getSwitchlistsCollection<T extends Document = Document>(): Collection<T> {
    this.recordCall('getSwitchlistsCollection');
    return this.getCollection<T>('switchlists');
  }
  
  // Helper method to create mock collections
  private createMockCollection(name: string): Collection<MockDocument> {
    const mockDocuments: MockDocument[] = [];
    
    // Create a basic mock implementation of a MongoDB collection
    return {
      // Basic find implementation
      find: jest.fn().mockImplementation(() => ({
        toArray: jest.fn().mockResolvedValue(mockDocuments)
      })),
      // Basic insertOne implementation
      insertOne: jest.fn().mockImplementation((doc: MockDocument) => {
        const newDoc = { ...doc, _id: new ObjectId() };
        mockDocuments.push(newDoc);
        return Promise.resolve({ insertedId: newDoc._id });
      }),
      // Basic findOne implementation
      findOne: jest.fn().mockImplementation(() => {
        return Promise.resolve(mockDocuments[0] || null);
      }),
      // Other collection methods as needed
      collectionName: name
    } as unknown as Collection<MockDocument>;
  }
}

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
      await collection.insertOne({ name: 'Test Document' });
      
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
  
  describe('Legacy functions', () => {
    beforeEach(() => {
      // Start with a clean state for each test
      resetMongoDbService();
    });
    
    it('should get the MongoDB service using getMongoDbService', () => {
      const service = getMongoDbService();
      
      expect(service).toBeTruthy();
      expect(service.connect).toBeDefined();
    });
    
    it('should return the same instance for subsequent calls to getMongoDbService', () => {
      const service1 = getMongoDbService();
      const service2 = getMongoDbService();
      
      expect(service1).toBe(service2);
    });
    
    it('should reset the service with resetMongoDbService', () => {
      // Get the initial service
      const service1 = getMongoDbService();
      
      // Reset the service
      resetMongoDbService();
      
      // Get the service again
      const service2 = getMongoDbService();
      
      // They should be different instances
      expect(service1).not.toBe(service2);
    });
    
    it('should set a custom service with setMongoDbService', () => {
      // Create a custom service
      const customService: IMongoDbService = {
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
      
      setMongoDbService(customService);
      const service = getMongoDbService();
      
      expect(service).toBe(customService);
    });
    
    it('should work with the FakeMongoDbService', async () => {
      // Create a fake service
      const fakeService = new FakeMongoDbService();
      
      // Set it as the service
      setMongoDbService(fakeService);
      const service = getMongoDbService() as FakeMongoDbService;
      
      expect(service).toBe(fakeService);
      
      // Should be able to use it like a real service
      await service.connect();
      expect(service.isConnected).toBe(true);
    });
  });
}); 