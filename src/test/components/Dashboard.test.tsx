import React from 'react';
import { render, screen, fireEvent, waitFor, within, RenderResult } from '@testing-library/react';
import { act } from 'react';
import { Dashboard } from '@/app/components/Dashboard';
import { LayoutProvider } from '@/app/shared/contexts/LayoutContext';
import { LocationService } from '@/app/shared/services/LocationService';
import { IndustryService } from '@/app/shared/services/IndustryService';
import { TrainRouteService } from '@/app/shared/services/TrainRouteService';
import { Location, Industry, TrainRoute } from '@/shared/types/models';

jest.mock('@/app/shared/services/LocationService');
jest.mock('@/app/shared/services/IndustryService');
jest.mock('@/app/shared/services/TrainRouteService');

const mockLocations: Location[] = [
  { _id: '1', stationName: 'Station 1', block: 'A1', ownerId: 'owner1' },
  { _id: '2', stationName: 'Station 2', block: 'B1', ownerId: 'owner1' }
];

const mockIndustries: Industry[] = [
  { 
    _id: '1', 
    name: 'Industry 1', 
    industryType: 'FREIGHT',
    tracks: [{ _id: 't1', name: 'Track 1', maxCars: 5, placedCars: [] }],
    locationId: '1',
    ownerId: 'owner1'
  }
];

const mockTrainRoutes: TrainRoute[] = [
  {
    _id: '1',
    name: 'Route 1',
    routeNumber: 'R1',
    routeType: 'MIXED',
    originatingYardId: '1',
    terminatingYardId: '2',
    stations: mockLocations
  }
];

const mockLocationService = {
  getAllLocations: jest.fn()
};

const mockIndustryService = {
  getAllIndustries: jest.fn()
};

const mockTrainRouteService = {
  getAllTrainRoutes: jest.fn()
};

(LocationService as jest.MockedClass<typeof LocationService>).mockImplementation(() => mockLocationService);
(IndustryService as jest.MockedClass<typeof IndustryService>).mockImplementation(() => mockIndustryService);
(TrainRouteService as jest.MockedClass<typeof TrainRouteService>).mockImplementation(() => mockTrainRouteService);

describe('Dashboard', () => {
  const renderDashboard = async () => {
    let result: RenderResult | undefined;
    await act(async () => {
      result = render(
        <LayoutProvider>
          <Dashboard />
        </LayoutProvider>
      );
    });
    return result!;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up mock implementations to return promises that don't resolve immediately
    mockLocationService.getAllLocations.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockLocations), 100)));
    mockIndustryService.getAllIndustries.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockIndustries), 100)));
    mockTrainRouteService.getAllTrainRoutes.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockTrainRoutes), 100)));
  });

  it('shows loading state initially', async () => {
    let rendered: RenderResult | undefined;
    await act(async () => {
      rendered = render(
        <LayoutProvider>
          <Dashboard />
        </LayoutProvider>
      );
    });
    
    // The loading state should be visible immediately
    expect(rendered!.container.textContent).toContain('Loading statistics');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders dashboard statistics', async () => {
    await renderDashboard();

    await waitFor(() => {
      const cards = screen.getAllByRole('generic').filter(el => el.className.includes('bg-white'));
      expect(cards).toHaveLength(3);
      
      const locationCard = cards[0];
      expect(within(locationCard).getByText('2')).toBeInTheDocument();
      expect(within(locationCard).getByText('Total Locations')).toBeInTheDocument();

      const industryCard = cards[1];
      expect(within(industryCard).getByText('1')).toBeInTheDocument();
      expect(within(industryCard).getByText('Total Industries')).toBeInTheDocument();

      const routeCard = cards[2];
      expect(within(routeCard).getByText('1')).toBeInTheDocument();
      expect(within(routeCard).getByText('Total Train Routes')).toBeInTheDocument();
    });
  });

  it('displays error messages when data loading fails', async () => {
    const error = new Error('Failed to fetch data');
    mockLocationService.getAllLocations.mockRejectedValue(error);
    mockIndustryService.getAllIndustries.mockRejectedValue(error);
    mockTrainRouteService.getAllTrainRoutes.mockRejectedValue(error);

    await renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Unable to load dashboard data')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('retries loading data when retry button is clicked', async () => {
    const error = new Error('Failed to fetch data');
    mockLocationService.getAllLocations.mockRejectedValueOnce(error);
    mockIndustryService.getAllIndustries.mockRejectedValueOnce(error);
    mockTrainRouteService.getAllTrainRoutes.mockRejectedValueOnce(error);

    await renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Unable to load dashboard data')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    });

    await waitFor(() => {
      const cards = screen.getAllByRole('generic').filter(el => el.className.includes('bg-white'));
      expect(cards).toHaveLength(3);
      
      const locationCard = cards[0];
      expect(within(locationCard).getByText('2')).toBeInTheDocument();
      expect(within(locationCard).getByText('Total Locations')).toBeInTheDocument();

      const industryCard = cards[1];
      expect(within(industryCard).getByText('1')).toBeInTheDocument();
      expect(within(industryCard).getByText('Total Industries')).toBeInTheDocument();

      const routeCard = cards[2];
      expect(within(routeCard).getByText('1')).toBeInTheDocument();
      expect(within(routeCard).getByText('Total Train Routes')).toBeInTheDocument();
    });
  });

  it('handles partial data loading', async () => {
    const error = new Error('Failed to fetch train routes');
    mockTrainRouteService.getAllTrainRoutes.mockRejectedValue(error);

    await renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Failed to load train routes/)).toBeInTheDocument();
    });
  });

  it('should call services on mount', async () => {
    await renderDashboard();
    
    expect(mockLocationService.getAllLocations).toHaveBeenCalledTimes(1);
    expect(mockIndustryService.getAllIndustries).toHaveBeenCalledTimes(1);
    expect(mockTrainRouteService.getAllTrainRoutes).toHaveBeenCalledTimes(1);
  });
}); 