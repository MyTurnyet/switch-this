import { TrainRoute } from '@/shared/types/models';

export class TrainRouteService {
  async getAllTrainRoutes(): Promise<TrainRoute[]> {
    const response = await fetch('/api/train-routes');
    if (!response.ok) {
      throw new Error('Failed to fetch train routes');
    }
    return response.json();
  }
} 