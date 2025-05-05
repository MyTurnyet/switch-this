export interface ApiError extends Error {
  status?: number;
  statusText?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_MONGODB_URL || '';

export async function fetchWithErrorHandling<T>(endpoint: string): Promise<T[]> {
  const isTestEnvironment = process.env.NODE_ENV === 'test';
  
  // Skip check for test environment
  if (!API_BASE_URL && !isTestEnvironment) {
    throw createApiError('API URL is not configured. Please check your environment variables.');
  }

  try {
    const url = isTestEnvironment ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw createApiError(
        `HTTP error! status: ${response.status}`,
        response.status,
        response.statusText
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching from ${endpoint}:`, error.message);
    }
    throw error;
  }
}

export interface RequestOptions {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  errorMessage?: string;
  parseResponseAsJson?: boolean;
}

/**
 * Enhanced fetch wrapper with consistent error handling
 */
export async function executeRequest<T>(options: RequestOptions): Promise<T> {
  const {
    url,
    method,
    body,
    headers = {},
    errorMessage = 'Request failed',
    parseResponseAsJson = true
  } = options;

  const isTestEnvironment = process.env.NODE_ENV === 'test';
  const requestUrl = isTestEnvironment ? url : `${API_BASE_URL}${url}`;
  
  // Skip check for test environment
  if (!API_BASE_URL && !isTestEnvironment) {
    throw createApiError('API URL is not configured. Please check your environment variables.');
  }

  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(requestUrl, requestOptions);
    
    if (!response.ok) {
      // Try to get error details from response
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = errorData.error || `${response.statusText} (${response.status})`;
      } catch (jsonError) {
        errorDetails = `${response.statusText} (${response.status})`;
      }
      
      throw createApiError(
        `${errorMessage}: ${errorDetails}`,
        response.status,
        response.statusText
      );
    }
    
    // Return null/undefined for 204 No Content or if response is not to be parsed
    if (response.status === 204 || !parseResponseAsJson) {
      return null as unknown as T;
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error executing request to ${url}:`, error.message);
    }
    throw error;
  }
}

export function createApiError(message: string, status?: number, statusText?: string): ApiError {
  const error: ApiError = new Error(message);
  error.status = status;
  error.statusText = statusText;
  return error;
} 