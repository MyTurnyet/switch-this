import { render, screen, act } from '@testing-library/react';
import { LayoutProvider, useLayout } from '../LayoutContext';
import { LocationService } from '../../services/LocationService';
import { IndustryService } from '../../services/IndustryService';
import { TrainRouteService } from '../../services/TrainRouteService';
import { RollingStockService } from '../../services/RollingStockService';
import { Location, Industry, TrainRoute, RollingStock } from '@/shared/types/models';
import userEvent from '@testing-library/user-event';

jest.mock('../../services/LocationService');
jest.mock('../../services/IndustryService');
jest.mock('../../services/TrainRouteService');
jest.mock('../../services/RollingStockService');

const TestComponent = () => {
  const { locations, industries, trainRoutes, rollingStock, error, isLoading, refreshData } = useLayout();
  return (
    <div>
      <div data-testid="locations">{locations?.length || 0}</div>
      <div data-testid="industries">{industries?.length || 0}</div>
      <div data-testid="trainRoutes">{trainRoutes?.length || 0}</div>
      <div data-testid="rollingStock">{rollingStock?.length || 0}</div>
      {error && <div data-testid="error">{error}</div>}
      <div data-testid="loading">{isLoading.toString()}</div>
      <button onClick={refreshData}>Refresh</button>
    </div>
  );
};

describe('LayoutProvider', () => {
  let mockLocationService: jest.Mocked<LocationService>;
  let mockIndustryService: jest.Mocked<IndustryService>;
  let mockTrainRouteService: jest.Mocked<TrainRouteService>;
  let mockRollingStockService: jest.Mocked<RollingStockService>;

  const mockData = {
    locations: [{ _id: '1', stationName: 'Test Station', block: 'A', ownerId: '1' }] as Location[],
    industries: [{ _id: '1', name: 'Test Industry', industryType: 'FREIGHT', tracks: [], locationId: '1', ownerId: '1' }] as Industry[],
    trainRoutes: [{ _id: '1', name: 'Test Route', routeNumber: 'TR1', routeType: 'MIXED', originatingYardId: '1', terminatingYardId: '2', stations: [] }] as TrainRoute[],
    rollingStock: [{ _id: '1', roadName: 'TEST', roadNumber: '1234', aarType: 'XM', description: 'Test Car', color: 'RED', homeYard: '1', ownerId: '1' }] as RollingStock[]
  };

  beforeEach(() => {
    mockLocationService = {
      getAllLocations: jest.fn()
    } as jest.Mocked<LocationService>;

    mockIndustryService = {
      getAllIndustries: jest.fn()
    } as jest.Mocked<IndustryService>;

    mockTrainRouteService = {
      getAllTrainRoutes: jest.fn()
    } as jest.Mocked<TrainRouteService>;

    mockRollingStockService = {
      getAllRollingStock: jest.fn()
    } as jest.Mocked<RollingStockService>;
  });

  it('should handle errors when loading data', async () => {
    const error = new Error('Failed to fetch');
    mockLocationService.getAllLocations.mockRejectedValue(error);
    mockIndustryService.getAllIndustries.mockRejectedValue(error);
    mockTrainRouteService.getAllTrainRoutes.mockRejectedValue(error);
    mockRollingStockService.getAllRollingStock.mockRejectedValue(error);

    render(
      <LayoutProvider
        locationService={mockLocationService}
        industryService={mockIndustryService}
        trainRouteService={mockTrainRouteService}
        rollingStockService={mockRollingStockService}
      >
        <TestComponent />
      </LayoutProvider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('error')).toHaveTextContent('Failed to fetch');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('should load data successfully', async () => {
    mockLocationService.getAllLocations.mockResolvedValue(mockData.locations);
    mockIndustryService.getAllIndustries.mockResolvedValue(mockData.industries);
    mockTrainRouteService.getAllTrainRoutes.mockResolvedValue(mockData.trainRoutes);
    mockRollingStockService.getAllRollingStock.mockResolvedValue(mockData.rollingStock);

    render(
      <LayoutProvider
        locationService={mockLocationService}
        industryService={mockIndustryService}
        trainRouteService={mockTrainRouteService}
        rollingStockService={mockRollingStockService}
      >
        <TestComponent />
      </LayoutProvider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('locations')).toHaveTextContent('1');
    expect(screen.getByTestId('industries')).toHaveTextContent('1');
    expect(screen.getByTestId('trainRoutes')).toHaveTextContent('1');
    expect(screen.getByTestId('rollingStock')).toHaveTextContent('1');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  it('should refresh data when requested', async () => {
    mockLocationService.getAllLocations.mockResolvedValue(mockData.locations);
    mockIndustryService.getAllIndustries.mockResolvedValue(mockData.industries);
    mockTrainRouteService.getAllTrainRoutes.mockResolvedValue(mockData.trainRoutes);
    mockRollingStockService.getAllRollingStock.mockResolvedValue(mockData.rollingStock);

    render(
      <LayoutProvider
        locationService={mockLocationService}
        industryService={mockIndustryService}
        trainRouteService={mockTrainRouteService}
        rollingStockService={mockRollingStockService}
      >
        <TestComponent />
      </LayoutProvider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await userEvent.click(screen.getByText('Refresh'));
    });

    expect(mockLocationService.getAllLocations).toHaveBeenCalledTimes(2);
    expect(mockIndustryService.getAllIndustries).toHaveBeenCalledTimes(2);
    expect(mockTrainRouteService.getAllTrainRoutes).toHaveBeenCalledTimes(2);
    expect(mockRollingStockService.getAllRollingStock).toHaveBeenCalledTimes(2);
  });
}); 