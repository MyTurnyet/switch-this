import { MongoDbService } from './mongodb.service';

// Mock instance of the MongoDB service
let mockInstance: MongoDbService | null = null;
const mockService = new MongoDbService();

/**
 * Get the MongoDB service instance
 * @returns The MongoDB service instance
 */
export function getMongoDbService(): MongoDbService {
  if (!mockInstance) {
    mockInstance = mockService;
  }
  return mockInstance;
}

/**
 * Reset the MongoDB service instance - primarily for testing
 */
export function resetMongoDbService(): void {
  mockInstance = null;
}

/**
 * Set a custom MongoDB service instance - primarily for testing
 * @param customInstance The custom MongoDB service instance
 */
export function setMongoDbService(customInstance: MongoDbService): void {
  mockInstance = customInstance;
} 