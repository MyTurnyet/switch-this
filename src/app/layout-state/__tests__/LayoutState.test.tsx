import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import LayoutState from '../LayoutState';
import type { Location, Industry, TrainRoute, RollingStock } from '@/app/shared/types/models';
import type { ClientServices } from '../../shared/services/clientServices';

const mockServices: ClientServices = {
  locationService: {
    getAllLocations: jest.fn().mockImplementation(() => new Promise(() => {})),
  },
  industryService: {
    getAllIndustries: jest.fn().mockImplementation(() => new Promise(() => {})),
  },
  trainRouteService: {
    getAllTrainRoutes: jest.fn().mockImplementation(() => new Promise(() => {})),
  },
  rollingStockService: {
    getAllRollingStock: jest.fn().mockImplementation(() => new Promise(() => {})),
  },
};

describe('LayoutState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', async () => {
    await act(async () => {
      render(<LayoutState services={mockServices} />);
    });
    await waitFor(() => {
      expect(screen.getByTestId('loading-pulse')).toBeInTheDocument();
    });
  });

  it('shows error state when service fails', async () => {
    (mockServices.locationService.getAllLocations as jest.Mock).mockRejectedValue(new Error('Failed to fetch locations'));
    
    await act(async () => {
      render(<LayoutState services={mockServices} />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch locations')).toBeInTheDocument();
    });
  });

  it('renders data when loaded', async () => {
    const mockData = {
      locations: [{ 
        _id: '1', 
        stationName: 'Location 1',
        block: 'A',
        ownerId: '1'
      }] as Location[],
      industries: [{ 
        _id: '1',
        name: 'Industry 1',
        locationId: '1',
        blockName: 'A',
        industryType: 'FREIGHT',
        tracks: [],
        ownerId: '1'
      }] as Industry[],
      trainRoutes: [{ 
        _id: '1',
        name: 'Route 1',
        description: 'Test route',
        ownerId: '1'
      }] as unknown as TrainRoute[],
      rollingStock: [{ 
        _id: '1',
        name: 'Stock 1',
        type: 'BOXCAR',
        description: 'Test stock',
        currentLocationId: '1'
      }] as unknown as RollingStock[],
    };

    (mockServices.locationService.getAllLocations as jest.Mock).mockResolvedValue(mockData.locations);
    (mockServices.industryService.getAllIndustries as jest.Mock).mockResolvedValue(mockData.industries);
    (mockServices.trainRouteService.getAllTrainRoutes as jest.Mock).mockResolvedValue(mockData.trainRoutes);
    (mockServices.rollingStockService.getAllRollingStock as jest.Mock).mockResolvedValue(mockData.rollingStock);

    await act(async () => {
      render(<LayoutState services={mockServices} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Location 1')).toBeInTheDocument();
      expect(screen.getByText('Industry 1')).toBeInTheDocument();
      expect(screen.getByText('Stock 1')).toBeInTheDocument();
      expect(screen.getByText('BOXCAR')).toBeInTheDocument();
      expect(screen.getByText('Test stock')).toBeInTheDocument();
    });
  });
}); 