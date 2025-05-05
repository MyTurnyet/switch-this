import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';

/**
 * Example service that demonstrates how to use the MongoDbProvider class with interface
 */
export class ExampleService {
  private readonly mongoDbProvider: MongoDbProvider;

  /**
   * Constructor that accepts a MongoDB provider for dependency injection
   * @param mongoDbProviderOrService A MongoDB provider instance or a MongoDB service instance
   */
  constructor(mongoDbProviderOrService: MongoDbProvider | IMongoDbService) {
    // Check if the parameter is a MongoDbProvider or an IMongoDbService
    if (mongoDbProviderOrService instanceof MongoDbProvider) {
      this.mongoDbProvider = mongoDbProviderOrService;
    } else {
      // It's an IMongoDbService, so create a provider with it
      this.mongoDbProvider = new MongoDbProvider(mongoDbProviderOrService);
    }
  }

  /**
   * Static factory method that creates an example service with default MongoDB service
   * @returns A new ExampleService instance with default MongoDbService
   */
  static withDefaultService(): ExampleService {
    return new ExampleService(new MongoDbService());
  }

  /**
   * Alternative constructor that directly accepts a MongoDB service implementation
   * @param mongoDbService A MongoDB service instance
   * @returns A new ExampleService instance
   */
  static withService(mongoDbService: IMongoDbService): ExampleService {
    return new ExampleService(mongoDbService);
  }

  /**
   * Example method that fetches data using the MongoDB service
   */
  async fetchData(collectionName: string) {
    const mongoService: IMongoDbService = this.mongoDbProvider.getService();
    
    try {
      await mongoService.connect();
      const collection = mongoService.getCollection(collectionName);
      return await collection.find().toArray();
    } finally {
      await mongoService.close();
    }
  }

  /**
   * Example method that inserts data using the MongoDB service
   */
  async insertData<T extends Record<string, unknown>>(collectionName: string, data: T) {
    const mongoService: IMongoDbService = this.mongoDbProvider.getService();
    
    try {
      await mongoService.connect();
      const collection = mongoService.getCollection(collectionName);
      return await collection.insertOne(data);
    } finally {
      await mongoService.close();
    }
  }
} 