import { LayoutStateService, LayoutStateData } from '../LayoutStateService';
import { Industry, RollingStock } from '@/app/shared/types/models';

describe('LayoutStateService', () => {
  let service: LayoutStateService;
  let mockFetch: jest.Mock;
  
  beforeEach(() => {
    service = new LayoutStateService();
    
    // Mock global fetch
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });
  
  describe('getLayoutState', () => {
    it('should fetch layout state successfully', async () => {
      // Setup mock state data
      const mockState: LayoutStateData = {
        _id: 'state-1',
        industries: [{ 
          _id: 'ind-1', 
          name: 'Industry 1', 
          tracks: [],
          industryType: 'FREIGHT',
          locationId: 'loc-1',
          ownerId: 'owner-1'
        } as Industry],
        rollingStock: [{ 
          _id: 'car-1', 
          roadName: 'UP', 
          roadNumber: '1234',
          aarType: 'XM',
          description: 'Test Car',
          color: 'Red',
          homeYard: 'yard-1',
          ownerId: 'owner-1', 
          note: ''
        } as RollingStock],
        updatedAt: new Date()
      };
      
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockState)
      });
      
      // Call the service
      const result = await service.getLayoutState();
      
      // Verify result
      expect(result).toEqual(mockState);
      expect(mockFetch).toHaveBeenCalledWith('/api/layout-state');
    });
    
    it('should return null when no layout state exists', async () => {
      // Mock response with no data
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ exists: false })
      });
      
      // Call the service
      const result = await service.getLayoutState();
      
      // Verify result
      expect(result).toBeNull();
    });
    
    it('should handle fetch errors', async () => {
      // Mock fetch error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      // Mock console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Call the service
      const result = await service.getLayoutState();
      
      // Verify result
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      // Restore console
      consoleSpy.mockRestore();
    });
    
    it('should handle non-OK responses', async () => {
      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      // Mock console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Call the service
      const result = await service.getLayoutState();
      
      // Verify result
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      // Restore console
      consoleSpy.mockRestore();
    });
  });
  
  describe('saveLayoutState', () => {
    it('should save layout state successfully', async () => {
      // Setup mock state data
      const stateToSave: LayoutStateData = {
        industries: [{ 
          _id: 'ind-1', 
          name: 'Industry 1', 
          tracks: [],
          industryType: 'FREIGHT',
          locationId: 'loc-1',
          ownerId: 'owner-1'
        } as Industry],
        rollingStock: [{ 
          _id: 'car-1', 
          roadName: 'UP', 
          roadNumber: '1234',
          aarType: 'XM',
          description: 'Test Car',
          color: 'Red',
          homeYard: 'yard-1',
          ownerId: 'owner-1', 
          note: ''
        } as RollingStock]
      };
      
      const savedState: LayoutStateData = {
        ...stateToSave,
        _id: 'state-1',
        updatedAt: new Date()
      };
      
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(savedState)
      });
      
      // Call the service
      const result = await service.saveLayoutState(stateToSave);
      
      // Verify result
      expect(result).toEqual(savedState);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/layout-state',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(stateToSave),
        }
      );
    });
    
    it('should throw error on failed save', async () => {
      // Setup mock state data
      const stateToSave: LayoutStateData = {
        industries: [{ 
          _id: 'ind-1', 
          name: 'Industry 1', 
          tracks: [],
          industryType: 'FREIGHT',
          locationId: 'loc-1',
          ownerId: 'owner-1'
        } as Industry],
        rollingStock: [{ 
          _id: 'car-1', 
          roadName: 'UP', 
          roadNumber: '1234',
          aarType: 'XM',
          description: 'Test Car',
          color: 'Red',
          homeYard: 'yard-1',
          ownerId: 'owner-1', 
          note: ''
        } as RollingStock]
      };
      
      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      // Mock console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Call the service and expect error
      await expect(service.saveLayoutState(stateToSave)).rejects.toThrow('Failed to save layout state');
      
      // Verify fetch was called
      expect(mockFetch).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      
      // Restore console
      consoleSpy.mockRestore();
    });
    
    it('should handle network errors during save', async () => {
      // Setup mock state data
      const stateToSave: LayoutStateData = {
        industries: [{ 
          _id: 'ind-1', 
          name: 'Industry 1', 
          tracks: [],
          industryType: 'FREIGHT',
          locationId: 'loc-1',
          ownerId: 'owner-1'
        } as Industry],
        rollingStock: [{ 
          _id: 'car-1', 
          roadName: 'UP', 
          roadNumber: '1234',
          aarType: 'XM',
          description: 'Test Car',
          color: 'Red',
          homeYard: 'yard-1',
          ownerId: 'owner-1', 
          note: ''
        } as RollingStock]
      };
      
      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      // Mock console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Call the service and expect error
      await expect(service.saveLayoutState(stateToSave)).rejects.toThrow();
      
      // Verify fetch was called
      expect(mockFetch).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      
      // Restore console
      consoleSpy.mockRestore();
    });
  });
}); 