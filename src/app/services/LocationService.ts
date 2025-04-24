import { Location } from '@/shared/types/models';

export class LocationService {
  async getAllLocations(): Promise<Location[]> {
    const response = await fetch('/api/locations');
    if (!response.ok) {
      throw new Error('Failed to load locations');
    }
    return response.json();
  }
} 