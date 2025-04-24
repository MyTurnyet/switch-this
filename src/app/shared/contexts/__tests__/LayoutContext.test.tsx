import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { LayoutProvider, useLayout } from '../LayoutContext';
import { LocationService } from '../../services/LocationService';
import { IndustryService } from '../../services/IndustryService';
import { TrainRouteService } from '../../services/TrainRouteService';

// Mock the services
jest.mock('../../services/LocationService');
jest.mock('../../services/IndustryService');
jest.mock('../../services/TrainRouteService');

const TestComponent = () => {
  const { locations, industries, trainRoutes, error, isLoading, fetchLocations, fetchIndustries, fetchTrainRoutes } = useLayout();

  return (
    <div>
      <div data-testid="locations">{locations?.length ?? 0}</div>
      <div data-testid="industries">{industries?.length ?? 0}</div>
      <div data-testid="trainRoutes">{trainRoutes?.length ?? 0}</div>
      <div data-testid="error">{error}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <button onClick={fetchLocations}>Fetch Locations</button>
      <button onClick={fetchIndustries}>Fetch Industries</button>
      <button onClick={fetchTrainRoutes}>Fetch Train Routes</button>
    </div>
  );
};

describe('LayoutContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial state and fetches data', async () => {
    const mockData = [{ id: 1 }];

    (LocationService as jest.Mock).mockImplementation(() => ({
      getAllLocations: jest.fn().mockResolvedValue(mockData)
    }));
    (IndustryService as jest.Mock).mockImplementation(() => ({
      getAllIndustries: jest.fn().mockResolvedValue(mockData)
    }));
    (TrainRouteService as jest.Mock).mockImplementation(() => ({
      getAllTrainRoutes: jest.fn().mockResolvedValue(mockData)
    }));

    await act(async () => {
      render(
        <LayoutProvider>
          <TestComponent />
        </LayoutProvider>
      );
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('locations')).toHaveTextContent('1');
      expect(screen.getByTestId('industries')).toHaveTextContent('1');
      expect(screen.getByTestId('trainRoutes')).toHaveTextContent('1');
      expect(screen.getByTestId('error')).toHaveTextContent('');
    });
  });

  it('handles errors when loading data', async () => {
    (LocationService as jest.Mock).mockImplementation(() => ({
      getAllLocations: jest.fn().mockRejectedValue(new Error('Failed to load locations'))
    }));
    (IndustryService as jest.Mock).mockImplementation(() => ({
      getAllIndustries: jest.fn().mockResolvedValue([])
    }));
    (TrainRouteService as jest.Mock).mockImplementation(() => ({
      getAllTrainRoutes: jest.fn().mockResolvedValue([])
    }));

    await act(async () => {
      render(
        <LayoutProvider>
          <TestComponent />
        </LayoutProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load locations');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('allows manual data refresh', async () => {
    (LocationService as jest.Mock).mockImplementation(() => ({
      getAllLocations: jest.fn()
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }])
    }));
    (IndustryService as jest.Mock).mockImplementation(() => ({
      getAllIndustries: jest.fn().mockResolvedValue([])
    }));
    (TrainRouteService as jest.Mock).mockImplementation(() => ({
      getAllTrainRoutes: jest.fn().mockResolvedValue([])
    }));

    await act(async () => {
      render(
        <LayoutProvider>
          <TestComponent />
        </LayoutProvider>
      );
    });

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('locations')).toHaveTextContent('1');
    });

    // Trigger manual refresh
    await act(async () => {
      fireEvent.click(screen.getByText('Fetch Locations'));
    });

    // Wait for refresh to complete and verify new data
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('locations')).toHaveTextContent('2');
    });
  });
}); 