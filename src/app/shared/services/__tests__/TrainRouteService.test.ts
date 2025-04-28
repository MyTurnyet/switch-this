import { TrainRouteService } from '../TrainRouteService';

describe('TrainRouteService', () => {
  let service: TrainRouteService;

  beforeEach(() => {
    service = new TrainRouteService();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should fetch all train routes', async () => {
    const mockTrainRoutes = [{
      _id: '1',
      name: 'Test Route',
      description: 'Test Description',
      industries: ['ind1', 'ind2'],
      ownerId: 'owner1'
    }];

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
      ok: false
    });

    await expect(service.getAllTrainRoutes()).rejects.toThrow('Failed to fetch train routes');
  });

  it('should handle network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch train routes'));

    await expect(service.getAllTrainRoutes()).rejects.toThrow('Failed to fetch train routes');
  });
}); 