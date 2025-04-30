import { MongoDbService } from './mongodb.service';

// Singleton instance of the MongoDB service
let instance: MongoDbService | null = null;

/**
 * Get the MongoDB service instance
 * @returns The MongoDB service instance
 */
export function getMongoDbService(): MongoDbService {
  if (!instance) {
    instance = new MongoDbService();
  }
  return instance;
}

/**
 * Reset the MongoDB service instance - primarily for testing
 */
export function resetMongoDbService(): void {
  instance = null;
}

/**
 * Set a custom MongoDB service instance - primarily for testing
 * @param customInstance The custom MongoDB service instance
 */
export function setMongoDbService(customInstance: MongoDbService): void {
  instance = customInstance;
} 