import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '@/app/components/Dashboard';
import { useLayout } from '@/app/shared/contexts/LayoutContext';

jest.mock('@/app/shared/contexts/LayoutContext', () => ({
  useLayout: jest.fn()
}));

describe('Dashboard', () => {
  const mockRefreshData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLayout as jest.Mock).mockReturnValue({
      locations: [],
      industries: [],
      trainRoutes: [],
      error: null,
      isLoading: false,
      refreshData: mockRefreshData
    });
  });

  describe('initialization', () => {
    it('calls refreshData on mount', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(mockRefreshData).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('loading state', () => {
    it('displays loading indicators when data is being fetched', () => {
      (useLayout as jest.Mock).mockReturnValue({
        locations: [],
        industries: [],
        trainRoutes: [],
        error: null,
        isLoading: true,
        refreshData: mockRefreshData
      });

      render(<Dashboard />);
      const loadingElements = screen.getAllByText('...');
      expect(loadingElements).toHaveLength(3);
      loadingElements.forEach(element => {
        expect(element).toHaveClass('animate-pulse');
      });
    });
  });

  describe('error state', () => {
    it('displays error message with correct styling', () => {
      const errorMessage = 'Failed to load data';
      (useLayout as jest.Mock).mockReturnValue({
        locations: [],
        industries: [],
        trainRoutes: [],
        error: errorMessage,
        isLoading: false,
        refreshData: mockRefreshData
      });

      render(<Dashboard />);
      const errorElement = screen.getByText(errorMessage);
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveClass('text-red-600');
    });
  });

  describe('data display', () => {
    it('displays correct statistics when data is loaded', () => {
      const mockData = {
        locations: [{ _id: '1' }, { _id: '2' }],
        industries: [{ _id: '1' }],
        trainRoutes: [{ _id: '1' }, { _id: '2' }, { _id: '3' }],
        error: null,
        isLoading: false,
        refreshData: mockRefreshData
      };

      (useLayout as jest.Mock).mockReturnValue(mockData);

      render(<Dashboard />);

      // Verify grid layout
      const grid = screen.getByTestId('dashboard-grid');
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-6');

      // Verify counts
      expect(screen.getByText('2')).toBeInTheDocument(); // Locations count
      expect(screen.getByText('1')).toBeInTheDocument(); // Industries count
      expect(screen.getByText('3')).toBeInTheDocument(); // Train routes count

      // Verify labels
      expect(screen.getByText('Locations')).toBeInTheDocument();
      expect(screen.getByText('Industries')).toBeInTheDocument();
      expect(screen.getByText('Train Routes')).toBeInTheDocument();
    });

    it('displays zero counts when arrays are empty', () => {
      render(<Dashboard />);
      
      const counts = screen.getAllByText('0');
      expect(counts).toHaveLength(3);
    });

    it('displays zero counts when data is null', () => {
      (useLayout as jest.Mock).mockReturnValue({
        locations: null,
        industries: null,
        trainRoutes: null,
        error: null,
        isLoading: false,
        refreshData: mockRefreshData
      });

      render(<Dashboard />);
      
      const counts = screen.getAllByText('0');
      expect(counts).toHaveLength(3);
    });
  });
}); 