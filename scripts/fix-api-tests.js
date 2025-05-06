#!/usr/bin/env node

/**
 * API Test Fixer Script
 * 
 * This script helps replace old MongoDB mocking patterns with the standardized approach
 * from the mongodb-test-utils.ts file.
 * 
 * Usage: node scripts/fix-api-tests.js <path/to/test/file.test.ts>
 */

const fs = require('fs');
const path = require('path');

// Check if a file path was provided
if (process.argv.length < 3) {
  console.log('Usage: node fix-api-tests.js <path/to/test/file.test.ts>');
  process.exit(1);
}

const testFilePath = process.argv[2];
const fullPath = path.resolve(process.cwd(), testFilePath);

// Check if the file exists
if (!fs.existsSync(fullPath)) {
  console.error(`File not found: ${fullPath}`);
  process.exit(1);
}

// Read the test file
let content = fs.readFileSync(fullPath, 'utf8');

// Patterns to replace
const patterns = [
  // Replace old mongodb mocking
  {
    pattern: /jest\.mock\(['"]mongodb['"]\)[^;]*;/gs,
    replacement: '// MongoDB mocking is handled by the mongodb-test-utils'
  },
  // Replace old mongodb service mocking
  {
    pattern: /jest\.mock\(['"]@\/lib\/services\/mongodb\.service['"]\)[^;]*;/gs,
    replacement: `// Mock the MongoDB provider
jest.mock('@/lib/services/mongodb.provider', () => {
  return {
    MongoDbProvider: jest.fn().mockImplementation(() => ({
      getService: jest.fn().mockReturnValue(createMockMongoService())
    }))
  };
});`
  },
  // Replace old NextResponse mocking
  {
    pattern: /jest\.mock\(['"]next\/server['"]\)[^;]*;/gs,
    replacement: `// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn()
  }
}));`
  },
  // Replace FakeMongoDbService imports
  {
    pattern: /import\s*{\s*FakeMongoDbService\s*}[^;]*;/g,
    replacement: `import { createMockMongoService } from '@/test/utils/mongodb-test-utils';
import { Collection, Document, ObjectId } from 'mongodb';`
  },
  // Replace missing imports
  {
    pattern: /import\s*{[^}]*}\s*from\s*['"]mongodb['"];/g,
    replace: (match) => {
      if (!match.includes('Collection')) {
        return match.replace('}', ', Collection, Document}');
      }
      return match;
    }
  },
  // Add createMockMongoService import if missing
  {
    pattern: /import\s*{[^}]*}\s*from\s*['"]@\/test\/utils\/mongodb-test-utils['"];/g,
    checkAndReplace: (content) => {
      if (!content.includes('createMockMongoService')) {
        if (content.includes('@/test/utils/mongodb-test-utils')) {
          return content.replace(
            /import\s*{([^}]*)}\s*from\s*['"]@\/test\/utils\/mongodb-test-utils['"];/g,
            (match, imports) => `import { ${imports}, createMockMongoService } from '@/test/utils/mongodb-test-utils';`
          );
        } else {
          return content + `\nimport { createMockMongoService } from '@/test/utils/mongodb-test-utils';`;
        }
      }
      return content;
    }
  },
];

// Apply the patterns
patterns.forEach(pattern => {
  if (pattern.pattern && pattern.replacement) {
    content = content.replace(pattern.pattern, pattern.replacement);
  } else if (pattern.pattern && pattern.replace) {
    content = content.replace(pattern.pattern, pattern.replace);
  } else if (pattern.checkAndReplace) {
    content = pattern.checkAndReplace(content);
  }
});

// Add setup code template if requested
if (process.argv.includes('--add-setup')) {
  const setupTemplate = `
  let mockRequest: NextRequest;
  let mockRequestJson: jest.Mock;
  let mockMongoService: ReturnType<typeof createMockMongoService>;
  let mockCollection: jest.Mocked<Collection<Document>>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock request
    mockRequestJson = jest.fn();
    mockRequest = {
      json: mockRequestJson
    } as unknown as NextRequest;
    
    // Setup MongoDB mock
    mockMongoService = createMockMongoService();
    mockCollection = mockMongoService.getCollection('collection-name') as jest.Mocked<Collection<Document>>;
  });
`;

  // Find the describe block and add setup after it
  content = content.replace(
    /(describe\(['"][^'"]*['"],\s*\(\)\s*=>\s*{[^\n]*\n)/,
    `$1${setupTemplate}`
  );
}

// Write the updated content back to the file
fs.writeFileSync(fullPath, content, 'utf8');

console.log(`Updated ${fullPath}`);
console.log('Remember to manually check and adjust the test file as needed.');
console.log('You may need to:');
console.log('1. Fix collection getter methods');
console.log('2. Update test assertions to use NextResponse.json properly');
console.log('3. Add proper type annotations for mockCollection'); 