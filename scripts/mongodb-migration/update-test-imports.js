#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.resolve(__dirname, '../../');
const srcDir = path.join(rootDir, 'src');

// Function to process a test file
function processTestFile(filePath) {
  console.log(`Processing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace import statements
  if (content.includes('resetMongoDbService') || content.includes('setMongoDbService') || 
      content.includes('getMongoDbService')) {
    
    // Fix imports
    content = content.replace(
      /import\s+\{\s*(MongoDbProvider)?(?:,)?\s*(?:getMongoDbService)?(?:,)?\s*(?:resetMongoDbService)?(?:,)?\s*(?:setMongoDbService)?(?:,)?\s*\}\s+from\s+['"]@\/lib\/services\/mongodb\.provider['"];?/g,
      'import { MongoDbProvider } from \'@/lib/services/mongodb.provider\';'
    );
    
    // Add MongoDbService import if needed
    if (!content.includes('MongoDbService')) {
      content = content.replace(
        /import\s+\{\s*MongoDbProvider\s*\}\s+from\s+['"]@\/lib\/services\/mongodb\.provider['"];?/g,
        'import { MongoDbProvider } from \'@/lib/services/mongodb.provider\';\nimport { MongoDbService } from \'@/lib/services/mongodb.service\';'
      );
    }
    
    modified = true;
  }
  
  // Replace the getMongoDbService mock definition if it exists
  if (content.includes('getMongoDbService: jest.fn()')) {
    content = content.replace(
      /getMongoDbService:\s*jest\.fn\(\),?/g,
      'MongoDbProvider: jest.fn().mockImplementation(() => ({\n    getService: jest.fn().mockReturnValue(mockMongoService)\n  })),'
    );
    modified = true;
  }
  
  // Replace mock implementation calls
  if (content.includes('(getMongoDbService as jest.Mock)')) {
    content = content.replace(
      /\(getMongoDbService as jest\.Mock\)\.mockReturnValue\(mockMongoService\);/g,
      'const mockProvider = new MongoDbProvider(mockMongoService);\n  (MongoDbProvider as jest.Mock).mockReturnValue(mockProvider);'
    );
    modified = true;
  }
  
  // Replace calls to resetMongoDbService
  if (content.includes('resetMongoDbService()')) {
    content = content.replace(
      /resetMongoDbService\(\);/g,
      'const newProvider = new MongoDbProvider(new MongoDbService());'
    );
    modified = true;
  }
  
  // Replace calls to setMongoDbService
  if (content.includes('setMongoDbService(')) {
    content = content.replace(
      /setMongoDbService\(([^)]+)\);/g,
      'const customProvider = new MongoDbProvider($1);'
    );
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

// Function to recursively process directories
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(entryPath);
    } else if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) {
      processTestFile(entryPath);
    }
  }
}

// Main function
function main() {
  console.log('Updating test files to use the class-based MongoDB provider...');
  processDirectory(srcDir);
  console.log('Done updating test files!');
}

main(); 