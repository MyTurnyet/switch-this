#!/bin/bash

# Find all API route files and update them to use getMongoService from mongodb.client.ts
# This script unifies the MongoDB service access approach across all API routes

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Updating API route files to use consistent MongoDB service access...${NC}"

# Find all API route files
API_ROUTES=$(find src/app/api -name "*.ts" | grep -v "__tests__")

# Count of files to update
TOTAL_FILES=$(echo "$API_ROUTES" | wc -l | tr -d ' ')
UPDATED_FILES=0

echo "Found $TOTAL_FILES API files to process"

for file in $API_ROUTES; do
  echo -e "${BLUE}Processing${NC} $file"
  
  # Update import statement if needed
  if grep -q "import.*getMongoDbService.*mongodb.factory" "$file"; then
    sed -i '' 's/import { getMongoDbService } from ".*\/mongodb.factory"/import { getMongoService } from "@\/lib\/services\/mongodb.client"/g' "$file"
    sed -i '' 's/import { getMongoDbService } from '\''.*\/mongodb.factory'\''/import { getMongoService } from '\''@\/lib\/services\/mongodb.client'\''/g' "$file"
    
    echo -e "${GREEN}Updated import in${NC} $file"
    
    # Now update the function calls
    sed -i '' 's/getMongoDbService()/getMongoService()/g' "$file"
    
    echo -e "${GREEN}Updated function calls in${NC} $file"
    UPDATED_FILES=$((UPDATED_FILES + 1))
  elif grep -q "const mongoService.*getMongoDbService" "$file"; then
    # No import but has function call
    # First add the import if not there
    if ! grep -q "import.*mongodb.client" "$file"; then
      # Add the import after another import
      sed -i '' '1,/^import/s/^import \(.*\)$/import \1\nimport { getMongoService } from "@\/lib\/services\/mongodb.client";/' "$file"
      echo -e "${GREEN}Added missing import in${NC} $file"
    fi
    
    # Then update the function calls
    sed -i '' 's/const mongoService.*getMongoDbService()/const mongoService = getMongoService()/g' "$file"
    sed -i '' 's/const mongoService:.*getMongoDbService()/const mongoService: IMongoDbService = getMongoService()/g' "$file"
    
    echo -e "${GREEN}Updated function calls in${NC} $file"
    UPDATED_FILES=$((UPDATED_FILES + 1))
  else
    echo -e "${BLUE}No changes needed for${NC} $file"
  fi
done

echo -e "${GREEN}Successfully updated ${UPDATED_FILES} out of ${TOTAL_FILES} API files.${NC}"

# Make the script executable
chmod +x unify-mongo-service.sh 