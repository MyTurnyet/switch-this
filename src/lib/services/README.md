# MongoDB Provider Migration Guide

## Background
The MongoDB provider has been refactored from a function-based approach to a class-based approach with dependency injection. This allows for more flexible testing and better control over MongoDB service instances.

## Interface-Based Approach
The MongoDB service now implements the `IMongoDbService` interface, which defines the contract that any MongoDB service must follow. This allows for easier mocking and testing, as well as the ability to create alternative implementations if needed.

## Immutable Provider
The `MongoDbProvider` is now immutable - it takes a service in its constructor and maintains a reference to that service for its entire lifecycle. If you need a different service, you should create a new provider instance.

## Legacy vs. Modern Usage

### Legacy Usage (Deprecated)

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

### Modern Usage (Recommended)

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

## Dependency Injection in Services

When creating services that depend on MongoDB, it's recommended to use dependency injection. Here's an example service:

```typescript
import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { IMongoDbService } from '@/lib/services/mongodb.interface';
import { MongoDbService } from '@/lib/services/mongodb.service';

export class MyService {
  private readonly mongoDbProvider: MongoDbProvider;

  // Accept either a provider or a service in the constructor
  constructor(mongoDbProviderOrService: MongoDbProvider | IMongoDbService) {
    if (mongoDbProviderOrService instanceof MongoDbProvider) {
      this.mongoDbProvider = mongoDbProviderOrService;
    } else {
      // It's an IMongoDbService, so create a provider with it
      this.mongoDbProvider = new MongoDbProvider(mongoDbProviderOrService);
    }
  }

  // Factory method for creating with default service
  static withDefaultService(): MyService {
    return new MyService(new MongoDbService());
  }

  // Factory method for creating with custom service
  static withService(mongoDbService: IMongoDbService): MyService {
    return new MyService(mongoDbService);
  }

  // Example method using MongoDB
  async getData(collectionName: string) {
    const mongoService = this.mongoDbProvider.getService();
    
    try {
      await mongoService.connect();
      const collection = mongoService.getCollection(collectionName);
      return await collection.find().toArray();
    } finally {
      await mongoService.close();
    }
  }
}
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
// Create a mock MongoDB service
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

## Best Practices

1. **Use Dependency Injection:** Always pass MongoDB services to your application classes through their constructors.

2. **Program to Interfaces:** Use the `IMongoDbService` interface instead of the concrete `MongoDbService` class in your code.

3. **Create New Providers for Different Services:** If you need to use a different MongoDB service, create a new provider instance.

4. **Use Factory Methods:** Consider adding static factory methods to your services to simplify their creation.

5. **Handle Connections Properly:** Always connect before using the database and close the connection when done, preferably in a try/finally block.

6. **Mock for Testing:** Use the interface to create mocks for unit testing.

## Compatibility

The legacy functions (`getMongoDbService`, `resetMongoDbService`, and `setMongoDbService`) are still available for backward compatibility, but they are marked as deprecated and will be removed in a future release. You should migrate to the new class-based approach as soon as possible. 