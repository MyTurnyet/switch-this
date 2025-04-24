import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { LayoutProvider, useLayout } from '@/app/shared/contexts/LayoutContext';
import { LocationService } from '@/app/shared/services/LocationService';
import { IndustryService } from '@/app/shared/services/IndustryService';
import { TrainRouteService } from '@/app/shared/services/TrainRouteService';
import { RollingStockService } from '@/app/shared/services/RollingStockService';
import { Location, Industry, TrainRoute, RollingStock } from '@/shared/types/models';

jest.mock('@/app/shared/services/LocationService');
jest.mock('@/app/shared/services/IndustryService');
jest.mock('@/app/shared/services/TrainRouteService');
jest.mock('@/app/shared/services/RollingStockService');

const mockLocations: Location[] = [
  {
    _id: '1',
    stationName: 'Location 1',
    block: 'Block 1',
    ownerId: 'Owner 1'
  },
  {
    _id: '2',
    stationName: 'Location 2',
    block: 'Block 2',
    ownerId: 'Owner 2'
  }
];

const mockIndustries: Industry[] = [
  {
    _id: '1',
    name: 'Industry 1',
    industryType: 'FREIGHT',
    tracks: [],
    locationId: 'Location 1',
    ownerId: 'Owner 1'
  },
  {
    _id: '2',
    name: 'Industry 2',
    industryType: 'YARD',
    tracks: [],
    locationId: 'Location 2',
    ownerId: 'Owner 2'
  }
];

const mockTrainRoutes: TrainRoute[] = [
  {
    _id: '1',
    name: 'Route 1',
    routeNumber: 'R1',
    routeType: 'MIXED',
    originatingYardId: 'Yard 1',
    terminatingYardId: 'Yard 2',
    stations: []
  },
  {
    _id: '2',
    name: 'Route 2',
    routeNumber: 'R2',
    routeType: 'FREIGHT',
    originatingYardId: 'Yard 3',
    terminatingYardId: 'Yard 4',
    stations: []
  }
];

const mockRollingStock: RollingStock[] = [
  {
    _id: '1',
    roadName: 'TEST',
    roadNumber: '1234',
    aarType: 'XM',
    description: 'Test Car',
    color: 'RED',
    homeYard: '1',
    ownerId: '1',
    note: 'Test note'
  }
];

const TestComponent = () => {
  const { locations, industries, trainRoutes, rollingStock, error, isLoading, refreshData } = useLayout();
  return (
    <div>
      <div data-testid="locations">{locations?.length || 0}</div>
      <div data-testid="industries">{industries?.length || 0}</div>
      <div data-testid="trainRoutes">{trainRoutes?.length || 0}</div>
      <div data-testid="rollingStock">{rollingStock?.length || 0}</div>
      <div data-testid="error">{error || ''}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <button onClick={refreshData}>Refresh Data</button>
    </div>
  );
};

describe('LayoutContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', async () => {
    const mockLocationService = {
      getAllLocations: jest.fn().mockResolvedValue(mockLocations)
    };
    const mockIndustryService = {
      getAllIndustries: jest.fn().mockResolvedValue(mockIndustries)
    };
    const mockTrainRouteService = {
      getAllTrainRoutes: jest.fn().mockResolvedValue(mockTrainRoutes)
    };
    const mockRollingStockService = {
      getAllRollingStock: jest.fn().mockResolvedValue(mockRollingStock)
    };

    (LocationService as jest.Mock).mockImplementation(() => mockLocationService);
    (IndustryService as jest.Mock).mockImplementation(() => mockIndustryService);
    (TrainRouteService as jest.Mock).mockImplementation(() => mockTrainRouteService);
    (RollingStockService as jest.Mock).mockImplementation(() => mockRollingStockService);

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

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
  });

  it('loads all data successfully', async () => {
    const mockLocationService = {
      getAllLocations: jest.fn().mockResolvedValue(mockLocations)
    };
    const mockIndustryService = {
      getAllIndustries: jest.fn().mockResolvedValue(mockIndustries)
    };
    const mockTrainRouteService = {
      getAllTrainRoutes: jest.fn().mockResolvedValue(mockTrainRoutes)
    };
    const mockRollingStockService = {
      getAllRollingStock: jest.fn().mockResolvedValue(mockRollingStock)
    };

    (LocationService as jest.Mock).mockImplementation(() => mockLocationService);
    (IndustryService as jest.Mock).mockImplementation(() => mockIndustryService);
    (TrainRouteService as jest.Mock).mockImplementation(() => mockTrainRouteService);
    (RollingStockService as jest.Mock).mockImplementation(() => mockRollingStockService);

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

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('locations')).toHaveTextContent('2');
      expect(screen.getByTestId('industries')).toHaveTextContent('2');
      expect(screen.getByTestId('trainRoutes')).toHaveTextContent('2');
      expect(screen.getByTestId('rollingStock')).toHaveTextContent('1');
      expect(screen.getByTestId('error')).toHaveTextContent('');
    });
  });

  it('handles location service error', async () => {
    const mockLocationService = {
      getAllLocations: jest.fn().mockRejectedValue(new Error('Failed to load locations'))
    };
    const mockIndustryService = {
      getAllIndustries: jest.fn().mockResolvedValue(mockIndustries)
    };
    const mockTrainRouteService = {
      getAllTrainRoutes: jest.fn().mockResolvedValue(mockTrainRoutes)
    };
    const mockRollingStockService = {
      getAllRollingStock: jest.fn().mockResolvedValue(mockRollingStock)
    };

    (LocationService as jest.Mock).mockImplementation(() => mockLocationService);
    (IndustryService as jest.Mock).mockImplementation(() => mockIndustryService);
    (TrainRouteService as jest.Mock).mockImplementation(() => mockTrainRouteService);
    (RollingStockService as jest.Mock).mockImplementation(() => mockRollingStockService);

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

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load locations');
    });
  });

  it('handles industry service error', async () => {
    const mockLocationService = {
      getAllLocations: jest.fn().mockResolvedValue(mockLocations)
    };
    const mockIndustryService = {
      getAllIndustries: jest.fn().mockRejectedValue(new Error('Failed to load industries'))
    };
    const mockTrainRouteService = {
      getAllTrainRoutes: jest.fn().mockResolvedValue(mockTrainRoutes)
    };
    const mockRollingStockService = {
      getAllRollingStock: jest.fn().mockResolvedValue(mockRollingStock)
    };

    (LocationService as jest.Mock).mockImplementation(() => mockLocationService);
    (IndustryService as jest.Mock).mockImplementation(() => mockIndustryService);
    (TrainRouteService as jest.Mock).mockImplementation(() => mockTrainRouteService);
    (RollingStockService as jest.Mock).mockImplementation(() => mockRollingStockService);

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

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load industries');
    });
  });

  it('handles train route service error', async () => {
    const mockLocationService = {
      getAllLocations: jest.fn().mockResolvedValue(mockLocations)
    };
    const mockIndustryService = {
      getAllIndustries: jest.fn().mockResolvedValue(mockIndustries)
    };
    const mockTrainRouteService = {
      getAllTrainRoutes: jest.fn().mockRejectedValue(new Error('Failed to load train routes'))
    };
    const mockRollingStockService = {
      getAllRollingStock: jest.fn().mockResolvedValue(mockRollingStock)
    };

    (LocationService as jest.Mock).mockImplementation(() => mockLocationService);
    (IndustryService as jest.Mock).mockImplementation(() => mockIndustryService);
    (TrainRouteService as jest.Mock).mockImplementation(() => mockTrainRouteService);
    (RollingStockService as jest.Mock).mockImplementation(() => mockRollingStockService);

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

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load train routes');
    });
  });

  it('allows manual data refresh', async () => {
    const initialLocations = [mockLocations[0]];
    const updatedLocations = mockLocations;

    const mockLocationService = {
      getAllLocations: jest.fn()
        .mockResolvedValueOnce(initialLocations)
        .mockResolvedValueOnce(updatedLocations)
    };
    const mockIndustryService = {
      getAllIndustries: jest.fn().mockResolvedValue(mockIndustries)
    };
    const mockTrainRouteService = {
      getAllTrainRoutes: jest.fn().mockResolvedValue(mockTrainRoutes)
    };
    const mockRollingStockService = {
      getAllRollingStock: jest.fn().mockResolvedValue(mockRollingStock)
    };

    (LocationService as jest.Mock).mockImplementation(() => mockLocationService);
    (IndustryService as jest.Mock).mockImplementation(() => mockIndustryService);
    (TrainRouteService as jest.Mock).mockImplementation(() => mockTrainRouteService);
    (RollingStockService as jest.Mock).mockImplementation(() => mockRollingStockService);

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

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('locations')).toHaveTextContent('1');
    });

    await act(async () => {
      screen.getByText('Refresh Data').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('locations')).toHaveTextContent('2');
    });

    expect(mockLocationService.getAllLocations).toHaveBeenCalledTimes(2);
  });
}); 