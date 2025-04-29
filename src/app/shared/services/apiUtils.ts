// Default to empty string if not set, will be caught by error handling
const MONGODB_API_URL = process.env.NEXT_PUBLIC_MONGODB_URL || '';

export async function fetchWithErrorHandling<T>(endpoint: string): Promise<T[]> {
  // Skip check for test environment
  if (!MONGODB_API_URL && process.env.NODE_ENV !== 'test') {
    throw new Error('MongoDB API URL is not configured. Please check your environment variables.');
  }

  try {
    const url = process.env.NODE_ENV === 'test' ? endpoint : `${MONGODB_API_URL}${endpoint}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
} 