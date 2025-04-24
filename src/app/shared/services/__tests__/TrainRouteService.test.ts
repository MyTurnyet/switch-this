import { TrainRouteService } from '../TrainRouteService';
import { TrainRoute } from '@/shared/types/models';

describe('TrainRouteService', () => {
  let trainRouteService: TrainRouteService;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    trainRouteService = new TrainRouteService();
  });

  it('should fetch all train routes', async () => {
    const mockTrainRoutes: TrainRoute[] = [
      {
        _id: '1',
        name: 'Test Route',
        routeNumber: 'R1',
        routeType: 'MIXED',
        originatingYardId: 'yard1',
        terminatingYardId: 'yard2',
        stations: [{
          _id: 'station1',
          stationName: 'Test Station',
          block: 'A1',
          ownerId: 'owner1'
        }]
      }
    ];

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTrainRoutes)
    });

    const result = await trainRouteService.getAllTrainRoutes();

    expect(fetchMock).toHaveBeenCalledWith('/api/train-routes');
    expect(result).toEqual(mockTrainRoutes);
  });

  it('should handle errors when fetching train routes', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    await expect(trainRouteService.getAllTrainRoutes()).rejects.toThrow('Failed to fetch train routes');
    expect(fetchMock).toHaveBeenCalledWith('/api/train-routes');
  });
}); 