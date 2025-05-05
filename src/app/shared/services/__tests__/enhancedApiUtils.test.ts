import { executeRequest, createApiError } from '../apiUtils';

/**
 * These tests verify the enhanced functionality of our API utilities
 */
describe('Enhanced API Utilities', () => {
  // Store original fetch
  const originalFetch = global.fetch;
  
  beforeEach(() => {
    // Mock fetch for testing
    global.fetch = jest.fn();
  });
  
  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    
    // Clear mocks
    jest.clearAllMocks();
  });
  
  describe('executeRequest', () => {
    it('should make requests with the correct options', async () => {
      // Mock successful response
      const mockData = { id: '1', name: 'Test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });
      
      // Execute request
      const result = await executeRequest({
        url: '/api/test',
        method: 'GET'
      });
      
      // Check fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Check result
      expect(result).toEqual(mockData);
    });
    
    it('should include body data for POST requests', async () => {
      // Mock successful response
      const mockData = { id: '1', name: 'Test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });
      
      // Request data
      const requestData = { name: 'New Item' };
      
      // Execute request
      await executeRequest({
        url: '/api/test',
        method: 'POST',
        body: requestData
      });
      
      // Check fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
    });
    
    it('should handle API errors with detailed error messages', async () => {
      // Mock error response
      const errorResponse = { error: 'Item not found' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => errorResponse
      });
      
      // Set up custom error message
      const errorMessage = 'Failed to fetch item';
      
      // Execute request and verify error
      await expect(executeRequest({
        url: '/api/test/123',
        method: 'GET',
        errorMessage
      })).rejects.toThrow(`${errorMessage}: Item not found`);
    });
    
    it('should handle network errors', async () => {
      // Mock network error
      const networkError = new Error('Network failure');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);
      
      // Execute request and verify error
      await expect(executeRequest({
        url: '/api/test',
        method: 'GET'
      })).rejects.toThrow('Network failure');
    });
    
    it('should return null for 204 No Content responses', async () => {
      // Mock no content response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204
      });
      
      // Execute request
      const result = await executeRequest({
        url: '/api/test/1',
        method: 'DELETE'
      });
      
      // Check result
      expect(result).toBeNull();
    });
  });
  
  describe('createApiError', () => {
    it('should create error objects with status information', () => {
      // Create error with status data
      const error = createApiError('Item not found', 404, 'Not Found');
      
      // Verify error properties
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Item not found');
      expect(error.status).toBe(404);
      expect(error.statusText).toBe('Not Found');
    });
  });
}); 