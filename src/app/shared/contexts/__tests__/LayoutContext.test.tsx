import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { LayoutProvider, useLayout } from '../LayoutContext';
import { LocationService } from '../../services/LocationService';
import { IndustryService } from '../../services/IndustryService';
import { TrainRouteService } from '../../services/TrainRouteService';
import { Location, Industry, TrainRoute } from '@/shared/types/models';

jest.mock('../../services/LocationService');
jest.mock('../../services/IndustryService');
jest.mock('../../services/TrainRouteService');

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

const TestComponent = () => {
  const { locations, industries, trainRoutes, error, isLoading, refreshData } = useLayout();
  return (
    <div>
      <div data-testid="locations">{locations?.length || 0}</div>
      <div data-testid="industries">{industries?.length || 0}</div>
      <div data-testid="trainRoutes">{trainRoutes?.length || 0}</div>
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
    (LocationService as jest.Mock).mockImplementation(() => ({
      getAllLocations: jest.fn().mockResolvedValue(mockLocations)
    }));
    (IndustryService as jest.Mock).mockImplementation(() => ({
      getAllIndustries: jest.fn().mockResolvedValue(mockIndustries)
    }));
    (TrainRouteService as jest.Mock).mockImplementation(() => ({
      getAllTrainRoutes: jest.fn().mockResolvedValue(mockTrainRoutes)
    }));

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
  });

  it('loads all data successfully', async () => {
    (LocationService as jest.Mock).mockImplementation(() => ({
      getAllLocations: jest.fn().mockResolvedValue(mockLocations)
    }));
    (IndustryService as jest.Mock).mockImplementation(() => ({
      getAllIndustries: jest.fn().mockResolvedValue(mockIndustries)
    }));
    (TrainRouteService as jest.Mock).mockImplementation(() => ({
      getAllTrainRoutes: jest.fn().mockResolvedValue(mockTrainRoutes)
    }));

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('locations')).toHaveTextContent('2');
    expect(screen.getByTestId('industries')).toHaveTextContent('2');
    expect(screen.getByTestId('trainRoutes')).toHaveTextContent('2');
    expect(screen.getByTestId('error')).toHaveTextContent('');
  });

  it('handles location service error', async () => {
    (LocationService as jest.Mock).mockImplementation(() => ({
      getAllLocations: jest.fn().mockRejectedValue(new Error('Failed to load locations'))
    }));
    (IndustryService as jest.Mock).mockImplementation(() => ({
      getAllIndustries: jest.fn().mockResolvedValue(mockIndustries)
    }));
    (TrainRouteService as jest.Mock).mockImplementation(() => ({
      getAllTrainRoutes: jest.fn().mockResolvedValue(mockTrainRoutes)
    }));

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load locations');
    });
  });

  it('handles industry service error', async () => {
    (LocationService as jest.Mock).mockImplementation(() => ({
      getAllLocations: jest.fn().mockResolvedValue(mockLocations)
    }));
    (IndustryService as jest.Mock).mockImplementation(() => ({
      getAllIndustries: jest.fn().mockRejectedValue(new Error('Failed to load industries'))
    }));
    (TrainRouteService as jest.Mock).mockImplementation(() => ({
      getAllTrainRoutes: jest.fn().mockResolvedValue(mockTrainRoutes)
    }));

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load industries');
    });
  });

  it('handles train route service error', async () => {
    (LocationService as jest.Mock).mockImplementation(() => ({
      getAllLocations: jest.fn().mockResolvedValue(mockLocations)
    }));
    (IndustryService as jest.Mock).mockImplementation(() => ({
      getAllIndustries: jest.fn().mockResolvedValue(mockIndustries)
    }));
    (TrainRouteService as jest.Mock).mockImplementation(() => ({
      getAllTrainRoutes: jest.fn().mockRejectedValue(new Error('Failed to load train routes'))
    }));

    render(
      <LayoutProvider>
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

    const getAllLocationsMock = jest.fn()
      .mockResolvedValueOnce(initialLocations)
      .mockResolvedValueOnce(updatedLocations);

    (LocationService as jest.Mock).mockImplementation(() => ({
      getAllLocations: getAllLocationsMock
    }));
    (IndustryService as jest.Mock).mockImplementation(() => ({
      getAllIndustries: jest.fn().mockResolvedValue(mockIndustries)
    }));
    (TrainRouteService as jest.Mock).mockImplementation(() => ({
      getAllTrainRoutes: jest.fn().mockResolvedValue(mockTrainRoutes)
    }));

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('locations')).toHaveTextContent('1');
    });

    const refreshButton = screen.getByText('Refresh Data');
    await act(async () => {
      refreshButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('locations')).toHaveTextContent('2');
    });

    expect(getAllLocationsMock).toHaveBeenCalledTimes(2);
  });

  it('uses cached data on subsequent renders', async () => {
    const getAllLocationsMock = jest.fn().mockResolvedValue(mockLocations);
    const getAllIndustriesMock = jest.fn().mockResolvedValue(mockIndustries);
    const getAllTrainRoutesMock = jest.fn().mockResolvedValue(mockTrainRoutes);

    (LocationService as jest.Mock).mockImplementation(() => ({
      getAllLocations: getAllLocationsMock
    }));
    (IndustryService as jest.Mock).mockImplementation(() => ({
      getAllIndustries: getAllIndustriesMock
    }));
    (TrainRouteService as jest.Mock).mockImplementation(() => ({
      getAllTrainRoutes: getAllTrainRoutesMock
    }));

    // First render
    const { rerender } = render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Second render
    rerender(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    // Verify data is still present without new API calls
    expect(screen.getByTestId('locations')).toHaveTextContent('2');
    expect(screen.getByTestId('industries')).toHaveTextContent('2');
    expect(screen.getByTestId('trainRoutes')).toHaveTextContent('2');
    expect(getAllLocationsMock).toHaveBeenCalledTimes(1);
    expect(getAllIndustriesMock).toHaveBeenCalledTimes(1);
    expect(getAllTrainRoutesMock).toHaveBeenCalledTimes(1);
  });
}); 