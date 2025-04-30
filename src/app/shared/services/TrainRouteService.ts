import { TrainRoute } from '@/shared/types/models';

export class TrainRouteService {
  async getAllTrainRoutes(): Promise<TrainRoute[]> {
    const response = await fetch('/api/train-routes');
    if (!response.ok) {
      throw new Error('Failed to fetch train routes');
    }
    return response.json();
  }

  async getTrainRouteById(id: string): Promise<TrainRoute> {
    const response = await fetch(`/api/train-routes/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch train route with id ${id}`);
    }
    return response.json();
  }

  async updateTrainRoute(id: string, trainRoute: TrainRoute): Promise<TrainRoute> {
    const response = await fetch(`/api/train-routes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trainRoute),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update train route with id ${id}`);
    }
    
    return response.json();
  }

  async deleteTrainRoute(id: string): Promise<void> {
    const response = await fetch(`/api/train-routes/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete train route with id ${id}`);
    }
  }
} 