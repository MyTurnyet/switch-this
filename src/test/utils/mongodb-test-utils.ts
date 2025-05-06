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
 */
export function createMockCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
  return {
    findOne: jest.fn(),
    find: jest.fn().mockReturnThis(),
    toArray: jest.fn(),
    insertOne: jest.fn(),
    insertMany: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn().mockReturnThis(),
  } as unknown as jest.Mocked<Collection<T>>;
}

/**
 * Creates a mock MongoDB service for testing
 */
export function createMockMongoService(): jest.Mocked<IMongoDbService> {
  const collections: Record<string, jest.Mocked<Collection<Document>>> = {};
  
  // Pre-create all collections
  Object.values(DB_COLLECTIONS).forEach(collectionName => {
    collections[collectionName] = createMockCollection<Document>();
  });
  
  return {
    isConnected: true,
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    
    getCollection: jest.fn().mockImplementation((collectionName: string) => {
      if (!collections[collectionName]) {
        collections[collectionName] = createMockCollection<Document>();
      }
      return collections[collectionName];
    }),
    
    // Collection-specific getters
    getLocationsCollection: jest.fn().mockImplementation(() => 
      collections[DB_COLLECTIONS.LOCATIONS]),
    
    getIndustriesCollection: jest.fn().mockImplementation(() => 
      collections[DB_COLLECTIONS.INDUSTRIES]),
    
    getRollingStockCollection: jest.fn().mockImplementation(() => 
      collections[DB_COLLECTIONS.ROLLING_STOCK]),
    
    getSwitchlistsCollection: jest.fn().mockImplementation(() => 
      collections[DB_COLLECTIONS.SWITCHLISTS]),
    
    getTrainRoutesCollection: jest.fn().mockImplementation(() => 
      collections[DB_COLLECTIONS.TRAIN_ROUTES]),
    
    getLayoutStateCollection: jest.fn().mockImplementation(() => 
      collections[DB_COLLECTIONS.LAYOUT_STATE]),
      
    // ObjectId conversion
    toObjectId: jest.fn().mockImplementation((id: string | ObjectId) => {
      if (typeof id === 'string') {
        return new ObjectId(id);
      }
      return id;
    })
  } as jest.Mocked<IMongoDbService>;
}

/**
 * Fake MongoDB service for testing
 * Implements IMongoDbService with mocked methods
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

  public connect = jest.fn().mockImplementation(async () => {
    this.isConnected = true;
    return undefined;
  });
  
  public close = jest.fn().mockImplementation(async () => {
    this.isConnected = false;
    return undefined;
  });

  /**
   * Get a collection by name
   */
  public getCollection<T extends Document = Document>(collectionName: string): jest.Mocked<Collection<T>> {
    // No connection check for easier testing
    
    if (!this.collections[collectionName]) {
      this.collections[collectionName] = createMockCollection() as unknown as jest.Mocked<Collection<Document>>;
    }
    
    return this.collections[collectionName] as unknown as jest.Mocked<Collection<T>>;
  }

  // Collection-specific getters - with proper generic type parameters
  public getLocationsCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>(DB_COLLECTIONS.LOCATIONS);
  }
  
  public getIndustriesCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>(DB_COLLECTIONS.INDUSTRIES);
  }
  
  public getRollingStockCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>(DB_COLLECTIONS.ROLLING_STOCK);
  }
  
  public getSwitchlistsCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>(DB_COLLECTIONS.SWITCHLISTS);
  }
  
  public getTrainRoutesCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>(DB_COLLECTIONS.TRAIN_ROUTES);
  }
  
  public getLayoutStateCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>(DB_COLLECTIONS.LAYOUT_STATE);
  }
    
  // ObjectId conversion
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
 */
export function createFakeMongoDbService(): FakeMongoDbService {
  return new FakeMongoDbService();
}

/**
 * Create a standard MongoDB testing setup
 * This returns a fake MongoDB service for use in tests
 */
export function createMongoDbTestSetup() {
  const fakeMongoService = new FakeMongoDbService();
  
  // Pre-connect to avoid having to connect in every test
  fakeMongoService.isConnected = true;
  
  return { fakeMongoService };
} 