import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../Dashboard';
import { 
  useLocationQueries,
  useIndustryQueries,
  useRollingStockQueries,
  useTrainRouteQueries
} from '../../shared/hooks/queries';

// Mock all the query hooks
jest.mock('../../shared/hooks/queries', () => ({
  useLocationQueries: jest.fn(),
  useIndustryQueries: jest.fn(),
  useRollingStockQueries: jest.fn(),
  useTrainRouteQueries: jest.fn()
}));

describe('Dashboard', () => {
  // Mock query results with proper typing
  const mockUseQuery = <T,>(isLoading = false, error: Error | null = null, data: T[] | null = []) => ({
    isLoading,
    error,
    data
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mocks for all hooks
    (useLocationQueries as jest.Mock).mockReturnValue({
      useLocations: () => mockUseQuery(false, null, [{ _id: '1' }])
    });
    
    (useIndustryQueries as jest.Mock).mockReturnValue({
      useIndustries: () => mockUseQuery(false, null, [{ _id: '1' }])
    });
    
    (useRollingStockQueries as jest.Mock).mockReturnValue({
      useRollingStockList: () => mockUseQuery(false, null, [{ _id: '1' }])
    });
    
    (useTrainRouteQueries as jest.Mock).mockReturnValue({
      useTrainRoutes: () => mockUseQuery(false, null, [{ _id: '1' }])
    });
  });

  it('should render loading state', () => {
    // Set loading state for locations
    (useLocationQueries as jest.Mock).mockReturnValue({
      useLocations: () => mockUseQuery(true, null, [])
    });
    
    render(<Dashboard />);
    
    // Should have at least one loading indicator
    expect(screen.getAllByTestId('loading-pulse').length).toBeGreaterThanOrEqual(1);
  });

  it('should render data after loading', () => {
    render(<Dashboard />);
    
    // Each stat card should show 1 as the count
    expect(screen.getAllByText('1')).toHaveLength(4);
  });

  it('should render error state', () => {
    // Set error state for locations
    (useLocationQueries as jest.Mock).mockReturnValue({
      useLocations: () => mockUseQuery(false, new Error('Failed to fetch'), [])
    });
    
    render(<Dashboard />);
    
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
  });
  
  it('should display zeros when data is empty', () => {
    // Mock empty data for all hooks
    (useLocationQueries as jest.Mock).mockReturnValue({
      useLocations: () => mockUseQuery(false, null, [])
    });
    (useIndustryQueries as jest.Mock).mockReturnValue({
      useIndustries: () => mockUseQuery(false, null, [])
    });
    (useRollingStockQueries as jest.Mock).mockReturnValue({
      useRollingStockList: () => mockUseQuery(false, null, [])
    });
    (useTrainRouteQueries as jest.Mock).mockReturnValue({
      useTrainRoutes: () => mockUseQuery(false, null, [])
    });
    
    render(<Dashboard />);
    
    // Should display zeros for all counts
    expect(screen.getAllByText('0')).toHaveLength(4);
  });
  
  it('should handle null data', () => {
    // Mock null data
    (useLocationQueries as jest.Mock).mockReturnValue({
      useLocations: () => mockUseQuery(false, null, null)
    });
    
    render(<Dashboard />);
    
    // Location count should be 0 with null data
    expect(screen.getByText('Locations').nextSibling?.textContent).toBe('0');
  });
  
  it('should show individual loading states', () => {
    // Set only one component as loading
    (useIndustryQueries as jest.Mock).mockReturnValue({
      useIndustries: () => mockUseQuery(true, null, [])
    });
    
    render(<Dashboard />);
    
    // Only the industry card should be in loading state
    const industryCard = screen.getByText('Industries').closest('[data-testid="stat-card"]');
    expect(industryCard?.querySelector('[data-testid="loading-pulse"]')).toBeInTheDocument();
    
    // Location card should not be loading
    const locationCard = screen.getByText('Locations').closest('[data-testid="stat-card"]');
    expect(locationCard?.querySelector('[data-testid="loading-pulse"]')).toBeNull();
  });
}); 