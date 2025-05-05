# Enhanced API Service Layer

This document outlines the improvements made to the API service layer in our application.

## Motivation

Our previous API service implementation had several issues:

1. Inconsistent error handling across services
2. Duplication of fetch logic
3. Lack of retry mechanisms for flaky network connections
4. Inconsistent API response handling

## Core Components

### 1. EnhancedBaseService

An abstract base class that provides consistent methods for common API operations:

- `getAll()`: Fetch all items of a resource
- `getById(id)`: Fetch a specific item by ID
- `create(data)`: Create a new item
- `update(id, data)`: Update an existing item
- `delete(id)`: Delete an item

**Features:**
- Automatic retry logic for failed requests
- Consistent error handling
- Standardized request/response processing

### 2. Enhanced API Utilities

#### `executeRequest(options)`

A flexible function that handles API requests with:
- Proper error extraction from response bodies
- Consistent error formatting
- Content-type handling
- Proper HTTP status code handling

#### `fetchWithErrorHandling(endpoint)`

A simpler function specifically for GET requests that fetch collections of items.

#### `createApiError(message, status, statusText)`

Helper for creating standardized error objects with HTTP status information.

## Using the Enhanced Services

### Creating a Service

To create a service for a new resource type:

```typescript
import { EnhancedBaseService } from './EnhancedBaseService';
import { MyResourceType } from '../types/models';

export class MyResourceService extends EnhancedBaseService<MyResourceType> {
  constructor() {
    super('/api/my-resource');
  }
  
  // Add resource-specific methods here
}
```

### Using Retry Logic

```typescript
// Create a service instance
const service = new MyResourceService();

// Configure retry behavior
service.setRetryOptions({
  maxRetries: 3,
  retryDelay: 500 // milliseconds
});

// All service methods will now use these retry settings
```

## Benefits

1. **Reduced code duplication**: Common API logic is centralized
2. **Improved error handling**: Errors are consistently formatted and include HTTP status information
3. **Better user experience**: Automatic retries handle transient network issues
4. **Easier maintenance**: Service implementations are simpler and more consistent
5. **Better testability**: Mock the base class instead of individual fetch calls

## Migration Guide

To migrate an existing service to use the enhanced base service:

1. Extend `EnhancedBaseService` instead of manually implementing fetch calls
2. Remove duplicate error handling logic
3. Use the protected `executeWithRetry` method for custom API calls

## Examples

### Before

```typescript
async getAllItems(): Promise<Item[]> {
  try {
    const response = await fetch('/api/items');
    if (!response.ok) {
      throw new Error('Failed to fetch items');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
}
```

### After

```typescript
// The base service handles all the details
async getAllItems(): Promise<Item[]> {
  return this.getAll();
}
```

## Testing

The enhanced services are designed for testability:

1. Mock the base class methods in unit tests
2. Test specific error handling in service-specific methods
3. Use the provided test helpers for common testing scenarios 