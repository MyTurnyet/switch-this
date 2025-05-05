#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.resolve(__dirname, '../../');
const apiDir = path.join(rootDir, 'src/app/api');

// Template for the new imports and provider initialization
const newImportTemplate = `import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { MongoDbService } from '@/lib/services/mongodb.service';`;

const providerInitTemplate = `// Create a MongoDB provider and service that will be used throughout this file
const mongoDbProvider = new MongoDbProvider(new MongoDbService());`;

// Function to process a file
function processFile(filePath) {
  console.log(`Processing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if the file imports getMongoDbService
  if (content.includes('import { getMongoDbService }') || 
      content.includes('import {getMongoDbService}')) {
    // Replace the import statement
    content = content.replace(
      /import\s+\{\s*getMongoDbService\s*\}\s+from\s+['"]@\/lib\/services\/mongodb\.provider['"];?/g,
      newImportTemplate
    );
    modified = true;
  } else if (content.includes('import { MongoDbProvider }')) {
    // If the file already imports MongoDbProvider but not MongoDbService, add it
    if (!content.includes('import { MongoDbService }') && !content.includes('MongoDbService')) {
      content = content.replace(
        /import\s+\{\s*MongoDbProvider\s*\}\s+from\s+['"]@\/lib\/services\/mongodb\.provider['"];?/g,
        newImportTemplate
      );
      modified = true;
    }
  }
  
  // Add provider initialization if needed
  if (modified && !content.includes('const mongoDbProvider = new MongoDbProvider')) {
    // Find the end of imports (assuming all imports are at the top of the file)
    const importEndIndex = findImportEndIndex(content);
    if (importEndIndex !== -1) {
      content = 
        content.substring(0, importEndIndex) + 
        '\n\n' + providerInitTemplate + '\n' + 
        content.substring(importEndIndex);
    }
  }
  
  // Replace getMongoDbService() calls with mongoDbProvider.getService()
  if (content.includes('getMongoDbService()')) {
    content = content.replace(
      /getMongoDbService\(\)/g,
      'mongoDbProvider.getService()'
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

// Function to find the end index of import statements
function findImportEndIndex(content) {
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex === -1) {
    return -1;
  }
  
  // Calculate the character index
  let charIndex = 0;
  for (let i = 0; i <= lastImportIndex; i++) {
    charIndex += lines[i].length + 1; // +1 for the newline
  }
  
  return charIndex;
}

// Function to recursively process directories
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(entryPath);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      processFile(entryPath);
    }
  }
}

// Main function
function main() {
  console.log('Updating API files to use the class-based MongoDB provider...');
  processDirectory(apiDir);
  console.log('Done updating API files!');
}

main(); 