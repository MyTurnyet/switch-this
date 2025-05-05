import { Collection, Document, ObjectId } from 'mongodb';
import { IMongoDbService } from '@/lib/services/mongodb.interface';

/**
 * Extended Document interface for mocking purposes
 */
export interface MockDocument extends Document {
  name?: string;
  [key: string]: unknown;
}

/**
 * FakeMongoDbService implements IMongoDbService for testing
 * 
 * A proper Fake test double that maintains some state and behavior,
 * but doesn't depend on the real MongoDB implementation.
 * This can be used in all tests instead of mocking MongoDbService.
 */
export class FakeMongoDbService implements IMongoDbService {
  isConnected = false;
  collections: Record<string, Collection<MockDocument>> = {};
  
  // Track method calls for verification in tests
  callHistory: { method: string; args: unknown[] }[] = [];
  
  clearCallHistory() {
    this.callHistory = [];
  }
  
  recordCall(method: string, ...args: unknown[]) {
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
      // Basic updateOne implementation
      updateOne: jest.fn().mockImplementation(() => {
        return Promise.resolve({ matchedCount: 1, modifiedCount: 1 });
      }),
      // Basic deleteOne implementation
      deleteOne: jest.fn().mockImplementation(() => {
        return Promise.resolve({ deletedCount: 1 });
      }),
      // Other collection methods as needed
      collectionName: name
    } as unknown as Collection<MockDocument>;
  }
}

/**
 * Create a standard MongoDB testing setup
 * This returns a fake MongoDB service and provider for use in tests
 */
export function createMongoDbTestSetup() {
  const fakeMongoService = new FakeMongoDbService();
  
  // Pre-connect to avoid having to connect in every test
  fakeMongoService.isConnected = true;
  
  // Mock the MongoDbProvider class to use our fake service
  jest.mock('@/lib/services/mongodb.provider', () => {
    return {
      MongoDbProvider: jest.fn().mockImplementation(() => ({
        getService: jest.fn().mockReturnValue(fakeMongoService)
      }))
    };
  });
  
  return { fakeMongoService };
} 