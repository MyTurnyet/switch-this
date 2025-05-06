import { ExampleService } from '../example.service';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { FakeMongoDbService, createMockMongoService } from '@/test/utils/mongodb-test-utils';

// Define a type for the mock collection
interface MockCollection {
  find: jest.Mock;
  toArray: jest.Mock;
  insertOne: jest.Mock;
}

describe('ExampleService', () => {
  let mockMongoDbService: jest.Mocked<IMongoDbService>;
  let mockCollection: MockCollection;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockMongoDbService = createMockMongoService();
    mockCollection = mockMongoDbService.getCollection('test') as unknown as MockCollection;
  });
  
  describe('constructor', () => {
    it('should accept an IMongoDbService', () => {
      const service = new ExampleService(mockMongoDbService);
      
      expect(service).toBeInstanceOf(ExampleService);
    });
    
    it('should work with FakeMongoDbService', () => {
      const fakeMongoService = new FakeMongoDbService();
      const service = new ExampleService(fakeMongoService);
      
      expect(service).toBeInstanceOf(ExampleService);
    });
  });
  
  describe('static factory methods', () => {
    it('should create an instance with default service', () => {
      // This is a bit tricky to test with the current mocking approach
      // We'll just verify it returns an instance
      const service = ExampleService.withDefaultService();
      
      expect(service).toBeInstanceOf(ExampleService);
    });
    
    it('should create an instance with custom service', () => {
      const service = ExampleService.withService(mockMongoDbService);
      
      expect(service).toBeInstanceOf(ExampleService);
    });
  });
  
  describe('fetchData', () => {
    it('should connect, fetch data and close the connection', async () => {
      const service = new ExampleService(mockMongoDbService);
      
      const result = await service.fetchData('test');
      
      expect(mockMongoDbService.connect).toHaveBeenCalledTimes(1);
      expect(mockMongoDbService.getCollection).toHaveBeenCalledWith('test');
      expect(mockCollection.find).toHaveBeenCalledTimes(1);
      expect(mockCollection.toArray).toHaveBeenCalledTimes(1);
      expect(mockMongoDbService.close).toHaveBeenCalledTimes(1);
      expect(result).toEqual([{ id: '1', name: 'Test Item' }]);
    });
    
    it('should close the connection even if an error occurs', async () => {
      const service = new ExampleService(mockMongoDbService);
      
      // Make the find method throw an error
      mockCollection.find.mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      
      await expect(service.fetchData('test')).rejects.toThrow('Test error');
      
      expect(mockMongoDbService.connect).toHaveBeenCalledTimes(1);
      expect(mockMongoDbService.close).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('insertData', () => {
    it('should connect, insert data and close the connection', async () => {
      const service = new ExampleService(mockMongoDbService);
      const data = { name: 'New Item' };
      
      const result = await service.insertData('test', data);
      
      expect(mockMongoDbService.connect).toHaveBeenCalledTimes(1);
      expect(mockMongoDbService.getCollection).toHaveBeenCalledWith('test');
      expect(mockCollection.insertOne).toHaveBeenCalledWith(data);
      expect(mockMongoDbService.close).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ insertedId: '1' });
    });
  });
}); 