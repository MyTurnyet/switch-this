#!/bin/bash

# This script helps automate the migration from MongoDbProvider to direct MongoDbService usage

# Search for files that use MongoDbProvider
echo "Finding files that use MongoDbProvider..."
FILES=$(grep -l "new MongoDbProvider" src/app/api/**/*.ts)

echo "Found the following files:"
echo "$FILES"
echo ""
echo "Migration steps for each file:"
echo "1. Import IMongoDbService instead of MongoDbProvider"
echo "2. Create mongoService directly: const mongoService: IMongoDbService = new MongoDbService();"
echo "3. Remove mongoDbProvider.getService() calls"
echo "4. Fix any type issues with mongoService parameters"
echo ""
echo "Files to manually review after automatic changes:"
echo "$FILES" 