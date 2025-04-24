import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../Dashboard';
import { useLayoutContext } from '../../shared/contexts/LayoutContext';

// Mock the useLayoutContext hook
jest.mock('../../shared/contexts/LayoutContext');

describe('Dashboard', () => {
  const mockUseLayoutContext = useLayoutContext as jest.Mock;

  beforeEach(() => {
    mockUseLayoutContext.mockReturnValue({
      locations: [{ _id: '1', name: 'Location 1' }, { _id: '2', name: 'Location 2' }],
      industries: [{ _id: '1', name: 'Industry 1' }],
      trainRoutes: [{ _id: '1', name: 'Route 1' }, { _id: '2', name: 'Route 2' }, { _id: '3', name: 'Route 3' }],
      isLoadingLocations: false,
      isLoadingIndustries: false,
      isLoadingTrainRoutes: false,
      locationError: null,
      industryError: null,
      trainRouteError: null,
    });
  });

  it('displays the total count of locations', () => {
    render(<Dashboard />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Total Locations')).toBeInTheDocument();
  });

  it('displays the total count of industries', () => {
    render(<Dashboard />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Total Industries')).toBeInTheDocument();
  });

  it('displays the total count of train routes', () => {
    render(<Dashboard />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Total Train Routes')).toBeInTheDocument();
  });

  it('shows loading state when data is being fetched', () => {
    mockUseLayoutContext.mockReturnValue({
      locations: [],
      industries: [],
      trainRoutes: [],
      isLoadingLocations: true,
      isLoadingIndustries: true,
      isLoadingTrainRoutes: true,
      locationError: null,
      industryError: null,
      trainRouteError: null,
    });

    render(<Dashboard />);
    expect(screen.getByText('Loading statistics...')).toBeInTheDocument();
  });

  it('shows error state when there is an error', () => {
    mockUseLayoutContext.mockReturnValue({
      locations: [],
      industries: [],
      trainRoutes: [],
      isLoadingLocations: false,
      isLoadingIndustries: false,
      isLoadingTrainRoutes: false,
      locationError: 'Failed to load locations',
      industryError: null,
      trainRouteError: null,
    });

    render(<Dashboard />);
    expect(screen.getByText('Error loading statistics')).toBeInTheDocument();
  });
}); 