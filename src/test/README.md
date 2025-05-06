# Switch-This Testing Utilities

This directory contains utilities for testing the Switch-This application, with a focus on standardized patterns for API route tests and MongoDB mocking.

## MongoDB Testing Utilities

The `mongodb-test-utils.ts` file provides standardized utilities for mocking MongoDB in tests:

- `createMockCollection()`: Creates a mock MongoDB collection with jest mocks for all common methods
- `createMockMongoService()`: Creates a mock MongoDB service that implements the `IMongoDbService` interface
- `FakeMongoDbService`: A class that implements the `IMongoDbService` interface with jest mocks

## API Route Testing

### API Test Template

The `api-test-template.ts` file provides example patterns for testing API routes.

### API Route Test Utils

The `api-route-test-utils.ts` file provides utility functions for testing Next.js API routes:

- `setupApiRouteTest()`: Sets up NextResponse and MongoDB mocks for API route testing
- `createMockNextRequest()`: Creates a mock Next.js request object
- `createMockRouteParams()`: Creates mock route parameters for routes with dynamic segments

## Common Problems and Solutions

### NextResponse Mocking Issues

A common issue in the tests is correctly mocking the NextResponse.json method. The proper approach is:

1. Mock NextResponse.json **before** importing route handlers
2. Use the mockJson function in assertions

Example:
```typescript
// Mock NextResponse
const mockJson = jest.fn();
jest.mock('next/server', () => ({
  NextResponse: {
    json: mockJson
  }
}));

// Import route handlers after mocking
import { GET, POST } from '../route';

// In your test
expect(mockJson).toHaveBeenCalledWith({ data: 'example' });
```

### MongoDB Mocking Issues

When mocking MongoDB, use the following approach:

1. Create a fake MongoDB service instance with `FakeMongoDbService`
2. Mock the MongoDB provider to use your fake service
3. Use jest.spyOn() to customize collection method responses

Example:
```typescript
// Create a fake service
const fakeMongoService = new FakeMongoDbService();

// Mock the provider
jest.mock('@/lib/services/mongodb.provider', () => ({
  MongoDbProvider: jest.fn().mockImplementation(() => ({
    getService: jest.fn().mockReturnValue(fakeMongoService)
  }))
}));

// In your test
const mockCollection = fakeMongoService.getCollection('collection-name');
jest.spyOn(mockCollection, 'findOne').mockResolvedValue({ _id: '123', name: 'Example' });
```

## Automated Test Fixing

For quickly fixing test files, use the `fix-api-tests.js` script:

```bash
# Fix an existing test file
node scripts/fix-api-tests.js path/to/test/file.test.ts

# Create a new test file with standard boilerplate
node scripts/fix-api-tests.js path/to/test/file.test.ts --add-setup
```

The script will:
1. Fix NextResponse mocking issues
2. Ensure MongoDB mocking follows best practices
3. Add standardized boilerplate code with the `--add-setup` flag
4. Create a backup of your original file

## Complete Testing Example

See the file `TEST_FIX_SUMMARY.md` in the project root for a complete example of correctly testing an API route. 