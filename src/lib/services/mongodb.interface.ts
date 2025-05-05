import { Collection, Document, ObjectId } from 'mongodb';

/**
 * Interface for MongoDB service functionality
 * This interface defines the contract that any MongoDB service implementation must follow
 */
export interface IMongoDbService {
  /**
   * Connect to MongoDB
   */
  connect(): Promise<void>;

  /**
   * Close connection to MongoDB
   */
  close(): Promise<void>;

  /**
   * Get a MongoDB collection
   * @param collectionName The collection to get
   * @returns The MongoDB collection
   * @throws Error if not connected to MongoDB
   */
  getCollection<T extends Document = Document>(collectionName: string): Collection<T>;

  /**
   * Convert string ID to ObjectId
   * @param id String ID to convert
   * @returns MongoDB ObjectId
   * @throws Error if the ID is invalid
   */
  toObjectId(id: string): ObjectId;

  /**
   * Get the rolling stock collection
   * @returns The rolling stock collection
   */
  getRollingStockCollection<T extends Document = Document>(): Collection<T>;

  /**
   * Get the industries collection
   * @returns The industries collection
   */
  getIndustriesCollection<T extends Document = Document>(): Collection<T>;

  /**
   * Get the locations collection
   * @returns The locations collection
   */
  getLocationsCollection<T extends Document = Document>(): Collection<T>;

  /**
   * Get the train routes collection
   * @returns The train routes collection
   */
  getTrainRoutesCollection<T extends Document = Document>(): Collection<T>;

  /**
   * Get the layout state collection
   * @returns The layout state collection
   */
  getLayoutStateCollection<T extends Document = Document>(): Collection<T>;

  /**
   * Get the switchlists collection
   * @returns The switchlists collection
   */
  getSwitchlistsCollection<T extends Document = Document>(): Collection<T>;
} 