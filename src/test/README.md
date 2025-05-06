# Switch-This Testing Utilities

This directory contains utilities for testing the Switch-This application, with a focus on standardized patterns for API route tests and MongoDB mocking.

## MongoDB Testing Utilities

The `mongodb-test-utils.ts` file provides standardized utilities for mocking MongoDB in tests:

- `createMockCollection()`: Creates a mock MongoDB collection with jest mocks for all common methods
- `createMockMongoService()`: Creates a mock MongoDB service that implements the `IMongoDbService` interface
- `FakeMongoDbService`: A class that implements the `IMongoDbService` interface with jest mocks

## API Test Template

The `api-test-template.ts` file provides example patterns for testing API routes:

- `setupNextResponseMock()`: Sets up mocks for NextResponse
- `setupMongoDbProviderMock()`: Sets up mocks for the MongoDB provider
- `exampleApiTestSetup()`: Creates a complete test setup for API routes
- `exampleGetRouteTest()`: Shows how to test GET API routes
- `examplePostRouteTest()`: Shows how to test POST API routes

## How to Fix Tests

1. **Use the Automated Script**

   We've created a script to help replace old MongoDB mocking patterns:

   ```bash
   node scripts/fix-api-tests.js path/to/your/test.test.ts
   ```

   Add the `--add-setup` flag to automatically add the test setup boilerplate:

   ```bash
   node scripts/fix-api-tests.js path/to/your/test.test.ts --add-setup
   ```

2. **Standardized Import Pattern**

   ```typescript
   import { NextRequest } from 'next/server';
   import { NextResponse } from 'next/server';
   import { GET, POST } from '../route';
   import { createMockMongoService } from '@/test/utils/mongodb-test-utils';
   import { Collection, Document, ObjectId } from 'mongodb';
   ```

3. **Standardized Mocking Pattern**

   ```typescript
   // Mock NextResponse
   jest.mock('next/server', () => ({
     NextResponse: {
       json: jest.fn()
     }
   }));

   // Mock the MongoDB provider
   jest.mock('@/lib/services/mongodb.provider', () => {
     return {
       MongoDbProvider: jest.fn().mockImplementation(() => ({
         getService: jest.fn().mockReturnValue(createMockMongoService())
       }))
     };
   });
   ```

4. **Standardized Test Setup**

   ```typescript
   let mockRequest: NextRequest;
   let mockRequestJson: jest.Mock;
   let mockMongoService: ReturnType<typeof createMockMongoService>;
   let mockCollection: jest.Mocked<Collection<Document>>;

   beforeEach(() => {
     jest.clearAllMocks();
     
     // Setup mock request
     mockRequestJson = jest.fn();
     mockRequest = {
       json: mockRequestJson
     } as unknown as NextRequest;
     
     // Setup MongoDB mock
     mockMongoService = createMockMongoService();
     mockCollection = mockMongoService.getCollection('your-collection-name') as jest.Mocked<Collection<Document>>;
     
     // Or use the specific getter method:
     // mockCollection = mockMongoService.getIndustriesCollection() as jest.Mocked<Collection<Document>>;
   });
   ```

5. **Mocking Collection Methods**

   ```typescript
   // Setup mock responses
   (mockCollection.find as jest.Mock).mockReturnValue({
     toArray: jest.fn().mockResolvedValue(mockData)
   });
   
   // Mock findOne
   (mockCollection.findOne as jest.Mock).mockResolvedValue(mockItem);
   
   // Mock insertOne
   (mockCollection.insertOne as jest.Mock).mockResolvedValue({ 
     insertedId: 'new-id', 
     acknowledged: true 
   });
   
   // Mock updateOne
   (mockCollection.updateOne as jest.Mock).mockResolvedValue({ 
     matchedCount: 1,
     modifiedCount: 1,
     acknowledged: true 
   });
   
   // Mock deleteOne
   (mockCollection.deleteOne as jest.Mock).mockResolvedValue({ 
     deletedCount: 1,
     acknowledged: true 
   });
   ```

6. **Handling API Responses**

   ```typescript
   // Call the API handler
   await GET(mockRequest);
   
   // Verify response
   expect(NextResponse.json).toHaveBeenCalledWith(
     mockData,
     expect.any(Object) // Optional status/headers
   );
   
   // Verify with specific options
   expect(NextResponse.json).toHaveBeenCalledWith(
     { message: 'Success' },
     { status: 201 }
   );
   ```

7. **Testing Error Handling**

   ```typescript
   // Setup mock to throw an error
   mockMongoService.connect.mockRejectedValue(new Error('Database error'));
   
   // Call the API handler
   await GET(mockRequest);
   
   // Verify error response
   expect(NextResponse.json).toHaveBeenCalledWith(
     { error: 'Error message' },
     { status: 500 }
   );
   ```

## Common Pitfalls

1. **Type Assertions**: Always use type assertions with the mock collections to satisfy the TypeScript compiler:
   ```typescript
   mockCollection = mockMongoService.getCollection('collection-name') as jest.Mocked<Collection<Document>>;
   ```

2. **Mock Method Chaining**: When mocking methods that return a chainable object (like `find()`), make sure to mock the entire chain:
   ```typescript
   (mockCollection.find as jest.Mock).mockReturnValue({
     toArray: jest.fn().mockResolvedValue([/* data */])
   });
   ```

3. **Verify MongoDB Service Methods**: Don't forget to verify all the MongoDB service methods:
   ```typescript
   expect(mockMongoService.connect).toHaveBeenCalled();
   expect(mockMongoService.getRollingStockCollection).toHaveBeenCalled();
   expect(mockMongoService.close).toHaveBeenCalled();
   ```

4. **Mocking Request Body**: When testing POST/PUT endpoints, don't forget to mock the request body:
   ```typescript
   mockRequestJson.mockResolvedValue({ name: 'New Item' });
   ```

## Example Test

Here's a complete example of a test for a GET API route:

```typescript
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { GET } from '../route';
import { createMockMongoService } from '@/test/utils/mongodb-test-utils';
import { Collection, Document } from 'mongodb';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn()
  }
}));

// Mock the MongoDB provider
jest.mock('@/lib/services/mongodb.provider', () => {
  return {
    MongoDbProvider: jest.fn().mockImplementation(() => ({
      getService: jest.fn().mockReturnValue(createMockMongoService())
    }))
  };
});

describe('API Route Test', () => {
  let mockRequest: NextRequest;
  let mockMongoService: ReturnType<typeof createMockMongoService>;
  let mockCollection: jest.Mocked<Collection<Document>>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock request
    mockRequest = {} as NextRequest;
    
    // Setup MongoDB mock
    mockMongoService = createMockMongoService();
    mockCollection = mockMongoService.getCollection('test-collection') as jest.Mocked<Collection<Document>>;
  });

  it('should return data successfully', async () => {
    // Mock data
    const mockData = [{ _id: '1', name: 'Test' }];
    
    // Setup mock response
    (mockCollection.find as jest.Mock).mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockData)
    });
    
    // Call the API
    await GET(mockRequest);
    
    // Verify MongoDB methods
    expect(mockMongoService.connect).toHaveBeenCalled();
    expect(mockMongoService.close).toHaveBeenCalled();
    
    // Verify response
    expect(NextResponse.json).toHaveBeenCalledWith(mockData);
  });
});
``` 