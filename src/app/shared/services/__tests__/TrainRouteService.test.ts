import { TrainRouteService } from '../TrainRouteService';
import { TrainRoute } from '@/shared/types/models';

describe('TrainRouteService', () => {
  let service: TrainRouteService;

  // Create mock train route data for tests
  const mockTrainRoute: TrainRoute = {
    _id: '1',
    name: 'Test Route',
    description: 'Test Description',
    ownerId: 'owner1',
    routeNumber: 'R1',
    routeType: 'MIXED',
    originatingYardId: 'yard1',
    terminatingYardId: 'yard2',
    stations: ['station1', 'station2']
  };
  
  const mockTrainRoutes = [mockTrainRoute];

  beforeEach(() => {
    service = new TrainRouteService();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllTrainRoutes', () => {
    it('should fetch all train routes', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrainRoutes
      });

      const result = await service.getAllTrainRoutes();
      
      expect(result).toEqual(mockTrainRoutes);
      expect(global.fetch).toHaveBeenCalledWith('/api/train-routes');
    });

    it('should handle fetch error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      });

      await expect(service.getAllTrainRoutes()).rejects.toThrow('Failed to fetch train routes');
    });

    it('should handle network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

      await expect(service.getAllTrainRoutes()).rejects.toThrow('Network Error');
    });
  });

  describe('getTrainRouteById', () => {
    it('should fetch a train route by id', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrainRoute
      });

      const result = await service.getTrainRouteById('1');
      
      expect(result).toEqual(mockTrainRoute);
      expect(global.fetch).toHaveBeenCalledWith('/api/train-routes/1');
    });

    it('should handle fetch error when getting train route by id', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(service.getTrainRouteById('1')).rejects.toThrow('Failed to fetch train route with id 1');
    });

    it('should handle network error when getting train route by id', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

      await expect(service.getTrainRouteById('1')).rejects.toThrow('Network Error');
    });
    
    it('should handle empty or invalid id', async () => {
      // Testing with empty string
      await expect(service.getTrainRouteById('')).rejects.toThrow();
      
      // Even though TypeScript would catch this at compile time, we're testing runtime behavior
      // Testing with undefined (cast as string to bypass TypeScript)
      await expect(service.getTrainRouteById(undefined as unknown as string)).rejects.toThrow();
    });
  });

  describe('updateTrainRoute', () => {
    it('should update a train route', async () => {
      const routeId = '1';
      const updateData: TrainRoute = {
        ...mockTrainRoute,
        name: 'Updated Route Name'
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updateData
      });

      const result = await service.updateTrainRoute(routeId, updateData);
      
      expect(result).toEqual(updateData);
      expect(global.fetch).toHaveBeenCalledWith(`/api/train-routes/${routeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
    });

    it('should handle error when updating train route', async () => {
      const routeId = '1';
      const updateData: TrainRoute = {
        ...mockTrainRoute,
        name: 'Updated Route Name'
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request'
      });

      await expect(service.updateTrainRoute(routeId, updateData)).rejects.toThrow('Failed to update train route with id 1');
    });

    it('should handle network error when updating train route', async () => {
      const routeId = '1';
      const updateData: TrainRoute = {
        ...mockTrainRoute,
        name: 'Updated Route Name'
      };
      
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

      await expect(service.updateTrainRoute(routeId, updateData)).rejects.toThrow('Network Error');
    });
  });

  describe('deleteTrainRoute', () => {
    it('should delete a train route', async () => {
      const routeId = '1';
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      await service.deleteTrainRoute(routeId);
      
      expect(global.fetch).toHaveBeenCalledWith(`/api/train-routes/${routeId}`, {
        method: 'DELETE',
      });
    });

    it('should handle error when deleting train route', async () => {
      const routeId = '1';
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(service.deleteTrainRoute(routeId)).rejects.toThrow('Failed to delete train route with id 1');
    });

    it('should handle network error when deleting train route', async () => {
      const routeId = '1';
      
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

      await expect(service.deleteTrainRoute(routeId)).rejects.toThrow('Network Error');
    });
  });
}); 