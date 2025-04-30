import { Industry as SharedIndustry } from '@/shared/types/models';
import { Industry as AppIndustry, IndustryType } from '@/app/shared/types/models';

// Function to convert from shared model to app model
function convertToAppIndustry(industry: SharedIndustry): AppIndustry {
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
    })) : [],
    locationId: industry.locationId,
    blockName: '', // Default value since it's required in AppIndustry
    ownerId: industry.ownerId,
    description: ''
  };
}

// Function to convert from app model to shared model for API requests
function convertToSharedIndustry(industry: Partial<AppIndustry>): Partial<SharedIndustry> {
  const result: Partial<SharedIndustry> = {
    name: industry.name,
    industryType: industry.industryType as unknown as 'FREIGHT' | 'YARD' | 'PASSENGER',
  };
  
  return result;
}

export class IndustryService {
  async getAllIndustries(): Promise<AppIndustry[]> {
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

  async getIndustryById(id: string): Promise<AppIndustry> {
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

  async updateIndustry(id: string, data: Partial<AppIndustry>): Promise<AppIndustry> {
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
} 