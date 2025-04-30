import { LayoutStateService, LayoutStateData, LayoutStateServiceImpl } from '../clientServices';

// Setup fetch mock
global.fetch = jest.fn();

describe('LayoutStateService', () => {
  let service: LayoutStateService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new LayoutStateServiceImpl();
  });
  
  describe('getLayoutState', () => {
    it('should return layout state when it exists', async () => {
      // Mock response data
      const mockState = {
        _id: 'test-id',
        industries: [{ 
          _id: 'ind-1', 
          name: 'Industry 1',
          locationId: 'loc-1',
          blockName: 'Block 1',
          industryType: 'YARD' as const,
          tracks: [],
          ownerId: 'owner-1'
        }],
        rollingStock: [{ 
          _id: 'rs-1', 
          roadName: 'BNSF', 
          roadNumber: '1234',
          aarType: 'XM',
          description: 'Boxcar',
          color: 'RED',
          note: '',
          homeYard: 'yard-1',
          ownerId: 'owner-1'
        }],
        updatedAt: new Date().toISOString()
      };
      
      // Setup mock fetch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockState)
      });
      
      // Call the service method
      const result = await service.getLayoutState();
      
      // Verify the result matches mock data
      expect(result).toEqual(mockState);
      
      // Verify fetch was called with the right endpoint
      expect(global.fetch).toHaveBeenCalledWith('/api/layout-state');
    });
    
    it('should return null when no layout state exists', async () => {
      // Setup mock fetch response indicating no layout state exists
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ exists: false })
      });
      
      // Call the service method
      const result = await service.getLayoutState();
      
      // Verify the result is null
      expect(result).toBeNull();
    });
    
    it('should throw an error when fetch fails', async () => {
      // Setup mock fetch to reject
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      // Expect the service method to throw
      await expect(service.getLayoutState()).rejects.toThrow('Network error');
    });
    
    it('should throw an error when response is not ok', async () => {
      // Setup mock fetch to return error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Server error'
      });
      
      // Expect the service method to throw
      await expect(service.getLayoutState()).rejects.toThrow('Failed to fetch layout state: Server error');
    });
  });
  
  describe('saveLayoutState', () => {
    it('should save layout state and return the saved state', async () => {
      // Mock state to save
      const stateToSave: LayoutStateData = {
        industries: [{ 
          _id: 'ind-1', 
          name: 'Industry 1',
          locationId: 'loc-1',
          blockName: 'Block 1',
          industryType: 'YARD' as const,
          tracks: [],
          ownerId: 'owner-1'
        }],
        rollingStock: [{ 
          _id: 'rs-1', 
          roadName: 'BNSF', 
          roadNumber: '1234',
          aarType: 'XM',
          description: 'Boxcar',
          color: 'RED',
          note: '',
          homeYard: 'yard-1',
          ownerId: 'owner-1'
        }]
      };
      
      // Mock response with generated ID
      const savedState = {
        ...stateToSave,
        _id: 'new-id',
        updatedAt: new Date().toISOString()
      };
      
      // Setup mock fetch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(savedState)
      });
      
      // Call the service method
      const result = await service.saveLayoutState(stateToSave);
      
      // Verify the result matches saved state
      expect(result).toEqual(savedState);
      
      // Verify fetch was called with the right endpoint and method
      expect(global.fetch).toHaveBeenCalledWith(
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
    
    it('should throw an error when fetch fails', async () => {
      // Mock state to save
      const stateToSave: LayoutStateData = {
        industries: [],
        rollingStock: []
      };
      
      // Setup mock fetch to reject
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      // Expect the service method to throw
      await expect(service.saveLayoutState(stateToSave)).rejects.toThrow('Network error');
    });
    
    it('should throw an error when response is not ok', async () => {
      // Mock state to save
      const stateToSave: LayoutStateData = {
        industries: [],
        rollingStock: []
      };
      
      // Setup mock fetch to return error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Server error'
      });
      
      // Expect the service method to throw
      await expect(service.saveLayoutState(stateToSave)).rejects.toThrow('Failed to save layout state: Server error');
    });
  });
}); 