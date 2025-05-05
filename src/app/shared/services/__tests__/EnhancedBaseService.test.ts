import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';

// First, mock the module before any imports
jest.mock('../apiUtils', () => ({
  fetchWithErrorHandling: jest.fn(),
  executeRequest: jest.fn(),
  createApiError: jest.fn((message, status, statusText) => {
    const error = new Error(message);
    (error as any).status = status;
    (error as any).statusText = statusText;
    return error;
  }),
  ApiError: class ApiError extends Error {
    status?: number;
    statusText?: string;
  }
}));

// Then import the mocked functions
import { fetchWithErrorHandling, executeRequest } from '../apiUtils';
import { EnhancedBaseService } from '../EnhancedBaseService';

// Define a test model
interface TestModel {
  _id: string;
  name: string;
}

class TestService extends EnhancedBaseService<TestModel> {
  constructor() {
    super('/api/test');
  }
}

describe('EnhancedBaseService', () => {
  let service: TestService;
  
  // Test data
  const mockItems = [
    { _id: '1', name: 'Test 1' },
    { _id: '2', name: 'Test 2' }
  ];
  const mockItem = { _id: '1', name: 'Test 1' };
  
  beforeEach(() => {
    service = new TestService();
    
    // Reset mocks
    (fetchWithErrorHandling as jest.Mock).mockReset();
    (executeRequest as jest.Mock).mockReset();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getAll', () => {
    it('should use fetchWithErrorHandling to get all items', async () => {
      // Setup mock
      (fetchWithErrorHandling as jest.Mock).mockResolvedValueOnce(mockItems);
      
      // Execute
      const result = await service.getAll();
      
      // Verify
      expect(fetchWithErrorHandling).toHaveBeenCalledWith('/api/test');
      expect(result).toEqual(mockItems);
    });
    
    it('should properly handle and propagate errors', async () => {
      // Setup mock to throw an error
      const mockError = new Error('Network error');
      (fetchWithErrorHandling as jest.Mock).mockRejectedValueOnce(mockError);
      
      // Execute and verify it throws
      await expect(service.getAll()).rejects.toThrow('Network error');
    });
  });
  
  describe('getById', () => {
    it('should use executeRequest to get an item by id', async () => {
      // Setup mock
      (executeRequest as jest.Mock).mockResolvedValueOnce(mockItem);
      
      // Execute
      const result = await service.getById('1');
      
      // Verify
      expect(executeRequest).toHaveBeenCalledWith({
        url: '/api/test/1',
        method: 'GET',
        errorMessage: 'Failed to fetch item with id 1'
      });
      expect(result).toEqual(mockItem);
    });
  });
  
  describe('update', () => {
    it('should use executeRequest to update an item', async () => {
      // Setup mock
      (executeRequest as jest.Mock).mockResolvedValueOnce(mockItem);
      const updateData = { name: 'Updated Name' };
      
      // Execute
      const result = await service.update('1', updateData);
      
      // Verify
      expect(executeRequest).toHaveBeenCalledWith({
        url: '/api/test/1',
        method: 'PUT',
        body: updateData,
        errorMessage: 'Failed to update item with id 1'
      });
      expect(result).toEqual(mockItem);
    });
  });
  
  describe('create', () => {
    it('should use executeRequest to create an item', async () => {
      // Setup mock
      (executeRequest as jest.Mock).mockResolvedValueOnce(mockItem);
      const newData = { name: 'New Item' } as any;
      
      // Execute
      const result = await service.create(newData);
      
      // Verify
      expect(executeRequest).toHaveBeenCalledWith({
        url: '/api/test',
        method: 'POST',
        body: newData,
        errorMessage: 'Failed to create item'
      });
      expect(result).toEqual(mockItem);
    });
  });
  
  describe('delete', () => {
    it('should use executeRequest to delete an item', async () => {
      // Setup mock
      (executeRequest as jest.Mock).mockResolvedValueOnce(undefined);
      
      // Execute
      await service.delete('1');
      
      // Verify
      expect(executeRequest).toHaveBeenCalledWith({
        url: '/api/test/1',
        method: 'DELETE',
        errorMessage: 'Failed to delete item with id 1'
      });
    });
  });
  
  describe('retry logic', () => {
    it('should retry failed requests up to the specified number of times', async () => {
      // Setup mocks to fail twice and succeed on third try
      const mockError = new Error('Network error');
      (executeRequest as jest.Mock)
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockItem);
      
      // Configure service with retry options
      service.setRetryOptions({ maxRetries: 3, retryDelay: 10 });
      
      // Execute
      const result = await service.getById('1');
      
      // Verify
      expect(executeRequest).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockItem);
    });
    
    it('should stop retrying after max attempts and throw the last error', async () => {
      // Setup mock to always fail
      const mockError = new Error('Persistent network error');
      (executeRequest as jest.Mock).mockRejectedValue(mockError);
      
      // Configure service with retry options
      service.setRetryOptions({ maxRetries: 2, retryDelay: 10 });
      
      // Execute and verify it throws after all retries
      await expect(service.getById('1')).rejects.toThrow('Persistent network error');
      expect(executeRequest).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });
}); 