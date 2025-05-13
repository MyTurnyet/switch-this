import { RollingStockService } from '../RollingStockService';
import { RollingStock } from '@/shared/types/models';

interface RollingStockWithLocation extends RollingStock {
  currentLocation: {
    industryId: string;
    trackId: string;
  };
}

// Mock fetch
global.fetch = jest.fn();

describe('RollingStockService', () => {
  let service: RollingStockService;
  let mockRollingStock: RollingStockWithLocation[];
  let originalConsoleLog: any;
  let originalConsoleError: any;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RollingStockService();
    
    // Store original console methods
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    
    // Use jest.spyOn instead of mocking to preserve functionality but allow assertions
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockRollingStock = [
      {
        _id: '1',
        roadName: 'BNSF',
        roadNumber: '1234',
        aarType: 'XM',
        description: 'Boxcar',
        color: 'RED',
        note: '',
        homeYard: 'yard1',
        ownerId: '1',
        currentLocation: {
          industryId: 'industry1',
          trackId: 'track1'
        }
      },
      {
        _id: '2',
        roadName: 'UP',
        roadNumber: '5678',
        aarType: 'XM',
        description: 'Boxcar',
        color: 'BLUE',
        note: '',
        homeYard: 'yard2',
        ownerId: '1',
        currentLocation: {
          industryId: 'industry2',
          trackId: 'track2'
        }
      }
    ];

    // Default mocks for fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRollingStock
    });
  });

  afterEach(() => {
    // Restore original console methods
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('getAllRollingStock', () => {
    it('should fetch all rolling stock items', async () => {
      // Call the method
      const result = await service.getAllRollingStock();
      
      // Verify the results
      expect(result).toEqual(mockRollingStock);
      expect(global.fetch).toHaveBeenCalledWith('/api/rolling-stock');
    });
    
    it('should handle fetch error when getting all rolling stock', async () => {
      // Mock a failed response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      });
      
      // Verify the method throws the expected error
      await expect(service.getAllRollingStock()).rejects.toThrow('Failed to fetch rolling stock');
    });
    
    it('should handle network error when getting all rolling stock', async () => {
      // Mock a network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      // Verify the method throws the expected error
      await expect(service.getAllRollingStock()).rejects.toThrow('Network error');
    });
  });
  
  describe('updateRollingStock', () => {
    it('should update a rolling stock item', async () => {
      const id = '1';
      const updateData: RollingStock = {
        _id: id,
        roadName: 'BNSF',
        roadNumber: '1234-Updated',
        aarType: 'XM',
        description: 'Updated Boxcar',
        color: 'GREEN',
        note: 'Updated note',
        homeYard: 'yard1',
        ownerId: '1'
      };
      
      // Mock a successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });
      
      // Call the method
      await service.updateRollingStock(id, updateData);
      
      // Verify the fetch call
      expect(global.fetch).toHaveBeenCalledWith(`/api/rolling-stock/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
    });
    
    it('should handle error when updating rolling stock', async () => {
      const id = '1';
      const updateData: RollingStock = {
        _id: id,
        roadName: 'BNSF',
        roadNumber: '1234',
        aarType: 'XM',
        description: 'Boxcar',
        color: 'RED',
        note: '',
        homeYard: 'yard1',
        ownerId: '1'
      };
      
      // Mock a failed response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request'
      });
      
      // Verify the method throws the expected error
      await expect(service.updateRollingStock(id, updateData)).rejects.toThrow('Failed to update rolling stock');
    });
    
    it('should handle network error when updating rolling stock', async () => {
      const id = '1';
      const updateData: RollingStock = {
        _id: id,
        roadName: 'BNSF',
        roadNumber: '1234',
        aarType: 'XM',
        description: 'Boxcar',
        color: 'RED',
        note: '',
        homeYard: 'yard1',
        ownerId: '1'
      };
      
      // Mock a network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      // Verify the method throws the expected error
      await expect(service.updateRollingStock(id, updateData)).rejects.toThrow('Network error');
    });
  });

  describe('resetToHomeYards', () => {
    it('should reset all rolling stock to their home yards', async () => {
      // Mock the fetch response for the reset endpoint
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      // Call the reset method
      await service.resetToHomeYards();

      // Verify that fetch was called with the correct parameters
      expect(global.fetch).toHaveBeenCalledWith('/api/rolling-stock/reset', {
        method: 'POST',
      });
      
      // Verify that the expected console messages were logged
      expect(consoleLogSpy).toHaveBeenCalledWith('Starting reset to home yards operation');
      expect(consoleLogSpy).toHaveBeenCalledWith('Reset operation completed successfully');
    });
    
    it('should handle API error when resetting rolling stock', async () => {
      // Mock a failed response
      const errorData = { error: 'Reset operation failed' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => errorData
      });
      
      // Verify the method throws the expected error
      await expect(service.resetToHomeYards()).rejects.toThrow('Failed to reset rolling stock');
      
      // Verify the error message was logged
      expect(consoleLogSpy).toHaveBeenCalledWith('Starting reset to home yards operation');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Reset API returned error:', errorData);
    });
    
    it('should handle network error when resetting rolling stock', async () => {
      // Mock a network error
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);
      
      // Verify the method throws the expected error
      await expect(service.resetToHomeYards()).rejects.toThrow('Network error');
      
      // Verify the error message was logged
      expect(consoleLogSpy).toHaveBeenCalledWith('Starting reset to home yards operation');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error during reset operation:', networkError);
    });
  });
}); 