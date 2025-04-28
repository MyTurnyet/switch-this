import { IndustryService } from '../IndustryService';
import { Industry } from '@/shared/types/models';

describe('IndustryService', () => {
  let industryService: IndustryService;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    industryService = new IndustryService();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fetch all industries successfully', async () => {
    const mockIndustries = [{ id: 1, name: 'Industry 1' }];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockIndustries),
    });

    const result = await industryService.getAllIndustries();
    expect(result).toEqual(mockIndustries);
  });

  it('should handle errors when fetching industries', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch industries'));

    await expect(industryService.getAllIndustries()).rejects.toThrow('Failed to fetch industries');
    expect(mockConsoleError).toHaveBeenCalled();
  });
}); 