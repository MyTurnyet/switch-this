import { Collection, Document, Filter, ObjectId, UpdateFilter } from 'mongodb';
import { IMongoDbService } from '../../lib/services/mongodb.interface';
import { DB_COLLECTIONS } from '../../lib/constants/dbCollections';

/**
 * Interface for query object to avoid using 'any'
 */
interface QueryObject {
  [key: string]: string | number | boolean | ObjectId | null | undefined;
}

/**
 * In-memory MongoDB service implementation for Playwright tests
 * This class mimics a MongoDB service with in-memory collections
 */
export class PlaywrightMongoDbService implements IMongoDbService {
  // In-memory collections for testing
  private collections: Map<string, Document[]> = new Map();
  private initialized: boolean = false;

  constructor() {
    // Initialize all collections with empty arrays
    this.initCollections();
    console.log('PlaywrightMongoDbService initialized');
  }

  // Initialize the collections
  private initCollections() {
    if (this.initialized) return;
    
    // Initialize each collection with an empty array
    Object.values(DB_COLLECTIONS).forEach(collection => {
      this.collections.set(collection, []);
    });
    
    this.initialized = true;
    console.log('Collections initialized:', Array.from(this.collections.keys()).join(', '));
  }

  // Set data for a collection (used by test setup)
  public setCollectionData(collectionName: string, data: Document[]): void {
    if (!this.initialized) this.initCollections();
    
    // Make sure we deep clone the data to avoid reference issues
    const clonedData = JSON.parse(JSON.stringify(data));
    this.collections.set(collectionName, clonedData);
    console.log(`Collection ${collectionName} populated with ${clonedData.length} documents`);
  }

  // Get the data for a collection (useful for test verification)
  public getCollectionData(collectionName: string): Document[] {
    return this.collections.get(collectionName) || [];
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
   * Get a MongoDB collection
   * @param collectionName The collection to get
   * @returns The MongoDB collection
   */
  public getCollection<T extends Document = Document>(collectionName: string): Collection<T> {
    return this.createMockCollection<T>(collectionName);
  }

  // Create a mock collection object with core MongoDB operations
  private createMockCollection<T extends Document = Document>(collectionName: string): Collection<T> {
    return {
      find: (query: Filter<T> = {}) => {
        console.log(`Mock find on ${collectionName}:`, JSON.stringify(query));
        const results = this.collections.get(collectionName) || [];
        
        return {
          toArray: async () => {
            return this.filterDocuments(results, query as unknown as QueryObject) as T[];
          }
        };
      },
      
      findOne: async (query: Filter<T> = {}) => {
        console.log(`Mock findOne on ${collectionName}:`, JSON.stringify(query));
        const results = this.collections.get(collectionName) || [];
        const filtered = this.filterDocuments(results, query as unknown as QueryObject);
        return filtered.length > 0 ? filtered[0] as T : null;
      },
      
      insertOne: async (document: T) => {
        console.log(`Mock insertOne on ${collectionName}:`, JSON.stringify(document));
        const collection = this.collections.get(collectionName) || [];
        
        // Generate _id if not provided
        if (!('_id' in document)) {
          (document as unknown as { _id: ObjectId })._id = new ObjectId();
        }
        
        collection.push(document as Document);
        this.collections.set(collectionName, collection);
        
        return {
          acknowledged: true,
          insertedId: (document as unknown as { _id: ObjectId })._id
        };
      },
      
      updateOne: async (filter: Filter<T>, update: UpdateFilter<T> | Partial<T>) => {
        console.log(`Mock updateOne on ${collectionName}:`, 
          JSON.stringify(filter), JSON.stringify(update));
        
        const collection = this.collections.get(collectionName) || [];
        const index = collection.findIndex(doc => 
          this.matchDocument(doc, filter as unknown as QueryObject));
        
        if (index !== -1) {
          // Handle $set operator
          if ('$set' in update) {
            collection[index] = { 
              ...collection[index], 
              ...update.$set 
            };
          }
          
          // Handle direct update (no operators)
          if (!('$set' in update) && !('$unset' in update) && !('$push' in update)) {
            collection[index] = { ...update } as Document;
          }
          
          this.collections.set(collectionName, collection);
          
          return {
            acknowledged: true,
            matchedCount: 1,
            modifiedCount: 1,
            upsertedCount: 0,
            upsertedId: null
          };
        }
        
        return {
          acknowledged: true,
          matchedCount: 0,
          modifiedCount: 0,
          upsertedCount: 0,
          upsertedId: null
        };
      },
      
      deleteOne: async (filter: Filter<T>) => {
        console.log(`Mock deleteOne on ${collectionName}:`, JSON.stringify(filter));
        
        const collection = this.collections.get(collectionName) || [];
        const index = collection.findIndex(doc => 
          this.matchDocument(doc, filter as unknown as QueryObject));
        
        if (index !== -1) {
          collection.splice(index, 1);
          this.collections.set(collectionName, collection);
          
          return {
            acknowledged: true,
            deletedCount: 1
          };
        }
        
        return {
          acknowledged: true,
          deletedCount: 0
        };
      },
      
      // Add additional methods as needed to satisfy the Collection interface
    } as unknown as Collection<T>;
  }

  // Helper method to filter documents based on a query
  private filterDocuments(documents: Document[], query: QueryObject): Document[] {
    if (!query || Object.keys(query).length === 0) {
      return [...documents];
    }
    
    return documents.filter(doc => this.matchDocument(doc, query));
  }

  // Helper method to check if a document matches a query
  private matchDocument(document: Document, query: QueryObject): boolean {
    // Handle ObjectId queries
    for (const key in query) {
      if (query[key] instanceof ObjectId) {
        if (document[key] instanceof ObjectId) {
          if (!document[key].equals(query[key])) {
            return false;
          }
        } else if (typeof document[key] === 'string') {
          if (document[key] !== query[key].toString()) {
            return false;
          }
        } else {
          return false;
        }
      }
      // Handle _id as string comparison
      else if (key === '_id' && typeof query[key] === 'string' && document[key]) {
        if (document[key].toString() !== query[key]) {
          return false;
        }
      }
      // Simple equality check for other properties
      else if (document[key] !== query[key]) {
        return false;
      }
    }
    
    return true;
  }

  // MongoDB Service Interface Implementation

  async connect(): Promise<void> {
    console.log('Mock connect called');
    // No-op for mock implementation
    return Promise.resolve();
  }

  async close(): Promise<void> {
    console.log('Mock close called');
    // No-op for mock implementation
    return Promise.resolve();
  }

  // Collection getters with generic type support
  getIndustriesCollection<T extends Document = Document>(): Collection<T> {
    return this.createMockCollection<T>(DB_COLLECTIONS.INDUSTRIES);
  }

  getLocationsCollection<T extends Document = Document>(): Collection<T> {
    return this.createMockCollection<T>(DB_COLLECTIONS.LOCATIONS);
  }

  getRollingStockCollection<T extends Document = Document>(): Collection<T> {
    return this.createMockCollection<T>(DB_COLLECTIONS.ROLLING_STOCK);
  }

  getTrainRoutesCollection<T extends Document = Document>(): Collection<T> {
    return this.createMockCollection<T>(DB_COLLECTIONS.TRAIN_ROUTES);
  }

  getSwitchlistsCollection<T extends Document = Document>(): Collection<T> {
    return this.createMockCollection<T>(DB_COLLECTIONS.SWITCHLISTS);
  }

  getLayoutStateCollection<T extends Document = Document>(): Collection<T> {
    return this.createMockCollection<T>(DB_COLLECTIONS.LAYOUT_STATE);
  }

  getBlocksCollection<T extends Document = Document>(): Collection<T> {
    return this.createMockCollection<T>(DB_COLLECTIONS.BLOCKS);
  }
} 