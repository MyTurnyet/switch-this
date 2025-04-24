import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { LayoutProvider, useLayout } from '@/app/shared/contexts/LayoutContext';
import { LocationService } from '@/app/shared/services/LocationService';
import { IndustryService } from '@/app/shared/services/IndustryService';
import { TrainRouteService } from '@/app/shared/services/TrainRouteService';

jest.mock('@/app/shared/services/LocationService');
jest.mock('@/app/shared/services/IndustryService');
jest.mock('@/app/shared/services/TrainRouteService');

const mockLocations = [
  { id: 1, name: 'Location 1' },
  { id: 2, name: 'Location 2' }
];

const mockIndustries = [
  { id: 1, name: 'Industry 1' },
  { id: 2, name: 'Industry 2' }
];

const mockTrainRoutes = [
  { id: 1, name: 'Route 1' },
  { id: 2, name: 'Route 2' }
];

const TestComponent = () => {
  const { locations, industries, trainRoutes, error, isLoading } = useLayout();
  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>{error}</div>}
      {locations && <div>Locations loaded</div>}
      {industries && <div>Industries loaded</div>}
      {trainRoutes && <div>Train routes loaded</div>}
    </div>
  );
};

describe('LayoutContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (LocationService as jest.Mock).mockImplementation(() => ({
      getAllLocations: jest.fn().mockResolvedValue(mockLocations)
    }));
    (IndustryService as jest.Mock).mockImplementation(() => ({
      getAllIndustries: jest.fn().mockResolvedValue(mockIndustries)
    }));
    (TrainRouteService as jest.Mock).mockImplementation(() => ({
      getAllTrainRoutes: jest.fn().mockResolvedValue(mockTrainRoutes)
    }));
  });

  it('shows loading state initially', () => {
    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('loads all data successfully', async () => {
    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Locations loaded')).toBeInTheDocument();
      expect(screen.getByText('Industries loaded')).toBeInTheDocument();
      expect(screen.getByText('Train routes loaded')).toBeInTheDocument();
    });
  });

  it('handles location service error', async () => {
    (LocationService as jest.Mock).mockImplementation(() => ({
      getAllLocations: jest.fn().mockRejectedValue(new Error('Failed to load locations'))
    }));

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load locations')).toBeInTheDocument();
    });
  });

  it('handles industry service error', async () => {
    (IndustryService as jest.Mock).mockImplementation(() => ({
      getAllIndustries: jest.fn().mockRejectedValue(new Error('Failed to load industries'))
    }));

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load industries')).toBeInTheDocument();
    });
  });

  it('handles train route service error', async () => {
    (TrainRouteService as jest.Mock).mockImplementation(() => ({
      getAllTrainRoutes: jest.fn().mockRejectedValue(new Error('Failed to load train routes'))
    }));

    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load train routes')).toBeInTheDocument();
    });
  });
}); 