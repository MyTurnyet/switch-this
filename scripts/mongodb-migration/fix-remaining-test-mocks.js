#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.resolve(__dirname, '../../');

// Files to fix manually - these are the ones that failed
const filesToFix = [
  'src/app/api/rolling-stock/[id]/__tests__/route.test.ts',
  'src/app/api/rolling-stock/reset/__tests__/route.test.ts',
  'src/app/api/switchlists/__tests__/route.test.ts',
  'src/app/api/switchlists/__tests__/id-route/route.test.ts',
  'src/app/api/industries/[id]/__tests__/route.test.ts',
  'src/app/api/switchlists/[id]/__tests__/route.test.ts'
];

// Template for a complete mock MongoDB service
const mockServiceTemplate = `
// Define mock MongoDB service
const mockMongoService = {
  connect: jest.fn(),
  close: jest.fn(),
  getCollection: jest.fn(),
  getRollingStockCollection: jest.fn().mockReturnValue({
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([])
    }),
    findOne: jest.fn().mockResolvedValue(null),
    insertOne: jest.fn().mockResolvedValue({ insertedId: 'new-id' }),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
  }),
  getIndustriesCollection: jest.fn().mockReturnValue({
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([])
    }),
    findOne: jest.fn().mockResolvedValue(null),
    insertOne: jest.fn().mockResolvedValue({ insertedId: 'new-id' }),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
  }),
  getLocationsCollection: jest.fn().mockReturnValue({
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([])
    }),
    findOne: jest.fn().mockResolvedValue(null),
    insertOne: jest.fn().mockResolvedValue({ insertedId: 'new-id' }),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
  }),
  getTrainRoutesCollection: jest.fn().mockReturnValue({
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([])
    }),
    findOne: jest.fn().mockResolvedValue(null),
    insertOne: jest.fn().mockResolvedValue({ insertedId: 'new-id' }),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
  }),
  getLayoutStateCollection: jest.fn().mockReturnValue({
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([])
    }),
    findOne: jest.fn().mockResolvedValue(null),
    insertOne: jest.fn().mockResolvedValue({ insertedId: 'new-id' }),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
  }),
  getSwitchlistsCollection: jest.fn().mockReturnValue({
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([])
    }),
    findOne: jest.fn().mockResolvedValue(null),
    insertOne: jest.fn().mockResolvedValue({ insertedId: 'new-id' }),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
  }),
  toObjectId: jest.fn().mockImplementation(id => id)
};
`;

// Import template
const importInterfaceTemplate = `import { IMongoDbService } from '@/lib/services/mongodb.interface';`;

// Function to fix a test file that uses MongoDB mocks
function fixTestFile(filePath) {
  console.log(`Processing ${filePath}`);
  const fullPath = path.join(rootDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`File does not exist: ${fullPath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // 1. Add IMongoDbService import if it doesn't exist
  if (!content.includes('IMongoDbService')) {
    // Look for the mongodb.provider import
    if (content.includes("from '@/lib/services/mongodb.provider'")) {
      content = content.replace(
        /import\s+\{\s*MongoDbProvider\s*\}\s+from\s+['"]@\/lib\/services\/mongodb\.provider['"];/,
        `import { MongoDbProvider } from '@/lib/services/mongodb.provider';\n${importInterfaceTemplate}`
      );
      modified = true;
    }
  }
  
  // 2. Check if the mock for mongodb.provider exists but we need to fix mockMongoService
  if (content.includes('jest.mock') && content.includes('mongodb.provider') && !content.includes('mockMongoService')) {
    // Find the position right before jest.mock
    const mockPosition = content.indexOf('jest.mock');
    if (mockPosition > 0) {
      // Insert mockMongoService before the jest.mock call
      content = content.substring(0, mockPosition) + mockServiceTemplate + content.substring(mockPosition);
      modified = true;
    }
  }
  
  // Save the modified file
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
    return true;
  } else {
    console.log(`No changes needed for ${filePath}`);
    return false;
  }
}

// Main function
function main() {
  console.log('Fixing remaining test files with missing mockMongoService definitions...');
  
  let fixedCount = 0;
  for (const file of filesToFix) {
    if (fixTestFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`Done! Fixed ${fixedCount} files.`);
}

main(); 