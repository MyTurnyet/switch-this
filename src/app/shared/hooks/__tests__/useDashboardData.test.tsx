import { renderHook, act, waitFor } from '@testing-library/react';
import { useDashboardData } from '../useDashboardData';
import { ClientServices } from '../../services/clientServices';

describe('useDashboardData', () => {
  let mockServices: ClientServices;
  
  beforeEach(() => {
    mockServices = {
      locationService: {
        getAllLocations: jest.fn(),
        getAll: jest.fn()
      },
      industryService: {
        getAllIndustries: jest.fn(),
        getAll: jest.fn()
      },
      trainRouteService: {
        getAllTrainRoutes: jest.fn(),
        getAll: jest.fn()
      },
      rollingStockService: {
        getAllRollingStock: jest.fn(),
        updateRollingStock: jest.fn(),
        resetToHomeYards: jest.fn(),
        getAll: jest.fn()
      }
    };
    
    (mockServices.locationService.getAllLocations as jest.Mock).mockResolvedValue([
      { _id: '1', stationName: 'Test Station', block: 'A', ownerId: '1' }
    ]);
    
    (mockServices.industryService.getAllIndustries as jest.Mock).mockResolvedValue([
      { _id: '1', name: 'Test Industry', locationId: '1', blockName: 'A', industryType: 'FREIGHT', tracks: [], ownerId: '1' }
    ]);
    
    (mockServices.trainRouteService.getAllTrainRoutes as jest.Mock).mockResolvedValue([
      { _id: '1', name: 'Test Route', startLocationId: '1', endLocationId: '2' }
    ]);
    
    (mockServices.rollingStockService.getAllRollingStock as jest.Mock).mockResolvedValue([
      { _id: '1', roadName: 'Test Road', roadNumber: '1', aarType: 'BOX', description: 'Test', color: 'red', note: 'test', homeYard: '1', ownerId: '1' }
    ]);
  });

  it('initializes with loading state', async () => {
    const { result } = renderHook(() => useDashboardData(mockServices));
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.locations).toEqual([]);
    expect(result.current.industries).toEqual([]);
    expect(result.current.trainRoutes).toEqual([]);
    expect(result.current.rollingStock).toEqual([]);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('fetches data successfully', async () => {
    const { result } = renderHook(() => useDashboardData(mockServices));
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.locations).toHaveLength(1);
      expect(result.current.industries).toHaveLength(1);
      expect(result.current.trainRoutes).toHaveLength(1);
      expect(result.current.rollingStock).toHaveLength(1);
    });
  });

  it('handles errors correctly', async () => {
    const errorServices = {...mockServices};
    (errorServices.locationService.getAllLocations as jest.Mock).mockRejectedValue(new Error('Failed to fetch locations'));
    
    const { result } = renderHook(() => useDashboardData(errorServices));
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Failed to fetch locations');
    });
  });

  it('refreshes data when called', async () => {
    const { result } = renderHook(() => useDashboardData(mockServices));
    
    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Clear all mock call counts
    jest.clearAllMocks();
    
    // Call refresh
    await act(async () => {
      await result.current.refreshData();
    });
    
    // Each service should have been called exactly once during the refresh
    expect(mockServices.locationService.getAllLocations).toHaveBeenCalledTimes(1);
    expect(mockServices.industryService.getAllIndustries).toHaveBeenCalledTimes(1);
    expect(mockServices.trainRouteService.getAllTrainRoutes).toHaveBeenCalledTimes(1);
    expect(mockServices.rollingStockService.getAllRollingStock).toHaveBeenCalledTimes(1);
  });
}); 