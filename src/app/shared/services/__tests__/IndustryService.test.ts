import { IndustryService } from '../IndustryService';
import { Industry } from '@/shared/types/models';

describe('IndustryService', () => {
  let industryService: IndustryService;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    industryService = new IndustryService();
  });

  it('should fetch all industries', async () => {
    const mockIndustries: Industry[] = [
      {
        _id: '1',
        name: 'Test Industry',
        industryType: 'FREIGHT',
        tracks: [{
          _id: 'track1',
          name: 'Track 1',
          maxCars: 3,
          placedCars: []
        }],
        locationId: 'loc1',
        ownerId: 'owner1'
      }
    ];

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockIndustries)
    });

    const result = await industryService.getAllIndustries();

    expect(fetchMock).toHaveBeenCalledWith('/api/industries');
    expect(result).toEqual(mockIndustries);
  });

  it('should handle errors when fetching industries', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    await expect(industryService.getAllIndustries()).rejects.toThrow('Failed to fetch industries');
    expect(fetchMock).toHaveBeenCalledWith('/api/industries');
  });
}); 