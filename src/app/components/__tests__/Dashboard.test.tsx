import React from 'react';
import { render, screen } from '@testing-library/react';
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
}); 