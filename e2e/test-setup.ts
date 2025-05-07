/**
 * End-to-end test setup file
 * This file sets up the testing environment for Playwright tests
 */
import { setupFakeMongoDbData } from './test-data-setup';
import { resetMongoService } from '../src/lib/services/mongodb.client';

// Ensure environment variables are set for test environment
process.env.USE_FAKE_MONGO = 'true';
process.env.NODE_ENV = 'test';

console.log('Environment setup for Playwright tests:');
console.log(`USE_FAKE_MONGO: ${process.env.USE_FAKE_MONGO}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

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