import { MongoDbService } from '../mongodb.service';
import { MongoClient } from 'mongodb';
import { DB_COLLECTIONS } from '@/lib/constants/dbCollections';

import { FakeMongoDbService, createMongoDbTestSetup } from '@/test/utils/mongodb-test-utils';
// Mock the mongodb module
jest.mock('mongodb', () => {
  const mockCollection = {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    toArray: jest.fn()
  };
  
  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection)
  };
  
  const mockClient = {
    db: jest.fn().mockReturnValue(mockDb),
    close: jest.fn().mockResolvedValue(undefined)
  };
  
  return {
    MongoClient: {
      connect: jest.fn().mockResolvedValue(mockClient)
    },
    ObjectId: jest.fn(id => id)
  };
});

describe('MongoDbService', () => {
  let mongoService: MongoDbService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mongoService = new MongoDbService('mock-uri', 'mock-db');
  });
  
  it('should connect to MongoDB', async () => {
    await mongoService.connect();
    expect(MongoClient.connect).toHaveBeenCalledWith('mock-uri');
  });
  
  it('should close the MongoDB connection', async () => {
    await mongoService.connect();
    await mongoService.close();
    
    const mockClient = await (MongoClient.connect as jest.Mock)();
    expect(mockClient.close).toHaveBeenCalled();
  });
  
  it('should get a collection', async () => {
    await mongoService.connect();
    mongoService.getCollection('test-collection');
    
    const mockClient = await (MongoClient.connect as jest.Mock)();
    const mockDb = mockClient.db();
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
  });
  
  it('should throw an error when getting a collection without connecting', () => {
    expect(() => mongoService.getCollection('test-collection')).toThrow('Not connected to MongoDB');
  });
  
  it('should convert a string ID to ObjectId', () => {
    mongoService.toObjectId('123');
    // Since we're mocking ObjectId, just verify it's being called correctly
    expect(require('mongodb').ObjectId).toHaveBeenCalledWith('123');
  });
  
  it('should get the rolling stock collection', async () => {
    await mongoService.connect();
    mongoService.getRollingStockCollection();
    
    const mockClient = await (MongoClient.connect as jest.Mock)();
    const mockDb = mockClient.db();
    expect(mockDb.collection).toHaveBeenCalledWith(DB_COLLECTIONS.ROLLING_STOCK);
  });
  
  it('should get the industries collection', async () => {
    await mongoService.connect();
    mongoService.getIndustriesCollection();
    
    const mockClient = await (MongoClient.connect as jest.Mock)();
    const mockDb = mockClient.db();
    expect(mockDb.collection).toHaveBeenCalledWith(DB_COLLECTIONS.INDUSTRIES);
  });
  
  it('should get the locations collection', async () => {
    await mongoService.connect();
    mongoService.getLocationsCollection();
    
    const mockClient = await (MongoClient.connect as jest.Mock)();
    const mockDb = mockClient.db();
    expect(mockDb.collection).toHaveBeenCalledWith(DB_COLLECTIONS.LOCATIONS);
  });
  
  it('should get the train routes collection', async () => {
    await mongoService.connect();
    mongoService.getTrainRoutesCollection();
    
    const mockClient = await (MongoClient.connect as jest.Mock)();
    const mockDb = mockClient.db();
    expect(mockDb.collection).toHaveBeenCalledWith(DB_COLLECTIONS.TRAIN_ROUTES);
  });
  
  it('should get the layout state collection', async () => {
    await mongoService.connect();
    mongoService.getLayoutStateCollection();
    
    const mockClient = await (MongoClient.connect as jest.Mock)();
    const mockDb = mockClient.db();
    expect(mockDb.collection).toHaveBeenCalledWith(DB_COLLECTIONS.LAYOUT_STATE);
  });
}); 