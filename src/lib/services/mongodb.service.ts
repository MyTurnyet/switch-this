import { MongoClient, Collection, Db, ObjectId, Document } from 'mongodb';
import { DB_COLLECTIONS } from '@/lib/constants/dbCollections';

/**
 * Service for handling MongoDB connections and operations
 */
export class MongoDbService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private uri: string;
  private dbName: string;

  constructor(uri?: string, dbName?: string) {
    this.uri = uri || process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017';
    this.dbName = dbName || process.env.MONGODB_DB || 'switch-this';
  }

  /**
   * Connect to MongoDB
   */
  public async connect(): Promise<void> {
    if (!this.client) {
      this.client = await MongoClient.connect(this.uri);
      this.db = this.client.db(this.dbName);
    }
  }

  /**
   * Close connection to MongoDB
   */
  public async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  /**
   * Get a MongoDB collection
   * @param collectionName The collection to get, from DB_COLLECTIONS constants
   * @returns The MongoDB collection
   * @throws Error if not connected to MongoDB
   */
  public getCollection<T extends Document = Document>(collectionName: string): Collection<T> {
    if (!this.db) {
      throw new Error('Not connected to MongoDB');
    }
    return this.db.collection<T>(collectionName);
  }

  /**
   * Convert string ID to ObjectId
   * @param id String ID to convert
   * @returns MongoDB ObjectId
   */
  public toObjectId(id: string): ObjectId {
    return new ObjectId(id);
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
} 