import { IMongoDbService } from './mongodb.interface';
import { MongoDbService } from './mongodb.service';

// Declare a singleton instance at the module level
let serviceInstance: IMongoDbService | null = null;

// Environment variable to control using fake service for tests
// Default to undefined to use real MongoDB service
let useFakeService = process.env.USE_FAKE_MONGO === 'true';

/**
 * Gets or creates a MongoDB service instance based on the current environment
 * Implements a singleton pattern to ensure only one instance is used
 * 
 * @returns An IMongoDbService implementation
 */
export async function getMongoDbService(): Promise<IMongoDbService> {
  // Return existing instance if available
  if (serviceInstance) {
    return serviceInstance as IMongoDbService;
  }

  // Create a new instance based on environment
  if (useFakeService) {
    try {
      // First, try to import the Playwright mock service
      const { PlaywrightMongoDbService } = await import('../../test/utils/playwright-mongo-mock');
      serviceInstance = new PlaywrightMongoDbService();
      console.log('Using PlaywrightMongoDbService for e2e testing');
    } catch (error) {
      // Fall back to Jest mock if we're in a Jest environment
      try {
        const FakeMongoDbService = (await import('../../test/utils/mongodb-test-utils')).FakeMongoDbService;
        serviceInstance = new FakeMongoDbService();
        console.log('Using FakeMongoDbService for Jest testing');
      } catch (fallbackError) {
        // If both fail, create a real service
        console.warn('Failed to load mock services, using real MongoDB service');
        serviceInstance = new MongoDbService();
      }
    }
  } else {
    serviceInstance = new MongoDbService();
  }

  return serviceInstance as IMongoDbService;
}

/**
 * Synchronous version of getMongoDbService for places where async imports aren't possible
 * This will still return the cached instance if available
 */
export function getMongoDbServiceSync(): IMongoDbService {
  if (serviceInstance) {
    return serviceInstance;
  }

  // If no instance exists yet, create one synchronously (only real service can be created synchronously)
  if (useFakeService) {
    console.warn('No MongoDB service instance exists yet. Creating real service as fallback.');
    serviceInstance = new MongoDbService();
  } else {
    serviceInstance = new MongoDbService();
  }

  return serviceInstance;
}

/**
 * Enables the use of the fake MongoDB service for testing
 * This should be called before any service operations
 */
export async function enableFakeMongoDbService(): Promise<void> {
  // Only switch if we haven't already created an instance
  if (!serviceInstance) {
    useFakeService = true;
  }
}

/**
 * Disables the use of the fake MongoDB service
 * This should be called to switch back to the real service
 */
export async function disableFakeMongoDbService(): Promise<void> {
  // Only switch if we haven't already created an instance
  if (!serviceInstance) {
    useFakeService = false;
  }
}

/**
 * Resets the MongoDB service instance
 * This is useful for testing to ensure a clean state
 */
export async function resetMongoDbService(): Promise<void> {
  serviceInstance = null;
} 