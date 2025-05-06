import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';

/**
 * Example service that demonstrates how to use the MongoDbService with interface
 */
export class ExampleService {
  private readonly mongoService: IMongoDbService;

  /**
   * Constructor that accepts a MongoDB service for dependency injection
   * @param mongoService A MongoDB service instance
   */
  constructor(mongoService: IMongoDbService) {
    this.mongoService = mongoService;
  }

  /**
   * Static factory method that creates an example service with default MongoDB service
   * @returns A new ExampleService instance with default MongoDbService
   */
  static withDefaultService(): ExampleService {
    return new ExampleService(new MongoDbService());
  }

  /**
   * Static factory method that creates an example service with a custom MongoDB service
   * @param mongoService A MongoDB service instance
   * @returns A new ExampleService instance with the provided MongoDbService
   */
  static withService(mongoService: IMongoDbService): ExampleService {
    return new ExampleService(mongoService);
  }

  /**
   * Example method that fetches data using the MongoDB service
   */
  async fetchData(collectionName: string) {
    try {
      await this.mongoService.connect();
      const collection = this.mongoService.getCollection(collectionName);
      return await collection.find().toArray();
    } finally {
      await this.mongoService.close();
    }
  }

  /**
   * Example method that inserts data using the MongoDB service
   */
  async insertData<T extends Record<string, unknown>>(collectionName: string, data: T) {
    try {
      await this.mongoService.connect();
      const collection = this.mongoService.getCollection(collectionName);
      return await collection.insertOne(data);
    } finally {
      await this.mongoService.close();
    }
  }
} 