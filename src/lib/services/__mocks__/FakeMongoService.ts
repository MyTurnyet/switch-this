import { Collection, Document, ObjectId } from 'mongodb';
import { IMongoDbService } from '../mongodb.interface';
import { DB_COLLECTIONS } from '@/lib/constants/dbCollections';

/**
 * A fake implementation of MongoDB service for testing
 * This class can be used in tests in place of the real MongoDbService
 */
export class FakeMongoService implements IMongoDbService {
  private isConnected = false;
  private collections: Map<string, Collection<Document>> = new Map();
  
  constructor() {
    // Pre-initialize collections with empty mock collections
    Object.values(DB_COLLECTIONS).forEach(collectionName => {
      this.collections.set(collectionName, this.createMockCollection());
    });
  }

  /**
   * Connect to fake MongoDB
   */
  public async connect(): Promise<void> {
    this.isConnected = true;
  }

  /**
   * Close connection to fake MongoDB
   */
  public async close(): Promise<void> {
    this.isConnected = false;
  }

  /**
   * Get a mock MongoDB collection
   * @param collectionName The collection to get
   * @returns The mock MongoDB collection
   * @throws Error if not connected to MongoDB
   */
  public getCollection<T extends Document = Document>(collectionName: string): Collection<T> {
    if (!this.isConnected) {
      throw new Error('Not connected to MongoDB');
    }
    
    if (!this.collections.has(collectionName)) {
      this.collections.set(collectionName, this.createMockCollection());
    }
    
    // Cast is necessary due to generic type T
    return this.collections.get(collectionName) as unknown as Collection<T>;
  }

  /**
   * Convert string ID to ObjectId
   * @param id String ID to convert
   * @returns MongoDB ObjectId
   * @throws Error if the ID is invalid
   */
  public toObjectId(id: string): ObjectId {
    try {
      return new ObjectId(id);
    } catch (error) {
      throw new Error(`Invalid ObjectId format: ${id}`);
    }
  }

  /**
   * Get the rolling stock collection
   * @returns The rolling stock collection
   */
  public getRollingStockCollection<T extends Document = Document>(): Collection<T> {
    return this.getCollection<T>(DB_COLLECTIONS.ROLLING_STOCK);
  }

  /**
   * Get the industries collection
   * @returns The industries collection
   */
  public getIndustriesCollection<T extends Document = Document>(): Collection<T> {
    return this.getCollection<T>(DB_COLLECTIONS.INDUSTRIES);
  }

  /**
   * Get the locations collection
   * @returns The locations collection
   */
  public getLocationsCollection<T extends Document = Document>(): Collection<T> {
    return this.getCollection<T>(DB_COLLECTIONS.LOCATIONS);
  }

  /**
   * Get the train routes collection
   * @returns The train routes collection
   */
  public getTrainRoutesCollection<T extends Document = Document>(): Collection<T> {
    return this.getCollection<T>(DB_COLLECTIONS.TRAIN_ROUTES);
  }

  /**
   * Get the layout state collection
   * @returns The layout state collection
   */
  public getLayoutStateCollection<T extends Document = Document>(): Collection<T> {
    return this.getCollection<T>(DB_COLLECTIONS.LAYOUT_STATE);
  }

  /**
   * Get the switchlists collection
   * @returns The switchlists collection
   */
  public getSwitchlistsCollection<T extends Document = Document>(): Collection<T> {
    return this.getCollection<T>(DB_COLLECTIONS.SWITCHLISTS);
  }

  /**
   * Helper to create a mock collection with jest functions
   */
  private createMockCollection<T extends Document = Document>(): Collection<T> {
    return {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockResolvedValue(null),
      insertOne: jest.fn().mockResolvedValue({ insertedId: new ObjectId() }),
      insertMany: jest.fn().mockResolvedValue({ insertedIds: [] }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      aggregate: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([]),
      countDocuments: jest.fn().mockResolvedValue(0)
    } as unknown as Collection<T>;
  }
} 