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

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RollingStockService();
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
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });
}); 