#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.resolve(__dirname, '../../');

// Files with complex collection mocking that need special handling
const filesToFix = [
  'src/app/api/train-routes/[id]/__tests__/route.test.ts',
  'src/app/api/rolling-stock/[id]/__tests__/route.test.ts',
  'src/app/api/rolling-stock/[id]/__tests__/put.test.ts',
  'src/app/api/rolling-stock/reset/__tests__/route.test.ts',
  'src/app/api/switchlists/__tests__/route.test.ts',
  'src/app/api/locations/[id]/__tests__/route.test.ts',
  'src/app/api/switchlists/__tests__/id-route/route.test.ts',
  'src/app/api/industries/[id]/__tests__/route.test.ts',
  'src/app/api/switchlists/[id]/__tests__/route.test.ts',
  'src/app/api/industries/__tests__/route.test.ts',
  'src/app/api/locations/__tests__/route.test.ts'
];

// Template for collection setup in beforeEach
const collectionSetupTemplate = `
  // Setup mock collections for this test
  beforeEach(() => {
    // Configure the fake service collections
    const rollingStockCollection = fakeMongoService.getRollingStockCollection();
    const industriesCollection = fakeMongoService.getIndustriesCollection();
    const locationsCollection = fakeMongoService.getLocationsCollection();
    const trainRoutesCollection = fakeMongoService.getTrainRoutesCollection();
    const switchlistsCollection = fakeMongoService.getSwitchlistsCollection();
    
    // Configure collection methods as needed for specific tests
    // Example: rollingStockCollection.find().toArray.mockResolvedValue([mockRollingStock]);
  });
`;

// Function to fix collection mocking in a test file
function fixTestFile(filePath) {
  console.log(`Fixing collection mocks in ${filePath}`);
  const fullPath = path.join(rootDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`File does not exist: ${fullPath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // First, make sure we're using the FakeMongoDbService
  if (!content.includes('FakeMongoDbService') && !content.includes('createMongoDbTestSetup')) {
    console.error(`File ${filePath} should first be migrated to use FakeMongoDbService.`);
    return false;
  }
  
  // Add collection setup in beforeEach if not present
  if (!content.includes('Setup mock collections for this test')) {
    // Find beforeEach block
    const beforeEachMatch = content.match(/beforeEach\(\s*\(\)\s*=>\s*\{/);
    if (beforeEachMatch) {
      const beforeEachPos = content.indexOf(beforeEachMatch[0]) + beforeEachMatch[0].length;
      content = 
        content.substring(0, beforeEachPos) + 
        collectionSetupTemplate + 
        content.substring(beforeEachPos);
      modified = true;
    }
  }
  
  // Find any collection mocking for specific tests and convert to use FakeMongoDbService
  // This requires more complex handling per file
  const collectionMocks = [
    { pattern: /(\w+)Collection\.find\(\)\.toArray\.mockResolvedValue\(([^)]+)\)/g, 
      replace: '$1Collection.find.mockImplementation(() => ({ toArray: jest.fn().mockResolvedValue($2) }))' },
    { pattern: /(\w+)Collection\.findOne\.mockResolvedValue\(([^)]+)\)/g,
      replace: '$1Collection.findOne.mockResolvedValue($2)' },
    { pattern: /(\w+)Collection\.updateOne\.mockResolvedValue\(([^)]+)\)/g,
      replace: '$1Collection.updateOne.mockResolvedValue($2)' },
    { pattern: /(\w+)Collection\.deleteOne\.mockResolvedValue\(([^)]+)\)/g,
      replace: '$1Collection.deleteOne.mockResolvedValue($2)' },
    { pattern: /(\w+)Collection\.insertOne\.mockResolvedValue\(([^)]+)\)/g,
      replace: '$1Collection.insertOne.mockResolvedValue($2)' }
  ];
  
  for (const { pattern, replace } of collectionMocks) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replace);
      modified = true;
    }
  }
  
  // Reset mocks in afterEach if not already present
  if (!content.includes('afterEach') && !content.includes('fakeMongoService.clearCallHistory')) {
    // Find a good place to insert afterEach
    const describeMatch = content.match(/describe\(['"](.*?)['"],\s*\(\)\s*=>\s*\{/);
    if (describeMatch) {
      // Find closing brace of the describe block
      const describePos = content.indexOf(describeMatch[0]);
      const describeEndPos = findClosingBrace(content, describePos + describeMatch[0].length);
      
      if (describeEndPos !== -1) {
        const afterEachBlock = `
  afterEach(() => {
    jest.clearAllMocks();
    fakeMongoService.clearCallHistory();
  });
`;
        content = 
          content.substring(0, describeEndPos) + 
          afterEachBlock + 
          content.substring(describeEndPos);
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

// Helper function to find the position of a closing brace
function findClosingBrace(content, startPos) {
  let braceCount = 1;
  let pos = startPos;
  
  while (pos < content.length && braceCount > 0) {
    const char = content.charAt(pos);
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    pos++;
  }
  
  return braceCount === 0 ? pos - 1 : -1;
}

// Main function
function main() {
  console.log('Fixing complex collection mocking in test files...');
  
  let fixedCount = 0;
  for (const file of filesToFix) {
    if (fixTestFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`Done! Fixed ${fixedCount} files.`);
}

main(); 