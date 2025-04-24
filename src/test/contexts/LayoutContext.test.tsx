import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { LayoutProvider, useLayout } from '@/app/shared/contexts/LayoutContext';
import { Location, Industry, TrainRoute, RollingStock } from '@/shared/types/models';

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
    const mockServices = {
      locationService: {
        getAllLocations: jest.fn().mockResolvedValue(mockLocations)
      },
      industryService: {
        getAllIndustries: jest.fn().mockResolvedValue(mockIndustries)
      },
      trainRouteService: {
        getAllTrainRoutes: jest.fn().mockResolvedValue(mockTrainRoutes)
      },
      rollingStockService: {
        getAllRollingStock: jest.fn().mockResolvedValue(mockRollingStock)
      }
    };

    render(
      <LayoutProvider services={mockServices}>
        <TestComponent />
      </LayoutProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
  });

  it('loads all data successfully', async () => {
    const mockServices = {
      locationService: {
        getAllLocations: jest.fn().mockResolvedValue(mockLocations)
      },
      industryService: {
        getAllIndustries: jest.fn().mockResolvedValue(mockIndustries)
      },
      trainRouteService: {
        getAllTrainRoutes: jest.fn().mockResolvedValue(mockTrainRoutes)
      },
      rollingStockService: {
        getAllRollingStock: jest.fn().mockResolvedValue(mockRollingStock)
      }
    };

    render(
      <LayoutProvider services={mockServices}>
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
    const mockServices = {
      locationService: {
        getAllLocations: jest.fn().mockRejectedValue(new Error('Failed to load locations'))
      },
      industryService: {
        getAllIndustries: jest.fn().mockResolvedValue(mockIndustries)
      },
      trainRouteService: {
        getAllTrainRoutes: jest.fn().mockResolvedValue(mockTrainRoutes)
      },
      rollingStockService: {
        getAllRollingStock: jest.fn().mockResolvedValue(mockRollingStock)
      }
    };

    render(
      <LayoutProvider services={mockServices}>
        <TestComponent />
      </LayoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load locations');
    });
  });

  it('handles industry service error', async () => {
    const mockServices = {
      locationService: {
        getAllLocations: jest.fn().mockResolvedValue(mockLocations)
      },
      industryService: {
        getAllIndustries: jest.fn().mockRejectedValue(new Error('Failed to load industries'))
      },
      trainRouteService: {
        getAllTrainRoutes: jest.fn().mockResolvedValue(mockTrainRoutes)
      },
      rollingStockService: {
        getAllRollingStock: jest.fn().mockResolvedValue(mockRollingStock)
      }
    };

    render(
      <LayoutProvider services={mockServices}>
        <TestComponent />
      </LayoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load industries');
    });
  });

  it('handles train route service error', async () => {
    const mockServices = {
      locationService: {
        getAllLocations: jest.fn().mockResolvedValue(mockLocations)
      },
      industryService: {
        getAllIndustries: jest.fn().mockResolvedValue(mockIndustries)
      },
      trainRouteService: {
        getAllTrainRoutes: jest.fn().mockRejectedValue(new Error('Failed to load train routes'))
      },
      rollingStockService: {
        getAllRollingStock: jest.fn().mockResolvedValue(mockRollingStock)
      }
    };

    render(
      <LayoutProvider services={mockServices}>
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

    const mockServices = {
      locationService: {
        getAllLocations: jest.fn()
          .mockResolvedValueOnce(initialLocations)
          .mockResolvedValueOnce(updatedLocations)
      },
      industryService: {
        getAllIndustries: jest.fn().mockResolvedValue(mockIndustries)
      },
      trainRouteService: {
        getAllTrainRoutes: jest.fn().mockResolvedValue(mockTrainRoutes)
      },
      rollingStockService: {
        getAllRollingStock: jest.fn().mockResolvedValue(mockRollingStock)
      }
    };

    render(
      <LayoutProvider services={mockServices}>
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

    expect(mockServices.locationService.getAllLocations).toHaveBeenCalledTimes(2);
  });
}); 