import { Location } from '@/app/shared/types/models';

export class LocationService {
  async getAllLocations(): Promise<Location[]> {
    const response = await fetch('/api/locations');
    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }
    return response.json();
  }

  async getLocationById(id: string): Promise<Location> {
    const response = await fetch(`/api/locations/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch location with id ${id}`);
    }
    return response.json();
  }

  async createLocation(location: Partial<Location>): Promise<Location> {
    const response = await fetch('/api/locations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create location');
    }

    return response.json();
  }

  async updateLocation(id: string, location: Partial<Location>): Promise<Location> {
    const response = await fetch(`/api/locations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to update location with id ${id}`);
    }

    return response.json();
  }

  async deleteLocation(id: string): Promise<void> {
    const response = await fetch(`/api/locations/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'same-origin'
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete location with id ${id}`);
      } catch (parseError) {
        const statusText = response.statusText || 'Unknown error';
        throw new Error(`Failed to delete location: ${statusText} (${response.status})`);
      }
    }
  }
} 