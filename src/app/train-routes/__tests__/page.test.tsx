import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrainRoutesPage from '../page';
import { services } from '@/app/shared/services';

// Mock the services
jest.mock('@/app/shared/services', () => ({
  services: {
    trainRouteService: {
      getAllTrainRoutes: jest.fn(),
    },
    locationService: {
      getAllLocations: jest.fn(),
    },
  },
}));

// Mock console.log and console.error to avoid cluttering test output
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.log as jest.Mock).mockRestore();
  (console.error as jest.Mock).mockRestore();
});

describe('TrainRoutesPage', () => {
  const mockTrainRoutes = [
    {
      _id: '1',
      name: 'West Coaster North',
      routeNumber: 'WC 202',
      routeType: 'MIXED',
      originatingYardId: '101',
      terminatingYardId: '101',
      stations: ['201', '202', '203'],
      ownerId: 'owner1'
    },
    {
      _id: '2',
      name: 'Echo Lake Turn',
      routeNumber: 'EL 103',
      routeType: 'PASSENGER',
      originatingYardId: '102',
      terminatingYardId: '102',
      stations: ['204', '205', '206'],
      ownerId: 'owner1'
    }
  ];

  const mockLocations = [
    { _id: '101', stationName: 'Central Yard', block: 'YARD', ownerId: 'owner1' },
    { _id: '102', stationName: 'Echo Lake Yard', block: 'YARD', ownerId: 'owner1' },
    { _id: '201', stationName: 'Seattle', block: 'SEA', ownerId: 'owner1' },
    { _id: '202', stationName: 'Everett', block: 'SEA', ownerId: 'owner1' },
    { _id: '203', stationName: 'Vancouver', block: 'NORTH', ownerId: 'owner1' },
    { _id: '204', stationName: 'Echo Lake', block: 'ECHO', ownerId: 'owner1' },
    { _id: '205', stationName: 'High Bridge', block: 'ECHO', ownerId: 'owner1' },
    { _id: '206', stationName: 'Seattle', block: 'SEA', ownerId: 'owner1' },
  ];

  beforeEach(() => {
    (services.trainRouteService.getAllTrainRoutes as jest.Mock).mockResolvedValue(mockTrainRoutes);
    (services.locationService.getAllLocations as jest.Mock).mockResolvedValue(mockLocations);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<TrainRoutesPage />);
    expect(screen.getByText('Loading train routes...')).toBeInTheDocument();
  });

  it('renders train routes after loading', async () => {
    render(<TrainRoutesPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading train routes...')).not.toBeInTheDocument();
    });

    // Check that train route names are displayed
    expect(screen.getByText('West Coaster North')).toBeInTheDocument();
    expect(screen.getByText('Echo Lake Turn')).toBeInTheDocument();
    
    // Check that route numbers are displayed
    expect(screen.getByText('WC 202')).toBeInTheDocument();
    expect(screen.getByText('EL 103')).toBeInTheDocument();
    
    // Check that route types are displayed
    expect(screen.getByText('MIXED')).toBeInTheDocument();
    expect(screen.getByText('PASSENGER')).toBeInTheDocument();
    
    // Check that yard names are displayed
    expect(screen.getAllByText('Central Yard')).toHaveLength(2); // Originating and terminating
    expect(screen.getAllByText('Echo Lake Yard')).toHaveLength(2); // Originating and terminating
    
    // Check that stations are displayed
    expect(screen.getAllByText('Seattle')).toHaveLength(2); // Appears in both routes
    expect(screen.getByText('Everett')).toBeInTheDocument();
    expect(screen.getByText('Vancouver')).toBeInTheDocument();
    expect(screen.getByText('Echo Lake')).toBeInTheDocument();
    expect(screen.getByText('High Bridge')).toBeInTheDocument();
  });

  it('handles API error', async () => {
    (services.trainRouteService.getAllTrainRoutes as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    
    render(<TrainRoutesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load data. Please try again later.')).toBeInTheDocument();
    });
  });

  it('renders empty state when no train routes are found', async () => {
    (services.trainRouteService.getAllTrainRoutes as jest.Mock).mockResolvedValue([]);
    
    render(<TrainRoutesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No train routes found.')).toBeInTheDocument();
    });
  });
}); 