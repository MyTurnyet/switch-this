# Test Utilities

This directory contains utilities to help with testing the application, particularly for API routes that use MongoDB.

## MongoDB Test Utilities

The `mongodb-test-utils.ts` file provides tools for mocking MongoDB in tests. These utilities make it easier to write consistent tests without complex setup.

### Key Functions

- `createMockCollection()`: Creates a mock collection with common methods
- `createMockMongoService()`: Creates a mock MongoDB service with pre-configured methods

### Usage Example

```typescript
import { createMockMongoService } from '@/test/utils/mongodb-test-utils';

// Mock the MongoDB provider
jest.mock('@/lib/services/mongodb.provider', () => {
  return {
    MongoDbProvider: jest.fn().mockImplementation(() => ({
      getService: jest.fn().mockReturnValue(createMockMongoService())
    }))
  };
});

// In your test setup
const mockMongoService = createMockMongoService();
const mockCollection = mockMongoService.getLocationsCollection();

// Configure mock responses
(mockCollection.find as jest.Mock).mockReturnValue({
  toArray: jest.fn().mockResolvedValue([{ _id: '1', name: 'Test' }])
});
```

## API Test Template

The `api-test-template.ts` file provides examples and utility functions for testing API routes.

### Key Functions

- `setupNextResponseMock()`: Sets up mocks for NextResponse
- `setupMongoDbProviderMock()`: Sets up mocks for MongoDB provider
- `exampleApiTestSetup()`: Creates common mocks needed for API tests
- `exampleGetRouteTest()`: Example of testing a GET route
- `examplePostRouteTest()`: Example of testing a POST route

### Usage Example

```typescript
import { GET } from '../route';
import { exampleApiTestSetup } from '@/test/utils/api-test-template';

describe('My API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns data correctly', async () => {
    // Setup
    const { mockRequest, mockCollection } = exampleApiTestSetup();
    const mockData = [{ _id: '1', name: 'Test' }];
    
    // Configure mocks
    (mockCollection.find as jest.Mock).mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockData)
    });
    
    // Test
    await GET(mockRequest);
    
    // Assert
    expect(NextResponse.json).toHaveBeenCalledWith(
      mockData,
      expect.any(Object)
    );
  });
});
```

## How to Fix Tests

Follow these steps to fix failing tests:

1. Replace direct MongoDB mocking with our utilities
2. Use the API test template as a reference
3. Make sure you're properly typing and casting mocks when needed
4. Use the test pattern shown in the examples 