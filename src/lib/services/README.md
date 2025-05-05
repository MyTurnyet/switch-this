# MongoDB Provider Migration Guide

## Background
The MongoDB provider has been refactored from a function-based approach to a class-based approach with dependency injection. This allows for more flexible testing and better control over MongoDB service instances.

## Interface-Based Approach
The MongoDB service now implements the `IMongoDbService` interface, which defines the contract that any MongoDB service must follow. This allows for easier mocking and testing, as well as the ability to create alternative implementations if needed.

## Immutable Provider
The `MongoDbProvider` is now immutable - it takes a service in its constructor and maintains a reference to that service for its entire lifecycle. If you need a different service, you should create a new provider instance.

## Old Usage

```typescript
import { getMongoDbService } from '@/lib/services/mongodb.provider';

// Using the provider
const mongoService = getMongoDbService();
await mongoService.connect();
// ... use mongoService ...
await mongoService.close();

// In tests
import { resetMongoDbService, setMongoDbService } from '@/lib/services/mongodb.provider';

// Reset the service
resetMongoDbService();

// Set a custom service for testing
const mockService = new MongoDbService();
setMongoDbService(mockService);
```

## New Usage

```typescript
import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';

// Create a MongoDB service
const mongoDbService = new MongoDbService();

// Create a provider with the service
const mongoDbProvider = new MongoDbProvider(mongoDbService);

// Get the MongoDB service
const mongoService: IMongoDbService = mongoDbProvider.getService();
await mongoService.connect();
// ... use mongoService ...
await mongoService.close();

// For testing with a different service, create a new provider
const testService = new MongoDbService();
const testProvider = new MongoDbProvider(testService);
```

## Creating a Custom Implementation

You can create a custom implementation of the MongoDB service by implementing the `IMongoDbService` interface:

```typescript
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { Collection, Document, ObjectId } from 'mongodb';

export class CustomMongoDbService implements IMongoDbService {
  // Implement all methods required by the interface
  async connect(): Promise<void> {
    // Custom implementation
  }
  
  async close(): Promise<void> {
    // Custom implementation
  }
  
  // ... implement other methods
}

// Then use it with the provider
const customService = new CustomMongoDbService();
const provider = new MongoDbProvider(customService);
```

## Mocking in Tests

When mocking the MongoDB service in tests, you can create a mock that implements the interface:

```typescript
const mockMongoDbService: jest.Mocked<IMongoDbService> = {
  connect: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  getCollection: jest.fn().mockReturnValue(mockCollection),
  getRollingStockCollection: jest.fn(),
  getIndustriesCollection: jest.fn(),
  getLocationsCollection: jest.fn(),
  getTrainRoutesCollection: jest.fn(),
  getLayoutStateCollection: jest.fn(),
  getSwitchlistsCollection: jest.fn(),
  toObjectId: jest.fn()
} as unknown as jest.Mocked<IMongoDbService>;

// Use it with the provider
const provider = new MongoDbProvider(mockMongoDbService);

// To switch to a different mock service, create a new provider
const anotherMockService = { /* ... */ } as unknown as jest.Mocked<IMongoDbService>;
const anotherProvider = new MongoDbProvider(anotherMockService);
```

## Compatibility
For backward compatibility, the old functions (`getMongoDbService`, `resetMongoDbService`, and `setMongoDbService`) are still available but marked as deprecated. These functions use a singleton instance of the `MongoDbProvider` class under the hood.

## Mocking in Tests
When mocking the provider in tests, you should now mock both the class and the backward compatibility functions if needed:

```typescript
jest.mock('@/lib/services/mongodb.provider', () => {
  const mockGetService = jest.fn();
  
  // Mock the MongoDbProvider class
  const MockMongoDbProvider = jest.fn().mockImplementation(() => ({
    getService: mockGetService
  }));
  
  return {
    MongoDbProvider: MockMongoDbProvider,
    getMongoDbService: jest.fn()
  };
});
```

## Migration Plan
1. For new code, use the class-based approach with dependency injection
2. For existing code, you can continue using the old functions until it's convenient to update
3. When updating tests, consider switching to the class-based approach for better testability 