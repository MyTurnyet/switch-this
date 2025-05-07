#!/bin/bash

# Find and fix duplicate imports of getMongoService
# This script removes duplicate import lines for the MongoDB service

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Fixing duplicate MongoDB service imports...${NC}"

# Find all API route files that might have duplicate imports
FILES_TO_CHECK=$(grep -l "import.*getMongoService.*mongodb.client" --include="*.ts" -r src/app/api)

# Count of files to update
TOTAL_FILES=$(echo "$FILES_TO_CHECK" | wc -l | tr -d ' ')
FIXED_FILES=0

echo "Found $TOTAL_FILES files to check"

for file in $FILES_TO_CHECK; do
  echo -e "${BLUE}Checking${NC} $file"
  
  # Count occurrences of the import
  IMPORT_COUNT=$(grep -c "import.*getMongoService.*mongodb.client" "$file")
  
  if [ "$IMPORT_COUNT" -gt 1 ]; then
    echo -e "${RED}Found duplicate imports in${NC} $file"
    
    # Create a temp file
    TMP_FILE=$(mktemp)
    
    # First occurrence to keep
    FIRST_LINE=$(grep -n "import.*getMongoService.*mongodb.client" "$file" | head -1 | cut -d ':' -f1)
    
    # Write the first part of the file until the first import
    head -n "$FIRST_LINE" "$file" > "$TMP_FILE"
    
    # Write the rest of the file excluding any other getMongoService imports
    tail -n +$((FIRST_LINE + 1)) "$file" | grep -v "import.*getMongoService.*mongodb.client" >> "$TMP_FILE"
    
    # Replace the original file
    mv "$TMP_FILE" "$file"
    
    echo -e "${GREEN}Fixed${NC} $file"
    FIXED_FILES=$((FIXED_FILES + 1))
  else
    echo -e "${GREEN}No duplicates found in${NC} $file"
  fi
done

echo -e "${GREEN}Successfully fixed ${FIXED_FILES} out of ${TOTAL_FILES} files.${NC}"

# Make the script executable
chmod +x fix-duplicate-imports.sh 