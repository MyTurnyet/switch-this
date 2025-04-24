import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { LayoutProvider, useLayoutContext } from '@/app/shared/contexts/LayoutContext';

const mockLocations = [{ _id: '1', stationName: 'Test Station', block: 'A1', ownerId: 'owner1' }];
const mockIndustries = [{
  _id: '1',
  name: 'Test Industry',
  industryType: 'FREIGHT',
  tracks: [{ _id: 't1', name: 'Track 1', maxCars: 5, placedCars: [] }],
  locationId: '1',
  ownerId: 'owner1'
}];
const mockTrainRoutes = [{
  _id: '1',
  name: 'Test Route',
  routeNumber: 'R1',
  routeType: 'MIXED',
  originatingYardId: '1',
  terminatingYardId: '2',
  stations: []
}];

// Mock the services
const mockGetAllLocations = jest.fn();
const mockGetAllIndustries = jest.fn();
const mockGetAllTrainRoutes = jest.fn();

// Mock service classes
jest.mock('@/app/shared/services/LocationService', () => ({
  LocationService: jest.fn().mockImplementation(() => ({
    getAllLocations: mockGetAllLocations
  }))
}));

jest.mock('@/app/shared/services/IndustryService', () => ({
  IndustryService: jest.fn().mockImplementation(() => ({
    getAllIndustries: mockGetAllIndustries
  }))
}));

jest.mock('@/app/shared/services/TrainRouteService', () => ({
  TrainRouteService: jest.fn().mockImplementation(() => ({
    getAllTrainRoutes: mockGetAllTrainRoutes
  }))
}));

// Mock React.startTransition to execute callback immediately
jest.spyOn(React, 'startTransition').mockImplementation((callback) => callback());

const TestComponent = () => {
  const context = useLayoutContext();
  return (
    <div>
      <div data-testid="locations">{context.locations.length}</div>
      <div data-testid="industries">{context.industries.length}</div>
      <div data-testid="trainRoutes">{context.trainRoutes.length}</div>
      <div data-testid="locationError">{context.locationError}</div>
      <div data-testid="industryError">{context.industryError}</div>
      <div data-testid="trainRouteError">{context.trainRouteError}</div>
      <button onClick={() => context.fetchLocations()}>Fetch Locations</button>
      <button onClick={() => context.fetchIndustries()}>Fetch Industries</button>
      <button onClick={() => context.fetchTrainRoutes()}>Fetch Train Routes</button>
    </div>
  );
};

describe('LayoutContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllLocations.mockResolvedValue(mockLocations);
    mockGetAllIndustries.mockResolvedValue(mockIndustries);
    mockGetAllTrainRoutes.mockResolvedValue(mockTrainRoutes);
  });

  it('provides initial state', async () => {
    await act(async () => {
      render(
        <LayoutProvider>
          <TestComponent />
        </LayoutProvider>
      );
    });

    expect(screen.getByTestId('locations')).toHaveTextContent('1');
    expect(screen.getByTestId('industries')).toHaveTextContent('1');
    expect(screen.getByTestId('trainRoutes')).toHaveTextContent('1');
  });

  it('loads data successfully', async () => {
    await act(async () => {
      render(
        <LayoutProvider>
          <TestComponent />
        </LayoutProvider>
      );
    });

    await waitFor(() => {
      expect(mockGetAllLocations).toHaveBeenCalledTimes(1);
      expect(mockGetAllIndustries).toHaveBeenCalledTimes(1);
      expect(mockGetAllTrainRoutes).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId('locations')).toHaveTextContent('1');
    expect(screen.getByTestId('industries')).toHaveTextContent('1');
    expect(screen.getByTestId('trainRoutes')).toHaveTextContent('1');
  });

  it('handles errors when loading data', async () => {
    mockGetAllLocations.mockRejectedValueOnce(new Error('Location error'));
    mockGetAllIndustries.mockRejectedValueOnce(new Error('Industry error'));
    mockGetAllTrainRoutes.mockRejectedValueOnce(new Error('Train route error'));

    await act(async () => {
      render(
        <LayoutProvider>
          <TestComponent />
        </LayoutProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('locationError')).toHaveTextContent('Failed to load locations: Location error');
      expect(screen.getByTestId('industryError')).toHaveTextContent('Failed to load industries: Industry error');
      expect(screen.getByTestId('trainRouteError')).toHaveTextContent('Failed to load train routes: Train route error');
    });
  });

  it('allows manual data refresh', async () => {
    await act(async () => {
      render(
        <LayoutProvider>
          <TestComponent />
        </LayoutProvider>
      );
    });

    // Wait for initial data load
    await waitFor(() => {
      expect(mockGetAllLocations).toHaveBeenCalledTimes(1);
      expect(mockGetAllIndustries).toHaveBeenCalledTimes(1);
      expect(mockGetAllTrainRoutes).toHaveBeenCalledTimes(1);
    });

    // Reset mock counters after initial load
    mockGetAllLocations.mockClear();
    mockGetAllIndustries.mockClear();
    mockGetAllTrainRoutes.mockClear();

    // Trigger manual refresh
    await act(async () => {
      fireEvent.click(screen.getByText('Fetch Locations'));
      fireEvent.click(screen.getByText('Fetch Industries'));
      fireEvent.click(screen.getByText('Fetch Train Routes'));
    });

    // Check that each service was called again
    await waitFor(() => {
      expect(mockGetAllLocations).toHaveBeenCalledTimes(1);
      expect(mockGetAllIndustries).toHaveBeenCalledTimes(1);
      expect(mockGetAllTrainRoutes).toHaveBeenCalledTimes(1);
    });
  });

  it('throws error when used outside provider', () => {
    const TestComponentWithoutProvider = () => {
      try {
        useLayoutContext();
        return <div>No error</div>;
      } catch {
        return <div>Error caught</div>;
      }
    };

    render(<TestComponentWithoutProvider />);
    expect(screen.getByText('Error caught')).toBeInTheDocument();
  });
}); 