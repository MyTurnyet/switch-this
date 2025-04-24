import { TrainRoute } from '@/shared/types/models';

export class TrainRouteService {
  async getAllTrainRoutes(): Promise<TrainRoute[]> {
    try {
      const response = await fetch('/api/train-routes');
      if (!response.ok) {
        throw new Error('Failed to fetch train routes');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching train routes:', error);
      throw new Error('Failed to fetch train routes');
    }
  }
} 