#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.resolve(__dirname, '../../');

// Files to fix with hoisting issues
const filesToFix = [
  'src/app/api/switchlists/[id]/__tests__/route.test.ts',
  'src/app/api/switchlists/__tests__/id-route/route.test.ts',
  'src/app/api/rolling-stock/[id]/__tests__/route.test.ts',
  'src/app/api/rolling-stock/[id]/__tests__/put.test.ts',
  'src/app/api/rolling-stock/reset/__tests__/route.test.ts',
  'src/app/api/industries/[id]/__tests__/route.test.ts',
  'src/app/api/locations/[id]/__tests__/route.test.ts',
  'src/app/api/train-routes/[id]/__tests__/route.test.ts',
  'src/app/api/switchlists/__tests__/route.test.ts',
  'src/app/api/industries/__tests__/route.test.ts',
  'src/app/api/locations/__tests__/route.test.ts'
];

// Template for a complete mock MongoDB service
const mockServiceTemplate = `// Define mock MongoDB service
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

// Now mock the MongoDB provider
jest.mock('@/lib/services/mongodb.provider', () => ({
  MongoDbProvider: jest.fn().mockImplementation(() => ({
    getService: jest.fn().mockReturnValue(mockMongoService)
  })),
}));`;

// Import template
const importInterfaceTemplate = `import { IMongoDbService } from '@/lib/services/mongodb.interface';`;

// Function to fix a file with mockMongoService hoisting issues
function fixTestFile(filePath) {
  console.log(`Processing ${filePath}`);
  const fullPath = path.join(rootDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`File does not exist: ${fullPath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // First, add IMongoDbService import if it doesn't exist
  if (!content.includes('IMongoDbService')) {
    // Look for the mongodb.provider import
    if (content.includes("from '@/lib/services/mongodb.provider'")) {
      content = content.replace(
        /import\s+\{\s*MongoDbProvider\s*\}\s+from\s+['"]@\/lib\/services\/mongodb\.provider['"];/,
        `import { MongoDbProvider } from '@/lib/services/mongodb.provider';\n${importInterfaceTemplate}`
      );
    }
  }
  
  // Remove the existing jest.mock for mongodb.provider
  content = content.replace(
    /jest\.mock\(['"]@\/lib\/services\/mongodb\.provider['"][\s\S]*?\}\)\);/,
    '// Mock removed and replaced with proper declaration'
  );
  
  // Find a good place to insert our mock service - after imports and before the describe block
  let insertPosition = -1;
  
  // Find the last import statement
  const lastImportMatch = content.match(/^import.*?;/gm);
  if (lastImportMatch && lastImportMatch.length > 0) {
    const lastImport = lastImportMatch[lastImportMatch.length - 1];
    insertPosition = content.indexOf(lastImport) + lastImport.length;
  }
  
  if (insertPosition === -1) {
    console.error(`Could not find a good insert position in ${filePath}`);
    return false;
  }
  
  // Insert the mock service template
  content = content.substring(0, insertPosition) + 
    '\n\n' + mockServiceTemplate + '\n\n' + 
    content.substring(insertPosition);
  
  // Save the modified file
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Fixed ${filePath}`);
  return true;
}

// Main function
function main() {
  console.log('Fixing test files with mockMongoService hoisting issues...');
  
  let fixedCount = 0;
  for (const file of filesToFix) {
    if (fixTestFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`Done! Fixed ${fixedCount} files.`);
}

main(); 