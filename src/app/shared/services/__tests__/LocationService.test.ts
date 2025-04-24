import { LocationService } from '../LocationService';

describe('LocationService', () => {
  let service: LocationService;

  beforeEach(() => {
    service = new LocationService();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should fetch all locations', async () => {
    const mockLocations = [{ _id: '1', stationName: 'Test Station', block: 'A', ownerId: 'owner1' }];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockLocations
    });

    const result = await service.getAllLocations();
    expect(result).toEqual(mockLocations);
    expect(global.fetch).toHaveBeenCalledWith('/api/locations');
  });

  it('should handle fetch error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false
    });

    await expect(service.getAllLocations()).rejects.toThrow('Failed to fetch locations');
  });

  it('should handle network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await expect(service.getAllLocations()).rejects.toThrow('Failed to fetch locations');
  });
}); 