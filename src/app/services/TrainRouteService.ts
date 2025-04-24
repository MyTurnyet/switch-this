import { TrainRoute } from '@/shared/types/models';

export class TrainRouteService {
  async getAllTrainRoutes(): Promise<TrainRoute[]> {
    const response = await fetch('/api/train-routes');
    if (!response.ok) {
      throw new Error('Failed to load train routes');
    }
    return response.json();
  }
} 