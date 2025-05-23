/**
 * Client-side MongoDB service initialization
 * This avoids the server action issues in the factory approach
 */

import { IMongoDbService } from './mongodb.interface';
import { MongoDbService } from './mongodb.service';
import { Collection, Document } from 'mongodb';
import { DB_COLLECTIONS } from '../constants/dbCollections';

// Singleton instance store
let mongoService: IMongoDbService | null = null;

/**
 * Get a MongoDB service instance for client-side use
 * This uses a singleton pattern to ensure only one instance exists
 * 
 * @returns An IMongoDbService instance
 */
export function getMongoService(): IMongoDbService {
  if (!mongoService) {
    // Check if we're in a test environment
    if (process.env.USE_FAKE_MONGO === 'true') {
      // Try to use Playwright mock first
      try {
        // Dynamically load the module to avoid import issues
        const PlaywrightMongoDbService = require('../../test/utils/playwright-mongo-mock').PlaywrightMongoDbService;
        mongoService = new PlaywrightMongoDbService();
        console.log('MongoDB Client using PlaywrightMongoDbService');
      } catch (e) {
        console.error('Failed to load PlaywrightMongoDbService:', e);
        // Fall back to Jest mock
        try {
          const FakeMongoDbService = require('../../test/utils/mongodb-test-utils').FakeMongoDbService;
          mongoService = new FakeMongoDbService();
          console.log('MongoDB Client using FakeMongoDbService');
        } catch (e2) {
          console.error('Failed to load FakeMongoDbService:', e2);
          // If all fails, use real service
          mongoService = new MongoDbService();
          console.log('MongoDB Client using real MongoDbService (test fallback)');
        }
      }
    } else {
      // Use real service for production
      mongoService = new MongoDbService();
      console.log('MongoDB Client using real MongoDbService');
    }
  }
  
  // At this point mongoService is guaranteed to be initialized
  const service = mongoService as IMongoDbService;
  
  // Ensure critical methods are available
  ensureServiceMethods(service);
  
  return service;
}

/**
 * Ensure all required methods exist on the service
 * This is a safety mechanism to prevent runtime errors
 */
function ensureServiceMethods(service: IMongoDbService): void {
  // Check for getBlocksCollection method
  if (typeof service.getBlocksCollection !== 'function') {
    console.error('The mongoService instance is missing getBlocksCollection method - adding it dynamically');
    
    // Patch missing method
    service.getBlocksCollection = function<T extends Document = Document>(): Collection<T> {
      console.log('Using dynamically added getBlocksCollection method');
      
      // Try to use getCollection if available
      if (typeof this.getCollection === 'function') {
        return this.getCollection<T>(DB_COLLECTIONS.BLOCKS);
      }
      
      // If getCollection is not available, create error-throwing stub
      throw new Error('Cannot access blocks collection - service implementation is incomplete');
    };
  }
  
  // Add any other method checks here if needed
}

/**
 * Reset the MongoDB service instance
 * This is useful for testing to ensure a clean state
 */
export function resetMongoService(): void {
  mongoService = null;
} 