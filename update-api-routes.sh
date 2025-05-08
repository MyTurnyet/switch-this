#!/bin/bash

# Find all API route files and update them to use the MongoDB factory
# This script is a helper to automate the process of updating all route files

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Updating API route files to use MongoDB factory...${NC}"

# Find all API route files
API_ROUTES=$(find src/app/api -name "route.ts")

# Count of files to update
TOTAL_FILES=$(echo "$API_ROUTES" | wc -l)
UPDATED_FILES=0

for file in $API_ROUTES; do
  echo -e "${BLUE}Processing${NC} $file"
  
  # Check if file already uses the factory
  if grep -q "getMongoDbService" "$file"; then
    echo -e "${GREEN}File already using factory - skipping${NC}"
    continue
  fi
  
  # Replace import statement
  sed -i '' 's/import { MongoDbService } from .\/lib\/services\/mongodb.service./import { getMongoDbService } from \"\@\/lib\/services\/mongodb.factory\"/g' "$file"
  
  # Replace service instantiation with factory getter
  sed -i '' 's/const mongoService: IMongoDbService = new MongoDbService();/const mongoService: IMongoDbService = getMongoDbService();/g' "$file"
  sed -i '' 's/const mongoService = new MongoDbService();/const mongoService = getMongoDbService();/g' "$file"
  sed -i '' 's/const mongoService: IMongoDbService = new MongoDbService(/const mongoService: IMongoDbService = getMongoDbService(/g' "$file"
  
  UPDATED_FILES=$((UPDATED_FILES + 1))
  echo -e "${GREEN}Updated${NC} $file"
done

echo -e "${GREEN}Successfully updated${NC} $UPDATED_FILES out of $TOTAL_FILES API route files."

# Make the script executable
chmod +x update-api-routes.sh 