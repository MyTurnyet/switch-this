import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { LayoutProvider, useLayout } from '../LayoutContext';
import { LocationService } from '../../services/LocationService';
import { IndustryService } from '../../services/IndustryService';
import { TrainRouteService } from '../../services/TrainRouteService';

jest.mock('../../services/LocationService');
jest.mock('../../services/IndustryService');
jest.mock('../../services/TrainRouteService');

describe('LayoutContext', () => {
  const mockLocations = [
    {
      _id: '1',
      stationName: 'Test Station',
      block: 'A1',
      ownerId: 'owner1'
    }
  ];

  const mockIndustries = [
    {
      _id: '1',
      name: 'Test Industry',
      industryType: 'FREIGHT',
      tracks: [{
        _id: 'track1',
        name: 'Track 1',
        maxCars: 3,
        placedCars: []
      }],
      locationId: 'loc1',
      ownerId: 'owner1'
    }
  ];

  const mockTrainRoutes = [
    {
      _id: '1',
      name: 'Test Route',
      routeNumber: 'R1',
      routeType: 'MIXED',
      originatingYardId: 'yard1',
      terminatingYardId: 'yard2',
      stations: [{
        _id: 'station1',
        stationName: 'Test Station',
        block: 'A1',
        ownerId: 'owner1'
      }]
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (LocationService as jest.MockedClass<typeof LocationService>).mockImplementation(() => ({
      getAllLocations: jest.fn().mockResolvedValue(mockLocations)
    }));
    (IndustryService as jest.MockedClass<typeof IndustryService>).mockImplementation(() => ({
      getAllIndustries: jest.fn().mockResolvedValue(mockIndustries)
    }));
    (TrainRouteService as jest.MockedClass<typeof TrainRouteService>).mockImplementation(() => ({
      getAllTrainRoutes: jest.fn().mockResolvedValue(mockTrainRoutes)
    }));
  });

  it('provides default layout values', () => {
    const TestComponent = () => {
      const { isSidebarOpen, toggleSidebar } = useLayout();
      return (
        <div>
          <span data-testid="sidebar-state">{isSidebarOpen.toString()}</span>
          <button onClick={toggleSidebar}>Toggle Sidebar</button>
        </div>
      );
    };

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    expect(screen.getByTestId('sidebar-state').textContent).toBe('false');
  });

  it('toggles sidebar state when toggleSidebar is called', () => {
    const TestComponent = () => {
      const { isSidebarOpen, toggleSidebar } = useLayout();
      return (
        <div>
          <span data-testid="sidebar-state">{isSidebarOpen.toString()}</span>
          <button onClick={toggleSidebar}>Toggle Sidebar</button>
        </div>
      );
    };

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    const toggleButton = screen.getByText('Toggle Sidebar');
    act(() => {
      toggleButton.click();
    });

    expect(screen.getByTestId('sidebar-state').textContent).toBe('true');
  });

  it('loads all data on mount', async () => {
    const TestComponent = () => {
      const {
        locations, industries, trainRoutes,
        isLoadingLocations, isLoadingIndustries, isLoadingTrainRoutes,
        locationError, industryError, trainRouteError
      } = useLayout();
      return (
        <div>
          <span data-testid="loading-locations">{isLoadingLocations.toString()}</span>
          <span data-testid="loading-industries">{isLoadingIndustries.toString()}</span>
          <span data-testid="loading-routes">{isLoadingTrainRoutes.toString()}</span>
          <span data-testid="error-locations">{locationError || 'no error'}</span>
          <span data-testid="error-industries">{industryError || 'no error'}</span>
          <span data-testid="error-routes">{trainRouteError || 'no error'}</span>
          <span data-testid="locations-count">{locations.length}</span>
          <span data-testid="industries-count">{industries.length}</span>
          <span data-testid="routes-count">{trainRoutes.length}</span>
        </div>
      );
    };

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    expect(screen.getByTestId('loading-locations').textContent).toBe('true');
    expect(screen.getByTestId('loading-industries').textContent).toBe('true');
    expect(screen.getByTestId('loading-routes').textContent).toBe('true');

    await waitFor(() => {
      expect(screen.getByTestId('loading-locations').textContent).toBe('false');
      expect(screen.getByTestId('loading-industries').textContent).toBe('false');
      expect(screen.getByTestId('loading-routes').textContent).toBe('false');
    });

    expect(screen.getByTestId('locations-count').textContent).toBe('1');
    expect(screen.getByTestId('industries-count').textContent).toBe('1');
    expect(screen.getByTestId('routes-count').textContent).toBe('1');
    expect(screen.getByTestId('error-locations').textContent).toBe('no error');
    expect(screen.getByTestId('error-industries').textContent).toBe('no error');
    expect(screen.getByTestId('error-routes').textContent).toBe('no error');
  });

  it('handles loading errors for all data types', async () => {
    (LocationService as jest.MockedClass<typeof LocationService>).mockImplementation(() => ({
      getAllLocations: jest.fn().mockRejectedValue(new Error('Failed to fetch locations'))
    }));
    (IndustryService as jest.MockedClass<typeof IndustryService>).mockImplementation(() => ({
      getAllIndustries: jest.fn().mockRejectedValue(new Error('Failed to fetch industries'))
    }));
    (TrainRouteService as jest.MockedClass<typeof TrainRouteService>).mockImplementation(() => ({
      getAllTrainRoutes: jest.fn().mockRejectedValue(new Error('Failed to fetch train routes'))
    }));

    const TestComponent = () => {
      const {
        locations, industries, trainRoutes,
        isLoadingLocations, isLoadingIndustries, isLoadingTrainRoutes,
        locationError, industryError, trainRouteError
      } = useLayout();
      return (
        <div>
          <span data-testid="loading-locations">{isLoadingLocations.toString()}</span>
          <span data-testid="loading-industries">{isLoadingIndustries.toString()}</span>
          <span data-testid="loading-routes">{isLoadingTrainRoutes.toString()}</span>
          <span data-testid="error-locations">{locationError || 'no error'}</span>
          <span data-testid="error-industries">{industryError || 'no error'}</span>
          <span data-testid="error-routes">{trainRouteError || 'no error'}</span>
          <span data-testid="locations-count">{locations.length}</span>
          <span data-testid="industries-count">{industries.length}</span>
          <span data-testid="routes-count">{trainRoutes.length}</span>
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
      expect(screen.getByTestId('loading-routes').textContent).toBe('false');
    });

    expect(screen.getByTestId('locations-count').textContent).toBe('0');
    expect(screen.getByTestId('industries-count').textContent).toBe('0');
    expect(screen.getByTestId('routes-count').textContent).toBe('0');
    expect(screen.getByTestId('error-locations').textContent).toBe('Failed to load locations');
    expect(screen.getByTestId('error-industries').textContent).toBe('Failed to load industries');
    expect(screen.getByTestId('error-routes').textContent).toBe('Failed to load train routes');
  });
}); 