# Test Migration Guide for MongoDbService Refactoring

## Overview
This guide provides instructions on updating test files after the refactoring from `MongoDbProvider` to direct `MongoDbService` usage.

## Common Issues in Tests
- Tests are currently mocking `MongoDbProvider` but the codebase now uses `MongoDbService` directly
- Jest mocks expecting `MongoDbProvider` need to be updated
- Some tests have nested `beforeEach` calls that cause errors
- Some tests are using `clearCallHistory()` which isn't available on all mock implementations

## Step-by-Step Migration

### 1. Update the imports
```javascript
// Before
import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { MongoDbService } from '@/lib/services/mongodb.service';

// After
import { FakeMongoDbService } from '@/test/utils/mongodb-test-utils';
import { MongoDbService } from '@/lib/services/mongodb.service'; // If still needed
```

### 2. Update the MongoDB mocking
```javascript
// Before
const fakeMongoService = {
  connect: jest.fn(),
  close: jest.fn(),
  // Other methods...
};
const mockProvider = new MongoDbProvider(fakeMongoService);
(MongoDbProvider as jest.Mock).mockReturnValue(mockProvider);

// After
const fakeMongoService = new FakeMongoDbService();

// Mock the mongodb service
jest.mock('@/lib/services/mongodb.service', () => {
  return {
    MongoDbService: jest.fn().mockImplementation(() => {
      return fakeMongoService;
    })
  };
});
```

### 3. Fix nested beforeEach blocks
Look for and fix any nested `beforeEach` blocks, which are not allowed in Jest:

```javascript
// Before - incorrect nesting
beforeEach(() => {
  beforeEach(() => {
    // Setup code
  });
});

// After - fixed
beforeEach(() => {
  // Setup code
});
```

### 4. Update test assertions
Tests should directly reference `fakeMongoService` methods:

```javascript
// Before
expect(mockMongoService.connect).toHaveBeenCalled();
expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 'some-id' });

// After
expect(fakeMongoService.connect).toHaveBeenCalled();
expect(fakeMongoService.getRollingStockCollection().findOne)
  .toHaveBeenCalledWith({ _id: fakeMongoService.toObjectId('some-id') });
```

### 5. Clear call history correctly
The `FakeMongoDbService` class provides a `clearCallHistory()` method:

```javascript
// Before
jest.clearAllMocks();

// After
jest.clearAllMocks();
fakeMongoService.clearCallHistory();
```

## Working Example

Here's a complete working example:

```javascript
import { jest } from '@jest/globals';
import { NextResponse } from 'next/server';
import { GET } from '../route';
import { FakeMongoDbService } from '@/test/utils/mongodb-test-utils';

// Create a fake mongo service for testing
const fakeMongoService = new FakeMongoDbService();

// Mock the mongodb service
jest.mock('@/lib/services/mongodb.service', () => {
  return {
    MongoDbService: jest.fn().mockImplementation(() => {
      return fakeMongoService;
    })
  };
});

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({ data, options }))
  }
}));

describe('API Tests', () => {
  beforeEach(() => {
    // Clear previous calls
    fakeMongoService.clearCallHistory();
    
    // Setup mock collection behavior
    const collection = fakeMongoService.getCollection('myCollection');
    jest.spyOn(collection, 'findOne').mockResolvedValue({ _id: 'id1', name: 'Test' });
    
    // Reset NextResponse mock
    jest.mocked(NextResponse.json).mockClear();
  });
  
  it('should retrieve data correctly', async () => {
    const request = {} as Request;
    const params = { id: 'id1' };
    
    await GET(request, { params });
    
    expect(fakeMongoService.connect).toHaveBeenCalled();
    expect(fakeMongoService.getCollection).toHaveBeenCalledWith('myCollection');
    expect(fakeMongoService.close).toHaveBeenCalled();
  });
});
```

## Reference
For a full working example, see: `src/lib/services/__tests__/mongodb-migration.test.ts` 