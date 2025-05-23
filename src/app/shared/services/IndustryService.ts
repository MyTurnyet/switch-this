import { Industry as SharedIndustry, Track as SharedTrack } from '@/shared/types/models';
import { Industry, IndustryType, Track } from '@/app/shared/types/models';

// Function to convert from shared model to app model
function convertToAppIndustry(industry: SharedIndustry): Industry {
  return {
    _id: industry._id,
    name: industry.name,
    industryType: industry.industryType as unknown as IndustryType,
    tracks: industry.tracks ? industry.tracks.map(track => ({
      _id: track._id,
      name: track.name,
      maxCars: track.maxCars,
      placedCars: track.placedCars,
      length: 0, // Default value
      capacity: track.maxCars, // Use maxCars as capacity
      ownerId: industry.ownerId
    } as Track)) : [],
    locationId: industry.locationId,
    blockName: '', // Default value since it's required in Industry
    ownerId: industry.ownerId,
    description: ''
  };
}

// Function to convert from app model to shared model for API requests
function convertToSharedIndustry(industry: Partial<Industry>): Partial<SharedIndustry> {
  const result: Partial<SharedIndustry> = {
    name: industry.name,
    industryType: industry.industryType,
    locationId: industry.locationId,
    blockName: industry.blockName,
    ownerId: industry.ownerId,
  };
  
  // Include tracks when present in the update data
  if (industry.tracks) {
    result.tracks = industry.tracks.map(track => ({
      _id: track._id,
      name: track.name,
      maxCars: track.maxCars || track.capacity || 0, // Ensure we have a maxCars value
      placedCars: track.placedCars || [],
      length: track.length || 0,
      capacity: track.capacity || 0,
      ownerId: track.ownerId
    } as unknown as SharedTrack));
  }
  
  // Include optional fields when present
  if (industry.description !== undefined) {
    result.description = industry.description;
  }
  
  return result;
}

export class IndustryService {
  async getAllIndustries(): Promise<Industry[]> {
    try {
      const response = await fetch('/api/industries');
      if (!response.ok) {
        throw new Error('Failed to fetch industries');
      }
      const industries: SharedIndustry[] = await response.json();
      return industries.map(convertToAppIndustry);
    } catch (error) {
      console.error('Error fetching industries:', error);
      throw error;
    }
  }

  async getIndustryById(id: string): Promise<Industry> {
    try {
      const response = await fetch(`/api/industries/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch industry');
      }
      const industry: SharedIndustry = await response.json();
      return convertToAppIndustry(industry);
    } catch (error) {
      console.error(`Error fetching industry with id ${id}:`, error);
      throw error;
    }
  }

  async updateIndustry(id: string, data: Partial<Industry>): Promise<Industry> {
    try {
      const sharedData = convertToSharedIndustry(data);
      
      const response = await fetch(`/api/industries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sharedData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update industry');
      }
      
      const updatedIndustry: SharedIndustry = await response.json();
      return convertToAppIndustry(updatedIndustry);
    } catch (error) {
      console.error(`Error updating industry with id ${id}:`, error);
      throw error;
    }
  }
  
  async createIndustry(data: Partial<Industry>): Promise<Industry> {
    try {
      const sharedData = convertToSharedIndustry(data);
      
      const response = await fetch('/api/industries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sharedData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create industry');
      }
      
      const newIndustry: SharedIndustry = await response.json();
      return convertToAppIndustry(newIndustry);
    } catch (error) {
      console.error('Error creating industry:', error);
      throw error;
    }
  }

  async deleteIndustry(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/industries/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete industry with id ${id}`);
      }
    } catch (error) {
      console.error(`Error deleting industry with id ${id}:`, error);
      throw error;
    }
  }
} 