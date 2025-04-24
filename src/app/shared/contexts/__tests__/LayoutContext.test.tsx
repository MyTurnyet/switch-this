import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutProvider, useLayout } from '../LayoutContext';

// Mock services
const mockLocations = [{ id: 1, name: 'Location 1' }, { id: 2, name: 'Location 2' }];
const mockIndustries = [{ id: 1, name: 'Industry 1' }, { id: 2, name: 'Industry 2' }];
const mockTrainRoutes = [{ id: 1, name: 'Route 1' }, { id: 2, name: 'Route 2' }];

// Mock service classes
class MockLocationService {
  getAllLocations = jest.fn();
}

class MockIndustryService {
  getAllIndustries = jest.fn();
}

class MockTrainRouteService {
  getAllTrainRoutes = jest.fn();
}

jest.mock('../../services/LocationService', () => ({
  LocationService: jest.fn().mockImplementation(() => new MockLocationService())
}));

jest.mock('../../services/IndustryService', () => ({
  IndustryService: jest.fn().mockImplementation(() => new MockIndustryService())
}));

jest.mock('../../services/TrainRouteService', () => ({
  TrainRouteService: jest.fn().mockImplementation(() => new MockTrainRouteService())
}));

const TestComponent = () => {
  const { locations, industries, trainRoutes, error, isLoading, refreshData } = useLayout();
  return (
    <div>
      <div data-testid="locations">{locations?.length || 0}</div>
      <div data-testid="industries">{industries?.length || 0}</div>
      <div data-testid="trainRoutes">{trainRoutes?.length || 0}</div>
      <div data-testid="error">{error}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <button onClick={refreshData}>Refresh Data</button>
    </div>
  );
};

describe('LayoutContext', () => {
  let mockLocationService: MockLocationService;
  let mockIndustryService: MockIndustryService;
  let mockTrainRouteService: MockTrainRouteService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationService = new MockLocationService();
    mockIndustryService = new MockIndustryService();
    mockTrainRouteService = new MockTrainRouteService();

    (jest.requireMock('../../services/LocationService').LocationService as jest.Mock)
      .mockImplementation(() => mockLocationService);
    (jest.requireMock('../../services/IndustryService').IndustryService as jest.Mock)
      .mockImplementation(() => mockIndustryService);
    (jest.requireMock('../../services/TrainRouteService').TrainRouteService as jest.Mock)
      .mockImplementation(() => mockTrainRouteService);
  });

  it('shows loading state initially', async () => {
    mockLocationService.getAllLocations.mockResolvedValue(mockLocations);
    mockIndustryService.getAllIndustries.mockResolvedValue(mockIndustries);
    mockTrainRouteService.getAllTrainRoutes.mockResolvedValue(mockTrainRoutes);

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('loads all data successfully', async () => {
    mockLocationService.getAllLocations.mockResolvedValue(mockLocations);
    mockIndustryService.getAllIndustries.mockResolvedValue(mockIndustries);
    mockTrainRouteService.getAllTrainRoutes.mockResolvedValue(mockTrainRoutes);

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('locations')).toHaveTextContent('2');
      expect(screen.getByTestId('industries')).toHaveTextContent('2');
      expect(screen.getByTestId('trainRoutes')).toHaveTextContent('2');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('');
    });
  });

  it('handles errors during data loading', async () => {
    mockLocationService.getAllLocations.mockRejectedValue(new Error('Failed to load locations'));
    mockIndustryService.getAllIndustries.mockResolvedValue(mockIndustries);
    mockTrainRouteService.getAllTrainRoutes.mockResolvedValue(mockTrainRoutes);

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load locations');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('refreshes data when refresh button is clicked', async () => {
    mockLocationService.getAllLocations.mockResolvedValue(mockLocations);
    mockIndustryService.getAllIndustries.mockResolvedValue(mockIndustries);
    mockTrainRouteService.getAllTrainRoutes.mockResolvedValue(mockTrainRoutes);

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Click refresh and wait for loading to complete
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /refresh data/i }));
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    // Verify service calls
    expect(mockLocationService.getAllLocations).toHaveBeenCalledTimes(2);
    expect(mockIndustryService.getAllIndustries).toHaveBeenCalledTimes(2);
    expect(mockTrainRouteService.getAllTrainRoutes).toHaveBeenCalledTimes(2);
  });
}); 