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

// Singleton instance of the provider for legacy functions
let providerInstance: MongoDbProvider | null = null;

/**
 * Get the MongoDB service instance
 * This is a legacy function that maintains backward compatibility.
 * It creates a singleton provider instance if none exists, and returns its service.
 * 
 * @returns The MongoDB service instance
 * @deprecated Use new MongoDbProvider(new MongoDbService()).getService() instead
 * 
 * @example
 * ```typescript
 * // Legacy usage
 * const mongoService = getMongoDbService();
 * await mongoService.connect();
 * // ... use mongoService ...
 * await mongoService.close();
 * ```
 */
export function getMongoDbService(): IMongoDbService {
  if (!providerInstance) {
    providerInstance = new MongoDbProvider(new MongoDbService());
  }
  return providerInstance.getService();
}

/**
 * Reset the MongoDB service instance - primarily for testing
 * This is a legacy function that maintains backward compatibility.
 * It replaces the singleton provider instance with a new one.
 * 
 * @deprecated Use new MongoDbProvider(new MongoDbService()) instead
 * 
 * @example
 * ```typescript
 * // Legacy usage in tests
 * resetMongoDbService();
 * ```
 */
export function resetMongoDbService(): void {
  providerInstance = new MongoDbProvider(new MongoDbService());
}

/**
 * Set a custom MongoDB service instance - primarily for testing
 * This is a legacy function that maintains backward compatibility.
 * It replaces the singleton provider instance with a new one using the custom service.
 * 
 * @param customInstance The custom MongoDB service instance
 * @deprecated Use new MongoDbProvider(customInstance) instead
 * 
 * @example
 * ```typescript
 * // Legacy usage in tests
 * const mockService = new MongoDbService();
 * setMongoDbService(mockService);
 * ```
 */
export function setMongoDbService(customInstance: IMongoDbService): void {
  providerInstance = new MongoDbProvider(customInstance);
} 