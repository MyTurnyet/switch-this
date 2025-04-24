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
    const loadingElements = screen.getAllByText('...');
    expect(loadingElements).toHaveLength(3);
    loadingElements.forEach(element => {
      expect(element).toHaveClass('animate-pulse');
    });
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
    
    // Verify the grid layout
    const gridContainer = screen.getByTestId('dashboard-grid');
    expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-6');
    
    // Verify the stats are displayed
    expect(screen.getByText('2')).toBeInTheDocument(); // Locations count
    expect(screen.getByText('1')).toBeInTheDocument(); // Industries count
    expect(screen.getByText('3')).toBeInTheDocument(); // Train Routes count
    
    // Verify the labels
    expect(screen.getByText('Locations')).toBeInTheDocument();
    expect(screen.getByText('Industries')).toBeInTheDocument();
    expect(screen.getByText('Train Routes')).toBeInTheDocument();
  });

  it('shows error message with correct styling when data loading fails', () => {
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

    const { container } = render(<Dashboard />);
    const errorContainer = container.firstChild as HTMLElement;
    expect(errorContainer).toHaveClass(
      'bg-red-50',
      'border',
      'border-red-200',
      'rounded-lg',
      'p-4',
      'text-red-600'
    );
    expect(errorContainer).toHaveTextContent('Failed to load data');
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