import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '@/app/components/Dashboard';
import { useLayout } from '@/app/shared/contexts/LayoutContext';

jest.mock('@/app/shared/contexts/LayoutContext', () => ({
  useLayout: jest.fn()
}));

describe('Dashboard', () => {
  const mockUseLayout = useLayout as jest.Mock;

  beforeEach(() => {
    mockUseLayout.mockReset();
  });

  it('shows loading state when data is being fetched', () => {
    mockUseLayout.mockReturnValue({
      locations: null,
      industries: null,
      trainRoutes: null,
      error: null,
      isLoading: true,
      fetchLocations: jest.fn(),
      fetchIndustries: jest.fn(),
      fetchTrainRoutes: jest.fn()
    });

    render(<Dashboard />);
    expect(screen.getAllByText('...')).toHaveLength(3);
  });

  it('shows data when loaded successfully', () => {
    mockUseLayout.mockReturnValue({
      locations: ['Location 1', 'Location 2'],
      industries: ['Industry 1'],
      trainRoutes: ['Route 1', 'Route 2', 'Route 3'],
      error: null,
      isLoading: false,
      fetchLocations: jest.fn(),
      fetchIndustries: jest.fn(),
      fetchTrainRoutes: jest.fn()
    });

    render(<Dashboard />);
    expect(screen.getByText('2')).toBeInTheDocument(); // Locations count
    expect(screen.getByText('1')).toBeInTheDocument(); // Industries count
    expect(screen.getByText('3')).toBeInTheDocument(); // Train Routes count
  });

  it('shows error message when data loading fails', () => {
    mockUseLayout.mockReturnValue({
      locations: null,
      industries: null,
      trainRoutes: null,
      error: 'Failed to load data',
      isLoading: false,
      fetchLocations: jest.fn(),
      fetchIndustries: jest.fn(),
      fetchTrainRoutes: jest.fn()
    });

    render(<Dashboard />);
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('fetches data on mount', () => {
    const fetchLocations = jest.fn();
    const fetchIndustries = jest.fn();
    const fetchTrainRoutes = jest.fn();

    mockUseLayout.mockReturnValue({
      locations: null,
      industries: null,
      trainRoutes: null,
      error: null,
      isLoading: true,
      fetchLocations,
      fetchIndustries,
      fetchTrainRoutes
    });

    render(<Dashboard />);

    expect(fetchLocations).toHaveBeenCalled();
    expect(fetchIndustries).toHaveBeenCalled();
    expect(fetchTrainRoutes).toHaveBeenCalled();
  });
}); 