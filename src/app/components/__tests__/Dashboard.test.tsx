import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '@/app/components/Dashboard';
import { useLayout } from '@/app/shared/contexts/LayoutContext';

jest.mock('@/app/shared/contexts/LayoutContext', () => ({
  useLayout: jest.fn()
}));

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLayout as jest.Mock).mockReturnValue({
      locations: [],
      industries: [],
      trainRoutes: [],
      error: null,
      isLoading: false,
      fetchLocations: jest.fn(),
      fetchIndustries: jest.fn(),
      fetchTrainRoutes: jest.fn()
    });
  });

  it('displays loading state', () => {
    (useLayout as jest.Mock).mockReturnValue({
      locations: [],
      industries: [],
      trainRoutes: [],
      error: null,
      isLoading: true,
      fetchLocations: jest.fn(),
      fetchIndustries: jest.fn(),
      fetchTrainRoutes: jest.fn()
    });

    render(<Dashboard />);
    const loadingElements = screen.getAllByText('...');
    expect(loadingElements).toHaveLength(3);
  });

  it('displays error state', () => {
    const errorMessage = 'Failed to load data';
    (useLayout as jest.Mock).mockReturnValue({
      locations: [],
      industries: [],
      trainRoutes: [],
      error: errorMessage,
      isLoading: false,
      fetchLocations: jest.fn(),
      fetchIndustries: jest.fn(),
      fetchTrainRoutes: jest.fn()
    });

    render(<Dashboard />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays statistics when data is loaded', () => {
    const mockData = {
      locations: [{ _id: '1' }, { _id: '2' }],
      industries: [{ _id: '1' }],
      trainRoutes: [{ _id: '1' }, { _id: '2' }, { _id: '3' }]
    };

    (useLayout as jest.Mock).mockReturnValue({
      ...mockData,
      error: null,
      isLoading: false,
      fetchLocations: jest.fn(),
      fetchIndustries: jest.fn(),
      fetchTrainRoutes: jest.fn()
    });

    render(<Dashboard />);
    expect(screen.getByText('2')).toBeInTheDocument(); // Locations count
    expect(screen.getByText('1')).toBeInTheDocument(); // Industries count
    expect(screen.getByText('3')).toBeInTheDocument(); // Train routes count
  });

  it('fetches data on mount', () => {
    const mockFetchLocations = jest.fn();
    const mockFetchIndustries = jest.fn();
    const mockFetchTrainRoutes = jest.fn();

    (useLayout as jest.Mock).mockReturnValue({
      locations: [],
      industries: [],
      trainRoutes: [],
      error: null,
      isLoading: false,
      fetchLocations: mockFetchLocations,
      fetchIndustries: mockFetchIndustries,
      fetchTrainRoutes: mockFetchTrainRoutes
    });

    render(<Dashboard />);
    expect(mockFetchLocations).toHaveBeenCalled();
    expect(mockFetchIndustries).toHaveBeenCalled();
    expect(mockFetchTrainRoutes).toHaveBeenCalled();
  });
}); 