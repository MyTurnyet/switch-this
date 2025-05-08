#!/bin/bash

# Find all API route files and update them to use the safe MongoDB connect/close pattern
# This script is a helper to automate the process of updating all route files

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Updating API route files to use safe MongoDB connect/close pattern...${NC}"

# Find all API route files
API_ROUTES=$(find src/app/api -name "route.ts")

# Count of files to update
TOTAL_FILES=$(echo "$API_ROUTES" | wc -l | tr -d ' ')
UPDATED_FILES=0

echo "Found $TOTAL_FILES API route files to process"

for file in $API_ROUTES; do
  echo -e "${BLUE}Processing${NC} $file"
  
  # Check if file contains mongoService.connect calls
  if grep -q "mongoService.connect" "$file"; then
    echo "Found mongoService.connect in $file"
    
    # Check if file already has the safe pattern
    if grep -q "typeof mongoService.connect === 'function'" "$file"; then
      echo "File already has safe connect pattern - skipping"
    else
      # Update connect calls
      echo "Updating connect calls in $file"
      sed -i '' -E 's/await mongoService\.connect\(\);/if (typeof mongoService.connect === '"'"'function'"'"') {\n      await mongoService.connect();\n    }/g' "$file"
      
      if [ $? -eq 0 ]; then
        echo -e "${GREEN}Updated connect calls in${NC} $file"
      else
        echo -e "${RED}Failed to update connect calls in${NC} $file"
      fi
    fi
  else
    echo "No mongoService.connect calls found in $file"
  fi
  
  # Check if file contains mongoService.close calls
  if grep -q "mongoService.close" "$file"; then
    echo "Found mongoService.close in $file"
    
    # Check if file already has the safe pattern
    if grep -q "typeof mongoService.close === 'function'" "$file"; then
      echo "File already has safe close pattern - skipping"
    else
      # Update close calls
      echo "Updating close calls in $file"
      sed -i '' -E 's/await mongoService\.close\(\);/if (typeof mongoService.close === '"'"'function'"'"') {\n      await mongoService.close();\n    }/g' "$file"
      
      if [ $? -eq 0 ]; then
        echo -e "${GREEN}Updated close calls in${NC} $file"
        UPDATED_FILES=$((UPDATED_FILES + 1))
      else
        echo -e "${RED}Failed to update close calls in${NC} $file"
      fi
    fi
  else
    echo "No mongoService.close calls found in $file"
  fi
done

echo -e "${GREEN}Successfully updated ${UPDATED_FILES} out of ${TOTAL_FILES} API route files.${NC}" 