/**
 * End-to-end test setup file
 * This file sets up the testing environment for Playwright tests
 */
import { setupFakeMongoDbData } from './test-data-setup';
import { resetMongoService } from '../src/lib/services/mongodb.client';

// Set environment variable to use fake MongoDB service during tests
process.env.USE_FAKE_MONGO = 'true';

/**
 * This is the required default export for Playwright global setup
 * It runs once before all the tests start
 */
export default async function globalSetup() {
  console.log('Starting E2E test setup with Mock MongoDB Service');
  
  // Reset any existing MongoDB service first
  resetMongoService();
  
  // Initialize test data
  await setupFakeMongoDbData();

  console.log('E2E test setup complete - Using Mock MongoDB Service');
  return;
} 