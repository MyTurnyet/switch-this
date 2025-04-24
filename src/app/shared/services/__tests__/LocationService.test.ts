import { LocationService } from '../LocationService';
import { Location } from '@/shared/types/models';

describe('LocationService', () => {
  let locationService: LocationService;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    locationService = new LocationService();
  });

  it('should fetch all locations', async () => {
    const mockLocations: Location[] = [
      {
        _id: '1',
        stationName: 'Test Station',
        block: 'A1',
        ownerId: 'owner1'
      }
    ];

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLocations)
    });

    const result = await locationService.getAllLocations();

    expect(fetchMock).toHaveBeenCalledWith('/api/locations');
    expect(result).toEqual(mockLocations);
  });

  it('should handle errors when fetching locations', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    await expect(locationService.getAllLocations()).rejects.toThrow('Failed to fetch locations');
    expect(fetchMock).toHaveBeenCalledWith('/api/locations');
  });
}); 