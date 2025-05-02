import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '../Dashboard';
import { ClientServices } from '../../shared/services/clientServices';
import * as hookModule from '../../shared/hooks/useDashboardData';

// Mock the useDashboardData hook
jest.mock('../../shared/hooks/useDashboardData', () => ({
  useDashboardData: jest.fn()
}));

describe('Dashboard', () => {
  let mockServices: ClientServices;
  
  beforeEach(() => {
    // Create mock service implementations
    mockServices = {
      locationService: {
        getAllLocations: jest.fn(),
        getAll: jest.fn()
      },
      industryService: {
        getAllIndustries: jest.fn(),
        getAll: jest.fn()
      },
      trainRouteService: {
        getAllTrainRoutes: jest.fn(),
        getAll: jest.fn()
      },
      rollingStockService: {
        getAllRollingStock: jest.fn(),
        updateRollingStock: jest.fn(),
        resetToHomeYards: jest.fn(),
        getAll: jest.fn()
      }
    };
  });

  it('should render loading state', () => {
    // Mock hook return value
    (hookModule.useDashboardData as jest.Mock).mockReturnValue({
      locations: [],
      industries: [],
      trainRoutes: [],
      rollingStock: [],
      error: null,
      isLoading: true,
      refreshData: jest.fn()
    });
    
    render(<Dashboard services={mockServices} />);
    
    expect(screen.getAllByTestId('loading-pulse')).toHaveLength(4);
  });

  it('should render data after loading', () => {
    // Mock hook return value with data
    (hookModule.useDashboardData as jest.Mock).mockReturnValue({
      locations: [{ _id: '1' }],
      industries: [{ _id: '1' }],
      trainRoutes: [{ _id: '1' }],
      rollingStock: [{ _id: '1' }],
      error: null,
      isLoading: false,
      refreshData: jest.fn()
    });
    
    render(<Dashboard services={mockServices} />);
    
    expect(screen.getAllByText('1')).toHaveLength(4);
  });

  it('should render error state', () => {
    // Mock hook return value with error
    (hookModule.useDashboardData as jest.Mock).mockReturnValue({
      locations: [],
      industries: [],
      trainRoutes: [],
      rollingStock: [],
      error: 'Failed to fetch',
      isLoading: false,
      refreshData: jest.fn()
    });
    
    render(<Dashboard services={mockServices} />);
    
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
  });
  
  it('should display zeros when arrays are null', () => {
    // Mock hook return value with null data
    (hookModule.useDashboardData as jest.Mock).mockReturnValue({
      locations: null,
      industries: null,
      trainRoutes: null,
      rollingStock: null,
      error: null,
      isLoading: false,
      refreshData: jest.fn()
    });
    
    render(<Dashboard services={mockServices} />);
    
    // Should display zeros for all counts
    expect(screen.getAllByText('0')).toHaveLength(4);
  });
  
  it('should correctly pass isLoading to StatCard components', () => {
    // Mock hook return value with loading state
    (hookModule.useDashboardData as jest.Mock).mockReturnValue({
      locations: [],
      industries: [],
      trainRoutes: [],
      rollingStock: [],
      error: null,
      isLoading: true,
      refreshData: jest.fn()
    });
    
    render(<Dashboard services={mockServices} />);
    
    // Test that all StatCards have loading state
    expect(screen.getAllByTestId('loading-pulse')).toHaveLength(4);
  });
  
  it('should display zeros in error state', () => {
    // Mock hook return value with error
    (hookModule.useDashboardData as jest.Mock).mockReturnValue({
      locations: [],
      industries: [],
      trainRoutes: [],
      rollingStock: [],
      error: 'Failed to fetch',
      isLoading: false,
      refreshData: jest.fn()
    });
    
    render(<Dashboard services={mockServices} />);
    
    // Error state should still render the grid with zeros
    expect(screen.getByTestId('dashboard-grid')).toBeInTheDocument();
    
    // All counts should be 0 in error state
    const statCards = screen.getAllByText('0');
    expect(statCards).toHaveLength(4);
  });
  
  it('should pass services to useDashboardData hook', () => {
    // Mock the hook to verify services are passed
    const mockUseDashboardData = hookModule.useDashboardData as jest.Mock;
    mockUseDashboardData.mockReturnValue({
      locations: [],
      industries: [],
      trainRoutes: [],
      rollingStock: [],
      error: null,
      isLoading: false,
      refreshData: jest.fn()
    });
    
    render(<Dashboard services={mockServices} />);
    
    // Verify services were passed to the hook
    expect(mockUseDashboardData).toHaveBeenCalledWith(mockServices);
  });
  
  it('should handle large count values correctly', () => {
    // Mock hook return value with large data arrays
    (hookModule.useDashboardData as jest.Mock).mockReturnValue({
      locations: Array(100).fill({ _id: '1' }), // 100 locations
      industries: Array(200).fill({ _id: '1' }), // 200 industries
      trainRoutes: Array(150).fill({ _id: '1' }), // 150 train routes
      rollingStock: Array(500).fill({ _id: '1' }), // 500 rolling stock items
      error: null,
      isLoading: false,
      refreshData: jest.fn()
    });
    
    render(<Dashboard services={mockServices} />);
    
    // Should display correct counts
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });
  
  it('should handle edge case when hook returns undefined values', () => {
    // Mock hook return value with undefined values
    (hookModule.useDashboardData as jest.Mock).mockReturnValue({
      locations: undefined,
      industries: undefined,
      trainRoutes: undefined,
      rollingStock: undefined,
      error: null,
      isLoading: false,
      refreshData: jest.fn()
    });
    
    render(<Dashboard services={mockServices} />);
    
    // Should fallback to zeros for all counts
    expect(screen.getAllByText('0')).toHaveLength(4);
  });
}); 