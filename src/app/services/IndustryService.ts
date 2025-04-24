import { Industry } from '@/shared/types/models';

export class IndustryService {
  async getAllIndustries(): Promise<Industry[]> {
    const response = await fetch('/api/industries');
    if (!response.ok) {
      throw new Error('Failed to load industries');
    }
    return response.json();
  }
} 