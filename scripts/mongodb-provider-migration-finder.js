#!/usr/bin/env node

/**
 * This script scans the codebase for usages of the deprecated MongoDB provider functions
 * and generates a report of files that need to be updated to use the new class-based approach.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patterns to search for
const patterns = [
  'getMongoDbService',
  'resetMongoDbService',
  'setMongoDbService'
];

// File extensions to scan
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// Directories to exclude
const excludeDirs = [
  'node_modules',
  '.next',
  'coverage',
  'dist',
  '.git'
];

// Results storage
const results = {
  fileCount: 0,
  usageCount: 0,
  files: []
};

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fileHasMatches = false;
    
    // Find all matches in the file
    const matches = patterns.flatMap(pattern => {
      const regex = new RegExp(`\\b${pattern}\\b`, 'g');
      const matches = content.match(regex) || [];
      return matches.map(match => ({ pattern: match, line: getLineNumber(content, match) }));
    });
    
    if (matches.length > 0) {
      results.usageCount += matches.length;
      results.fileCount++;
      fileHasMatches = true;
      
      // Add file to results
      results.files.push({
        filePath: filePath,
        matches: matches
      });
    }
    
    return fileHasMatches;
  } catch (err) {
    console.error(`Error scanning file ${filePath}:`, err.message);
    return false;
  }
}

function getLineNumber(content, match) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(match)) {
      return i + 1;
    }
  }
  return -1;
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !excludeDirs.includes(file)) {
      walkDirectory(filePath);
    } else if (stat.isFile() && extensions.includes(path.extname(file))) {
      scanFile(filePath);
    }
  }
}

// Alternative: Use grep for faster scanning
function scanWithGrep() {
  try {
    const baseDir = path.resolve(__dirname, '..');
    const grepPatterns = patterns.join('\\|');
    const excludePattern = excludeDirs.map(dir => `--exclude-dir=${dir}`).join(' ');
    const extensionPattern = extensions.join(',');
    
    const cmd = `grep -r "${grepPatterns}" ${excludePattern} --include="*{${extensionPattern}}" ${baseDir}`;
    const output = execSync(cmd, { encoding: 'utf8' });
    
    // Parse the grep output
    const lines = output.split('\n').filter(Boolean);
    const fileMap = new Map();
    
    lines.forEach(line => {
      const [filePath, ...rest] = line.split(':');
      const content = rest.join(':').trim();
      
      // Extract the matched pattern
      const matchedPattern = patterns.find(pattern => content.includes(pattern));
      
      if (matchedPattern) {
        if (!fileMap.has(filePath)) {
          fileMap.set(filePath, []);
          results.fileCount++;
        }
        
        fileMap.get(filePath).push({
          pattern: matchedPattern,
          line: -1 // Line number not easily available in this approach
        });
        
        results.usageCount++;
      }
    });
    
    // Convert file map to results
    fileMap.forEach((matches, filePath) => {
      results.files.push({
        filePath,
        matches
      });
    });
    
    return true;
  } catch (err) {
    console.error('Error using grep:', err.message);
    return false;
  }
}

// Main execution
console.log('Scanning for MongoDB provider usages...');

const grepSuccess = scanWithGrep();

if (!grepSuccess) {
  console.log('Falling back to manual directory scan...');
  walkDirectory(path.resolve(__dirname, '..'));
}

// Generate report
console.log('\nMongoDB Provider Migration Report');
console.log('=================================');
console.log(`Found ${results.usageCount} usages in ${results.fileCount} files.`);
console.log('\nFiles to update:');

results.files.forEach(file => {
  console.log(`\n${file.filePath}`);
  file.matches.forEach(match => {
    const lineInfo = match.line > 0 ? `line ${match.line}` : '';
    console.log(`  - ${match.pattern} ${lineInfo}`);
  });
});

console.log('\nMigration Guide:');
console.log('1. Import the new class: import { MongoDbProvider } from \'@/lib/services/mongodb.provider\';');
console.log('2. Create a provider: const mongoDbProvider = new MongoDbProvider(new MongoDbService());');
console.log('3. Replace getMongoDbService() with mongoDbProvider.getService()');
console.log('4. Replace resetMongoDbService() with new MongoDbProvider(new MongoDbService())');
console.log('5. Replace setMongoDbService(customService) with new MongoDbProvider(customService)');
console.log('\nSee src/lib/services/README.md for detailed migration instructions.');

console.log('\nDone!'); 