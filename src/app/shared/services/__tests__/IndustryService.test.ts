import { IndustryService } from '../IndustryService';
import { Industry, IndustryType, Track } from '@/app/shared/types/models';

describe('IndustryService', () => {
  let service: IndustryService;
  let fetchMock: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    service = new IndustryService();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
    consoleErrorSpy.mockRestore();
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
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle network error', async () => {
      const networkError = new Error('Network error');
      fetchMock.mockRejectedValueOnce(networkError);

      await expect(service.getAllIndustries()).rejects.toThrow('Network error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching industries:', networkError);
    });
    
    it('should properly convert industries with tracks', async () => {
      // Mock industry with tracks
      const mockIndustryWithTracks = { 
        _id: '1', 
        name: 'Industry 1', 
        industryType: 'FREIGHT', 
        tracks: [
          { 
            _id: 'track1', 
            name: 'Track 1', 
            maxCars: 5, 
            placedCars: ['car1', 'car2'], 
            ownerId: 'owner1'
          }
        ], 
        locationId: 'loc1', 
        ownerId: 'owner1' 
      };
      
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce([mockIndustryWithTracks])
      });

      const result = await service.getAllIndustries();

      expect(result[0].tracks).toHaveLength(1);
      expect(result[0].tracks[0].maxCars).toBe(5);
      expect(result[0].tracks[0].capacity).toBe(5); // Verify capacity is set from maxCars
      expect(result[0].tracks[0].placedCars).toEqual(['car1', 'car2']);
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
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle network error for single industry', async () => {
      const networkError = new Error('Network error');
      fetchMock.mockRejectedValueOnce(networkError);

      await expect(service.getIndustryById('1')).rejects.toThrow('Network error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching industry with id 1:', networkError);
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
    
    it('should convert and include all provided fields when updating', async () => {
      const industryId = '1';
      const track: Track = { 
        _id: 'track1', 
        name: 'Track 1', 
        maxCars: 5, 
        capacity: 5, 
        length: 100, 
        placedCars: ['car1'], 
        ownerId: 'owner1',
        acceptedCarTypes: ['XM', 'FM']
      };
      
      const updateData: Partial<Industry> = { 
        name: 'Updated Industry', 
        industryType: IndustryType.FREIGHT,
        description: 'Updated description',
        blockName: 'Block A',
        locationId: 'loc2',
        ownerId: 'owner2',
        tracks: [track]
      };
      
      const updatedApiIndustry = { 
        _id: industryId,
        ...updateData,
        industryType: 'FREIGHT'
      };
      
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(updatedApiIndustry)
      });

      await service.updateIndustry(industryId, updateData);

      // Verify the conversion correctly handled all fields
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.name).toBe('Updated Industry');
      expect(requestBody.industryType).toBe('FREIGHT');
      expect(requestBody.description).toBe('Updated description');
      expect(requestBody.blockName).toBe('Block A');
      expect(requestBody.locationId).toBe('loc2');
      expect(requestBody.ownerId).toBe('owner2');
      expect(requestBody.tracks).toHaveLength(1);
      expect(requestBody.tracks[0].maxCars).toBe(5);
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
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle update error with default error message', async () => {
      const industryId = '1';
      const updateData: Partial<Industry> = { name: 'Updated Industry' };
      
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({})
      });

      await expect(service.updateIndustry(industryId, updateData)).rejects.toThrow('Failed to update industry');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle network error during update', async () => {
      const industryId = '1';
      const updateData: Partial<Industry> = { name: 'Updated Industry' };
      const networkError = new Error('Network error');
      
      fetchMock.mockRejectedValueOnce(networkError);

      await expect(service.updateIndustry(industryId, updateData)).rejects.toThrow('Network error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(`Error updating industry with id ${industryId}:`, networkError);
    });
  });

  describe('createIndustry', () => {
    it('should create an industry successfully', async () => {
      const newIndustryData: Partial<Industry> = { 
        name: 'New Industry', 
        industryType: IndustryType.FREIGHT,
        locationId: 'loc1',
        blockName: 'Block 1',
        ownerId: 'owner1',
        tracks: []
      };
      
      // Raw API response
      const createdApiIndustry = { 
        _id: 'new1', 
        name: 'New Industry', 
        industryType: 'FREIGHT',
        tracks: [],
        locationId: 'loc1',
        blockName: 'Block 1',
        ownerId: 'owner1'
      };
      
      // Expected converted industry
      const expectedCreatedIndustry = { 
        _id: 'new1', 
        name: 'New Industry', 
        industryType: 'FREIGHT',
        tracks: [],
        locationId: 'loc1',
        blockName: '',  // Since the convertToAppIndustry function sets a default empty blockName
        ownerId: 'owner1',
        description: ''
      };
      
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(createdApiIndustry)
      });

      const result = await service.createIndustry(newIndustryData);

      expect(result).toEqual(expectedCreatedIndustry);
      
      // Verify the request body
      expect(fetchMock).toHaveBeenCalledWith('/api/industries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });
      
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.name).toBe('New Industry');
      expect(requestBody.industryType).toBe('FREIGHT');
      expect(requestBody.locationId).toBe('loc1');
      expect(requestBody.blockName).toBe('Block 1');
      expect(requestBody.ownerId).toBe('owner1');
    });
    
    it('should create an industry with tracks', async () => {
      const track: Track = { 
        _id: 'track1', 
        name: 'Track 1', 
        maxCars: 5, 
        capacity: 5, 
        length: 100, 
        placedCars: ['car1'], 
        ownerId: 'owner1',
        acceptedCarTypes: ['XM', 'FM']
      };
      
      const newIndustryData: Partial<Industry> = { 
        name: 'New Industry', 
        industryType: IndustryType.FREIGHT,
        tracks: [track]
      };
      
      const createdApiIndustry = { 
        _id: 'new1', 
        name: 'New Industry', 
        industryType: 'FREIGHT',
        tracks: [{
          _id: 'track1',
          name: 'Track 1',
          maxCars: 5,
          placedCars: ['car1'],
          ownerId: 'owner1'
        }],
        ownerId: 'system'
      };
      
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(createdApiIndustry)
      });

      await service.createIndustry(newIndustryData);
      
      // Verify the request body with tracks properly converted
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.tracks).toHaveLength(1);
      expect(requestBody.tracks[0].maxCars).toBe(5);
      expect(requestBody.tracks[0].placedCars).toEqual(['car1']);
    });

    it('should handle error when creating industry with error response', async () => {
      const newIndustryData: Partial<Industry> = { 
        name: 'New Industry', 
        industryType: IndustryType.FREIGHT 
      };
      
      const errorResponse = { error: 'Invalid industry data' };
      
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce(errorResponse)
      });

      await expect(service.createIndustry(newIndustryData)).rejects.toThrow('Invalid industry data');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle error when creating industry with default error message', async () => {
      const newIndustryData: Partial<Industry> = { 
        name: 'New Industry', 
        industryType: IndustryType.FREIGHT 
      };
      
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({})
      });

      await expect(service.createIndustry(newIndustryData)).rejects.toThrow('Failed to create industry');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle network error when creating industry', async () => {
      const newIndustryData: Partial<Industry> = { 
        name: 'New Industry', 
        industryType: IndustryType.FREIGHT 
      };
      
      const networkError = new Error('Network error');
      
      fetchMock.mockRejectedValueOnce(networkError);

      await expect(service.createIndustry(newIndustryData)).rejects.toThrow('Network error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating industry:', networkError);
    });
  });

  describe('deleteIndustry', () => {
    it('should delete an industry successfully', async () => {
      const industryId = '1';
      
      fetchMock.mockResolvedValueOnce({
        ok: true
      });

      await service.deleteIndustry(industryId);

      expect(fetchMock).toHaveBeenCalledWith(`/api/industries/${industryId}`, {
        method: 'DELETE',
      });
    });

    it('should handle error when deleting industry with error message', async () => {
      const industryId = '1';
      const errorResponse = { error: 'Industry not found' };
      
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce(errorResponse)
      });

      await expect(service.deleteIndustry(industryId)).rejects.toThrow('Industry not found');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle error when deleting industry with default error', async () => {
      const industryId = '1';
      
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({})
      });

      await expect(service.deleteIndustry(industryId)).rejects.toThrow(`Failed to delete industry with id ${industryId}`);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle network error when deleting industry', async () => {
      const industryId = '1';
      const networkError = new Error('Network error');
      
      fetchMock.mockRejectedValueOnce(networkError);

      await expect(service.deleteIndustry(industryId)).rejects.toThrow('Network error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(`Error deleting industry with id ${industryId}:`, networkError);
    });
  });
}); 