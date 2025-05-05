import { MongoDbService } from './mongodb.service';
import { IMongoDbService } from './mongodb.interface';

/**
 * MongoDB Provider class that manages a singleton instance of MongoDbService
 */
export class MongoDbProvider {
  private readonly mongoDbService: IMongoDbService;
  
  /**
   * Constructor that accepts a MongoDB service instance
   * @param mongoDbService MongoDB service instance
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

// Singleton instance of the provider
let providerInstance: MongoDbProvider | null = null;

/**
 * Get the MongoDB service instance
 * @returns The MongoDB service instance
 * @deprecated Use new MongoDbProvider(new MongoDbService()).getService() instead
 */
export function getMongoDbService(): IMongoDbService {
  if (!providerInstance) {
    providerInstance = new MongoDbProvider(new MongoDbService());
  }
  return providerInstance.getService();
}

/**
 * Reset the MongoDB service instance - primarily for testing
 * @deprecated Use new MongoDbProvider(new MongoDbService()) instead
 */
export function resetMongoDbService(): void {
  providerInstance = new MongoDbProvider(new MongoDbService());
}

/**
 * Set a custom MongoDB service instance - primarily for testing
 * @param customInstance The custom MongoDB service instance
 * @deprecated Use new MongoDbProvider(customInstance) instead
 */
export function setMongoDbService(customInstance: IMongoDbService): void {
  providerInstance = new MongoDbProvider(customInstance);
} 