import { RollingStockService } from '../RollingStockService';
import { RollingStock } from '@/shared/types/models';

interface RollingStockWithLocation extends RollingStock {
  currentLocation: {
    industryId: string;
    trackId: string;
  };
}

describe('RollingStockService', () => {
  let service: RollingStockService;
  let mockRollingStock: RollingStockWithLocation[];

  beforeEach(() => {
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
  });

  it('should reset all rolling stock to their home yards', async () => {
    // Mock the getAllRollingStock response
    jest.spyOn(service, 'getAllRollingStock').mockResolvedValue(mockRollingStock);
    
    // Mock the updateRollingStock method
    const updateSpy = jest.spyOn(service, 'updateRollingStock').mockResolvedValue(undefined);

    // Call the reset method
    await service.resetToHomeYards();

    // Verify that updateRollingStock was called for each car
    expect(updateSpy).toHaveBeenCalledTimes(2);
    
    // Verify the first car was reset
    expect(updateSpy).toHaveBeenCalledWith('1', {
      ...mockRollingStock[0],
      currentLocation: {
        industryId: 'yard1',
        trackId: 'yard1'
      }
    });

    // Verify the second car was reset
    expect(updateSpy).toHaveBeenCalledWith('2', {
      ...mockRollingStock[1],
      currentLocation: {
        industryId: 'yard2',
        trackId: 'yard2'
      }
    });
  });
}); 