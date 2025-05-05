import { MongoDbService } from './mongodb.service';
import { IMongoDbService } from './mongodb.interface';

/**
 * MongoDB Provider class that manages a MongoDB service instance
 * 
 * This provider follows the immutable design pattern - it takes a service in its constructor 
 * and maintains a reference to that service for its entire lifecycle. If you need a different 
 * service, you should create a new provider instance.
 * 
 * @example
 * ```typescript
 * // Create a MongoDB service
 * const mongoDbService = new MongoDbService();
 * 
 * // Create a provider with the service
 * const mongoDbProvider = new MongoDbProvider(mongoDbService);
 * 
 * // Get the MongoDB service
 * const mongoService = mongoDbProvider.getService();
 * await mongoService.connect();
 * // ... use mongoService ...
 * await mongoService.close();
 * ```
 */
export class MongoDbProvider {
  private readonly mongoDbService: IMongoDbService;
  
  /**
   * Constructor that accepts a MongoDB service instance
   * @param mongoDbService MongoDB service instance implementing IMongoDbService
   */
  constructor(mongoDbService: IMongoDbService) {
    this.mongoDbService = mongoDbService;
  }
  
  /**
   * Get the MongoDB service instance
   * @returns The MongoDB service instance
   */
  getService(): IMongoDbService {
    return this.mongoDbService;
  }
} 