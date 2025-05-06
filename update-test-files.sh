#!/bin/bash

# This script helps automate the migration of test files to use IMongoDbService directly
# rather than the previous MongoDbProvider approach

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Find all test files that import MongoDbProvider
echo -e "${YELLOW}Finding test files that use MongoDbProvider...${NC}"
TEST_FILES=$(grep -l "MongoDbProvider" src/**/__tests__/**/*.test.{ts,tsx} 2>/dev/null)

if [ -z "$TEST_FILES" ]; then
  echo -e "${GREEN}No test files found using MongoDbProvider.${NC}"
  exit 0
fi

echo -e "${YELLOW}Found $(echo "$TEST_FILES" | wc -l | tr -d ' ') test files using MongoDbProvider.${NC}"

# For each file, make the necessary changes
for FILE in $TEST_FILES; do
  echo -e "${YELLOW}Processing $FILE...${NC}"
  
  # Update imports
  sed -i '' 's/import { MongoDbProvider } from .*/import { IMongoDbService } from '\''@\/lib\/services\/mongodb.interface'\'';/g' "$FILE"
  
  # Add import for FakeMongoDbService if not already there
  if ! grep -q "FakeMongoDbService" "$FILE"; then
    sed -i '' '/IMongoDbService/a\\
import { FakeMongoDbService, createMockMongoService } from '\''@\/test\/utils\/mongodb-test-utils'\'';' "$FILE"
  fi
  
  # Replace MongoDbProvider usage patterns
  sed -i '' 's/new MongoDbProvider(\([^)]*\))/\1/g' "$FILE"
  sed -i '' 's/mongoDbProvider.getService()/mongoDbService/g' "$FILE"
  
  # Replace mock setup
  sed -i '' 's/jest.mock(.@\/lib\/services\/mongodb.provider.*)/jest.mock('\''@\/lib\/services\/mongodb.service'\'', () => ({\\
  MongoDbService: jest.fn().mockImplementation(() => mockMongoService)\\
}));/g' "$FILE"
  
  echo -e "${GREEN}Updated $FILE${NC}"
done

echo ""
echo -e "${GREEN}Migration script completed!${NC}"
echo -e "${YELLOW}Please review the changes manually to ensure correctness.${NC}"
echo -e "${YELLOW}Some manual fixes may still be needed in complex test files.${NC}"
echo -e "${YELLOW}Steps to complete the migration:${NC}"
echo -e "1. Replace MongoDbProvider imports with FakeMongoDbService"
echo -e "2. Remove the MongoDbProvider usage and mocking"
echo -e "3. Use IMongoDbService or FakeMongoDbService directly in tests"
echo -e "4. Update test setup to connect to FakeMongoDbService" 