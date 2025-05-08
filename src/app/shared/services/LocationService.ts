import { Location } from '@/app/shared/types/models';
import { BaseEntityService } from './BaseEntityService';

export class LocationService extends BaseEntityService<Location> {
  constructor() {
    super('/api/locations', 'location');
  }

  async getAllLocations(): Promise<Location[]> {
    return this.getAll();
  }

  async getLocationById(id: string): Promise<Location> {
    return this.getById(id);
  }

  async createLocation(location: Partial<Location>): Promise<Location> {
    return this.create(location);
  }

  async updateLocation(id: string, location: Partial<Location>): Promise<Location> {
    return this.update(id, location);
  }

  async deleteLocation(id: string): Promise<void> {
    return this.legacyDelete(id); // Using legacy delete for backward compatibility
  }
} 