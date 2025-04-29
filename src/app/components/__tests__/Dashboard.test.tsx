import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { Dashboard } from '../Dashboard';
import { ClientServices } from '../../shared/services/clientServices';
import { Location, Industry, TrainRoute, RollingStock } from '../../shared/types/models';

describe('Dashboard', () => {
  let mockServices: ClientServices;
  
  beforeEach(() => {
    // Create mock service implementations
    mockServices = {
      locationService: {
        getAllLocations: jest.fn()
      },
      industryService: {
        getAllIndustries: jest.fn()
      },
      trainRouteService: {
        getAllTrainRoutes: jest.fn()
      },
      rollingStockService: {
        getAllRollingStock: jest.fn(),
        updateRollingStock: jest.fn(),
        resetToHomeYards: jest.fn()
      }
    };
    
    // Set up mock return values
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

  it('should render loading state initially', async () => {
    // Mock the useDashboardData hook to return isLoading: true
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [true, jest.fn()]);
    
    render(<Dashboard services={mockServices} />);

    // Wait for UI to update
    await waitFor(() => {
      expect(screen.getAllByTestId('loading-pulse')).toHaveLength(4);
    });
  });

  it('should render data after loading', async () => {
    await act(async () => {
      render(<Dashboard services={mockServices} />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('1')).toHaveLength(4);
    });
  });

  it('should render error state when fetch fails', async () => {
    const errorServices = {...mockServices};
    (errorServices.locationService.getAllLocations as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    
    render(<Dashboard services={errorServices} />);

    await waitFor(() => {
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', async () => {
    const mockPromises = [
      new Promise<Location[]>(() => {}),
      new Promise<Industry[]>(() => {}),
      new Promise<TrainRoute[]>(() => {}),
      new Promise<RollingStock[]>(() => {})
    ];

    (mockServices.locationService.getAllLocations as jest.Mock).mockImplementation(() => mockPromises[0]);
    (mockServices.industryService.getAllIndustries as jest.Mock).mockImplementation(() => mockPromises[1]);
    (mockServices.trainRouteService.getAllTrainRoutes as jest.Mock).mockImplementation(() => mockPromises[2]);
    (mockServices.rollingStockService.getAllRollingStock as jest.Mock).mockImplementation(() => mockPromises[3]);

    await act(async () => {
      render(<Dashboard services={mockServices} />);
    });

    expect(screen.getAllByText('...')).toHaveLength(4);
    expect(screen.getAllByTestId('loading-pulse')).toHaveLength(4);
  });

  it('shows error state when service fails', async () => {
    (mockServices.locationService.getAllLocations as jest.Mock).mockRejectedValue(new Error('Failed to fetch locations'));

    await act(async () => {
      render(<Dashboard services={mockServices} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch locations')).toBeInTheDocument();
    });
  });

  it('renders data when loaded', async () => {
    const mockData = {
      locations: [{ 
        _id: '1', 
        stationName: 'Location 1',
        block: 'A',
        ownerId: '1'
      }],
      industries: [{ 
        _id: '1',
        name: 'Industry 1',
        locationId: '1',
        blockName: 'A',
        industryType: 'FREIGHT',
        tracks: [],
        ownerId: '1'
      }],
      trainRoutes: [{ 
        _id: '1',
        name: 'Route 1',
        routeNumber: '101',
        routeType: 'LOCAL',
        originatingYardId: '1',
        terminatingYardId: '2',
        stations: [],
        startLocationId: '1',
        endLocationId: '2'
      }],
      rollingStock: [{ 
        _id: '1',
        name: 'Stock 1',
        roadName: 'BNSF',
        roadNumber: '1234',
        aarType: 'XM',
        type: 'BOXCAR',
        description: 'Test stock',
        currentLocationId: '1',
        length: 40,
        weight: 1000,
        color: 'blue',
        ownerId: '1'
      }]
    };

    (mockServices.locationService.getAllLocations as jest.Mock).mockResolvedValue(mockData.locations);
    (mockServices.industryService.getAllIndustries as jest.Mock).mockResolvedValue(mockData.industries);
    (mockServices.trainRouteService.getAllTrainRoutes as jest.Mock).mockResolvedValue(mockData.trainRoutes);
    (mockServices.rollingStockService.getAllRollingStock as jest.Mock).mockResolvedValue(mockData.rollingStock);

    await act(async () => {
      render(<Dashboard services={mockServices} />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('1')).toHaveLength(4);
      expect(screen.getByText('Locations')).toBeInTheDocument();
      expect(screen.getByText('Industries')).toBeInTheDocument();
      expect(screen.getByText('Train Routes')).toBeInTheDocument();
      expect(screen.getByText('Rolling Stock')).toBeInTheDocument();
    });
  });
}); 