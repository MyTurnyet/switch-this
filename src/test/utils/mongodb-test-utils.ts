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
 * Creates a mock collection for testing
 */
export function createMockCollection(): jest.Mocked<Collection> {
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
  } as unknown as jest.Mocked<Collection>;
}

/**
 * Creates a mock MongoDB service for testing
 */
export function createMockMongoService(): jest.Mocked<IMongoDbService> {
  // Create a single mock collection to be returned from any collection getter
  const mockCollection = createMockCollection();
  
  return {
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    getCollection: jest.fn().mockReturnValue(mockCollection),
    toObjectId: jest.fn().mockImplementation((id: string) => new ObjectId(id)),
    getRollingStockCollection: jest.fn().mockReturnValue(mockCollection),
    getIndustriesCollection: jest.fn().mockReturnValue(mockCollection),
    getLocationsCollection: jest.fn().mockReturnValue(mockCollection),
    getTrainRoutesCollection: jest.fn().mockReturnValue(mockCollection),
    getLayoutStateCollection: jest.fn().mockReturnValue(mockCollection),
    getSwitchlistsCollection: jest.fn().mockReturnValue(mockCollection),
  } as unknown as jest.Mocked<IMongoDbService>;
}

/**
 * Fake MongoDB service for testing
 * Implements IMongoDbService with mocked methods
 */
export class FakeMongoDbService implements IMongoDbService {
  // Track collections to ensure consistency in tests
  private collections: Record<string, jest.Mocked<Collection<Document>>> = {};

  public connect = jest.fn().mockResolvedValue(undefined);
  public close = jest.fn().mockResolvedValue(undefined);

  public getCollection<T extends Document = Document>(collectionName: string): jest.Mocked<Collection<T>> {
    if (!this.collections[collectionName]) {
      this.collections[collectionName] = createMockCollection<T>();
    }
    return this.collections[collectionName] as unknown as jest.Mocked<Collection<T>>;
  }

  public toObjectId(id: string): ObjectId {
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      return new ObjectId(id);
    }
    throw new Error(`Invalid ObjectId format: ${id}`);
  }

  public getRollingStockCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>('rolling-stock');
  }

  public getIndustriesCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>('industries');
  }

  public getLocationsCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>('locations');
  }

  public getTrainRoutesCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>('train-routes');
  }

  public getLayoutStateCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>('layout-state');
  }

  public getSwitchlistsCollection<T extends Document = Document>(): jest.Mocked<Collection<T>> {
    return this.getCollection<T>('switchlists');
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