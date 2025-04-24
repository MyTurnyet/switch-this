import { Location } from '@/shared/types/models';

export class LocationService {
  async getAllLocations(): Promise<Location[]> {
    try {
      const response = await fetch('/api/locations');
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw new Error('Failed to fetch locations');
    }
  }
} 