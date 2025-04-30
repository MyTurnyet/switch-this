import { Collection } from 'mongodb';
import { DB_COLLECTIONS } from '@/lib/constants/dbCollections';

export class MongoDbService {
  private mockCollections: Record<string, any> = {};
  private connected = false;
  
  constructor() {
    // Create mock collections
    Object.values(DB_COLLECTIONS).forEach(collectionName => {
      this.mockCollections[collectionName] = {
        find: jest.fn().mockReturnThis(),
        findOne: jest.fn(),
        insertOne: jest.fn(),
        updateOne: jest.fn(),
        deleteOne: jest.fn(),
        toArray: jest.fn()
      };
    });
  }

  public async connect(): Promise<void> {
    this.connected = true;
    return Promise.resolve();
  }

  public async close(): Promise<void> {
    this.connected = false;
    return Promise.resolve();
  }

  public getCollection<T = any>(collectionName: string): Collection<T> {
    if (!this.connected) {
      throw new Error('Not connected to MongoDB');
    }
    return this.mockCollections[collectionName] as unknown as Collection<T>;
  }

  public toObjectId(id: string): any {
    return id;
  }

  public getRollingStockCollection<T = any>(): Collection<T> {
    return this.getCollection<T>(DB_COLLECTIONS.ROLLING_STOCK);
  }

  public getIndustriesCollection<T = any>(): Collection<T> {
    return this.getCollection<T>(DB_COLLECTIONS.INDUSTRIES);
  }

  public getLocationsCollection<T = any>(): Collection<T> {
    return this.getCollection<T>(DB_COLLECTIONS.LOCATIONS);
  }

  public getTrainRoutesCollection<T = any>(): Collection<T> {
    return this.getCollection<T>(DB_COLLECTIONS.TRAIN_ROUTES);
  }

  public getLayoutStateCollection<T = any>(): Collection<T> {
    return this.getCollection<T>(DB_COLLECTIONS.LAYOUT_STATE);
  }
} 