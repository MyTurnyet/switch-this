import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '../Dashboard';
import { ClientServices } from '../../shared/services/clientServices';
import { act } from 'react-dom/test-utils';
import { Location, Industry, TrainRoute, RollingStock } from '@/shared/types/models';

const mockServices: ClientServices = {
  locationService: {
    getAllLocations: jest.fn().mockResolvedValue([])
  },
  industryService: {
    getAllIndustries: jest.fn().mockResolvedValue([])
  },
  trainRouteService: {
    getAllTrainRoutes: jest.fn().mockResolvedValue([])
  },
  rollingStockService: {
    getAllRollingStock: jest.fn().mockResolvedValue([])
  }
};

jest.mock('../../shared/services/clientServices', () => ({
  services: mockServices
}));

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', async () => {
    const mockPromises = [
      new Promise<Location[]>(() => {}),
      new Promise<Industry[]>(() => {}),
      new Promise<TrainRoute[]>(() => {}),
      new Promise<RollingStock[]>(() => {})
    ];

    mockServices.locationService.getAllLocations.mockImplementation(() => mockPromises[0]);
    mockServices.industryService.getAllIndustries.mockImplementation(() => mockPromises[1]);
    mockServices.trainRouteService.getAllTrainRoutes.mockImplementation(() => mockPromises[2]);
    mockServices.rollingStockService.getAllRollingStock.mockImplementation(() => mockPromises[3]);

    await act(async () => {
      render(<Dashboard services={mockServices} />);
    });

    expect(screen.getAllByText('...')).toHaveLength(4);
    expect(screen.getAllByTestId('loading-pulse')).toHaveLength(4);
  });

  it('shows error state when service fails', async () => {
    mockServices.locationService.getAllLocations.mockRejectedValue(new Error('Failed to fetch locations'));

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

    mockServices.locationService.getAllLocations.mockResolvedValue(mockData.locations);
    mockServices.industryService.getAllIndustries.mockResolvedValue(mockData.industries);
    mockServices.trainRouteService.getAllTrainRoutes.mockResolvedValue(mockData.trainRoutes);
    mockServices.rollingStockService.getAllRollingStock.mockResolvedValue(mockData.rollingStock);

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