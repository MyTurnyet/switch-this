#!/bin/bash

# This script updates test files to use the new MongoDbService approach
# rather than the previous MongoDbProvider approach

cat > test-template.txt << 'EOL'
import { jest } from '@jest/globals';
import { NextResponse } from 'next/server';
import { GET, PUT, DELETE } from '../route';
import { FakeMongoDbService } from '@/test/utils/mongodb-test-utils';

// Create a fake mongo service for testing
const fakeMongoService = new FakeMongoDbService();

// Mock the mongodb service
jest.mock('@/lib/services/mongodb.service', () => {
  return {
    MongoDbService: jest.fn().mockImplementation(() => {
      return fakeMongoService;
    })
  };
});

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({ data, options }))
  }
}));
EOL

echo "Created test template at test-template.txt"
echo "This template includes the basic setup needed for tests."
echo ""
echo "Steps to manually update test files:"
echo "1. Replace MongoDbProvider imports with FakeMongoDbService"
echo "2. Remove the MongoDbProvider usage and mocking"
echo "3. Add direct mocking of MongoDbService to return fakeMongoService"
echo "4. Update test assertions to reference fakeMongoService directly"
echo "5. Replace any clearCallHistory() references with proper method on FakeMongoDbService"
echo ""
echo "Look at the src/lib/services/__tests__/mongodb-migration.test.ts file for a working example" 