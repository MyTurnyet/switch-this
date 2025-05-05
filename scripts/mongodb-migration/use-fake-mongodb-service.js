#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.resolve(__dirname, '../../');
const srcDir = path.join(rootDir, 'src');

// Template for the new imports and fake service usage
const testUtilImportTemplate = `import { FakeMongoDbService, createMongoDbTestSetup } from '@/test/utils/mongodb-test-utils';`;

// Template for the before each setup
const beforeEachTemplate = `
  let fakeMongoService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    ({ fakeMongoService } = createMongoDbTestSetup());
  });
`;

// Function to process a test file
function processTestFile(filePath) {
  console.log(`Processing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Skip files that already use the new approach
  if (content.includes('createMongoDbTestSetup')) {
    console.log(`File ${filePath} already uses the new approach, skipping.`);
    return false;
  }
  
  // Skip if not a MongoDB test
  if (!content.includes('MongoDbProvider') && !content.includes('MongoDbService')) {
    return false;
  }
  
  // Replace imports - add our test utils import
  if (!content.includes('mongodb-test-utils')) {
    // Find the imports section
    const importIndex = findLastImportIndex(content);
    if (importIndex !== -1) {
      content = 
        content.substring(0, importIndex) + 
        '\n' + testUtilImportTemplate + 
        content.substring(importIndex);
      modified = true;
    }
  }
  
  // Replace mock MongoDB service definitions
  if (content.includes('const mockMongoService')) {
    // Remove the entire mockMongoService definition block
    content = content.replace(
      /\/\/ Define mock MongoDB service[\s\S]*?toObjectId: jest\.fn\(\)\.mockImplementation\([^)]+\)\n\s*\};/g,
      '// Using FakeMongoDbService from test utils instead of custom mocks'
    );
    modified = true;
  }
  
  // Replace MongoDB provider mocks
  if (content.includes('jest.mock(\'@/lib/services/mongodb.provider\'')) {
    // Remove the MongoDB provider mock
    content = content.replace(
      /jest\.mock\(['"]@\/lib\/services\/mongodb\.provider['"][\s\S]*?\}\)\);/g,
      '// MongoDB provider mocking is now handled by createMongoDbTestSetup()'
    );
    modified = true;
  }
  
  // Add beforeEach setup if there's a describe block but no createMongoDbTestSetup
  if (content.includes('describe(') && !content.includes('createMongoDbTestSetup')) {
    // Find the first describe block
    const describeMatch = content.match(/describe\(['"](.*?)['"],\s*\(\)\s*=>\s*\{/);
    if (describeMatch) {
      const describePos = content.indexOf(describeMatch[0]) + describeMatch[0].length;
      content = 
        content.substring(0, describePos) + 
        beforeEachTemplate + 
        content.substring(describePos);
      modified = true;
    }
  }
  
  // Replace references to mockMongoService with fakeMongoService
  content = content.replace(/mockMongoService/g, 'fakeMongoService');
  
  // Add specific collection stubbing if needed
  if (content.includes('findOne.mockResolvedValue') || 
      content.includes('find.mockReturnValue') || 
      content.includes('toArray.mockResolvedValue')) {
    
    // Look for collection method mocking patterns and fix them to use fakeMongoService
    // This is complex and might need manual intervention for some files
    modified = true;
  }
  
  // Save the modified file
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
    return true;
  }
  
  return false;
}

// Function to find the last import statement position
function findLastImportIndex(content) {
  const lines = content.split('\n');
  let lastImportLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportLine = i;
    }
  }
  
  if (lastImportLine === -1) {
    return -1;
  }
  
  // Calculate the character index
  let charIndex = 0;
  for (let i = 0; i <= lastImportLine; i++) {
    charIndex += lines[i].length + 1; // +1 for the newline
  }
  
  return charIndex;
}

// Function to recursively process directories
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let modifiedCount = 0;
  
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      modifiedCount += processDirectory(entryPath);
    } else if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) {
      if (processTestFile(entryPath)) {
        modifiedCount++;
      }
    }
  }
  
  return modifiedCount;
}

// Main function
function main() {
  console.log('Updating test files to use the FakeMongoDbService...');
  const modifiedCount = processDirectory(srcDir);
  console.log(`Done! Updated ${modifiedCount} test files.`);
}

main(); 