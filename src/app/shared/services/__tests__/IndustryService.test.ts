import { IndustryService } from '../IndustryService';
import { Industry, IndustryType } from '@/app/shared/types/models';

describe('IndustryService', () => {
  let service: IndustryService;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    service = new IndustryService();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllIndustries', () => {
    it('should fetch all industries successfully', async () => {
      // Raw mockIndustries from API response
      const mockIndustries = [
        { _id: '1', name: 'Industry 1', industryType: 'FREIGHT', tracks: [], locationId: 'loc1', ownerId: 'owner1' }, 
        { _id: '2', name: 'Industry 2', industryType: 'YARD', tracks: [], locationId: 'loc2', ownerId: 'owner2' }
      ];
      
      // Expected converted industries with AppIndustry structure
      const expectedIndustries = [
        { 
          _id: '1', 
          name: 'Industry 1', 
          industryType: 'FREIGHT', 
          tracks: [], 
          locationId: 'loc1', 
          ownerId: 'owner1',
          blockName: '',
          description: ''
        }, 
        { 
          _id: '2', 
          name: 'Industry 2', 
          industryType: 'YARD', 
          tracks: [], 
          locationId: 'loc2', 
          ownerId: 'owner2',
          blockName: '',
          description: ''
        }
      ];
      
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockIndustries)
      });

      const result = await service.getAllIndustries();

      expect(result).toEqual(expectedIndustries);
      expect(fetchMock).toHaveBeenCalledWith('/api/industries');
    });

    it('should handle fetch error', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(service.getAllIndustries()).rejects.toThrow('Failed to fetch industries');
    });

    it('should handle network error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getAllIndustries()).rejects.toThrow('Network error');
    });
  });

  describe('getIndustryById', () => {
    it('should fetch a single industry successfully', async () => {
      // Raw mockIndustry from API response
      const mockIndustry = { 
        _id: '1', 
        name: 'Industry 1', 
        industryType: 'FREIGHT', 
        tracks: [], 
        locationId: 'loc1', 
        ownerId: 'owner1' 
      };
      
      // Expected converted industry with AppIndustry structure
      const expectedIndustry = { 
        _id: '1', 
        name: 'Industry 1', 
        industryType: 'FREIGHT', 
        tracks: [], 
        locationId: 'loc1', 
        ownerId: 'owner1',
        blockName: '',
        description: ''
      };
      
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockIndustry)
      });

      const result = await service.getIndustryById('1');

      expect(result).toEqual(expectedIndustry);
      expect(fetchMock).toHaveBeenCalledWith('/api/industries/1');
    });

    it('should handle fetch error for single industry', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(service.getIndustryById('1')).rejects.toThrow('Failed to fetch industry');
    });

    it('should handle network error for single industry', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getIndustryById('1')).rejects.toThrow('Network error');
    });
  });

  describe('updateIndustry', () => {
    it('should update an industry successfully', async () => {
      const industryId = '1';
      const updateData = { 
        name: 'Updated Industry', 
        industryType: IndustryType.YARD
      };
      
      // Raw API response
      const updatedApiIndustry = { 
        _id: industryId, 
        name: 'Updated Industry', 
        industryType: 'YARD',
        tracks: [],
        locationId: 'loc1',
        ownerId: 'owner1'
      };
      
      // Expected converted industry
      const expectedUpdatedIndustry = { 
        _id: industryId, 
        name: 'Updated Industry', 
        industryType: 'YARD',
        tracks: [],
        locationId: 'loc1',
        ownerId: 'owner1',
        blockName: '',
        description: ''
      };
      
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(updatedApiIndustry)
      });

      const result = await service.updateIndustry(industryId, updateData);

      expect(result).toEqual(expectedUpdatedIndustry);
      expect(fetchMock).toHaveBeenCalledWith(`/api/industries/${industryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Updated Industry',
          industryType: 'YARD',
        }),
      });
    });

    it('should handle update error with error message from response', async () => {
      const industryId = '1';
      const updateData: Partial<Industry> = { name: 'Updated Industry' };
      const errorResponse = { error: 'Invalid industry data' };
      
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce(errorResponse)
      });

      await expect(service.updateIndustry(industryId, updateData)).rejects.toThrow('Invalid industry data');
    });

    it('should handle update error with default error message', async () => {
      const industryId = '1';
      const updateData: Partial<Industry> = { name: 'Updated Industry' };
      
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({})
      });

      await expect(service.updateIndustry(industryId, updateData)).rejects.toThrow('Failed to update industry');
    });

    it('should handle network error during update', async () => {
      const industryId = '1';
      const updateData: Partial<Industry> = { name: 'Updated Industry' };
      
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.updateIndustry(industryId, updateData)).rejects.toThrow('Network error');
    });
  });
}); 