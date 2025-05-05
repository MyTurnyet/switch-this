import { fetchWithErrorHandling, executeRequest, RequestOptions } from './apiUtils';

export interface RetryOptions {
  maxRetries: number;
  retryDelay: number;
}

/**
 * Enhanced base service with consistent error handling, retry logic, and standardized API calls
 */
export abstract class EnhancedBaseService<T extends { _id: string }> {
  protected readonly endpoint: string;
  protected retryOptions: RetryOptions = { maxRetries: 0, retryDelay: 100 };

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Configure retry behavior for failed requests
   */
  public setRetryOptions(options: RetryOptions): void {
    this.retryOptions = options;
  }

  /**
   * Get all items
   */
  public async getAll(): Promise<T[]> {
    return fetchWithErrorHandling<T>(this.endpoint);
  }

  /**
   * Get item by ID
   */
  public async getById(id: string): Promise<T> {
    const url = `${this.endpoint}/${id}`;
    return this.executeWithRetry<T>({
      url,
      method: 'GET',
      errorMessage: `Failed to fetch item with id ${id}`
    });
  }

  /**
   * Update an item
   */
  public async update(id: string, data: Partial<T>): Promise<T> {
    const url = `${this.endpoint}/${id}`;
    return this.executeWithRetry<T>({
      url,
      method: 'PUT',
      body: data,
      errorMessage: `Failed to update item with id ${id}`
    });
  }

  /**
   * Create a new item
   */
  public async create(data: Omit<T, '_id'>): Promise<T> {
    return this.executeWithRetry<T>({
      url: this.endpoint,
      method: 'POST',
      body: data,
      errorMessage: 'Failed to create item'
    });
  }

  /**
   * Delete an item
   */
  public async delete(id: string): Promise<void> {
    const url = `${this.endpoint}/${id}`;
    await this.executeWithRetry<void>({
      url,
      method: 'DELETE',
      errorMessage: `Failed to delete item with id ${id}`
    });
  }

  /**
   * Execute a request with retry logic
   */
  protected async executeWithRetry<R>(options: RequestOptions): Promise<R> {
    const { maxRetries, retryDelay } = this.retryOptions;
    let lastError: Error | null = null;
    
    // Initial attempt plus retries
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await executeRequest<R>(options);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // If this was the last attempt, don't delay, just throw
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before the next retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    // If we got here, all attempts failed
    throw lastError;
  }
} 