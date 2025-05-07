import { Collection, Document, ObjectId } from 'mongodb';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { DB_COLLECTIONS } from '@/lib/constants/dbCollections';

// Use Record with unknown for safer typing
type QueryType = Record<string, unknown>;
type UpdateType = Record<string, unknown>;

/**
 * Create a mock collection for Playwright tests
 * @returns A mocked Collection object suitable for Playwright e2e tests
 */
function createPlaywrightMockCollection<T extends Document>(): Collection<T> {
  // In-memory data store for this collection
  let data: T[] = [];
  
  // Create a collection with all necessary methods implemented
  const collection = {
    // Query methods
    find: (_query: QueryType = {}) => {
      // Currently we ignore the query and return all data
      // In a more advanced implementation, we would filter based on the query
      return {
        toArray: async () => data
      };
    },
    findOne: async (query: QueryType = {}) => {
      // Check if we're querying by _id
      if (query._id) {
        const id = query._id.toString();
        return data.find(item => item._id && item._id.toString() === id) || null;
      }
      
      // Simple exact match on fields
      return data.find(item => {
        for (const [key, value] of Object.entries(query)) {
          if (item[key as keyof T] !== value) {
            return false;
          }
        }
        return true;
      }) || null;
    },
    
    // Mutation methods
    insertOne: async (doc: T) => {
      const id = new ObjectId();
      const newDoc = { ...doc, _id: id };
      data.push(newDoc as T);
      return {
        acknowledged: true,
        insertedId: id
      };
    },
    insertMany: async (docs: T[]) => {
      const insertedIds = [];
      for (const doc of docs) {
        const id = new ObjectId();
        const newDoc = { ...doc, _id: id };
        data.push(newDoc as T);
        insertedIds.push(id);
      }
      return {
        acknowledged: true,
        insertedIds,
        insertedCount: docs.length
      };
    },
    updateOne: async (filter: QueryType, update: UpdateType) => {
      // Simple update implementation that handles $set
      const index = data.findIndex(item => {
        if (filter._id) {
          return item._id && item._id.toString() === filter._id.toString();
        }
        
        // Exact match on all filter fields
        for (const [key, value] of Object.entries(filter)) {
          if (item[key as keyof T] !== value) {
            return false;
          }
        }
        return true;
      });
      
      if (index !== -1) {
        // Handle $set operator
        if (update.$set) {
          data[index] = { ...data[index], ...update.$set } as T;
        } else {
          // Direct update (not recommended but supported)
          data[index] = { ...data[index], ...update } as T;
        }
        
        return {
          acknowledged: true,
          modifiedCount: 1,
          upsertedId: null,
          upsertedCount: 0,
          matchedCount: 1
        };
      }
      
      return {
        acknowledged: true,
        modifiedCount: 0,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 0
      };
    },
    deleteOne: async (filter: QueryType) => {
      const initialLength = data.length;
      
      if (filter._id) {
        data = data.filter(item => !(item._id && item._id.toString() === filter._id.toString()));
      } else {
        data = data.filter(item => {
          for (const [key, value] of Object.entries(filter)) {
            if (item[key as keyof T] !== value) {
              return true; // Keep this item
            }
          }
          return false; // Remove this item
        });
      }
      
      const deletedCount = initialLength - data.length;
      
      return {
        acknowledged: true,
        deletedCount
      };
    },
    
    // Add test helpers
    _getData: () => data,
    _setData: (newData: T[]) => {
      data = [...newData];
    },
    _clearData: () => {
      data = [];
    }
  } as unknown as Collection<T>;
  
  return collection;
}

/**
 * Mock MongoDB service for Playwright tests
 * This class implements IMongoDbService for use in e2e tests
 */
export class PlaywrightMongoDbService implements IMongoDbService {
  private collections: Record<string, Collection<Document>> = {};
  public isConnected = false;
  
  constructor() {
    // Initialize collections
    Object.values(DB_COLLECTIONS).forEach(name => {
      this.collections[name] = createPlaywrightMockCollection();
    });
    console.log('PlaywrightMongoDbService initialized with mock collections');
  }
  
  /**
   * Mock connection method - doesn't actually connect to anything
   * Just sets the isConnected flag to true
   */
  async connect(): Promise<void> {
    this.isConnected = true;
    console.log('PlaywrightMongoDbService connected (mock)');
    return Promise.resolve();
  }
  
  /**
   * Mock close method - doesn't actually close anything
   * Just sets the isConnected flag to false
   */
  async close(): Promise<void> {
    this.isConnected = false;
    console.log('PlaywrightMongoDbService closed (mock)');
    return Promise.resolve();
  }
  
  getCollection<T extends Document = Document>(collectionName: string): Collection<T> {
    if (!this.collections[collectionName]) {
      this.collections[collectionName] = createPlaywrightMockCollection<T>();
    }
    return this.collections[collectionName] as Collection<T>;
  }
  
  toObjectId(id: string): ObjectId {
    return new ObjectId(id);
  }
  
  getRollingStockCollection<T extends Document = Document>(): Collection<T> {
    return this.getCollection<T>(DB_COLLECTIONS.ROLLING_STOCK);
  }
  
  getIndustriesCollection<T extends Document = Document>(): Collection<T> {
    return this.getCollection<T>(DB_COLLECTIONS.INDUSTRIES);
  }
  
  getLocationsCollection<T extends Document = Document>(): Collection<T> {
    return this.getCollection<T>(DB_COLLECTIONS.LOCATIONS);
  }
  
  getTrainRoutesCollection<T extends Document = Document>(): Collection<T> {
    return this.getCollection<T>(DB_COLLECTIONS.TRAIN_ROUTES);
  }
  
  getLayoutStateCollection<T extends Document = Document>(): Collection<T> {
    return this.getCollection<T>(DB_COLLECTIONS.LAYOUT_STATE);
  }
  
  getSwitchlistsCollection<T extends Document = Document>(): Collection<T> {
    return this.getCollection<T>(DB_COLLECTIONS.SWITCHLISTS);
  }
  
  // Helper method to directly set test data for a collection
  setCollectionData<T extends Document>(collectionName: string, data: T[]): void {
    const collection = this.getCollection<T>(collectionName) as unknown as {
      _setData: (data: T[]) => void;
    };
    
    if (typeof collection._setData === 'function') {
      collection._setData(data);
    }
  }
} 