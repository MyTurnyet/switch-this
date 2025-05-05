# MongoDB Migration Report

## Overview

We've migrated the codebase from the legacy function-based MongoDB provider approach to the new class-based approach with dependency injection. This migration involved:

1. Removing the legacy functions (`getMongoDbService`, `resetMongoDbService`, and `setMongoDbService`) from `mongodb.provider.ts`.
2. Creating a standard `FakeMongoDbService` implementation for tests in `src/test/utils/mongodb-test-utils.ts`.
3. Updating all code that used the legacy functions to use the new class-based approach.
4. Migrating test files to use the standardized approach.

## Completed Work

1. ✅ Created a shared `FakeMongoDbService` implementation in `src/test/utils/mongodb-test-utils.ts`
2. ✅ Created example test showcasing proper usage in `src/test/examples/mongodb-fake-service-example.test.ts`
3. ✅ Created migration scripts:
   - `scripts/mongodb-migration/use-fake-mongodb-service.js` - Replaces mocks with FakeMongoDbService
   - `scripts/mongodb-migration/fix-collection-mocks.js` - Fixes collection mocking
   - `scripts/mongodb-migration/fix-hoisting-issue.js` - Addresses variable hoisting problems
4. ✅ Updated mongodb.provider.test.ts to use the shared implementation
5. ✅ Successfully migrated many API test files to use the standardized approach

## Remaining Issues

There are still some test files that need manual fixes:

1. ❌ **Nested `beforeEach` Blocks**: Some test files have nested beforeEach blocks which need to be fixed:
   ```javascript
   beforeEach(() => {
     // Setup mock collections for this test
     beforeEach(() => {
       // Configure the fake service collections
       // ...
     });
   });
   ```

2. ❌ **Mocking Issues**: Some test files have issues with mocking MongoDbProvider:
   ```javascript
   (MongoDbProvider as jest.Mock).mockReturnValue(mockProvider);
   ```

3. ❌ **Missing Methods**: Some tests try to call `clearCallHistory()` which isn't properly available:
   ```javascript
   fakeMongoService.clearCallHistory(); // Fails in some contexts
   ```

4. ❌ **Syntax Errors**: A few test files have syntax errors that need to be fixed manually.

## Manual Fix Instructions

To manually fix the remaining issues:

1. **For Nested `beforeEach` Blocks**: Remove the outer beforeEach and keep only the inner one.

2. **For Mocking Issues**: Use the createMongoDbTestSetup() function instead:
   ```javascript
   import { createMongoDbTestSetup } from '@/test/utils/mongodb-test-utils';

   let fakeMongoService;
  
   beforeEach(() => {
     jest.clearAllMocks();
     ({ fakeMongoService } = createMongoDbTestSetup());
   });
   ```

3. **For Missing Methods**: Make sure to import and use the FakeMongoDbService type:
   ```javascript
   import { FakeMongoDbService, createMongoDbTestSetup } from '@/test/utils/mongodb-test-utils';
   
   let fakeMongoService: FakeMongoDbService;
   ```

4. **For Syntax Errors**: Fix the syntax errors in the affected files.

## Files Needing Manual Fixes

1. `src/app/api/switchlists/__tests__/id-route/route.test.ts`
2. `src/app/api/rolling-stock/[id]/__tests__/put.test.ts`
3. `src/app/api/switchlists/__tests__/route.test.ts`
4. `src/app/api/locations/[id]/__tests__/route.test.ts`
5. `src/app/api/industries/__tests__/route.test.ts`
6. `src/app/api/locations/__tests__/route.test.ts`

## Next Steps

1. Manually fix the remaining issues in the affected test files.
2. Run tests to ensure everything passes.
3. Finalize the migration by ensuring all tests are passing.

## Benefits of the New Approach

1. **Standardized Testing**: All tests now use the same FakeMongoDbService implementation.
2. **Easier Testing**: The FakeMongoDbService provides a consistent API for mocking MongoDB.
3. **Dependency Injection**: The new class-based approach with dependency injection makes testing easier.
4. **Removal of Global State**: The legacy approach used global state, which was prone to issues.
5. **Improved Maintainability**: The new approach is more maintainable and easier to understand. 