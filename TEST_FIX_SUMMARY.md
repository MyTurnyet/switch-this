# Test Fix Summary

## Completed Work

We've successfully implemented the following improvements to tests:

1. **Created MongoDB Testing Utilities**
   - Added `mongodb.provider.ts` to facilitate mocking MongoDB services
   - Created `mongodb-test-utils.ts` with standardized mock implementations
   - Added example test in `mongodb-test-example.test.ts`

2. **Standardized Test Pattern**
   - Added `api-test-template.ts` with examples for API route tests
   - Created comprehensive README with documentation on how to fix tests
   - Created a script (`fix-api-tests.js`) to automate test fixes
   - Created `api-route-test-utils.ts` with utilities specifically for testing API routes

3. **Fixed Specific Tests**
   - Fixed the Dashboard component test to properly handle null data
   - Fixed the useLocationQueries test with proper mocking
   - Restored the ReactQueryProvider that was deleted
   - Fixed the layout-state API route test with proper MongoDB mocking
   - Fixed the industries API route test with a complete rewrite
   - Fixed the rolling-stock [id] API route test with proper NextResponse handling

## Current Test Status

- Increased passing test suites
- Several API route tests fixed with standardized MongoDB mocking
- Improved type safety in test mocks
- Created automation to help fix remaining tests

## Remaining Work

The remaining test failures can be fixed by:

1. **Run the Automated Fix Script on Remaining Tests**
   - Use `node scripts/fix-api-tests.js path/to/test.test.ts --add-setup` to fix each remaining test
   - Follow up with manual adjustments as needed (see README for details)

2. **Specific Test Fixes Needed**
   - Fix `/api/rolling-stock/reset/__tests__/route.test.ts` - Currently failing with initialization errors
   - Fix `/api/rolling-stock/[id]/__tests__/put.test.ts` - Currently failing with initialization errors
   - Fix `/api/industries/[id]/__tests__/route.test.ts` - Currently failing with fakeMongoService not defined
   - Fix `/api/switchlists/__tests__/route.test.ts` - Currently failing with MongoDB provider issues
   - Fix `/api/train-routes/[id]/__tests__/route.test.ts` - Currently failing with MongoDB provider issues

## Complete API Route Test Template

Below is a complete example of how to properly test a Next.js API route. This approach specifically addresses the problem with the NextResponse.json mocking that many tests are encountering:

```typescript
// File: src/app/api/example/__tests__/route.test.ts

// IMPORTANT: Need to mock modules BEFORE importing the route handlers
import { NextRequest } from 'next/server';
import { Collection } from 'mongodb';

// Mock NextResponse
const mockJson = jest.fn();
jest.mock('next/server', () => ({
  NextResponse: {
    json: mockJson
  }
}));

// Create a fake MongoDB service for testing 
import { FakeMongoDbService } from '@/test/utils/mongodb-test-utils';
const fakeMongoService = new FakeMongoDbService();

// Mock the MongoDB provider to use our fake service
jest.mock('@/lib/services/mongodb.provider', () => ({
  MongoDbProvider: jest.fn().mockImplementation(() => ({
    getService: jest.fn().mockReturnValue(fakeMongoService)
  }))
}));

// IMPORTANT: Import route handlers AFTER setting up mocks
import { GET, POST } from '../route';

describe('Example API Route', () => {
  let mockRequest: NextRequest;
  let mockCollection: Collection;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock request
    mockRequest = {
      json: jest.fn().mockResolvedValue({}),
      headers: new Map(),
      nextUrl: { searchParams: new URLSearchParams() }
    } as unknown as NextRequest;
    
    // Get collection reference
    mockCollection = fakeMongoService.getCollection('example-collection');
  });

  describe('GET', () => {
    it('should return data successfully', async () => {
      // Mock the findOne/find response
      const mockItems = [{ _id: '123', name: 'Test Item' }];
      jest.spyOn(mockCollection, 'find').mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockItems)
      } as any);
      
      // Call the API
      await GET(mockRequest);
      
      // Verify MongoDB operations were called
      expect(fakeMongoService.connect).toHaveBeenCalled();
      expect(mockCollection.find).toHaveBeenCalled();
      expect(fakeMongoService.close).toHaveBeenCalled();
      
      // Verify correct response
      expect(mockJson).toHaveBeenCalledWith(mockItems);
    });
    
    it('should handle errors properly', async () => {
      // Mock error
      jest.spyOn(fakeMongoService, 'connect').mockRejectedValue(new Error('Test error'));
      
      // Call the API
      await GET(mockRequest);
      
      // Verify error response
      expect(mockJson).toHaveBeenCalledWith(
        { error: 'Failed to fetch data' },
        { status: 500 }
      );
    });
  });

  describe('POST', () => {
    it('should create a new item', async () => {
      // Setup request data
      const newItem = { name: 'New Item' };
      mockRequest.json = jest.fn().mockResolvedValue(newItem);
      
      // Mock insertOne response
      jest.spyOn(mockCollection, 'insertOne').mockResolvedValue({
        acknowledged: true,
        insertedId: '123'
      } as any);
      
      // Call the API
      await POST(mockRequest);
      
      // Verify MongoDB operations
      expect(fakeMongoService.connect).toHaveBeenCalled();
      expect(mockCollection.insertOne).toHaveBeenCalledWith(newItem);
      expect(fakeMongoService.close).toHaveBeenCalled();
      
      // Verify response
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ 
          _id: '123',
          name: 'New Item' 
        }),
        { status: 201 }
      );
    });
  });
});
```

Developers can use this template to fix remaining API route tests by:
1. Setting up mocks BEFORE importing route handlers
2. Creating proper mock service instances
3. Using `jest.spyOn()` for collection methods
4. Testing that the JSON response is called correctly

## Full Standard Testing Approach

We've created a complete, standardized approach for testing in this application:

1. **For MongoDB Mocking**
   - Use `createMockMongoService()` or `FakeMongoDbService` from `mongodb-test-utils.ts`
   - Mock the MongoDB provider consistently
   - Use proper type annotations for collections

2. **For API Route Testing**
   - Follow the patterns in the API Route Test Template above
   - Use consistent test setup boilerplate
   - Mock NextResponse.json correctly

3. **For Future Tests**
   - Follow the examples in the `src/test/README.md` file
   - Use the automated script to create the base structure
   - Add proper assertions and mocks

## Automation Tools

1. **Fix-API-Tests Script**
   - Located at `scripts/fix-api-tests.js`
   - Automatically fixes common issues in test files
   - Can add boilerplate setup code with the `--add-setup` flag

2. **Documentation**
   - Comprehensive README in the `src/test` directory
   - Examples and templates for different test scenarios
   - Explanations of common pitfalls and solutions

## Next Steps

1. Run the automation script on all remaining failing tests
2. Make manual adjustments as needed, following the API Route Test Template
3. Ensure all tests are passing before continuing development
4. Apply the standardized approach to all new tests moving forward 