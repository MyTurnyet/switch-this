interface ApiError extends Error {
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

function createApiError(message: string, status?: number, statusText?: string): ApiError {
  const error: ApiError = new Error(message);
  error.status = status;
  error.statusText = statusText;
  return error;
} 