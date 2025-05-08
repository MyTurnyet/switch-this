import { Collection, Document, ObjectId } from 'mongodb';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { DB_COLLECTIONS } from '@/lib/constants/dbCollections';

/**
 * Extended Document interface for mocking purposes
 */
export interface MockDocument extends Document {
  name?: string;
  [key: string]: unknown;
}

/**
 * Creates a mock collection for testing
 * This function creates a collection with all necessary methods mocked
 * 
 * @returns A mocked Collection object that can be used in tests
 */
export function createMockCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
  return {
    findOne: jest.fn(),
    find: jest.fn().mockReturnThis(),
    toArray: jest.fn(),
    insertOne: jest.fn(),
    insertMany: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    project: jest.fn().mockReturnThis()
  } as unknown as jest.Mocked<Collection<T>>;
}

/**
 * Fake MongoDB service for testing
 * Implements IMongoDbService with mocked methods
 * This is the recommended class to use for all MongoDB testing
 */
export class FakeMongoDbService implements IMongoDbService {
  // Track collections to ensure consistency in tests
  private collections: Record<string, jest.Mocked<Collection<Document>>> = {};
  
  // Flag to track connection state - start connected by default for easier testing
  public isConnected = true;

  constructor() {
    // Pre-initialize collections
    Object.values(DB_COLLECTIONS).forEach(collectionName => {
      this.collections[collectionName] = createMockCollection<Document>();
    });
  }

  /**
   * Connect to MongoDB (mock implementation)
   * Sets isConnected to true and returns a Promise
   */
  public connect = jest.fn().mockImplementation(async () => {
    this.isConnected = true;
    return undefined;
  });
  
  /**
   * Close MongoDB connection (mock implementation)
   * Sets isConnected to false and returns a Promise
   */
  public close = jest.fn().mockImplementation(async () => {
    this.isConnected = false;
    return undefined;
  });

  /**
   * Get a collection by name
   * This implementation doesn't check isConnected for easier testing
   * 
   * @param collectionName The name of the collection to get
   * @returns A mocked Collection object
   */
  public getCollection<T extends Document = Document>(collectionName: string): jest.Mocked<Collection<T>> {
    // No connection check for easier testing
    
    if (!this.collections[collectionName]) {
      this.collections[collectionName] = createMockCollection() as unknown as jest.Mocked<Collection<Document>>;
    }
    
    return this.collections[collectionName] as unknown as jest.Mocked<Collection<T>>;
  }

  // Collection-specific getters with proper generic type parameters
  
  /**
   * Get the locations collection
   * @returns A mocked locations collection
   */
  public getLocationsCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>(DB_COLLECTIONS.LOCATIONS);
  }
  
  /**
   * Get the industries collection
   * @returns A mocked industries collection
   */
  public getIndustriesCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>(DB_COLLECTIONS.INDUSTRIES);
  }
  
  /**
   * Get the rolling stock collection
   * @returns A mocked rolling stock collection
   */
  public getRollingStockCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>(DB_COLLECTIONS.ROLLING_STOCK);
  }
  
  /**
   * Get the switchlists collection
   * @returns A mocked switchlists collection
   */
  public getSwitchlistsCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>(DB_COLLECTIONS.SWITCHLISTS);
  }
  
  /**
   * Get the train routes collection
   * @returns A mocked train routes collection
   */
  public getTrainRoutesCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>(DB_COLLECTIONS.TRAIN_ROUTES);
  }
  
  /**
   * Get the layout state collection
   * @returns A mocked layout state collection
   */
  public getLayoutStateCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>(DB_COLLECTIONS.LAYOUT_STATE);
  }
  
  /**
   * Get the blocks collection
   * @returns A mocked blocks collection
   */
  public getBlocksCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>(DB_COLLECTIONS.BLOCKS);
  }
    
  /**
   * Convert a string ID to MongoDB ObjectId
   * Handles both string and ObjectId inputs
   * 
   * @param id String ID or ObjectId to use
   * @returns MongoDB ObjectId
   */
  public toObjectId(id: string | ObjectId): ObjectId {
    if (typeof id === 'string') {
      return new ObjectId(id);
    }
    return id;
  }
  
  /**
   * Clears the call history of all mock functions
   * This is useful for cleaning up between tests
   */
  public clearCallHistory(): void {
    this.connect.mockClear();
    this.close.mockClear();
    
    // Clear call history for all collection methods
    Object.values(this.collections).forEach((collection) => {
      Object.values(collection).forEach((method) => {
        if (typeof method === 'function' && method.mockClear) {
          method.mockClear();
        }
      });
    });
  }
}

/**
 * Create a fake MongoDB service instance for testing
 * This is a convenience function that just returns a new FakeMongoDbService
 * 
 * @returns A new FakeMongoDbService instance
 * @deprecated Use `new FakeMongoDbService()` directly instead
 */
export function createFakeMongoDbService(): FakeMongoDbService {
  return new FakeMongoDbService();
}

/**
 * Create a standard MongoDB testing setup
 * This returns a fake MongoDB service for use in tests that's already connected
 * 
 * @returns An object containing a pre-connected fakeMongoService
 */
export function createMongoDbTestSetup() {
  const fakeMongoService = new FakeMongoDbService();
  
  // Pre-connect to avoid having to connect in every test
  fakeMongoService.isConnected = true;
  
  return { fakeMongoService };
}

/**
 * Creates a mock MongoDB service for legacy tests
 * This is maintained for backward compatibility
 * 
 * @returns A jest-mocked IMongoDbService
 * @deprecated Use `new FakeMongoDbService()` instead for new tests
 */
export function createMockMongoService(): jest.Mocked<IMongoDbService> {
  // Cast to unknown first, then to jest.Mocked<IMongoDbService> to satisfy TypeScript
  return new FakeMongoDbService() as unknown as jest.Mocked<IMongoDbService>;
} 