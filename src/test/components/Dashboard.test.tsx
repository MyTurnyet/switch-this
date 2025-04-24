import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Dashboard } from '@/app/components/Dashboard';
import { useLayoutContext } from '@/app/shared/contexts/LayoutContext';

jest.mock('@/app/shared/services/LocationService');
jest.mock('@/app/shared/services/IndustryService');
jest.mock('@/app/shared/services/TrainRouteService');

// Mock the useLayoutContext hook
jest.mock('@/app/shared/contexts/LayoutContext', () => ({
  useLayoutContext: jest.fn()
}));

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLayoutContext as jest.Mock).mockReturnValue({
      locations: [],
      industries: [],
      trainRoutes: [],
      isLoadingLocations: false,
      isLoadingIndustries: false,
      isLoadingTrainRoutes: false,
      locationError: null,
      industryError: null,
      trainRouteError: null,
      fetchLocations: jest.fn(),
      fetchIndustries: jest.fn(),
      fetchTrainRoutes: jest.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('correctly determines loading state', async () => {
    const testCases = [
      {
        state: { isLoadingLocations: true, isLoadingIndustries: false, isLoadingTrainRoutes: false },
        expected: true
      },
      {
        state: { isLoadingLocations: false, isLoadingIndustries: true, isLoadingTrainRoutes: false },
        expected: true
      },
      {
        state: { isLoadingLocations: false, isLoadingIndustries: false, isLoadingTrainRoutes: true },
        expected: true
      },
      {
        state: { isLoadingLocations: false, isLoadingIndustries: false, isLoadingTrainRoutes: false },
        expected: false
      }
    ];

    for (const { state, expected } of testCases) {
      (useLayoutContext as jest.Mock).mockReturnValue({
        locations: [],
        industries: [],
        trainRoutes: [],
        ...state,
        locationError: null,
        industryError: null,
        trainRouteError: null,
        fetchLocations: jest.fn(),
        fetchIndustries: jest.fn(),
        fetchTrainRoutes: jest.fn(),
      });

      render(<Dashboard />);
      
      if (expected) {
        expect(screen.getByText('Loading statistics...')).toBeInTheDocument();
      } else {
        expect(screen.queryByText('Loading statistics...')).not.toBeInTheDocument();
      }
      
      cleanup();
    }
  });

  it('shows loading state initially', async () => {
    (useLayoutContext as jest.Mock).mockReturnValue({
      locations: [],
      industries: [],
      trainRoutes: [],
      isLoadingLocations: true,
      isLoadingIndustries: true,
      isLoadingTrainRoutes: true,
      locationError: null,
      industryError: null,
      trainRouteError: null,
      fetchLocations: jest.fn(),
      fetchIndustries: jest.fn(),
      fetchTrainRoutes: jest.fn(),
    });

    render(<Dashboard />);
    expect(screen.getByText('Loading statistics...')).toBeInTheDocument();
  });

  it('renders dashboard statistics', async () => {
    (useLayoutContext as jest.Mock).mockReturnValue({
      locations: [{ _id: '1', stationName: 'Station 1', block: 'A1', ownerId: 'owner1' }],
      industries: [{ _id: '1', name: 'Industry 1', industryType: 'FREIGHT', tracks: [], locationId: '1', ownerId: 'owner1' }],
      trainRoutes: [{ _id: '1', name: 'Route 1', routeNumber: 'R1', routeType: 'MIXED', originatingYardId: '1', terminatingYardId: '2', stations: [] }],
      isLoadingLocations: false,
      isLoadingIndustries: false,
      isLoadingTrainRoutes: false,
      locationError: null,
      industryError: null,
      trainRouteError: null,
      fetchLocations: jest.fn(),
      fetchIndustries: jest.fn(),
      fetchTrainRoutes: jest.fn(),
    });

    render(<Dashboard />);

    const statisticValues = screen.getAllByText('1');
    expect(statisticValues).toHaveLength(3); // One for each statistic
    expect(screen.getByText('Total Locations')).toBeInTheDocument();
    expect(screen.getByText('Total Industries')).toBeInTheDocument();
    expect(screen.getByText('Total Train Routes')).toBeInTheDocument();
  });

  it('displays error messages when data loading fails', async () => {
    (useLayoutContext as jest.Mock).mockReturnValue({
      locations: [],
      industries: [],
      trainRoutes: [],
      isLoadingLocations: false,
      isLoadingIndustries: false,
      isLoadingTrainRoutes: false,
      locationError: 'Failed to load locations',
      industryError: 'Failed to load industries',
      trainRouteError: 'Failed to load train routes',
      fetchLocations: jest.fn(),
      fetchIndustries: jest.fn(),
      fetchTrainRoutes: jest.fn(),
    });

    render(<Dashboard />);
    expect(screen.getByText('Unable to load dashboard data')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load locations/)).toBeInTheDocument();
    expect(screen.getByText(/Failed to load industries/)).toBeInTheDocument();
    expect(screen.getByText(/Failed to load train routes/)).toBeInTheDocument();
  });

  it('retries loading data when retry button is clicked', async () => {
    const mockFetchLocations = jest.fn();
    const mockFetchIndustries = jest.fn();
    const mockFetchTrainRoutes = jest.fn();

    (useLayoutContext as jest.Mock).mockReturnValue({
      locations: [],
      industries: [],
      trainRoutes: [],
      isLoadingLocations: false,
      isLoadingIndustries: false,
      isLoadingTrainRoutes: false,
      locationError: 'Failed to load locations',
      industryError: 'Failed to load industries',
      trainRouteError: 'Failed to load train routes',
      fetchLocations: mockFetchLocations,
      fetchIndustries: mockFetchIndustries,
      fetchTrainRoutes: mockFetchTrainRoutes,
    });

    render(<Dashboard />);
    fireEvent.click(screen.getByText('Retry'));

    expect(mockFetchLocations).toHaveBeenCalled();
    expect(mockFetchIndustries).toHaveBeenCalled();
    expect(mockFetchTrainRoutes).toHaveBeenCalled();
  });

  it('should call fetch functions on mount', async () => {
    const mockFetchLocations = jest.fn();
    const mockFetchIndustries = jest.fn();
    const mockFetchTrainRoutes = jest.fn();

    (useLayoutContext as jest.Mock).mockReturnValue({
      locations: [],
      industries: [],
      trainRoutes: [],
      isLoadingLocations: false,
      isLoadingIndustries: false,
      isLoadingTrainRoutes: false,
      locationError: null,
      industryError: null,
      trainRouteError: null,
      fetchLocations: mockFetchLocations,
      fetchIndustries: mockFetchIndustries,
      fetchTrainRoutes: mockFetchTrainRoutes,
    });

    render(<Dashboard />);
    
    expect(mockFetchLocations).toHaveBeenCalledTimes(1);
    expect(mockFetchIndustries).toHaveBeenCalledTimes(1);
    expect(mockFetchTrainRoutes).toHaveBeenCalledTimes(1);
  });
}); 