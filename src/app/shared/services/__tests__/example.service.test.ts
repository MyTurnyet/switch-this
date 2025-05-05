import { ExampleService } from '../example.service';
import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { IMongoDbService } from '@/lib/services/mongodb.interface';

// Mock the MongoDbProvider class
jest.mock('@/lib/services/mongodb.provider', () => {
  return {
    MongoDbProvider: jest.fn()
  };
});

// Define a type for the mock collection
interface MockCollection {
  find: jest.Mock;
  toArray: jest.Mock;
  insertOne: jest.Mock;
}

describe('ExampleService', () => {
  let exampleService: ExampleService;
  let mockMongoDbProvider: jest.Mocked<MongoDbProvider>;
  let mockMongoDbService: jest.Mocked<IMongoDbService>;
  let mockCollection: MockCollection;

  beforeEach(() => {
    // Set up mock collection
    mockCollection = {
      find: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ name: 'Test Item' }]),
      insertOne: jest.fn().mockResolvedValue({ insertedId: 'new-id' })
    };

    // Set up mock MongoDB service
    mockMongoDbService = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      getCollection: jest.fn().mockReturnValue(mockCollection),
      getRollingStockCollection: jest.fn(),
      getIndustriesCollection: jest.fn(),
      getLocationsCollection: jest.fn(),
      getTrainRoutesCollection: jest.fn(),
      getLayoutStateCollection: jest.fn(),
      getSwitchlistsCollection: jest.fn(),
      toObjectId: jest.fn()
    } as unknown as jest.Mocked<IMongoDbService>;

    // Set up mock MongoDB provider
    mockMongoDbProvider = {
      getService: jest.fn().mockReturnValue(mockMongoDbService)
    } as unknown as jest.Mocked<MongoDbProvider>;

    // Mock the constructor implementation
    (MongoDbProvider as unknown as jest.Mock).mockImplementation(() => mockMongoDbProvider);

    // Create the service with the mocked provider
    exampleService = new ExampleService(mockMongoDbProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should accept a MongoDB provider', () => {
      // Already tested in beforeEach
      expect(exampleService).toBeTruthy();
    });

    it('should accept a MongoDB service', () => {
      // Create another instance with the service directly
      const serviceWithDirectService = new ExampleService(mockMongoDbService);
      
      // Verify MongoDbProvider was constructed with the service
      expect(MongoDbProvider).toHaveBeenCalledWith(mockMongoDbService);
      expect(serviceWithDirectService).toBeTruthy();
    });

    it('should provide a static factory method for default service', () => {
      // We'll need to test this separately since it creates a real MongoDbService
      // Just verify the method exists
      expect(typeof ExampleService.withDefaultService).toBe('function');
    });
  });

  describe('fetchData', () => {
    it('should fetch data from the specified collection', async () => {
      const result = await exampleService.fetchData('testCollection');

      // Verify the MongoDB service methods were called correctly
      expect(mockMongoDbService.connect).toHaveBeenCalled();
      expect(mockMongoDbService.getCollection).toHaveBeenCalledWith('testCollection');
      expect(mockMongoDbService.close).toHaveBeenCalled();
      
      // Verify the collection methods were called
      expect(mockCollection.find).toHaveBeenCalled();
      expect(mockCollection.toArray).toHaveBeenCalled();
      
      // Verify the result is as expected
      expect(result).toEqual([{ name: 'Test Item' }]);
    });
  });

  describe('insertData', () => {
    it('should insert data into the specified collection', async () => {
      const data = { name: 'New Item' };
      const result = await exampleService.insertData('testCollection', data);

      // Verify the MongoDB service methods were called correctly
      expect(mockMongoDbService.connect).toHaveBeenCalled();
      expect(mockMongoDbService.getCollection).toHaveBeenCalledWith('testCollection');
      expect(mockMongoDbService.close).toHaveBeenCalled();
      
      // Verify the collection methods were called with the correct data
      expect(mockCollection.insertOne).toHaveBeenCalledWith(data);
      
      // Verify the result is as expected
      expect(result).toEqual({ insertedId: 'new-id' });
    });
  });

  describe('static methods', () => {
    it('should use withService static method for direct service injection', () => {
      // Reset MongoDbProvider mock
      (MongoDbProvider as unknown as jest.Mock).mockClear();

      // Create a service with direct service injection
      const serviceWithDirectInjection = ExampleService.withService(mockMongoDbService);
      
      // Verify MongoDbProvider was constructed with the service
      expect(MongoDbProvider).toHaveBeenCalledWith(mockMongoDbService);
      expect(serviceWithDirectInjection).toBeTruthy();
    });
  });
}); 