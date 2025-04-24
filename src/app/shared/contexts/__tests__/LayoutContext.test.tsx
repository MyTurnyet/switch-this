import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { LayoutProvider, useLayoutContext } from '../LayoutContext';
import { LocationService } from '../../services/LocationService';
import { IndustryService } from '../../services/IndustryService';
import { TrainRouteService } from '../../services/TrainRouteService';

// Mock the services
jest.mock('../../services/LocationService');
jest.mock('../../services/IndustryService');
jest.mock('../../services/TrainRouteService');

describe('LayoutContext', () => {
  const mockLocations = [{ id: 1, name: 'Location 1' }];
  const mockIndustries = [{ id: 1, name: 'Industry 1' }];
  const mockTrainRoutes = [{ id: 1, name: 'Route 1' }];

  const mockGetAllLocations = jest.fn();
  const mockGetAllIndustries = jest.fn();
  const mockGetAllTrainRoutes = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the service methods with delayed responses
    mockGetAllLocations.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockLocations), 100)));
    mockGetAllIndustries.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockIndustries), 100)));
    mockGetAllTrainRoutes.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockTrainRoutes), 100)));

    // Set up service mocks
    (LocationService.prototype.getAllLocations as jest.Mock).mockImplementation(() => mockGetAllLocations());
    (IndustryService.prototype.getAllIndustries as jest.Mock).mockImplementation(() => mockGetAllIndustries());
    (TrainRouteService.prototype.getAllTrainRoutes as jest.Mock).mockImplementation(() => mockGetAllTrainRoutes());
  });

  it('provides default layout values', async () => {
    const TestComponent = () => {
      const {
        locations,
        industries,
        trainRoutes,
        isLoadingLocations,
        isLoadingIndustries,
        isLoadingTrainRoutes,
      } = useLayoutContext();
      return (
        <div>
          <span data-testid="loading-locations">{isLoadingLocations.toString()}</span>
          <span data-testid="loading-industries">{isLoadingIndustries.toString()}</span>
          <span data-testid="loading-train-routes">{isLoadingTrainRoutes.toString()}</span>
          <span data-testid="locations-count">{locations.length}</span>
          <span data-testid="industries-count">{industries.length}</span>
          <span data-testid="train-routes-count">{trainRoutes.length}</span>
        </div>
      );
    };

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    // Initial state should show loading and empty arrays
    expect(screen.getByTestId('loading-locations').textContent).toBe('true');
    expect(screen.getByTestId('loading-industries').textContent).toBe('true');
    expect(screen.getByTestId('loading-train-routes').textContent).toBe('true');
    expect(screen.getByTestId('locations-count').textContent).toBe('0');
    expect(screen.getByTestId('industries-count').textContent).toBe('0');
    expect(screen.getByTestId('train-routes-count').textContent).toBe('0');

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-locations').textContent).toBe('false');
      expect(screen.getByTestId('loading-industries').textContent).toBe('false');
      expect(screen.getByTestId('loading-train-routes').textContent).toBe('false');
    });

    // Verify data is loaded
    expect(screen.getByTestId('locations-count').textContent).toBe('1');
    expect(screen.getByTestId('industries-count').textContent).toBe('1');
    expect(screen.getByTestId('train-routes-count').textContent).toBe('1');
  });

  it('loads data successfully', async () => {
    const TestComponent = () => {
      const {
        locations,
        industries,
        trainRoutes,
        isLoadingLocations,
        isLoadingIndustries,
        isLoadingTrainRoutes,
      } = useLayoutContext();
      return (
        <div>
          <span data-testid="loading-locations">{isLoadingLocations.toString()}</span>
          <span data-testid="loading-industries">{isLoadingIndustries.toString()}</span>
          <span data-testid="loading-train-routes">{isLoadingTrainRoutes.toString()}</span>
          <span data-testid="locations">{locations.length}</span>
          <span data-testid="industries">{industries.length}</span>
          <span data-testid="trainRoutes">{trainRoutes.length}</span>
        </div>
      );
    };

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    // Wait for loading to complete and data to be populated
    await waitFor(() => {
      expect(screen.getByTestId('loading-locations').textContent).toBe('false');
      expect(screen.getByTestId('loading-industries').textContent).toBe('false');
      expect(screen.getByTestId('loading-train-routes').textContent).toBe('false');
    });

    expect(screen.getByTestId('locations').textContent).toBe('1');
    expect(screen.getByTestId('industries').textContent).toBe('1');
    expect(screen.getByTestId('trainRoutes').textContent).toBe('1');
  });

  it('handles errors when loading data', async () => {
    mockGetAllLocations.mockRejectedValueOnce(new Error('Failed to fetch locations'));
    mockGetAllIndustries.mockRejectedValueOnce(new Error('Failed to fetch industries'));
    mockGetAllTrainRoutes.mockRejectedValueOnce(new Error('Failed to fetch train routes'));

    const TestComponent = () => {
      const {
        locationError,
        industryError,
        trainRouteError,
        isLoadingLocations,
        isLoadingIndustries,
        isLoadingTrainRoutes,
      } = useLayoutContext();
      return (
        <div>
          <span data-testid="loading-locations">{isLoadingLocations.toString()}</span>
          <span data-testid="loading-industries">{isLoadingIndustries.toString()}</span>
          <span data-testid="loading-train-routes">{isLoadingTrainRoutes.toString()}</span>
          <span data-testid="locationError">{locationError}</span>
          <span data-testid="industryError">{industryError}</span>
          <span data-testid="trainRouteError">{trainRouteError}</span>
        </div>
      );
    };

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-locations').textContent).toBe('false');
      expect(screen.getByTestId('loading-industries').textContent).toBe('false');
      expect(screen.getByTestId('loading-train-routes').textContent).toBe('false');
    });

    expect(screen.getByTestId('locationError').textContent).toBe('Failed to load locations: Failed to fetch locations');
    expect(screen.getByTestId('industryError').textContent).toBe('Failed to load industries: Failed to fetch industries');
    expect(screen.getByTestId('trainRouteError').textContent).toBe('Failed to load train routes: Failed to fetch train routes');
  });

  describe('manual refresh', () => {
    it('should fetch data when refresh buttons are clicked', async () => {
      const TestComponent = () => {
        const { fetchLocations, fetchIndustries, fetchTrainRoutes } = useLayoutContext();
        return (
          <div>
            <button data-testid="refresh-locations" onClick={fetchLocations}>
              Refresh Locations
            </button>
            <button data-testid="refresh-industries" onClick={fetchIndustries}>
              Refresh Industries
            </button>
            <button data-testid="refresh-routes" onClick={fetchTrainRoutes}>
              Refresh Routes
            </button>
          </div>
        );
      };

      render(
        <LayoutProvider>
          <TestComponent />
        </LayoutProvider>
      );

      // Wait for initial data fetch
      await waitFor(() => {
        expect(mockGetAllLocations).toHaveBeenCalledTimes(1);
        expect(mockGetAllIndustries).toHaveBeenCalledTimes(1);
        expect(mockGetAllTrainRoutes).toHaveBeenCalledTimes(1);
      });

      // Click refresh locations button
      await act(async () => {
        fireEvent.click(screen.getByTestId('refresh-locations'));
      });
      await waitFor(() => {
        expect(mockGetAllLocations).toHaveBeenCalledTimes(2);
      });

      // Click refresh industries button
      await act(async () => {
        fireEvent.click(screen.getByTestId('refresh-industries'));
      });
      await waitFor(() => {
        expect(mockGetAllIndustries).toHaveBeenCalledTimes(2);
      });

      // Click refresh routes button
      await act(async () => {
        fireEvent.click(screen.getByTestId('refresh-routes'));
      });
      await waitFor(() => {
        expect(mockGetAllTrainRoutes).toHaveBeenCalledTimes(2);
      });
    });
  });
}); 