#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.resolve(__dirname, '../../');

// Files to fix - these are the ones that failed
const filesToFix = [
  'src/app/api/train-routes/[id]/__tests__/route.test.ts',
  'src/app/api/rolling-stock/[id]/__tests__/route.test.ts',
  'src/app/api/rolling-stock/[id]/__tests__/put.test.ts',
  'src/app/api/locations/__tests__/route.test.ts',
  'src/app/api/switchlists/__tests__/route.test.ts',
  'src/app/api/locations/[id]/__tests__/route.test.ts',
  'src/app/api/rolling-stock/reset/__tests__/route.test.ts',
  'src/app/api/switchlists/__tests__/id-route/route.test.ts',
  'src/app/api/industries/[id]/__tests__/route.test.ts',
  'src/app/api/switchlists/[id]/__tests__/route.test.ts',
  'src/app/api/industries/__tests__/route.test.ts'
];

// Function to fix the mock implementation in test files
function fixTestFile(filePath) {
  console.log(`Fixing ${filePath}`);
  const fullPath = path.join(rootDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`File does not exist: ${fullPath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Check if the file contains the MockMongoDbProvider error
  if (content.includes('mockMongoService is not defined')) {
    console.error(`This error shouldn't appear in the file itself! File: ${filePath}`);
    return false;
  }
  
  // Check if the test has a mock for mongodb.provider but no mockMongoService defined
  if (content.includes('jest.mock(\'@/lib/services/mongodb.provider\'') &&
      !content.includes('const mockMongoService')) {
    
    // Find the mock implementation
    const mockMatch = content.match(/jest\.mock\(['"]@\/lib\/services\/mongodb\.provider['"].*?\{([\s\S]*?\}\)\);)/);
    
    if (mockMatch) {
      // Define mockMongoService before the mock
      const mockDefinition = `// Define mock MongoDB service
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
      
      // Insert the mock definition before the jest.mock call
      const mockPos = content.indexOf('jest.mock');
      if (mockPos !== -1) {
        content = content.substring(0, mockPos) + mockDefinition + content.substring(mockPos);
        modified = true;
      }
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
  console.log('Fixing test files with missing mockMongoService definitions...');
  
  let fixedCount = 0;
  for (const file of filesToFix) {
    if (fixTestFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`Done! Fixed ${fixedCount} files.`);
}

main(); 