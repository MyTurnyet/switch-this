import { Industry } from '@/shared/types/models';

export class IndustryService {
  async getAllIndustries(): Promise<Industry[]> {
    try {
      const response = await fetch('/api/industries');
      if (!response.ok) {
        throw new Error('Failed to fetch industries');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching industries:', error);
      throw error;
    }
  }
} 