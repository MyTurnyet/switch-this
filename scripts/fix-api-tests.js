#!/usr/bin/env node

/**
 * API Test Fixer Script
 * 
 * This script helps replace old MongoDB mocking patterns with the standardized approach
 * from the mongodb-test-utils.ts file.
 * 
 * Usage: 
 * - node scripts/fix-api-tests.js <path/to/test/file.test.ts>
 * - node scripts/fix-api-tests.js <path/to/test/file.test.ts> --add-setup
 */

const fs = require('fs');
const path = require('path');

// Parse command-line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Usage: node fix-api-tests.js <path/to/test/file.test.ts> [--add-setup]');
  process.exit(1);
}

const testFilePath = args[0];
const addSetup = args.includes('--add-setup');
const fullPath = path.resolve(process.cwd(), testFilePath);

// Check if the file exists
if (!fs.existsSync(fullPath)) {
  console.error(`File not found: ${fullPath}`);
  process.exit(1);
}

// Read the test file
let content = fs.readFileSync(fullPath, 'utf8');

// Check if this is an API route test file
const isApiRouteTest = content.includes('route.test.ts') || 
                        content.includes('NextResponse') || 
                        content.includes('import { GET') || 
                        content.includes('import { POST') ||
                        content.includes('NextApiRequest');

if (!isApiRouteTest) {
  console.log('This does not appear to be an API route test file.');
  console.log('If it is, run with --add-setup to add the standard API test setup code.');
  process.exit(0);
}

// Replace old MongoDB mocking with new approach
function fixMongoDbMocking(content) {
  // Replace old import patterns
  content = content.replace(
    /import { MongoDbProvider } from ['"]@\/lib\/services\/mongodb\.provider['"]/g,
    '// Old MongoDbProvider import removed - we now mock it\n// import { MongoDbProvider } from \'@/lib/services/mongodb.provider\''
  );

  // Replace old mock patterns with new approach
  content = content.replace(
    /jest\.mock\(['"]@\/lib\/services\/mongodb\.provider['"],[\s\n]*\(\) => \{[\s\S]*?\}\);/g,
    `jest.mock('@/lib/services/mongodb.provider', () => ({
  MongoDbProvider: jest.fn().mockImplementation(() => ({
    getService: jest.fn().mockReturnValue(fakeMongoService)
  }))
}));`
  );

  // Add the FakeMongoDbService import if not present
  if (!content.includes('FakeMongoDbService')) {
    content = content.replace(
      /import {([^}]*)} from ['"]@\/test\/utils\/mongodb-test-utils['"]/g,
      'import {$1, FakeMongoDbService } from \'@/test/utils/mongodb-test-utils\''
    );

    // If the import doesn't exist at all, add it
    if (!content.includes('mongodb-test-utils')) {
      // Add after other imports
      const importMatch = content.match(/^(import[^;]*;\s*)+/);
      if (importMatch) {
        const imports = importMatch[0];
        content = content.replace(
          imports,
          `${imports}import { FakeMongoDbService } from '@/test/utils/mongodb-test-utils';\n\n`
        );
      }
    }
  }

  return content;
}

// Replace old NextResponse mocking with new approach
function fixNextResponseMocking(content) {
  // Check if mockJson is already defined
  if (!content.includes('mockJson')) {
    // Add NextResponse mocking before imports if not present
    if (!content.includes('jest.mock(\'next/server\'')) {
      const importMatch = content.match(/^(import[^;]*;\s*)+/);
      if (importMatch) {
        const imports = importMatch[0];
        content = content.replace(
          imports,
          `// Mock NextResponse
const mockJson = jest.fn();
jest.mock('next/server', () => ({
  NextResponse: {
    json: mockJson
  }
}));\n\n${imports}`
        );
      }
    }
  }

  return content;
}

// Add standard setup code for API tests
function addStandardSetup(content) {
  // Extract the route path from the file path
  const routePath = fullPath.match(/src\/app\/api\/([^\/]+)(\/[^\/]+)?\/__tests__/);
  let collectionName = routePath ? routePath[1].replace(/-/g, '_') : 'example_collection';
  
  // Check if route handlers are already imported
  const hasRouteHandlers = content.includes('import { GET') || 
                           content.includes('import { POST') || 
                           content.includes('import { PUT') ||
                           content.includes('import { DELETE');

  // Create the standard setup template
  const setupTemplate = `// IMPORTANT: Need to mock modules BEFORE importing the route handlers
import { NextRequest } from 'next/server';
import { Collection } from 'mongodb';

// Mock NextResponse
const mockJson = jest.fn();
jest.mock('next/server', () => ({
  NextResponse: {
    json: mockJson
  }
}));

// Create a fake MongoDB service for testing 
import { FakeMongoDbService } from '@/test/utils/mongodb-test-utils';
const fakeMongoService = new FakeMongoDbService();

// Mock the MongoDB provider to use our fake service
jest.mock('@/lib/services/mongodb.provider', () => ({
  MongoDbProvider: jest.fn().mockImplementation(() => ({
    getService: jest.fn().mockReturnValue(fakeMongoService)
  }))
}));

// IMPORTANT: Import route handlers AFTER setting up mocks
import { GET, POST } from '../route';

describe('${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)} API Route', () => {
  let mockRequest: NextRequest;
  let mockCollection: Collection;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock request
    mockRequest = {
      json: jest.fn().mockResolvedValue({}),
      headers: new Map(),
      nextUrl: { searchParams: new URLSearchParams() }
    } as unknown as NextRequest;
    
    // Get collection reference
    mockCollection = fakeMongoService.get${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}Collection();
  });

  describe('GET', () => {
    it('should return data successfully', async () => {
      // TODO: Add proper test implementation
      // Example:
      // const mockItems = [{ _id: '123', name: 'Test Item' }];
      // jest.spyOn(mockCollection, 'find').mockReturnValue({
      //   toArray: jest.fn().mockResolvedValue(mockItems)
      // } as any);
      
      // await GET(mockRequest);
      
      // expect(fakeMongoService.connect).toHaveBeenCalled();
      // expect(mockCollection.find).toHaveBeenCalled();
      // expect(mockJson).toHaveBeenCalledWith(mockItems);
    });
  });
});
`;

  // If we detect this is an existing test with content, just add the mocking code
  if (content.length > 100 && content.includes('describe(')) {
    // Apply the fixes instead of replacing everything
    content = fixMongoDbMocking(content);
    content = fixNextResponseMocking(content);
  } else {
    // Replace with the standard template
    content = setupTemplate;
  }

  return content;
}

// Apply fixes
if (addSetup) {
  content = addStandardSetup(content);
} else {
  content = fixMongoDbMocking(content);
  content = fixNextResponseMocking(content);
}

// Write the updated file
fs.writeFileSync(fullPath, content, 'utf8');
console.log(`Updated test file: ${fullPath}`);

// Create backup
fs.writeFileSync(`${fullPath}.bak`, content, 'utf8');
console.log(`Backup created: ${fullPath}.bak`);

console.log(`
Next steps:
1. Review the updated test file
2. Update test assertions to match your API's expected behavior
3. Run the tests with: npm test -- --testPathPattern="${path.basename(testFilePath)}"
`); 