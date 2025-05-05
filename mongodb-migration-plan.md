# MongoDB Provider Migration Plan

## Overview
This document outlines the plan to remove the `MongoDbProvider` class and replace it with direct usage of `MongoDbService` typed as `IMongoDbService`. This simplifies the codebase by removing an unnecessary layer of indirection.

## Current Pattern
```typescript
import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { MongoDbService } from '@/lib/services/mongodb.service';

// Create a MongoDB provider and service
const mongoDbProvider = new MongoDbProvider(new MongoDbService());

// Get the MongoDB service in each function
export async function someFunction() {
  const mongoService = mongoDbProvider.getService();
  // Use mongoService...
}
```

## Target Pattern
```typescript
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';

// Create a MongoDB service directly
const mongoService: IMongoDbService = new MongoDbService();

// Use mongoService directly in each function
export async function someFunction() {
  // Use mongoService...
}
```

## Migration Steps

### 1. For each API endpoint file:
- Update imports:
  - Remove `import { MongoDbProvider } from '@/lib/services/mongodb.provider'`
  - Add `import { IMongoDbService } from '@/lib/services/mongodb.interface'`
- Replace `const mongoDbProvider = new MongoDbProvider(new MongoDbService())` with `const mongoService: IMongoDbService = new MongoDbService()`
- Remove `const mongoService = mongoDbProvider.getService()` lines from each function
- Update all function parameters where `mongoService` is passed from `MongoDbService` to `IMongoDbService`

### 2. For test files:
- Update mocking approach to mock `MongoDbService` directly instead of using `MongoDbProvider`
- Use `FakeMongoDbService` directly without wrapping in a provider
- Test file updates are more complex and require specific steps - see the Test Migration section below.

### 3. Verify changes:
- Run the new test file to verify direct service usage: `src/lib/services/__tests__/mongodb-migration.test.ts`
- Run the entire test suite to ensure all tests pass
- Manually test the application to ensure it works correctly

### 4. After all instances are migrated:
- Mark `MongoDbProvider` as deprecated with JSDoc
- Eventually remove the `MongoDbProvider` class and its test files

## Files to Update
The following files need to be updated (partial list, full list in migration script output):

1. API Endpoints:
   - src/app/api/industries/route.ts
   - src/app/api/industries/[id]/route.ts
   - src/app/api/locations/route.ts
   - src/app/api/locations/[id]/route.ts
   - src/app/api/rolling-stock/route.ts
   - src/app/api/rolling-stock/[id]/route.ts
   - src/app/api/switchlists/route.ts
   - src/app/api/switchlists/[id]/route.ts
   - And many more...

2. Test Files:
   - Various test files that mock `MongoDbProvider`

## Test Migration
Many test files have failures after updating API endpoints. Here are the key issues and solutions:

### Common Issues
- Nested `beforeEach` blocks causing Jest errors
- Tests mocking `MongoDbProvider` which no longer exists in the code
- Tests using `clearCallHistory()` which doesn't exist on all mock implementations
- Type errors with mocked collections

### Test Migration Steps
1. Update imports:
   - Replace `MongoDbProvider` with `FakeMongoDbService` from test utils
   
2. Fix MongoDB service mocking:
   ```javascript
   // Create a fake mongo service for testing
   const fakeMongoService = new FakeMongoDbService();

   // Mock the mongodb service (not the provider)
   jest.mock('@/lib/services/mongodb.service', () => {
     return {
       MongoDbService: jest.fn().mockImplementation(() => {
         return fakeMongoService;
       })
     };
   });
   ```

3. Fix nested `beforeEach` blocks by consolidating them into a single block

4. Update assertions to reference `fakeMongoService` methods directly

5. Use the `clearCallHistory()` method from `FakeMongoDbService` correctly

For detailed examples and a guide, see `test-migration-guide.md`.

## Completion Criteria
The migration is complete when:
1. All instances of `MongoDbProvider` have been replaced with direct `MongoDbService` usage
2. All tests are passing
3. The application functions correctly
4. The `MongoDbProvider` class has been marked as deprecated 