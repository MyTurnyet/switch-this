import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import LayoutState from '../LayoutState';
import type { Location, Industry, TrainRoute, RollingStock } from '@/app/shared/types/models';
import type { ClientServices } from '../../shared/services/clientServices';

interface MockRollingStockService {
  getAllRollingStock: jest.Mock;
  updateRollingStock: jest.Mock;
  resetToHomeYards: jest.Mock;
}

interface MockClientServices extends Omit<ClientServices, 'rollingStockService'> {
  rollingStockService: MockRollingStockService;
}

const mockServices: MockClientServices = {
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
    updateRollingStock: jest.fn().mockImplementation(() => new Promise(() => {})),
    resetToHomeYards: jest.fn().mockImplementation(() => new Promise(() => {})),
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
        roadName: 'BNSF',
        roadNumber: '1234',
        aarType: 'XM',
        description: '40ft Standard Boxcar',
        color: 'RED',
        note: 'Test note',
        homeYard: 'Yard 1',
        ownerId: '1'
      }] as RollingStock[],
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
      expect(screen.getByText('BNSF 1234')).toBeInTheDocument();
      expect(screen.getByText('XM')).toBeInTheDocument();
      expect(screen.getByText('40ft Standard Boxcar')).toBeInTheDocument();
      expect(screen.getByText('RED')).toBeInTheDocument();
      expect(screen.getByText('Test note')).toBeInTheDocument();
      expect(screen.getByText('Unknown Yard')).toBeInTheDocument();
    });
  });

  it('should reset rolling stock to home yards when reset button is clicked', async () => {
    const mockRollingStock = [{
      _id: '1',
      roadName: 'BNSF',
      roadNumber: '1234',
      aarType: 'XM',
      description: 'Boxcar',
      color: 'RED',
      note: '',
      homeYard: 'yard1',
      ownerId: '1',
      currentLocation: {
        industryId: 'industry1',
        trackId: 'track1'
      }
    }];

    (mockServices.rollingStockService.getAllRollingStock as jest.Mock).mockResolvedValue(mockRollingStock);
    (mockServices.rollingStockService.resetToHomeYards as jest.Mock).mockResolvedValue(undefined);

    await act(async () => {
      render(<LayoutState services={mockServices} />);
    });

    const resetButton = screen.getByText('Reset State');
    await act(async () => {
      resetButton.click();
    });

    expect(mockServices.rollingStockService.resetToHomeYards).toHaveBeenCalled();
  });

  it('displays cars under their respective industries', async () => {
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
        tracks: [{
          _id: 'track1',
          name: 'Track 1',
          placedCars: ['1']
        }],
        ownerId: '1'
      }] as Industry[],
      rollingStock: [{ 
        _id: '1',
        roadName: 'BNSF',
        roadNumber: '1234',
        aarType: 'XM',
        description: '40ft Standard Boxcar',
        color: 'RED',
        note: 'Test note',
        homeYard: 'Yard 1',
        ownerId: '1'
      }] as RollingStock[],
    };

    (mockServices.locationService.getAllLocations as jest.Mock).mockResolvedValue(mockData.locations);
    (mockServices.industryService.getAllIndustries as jest.Mock).mockResolvedValue(mockData.industries);
    (mockServices.rollingStockService.getAllRollingStock as jest.Mock).mockResolvedValue(mockData.rollingStock);

    await act(async () => {
      render(<LayoutState services={mockServices} />);
    });

    await waitFor(() => {
      // Verify industry is displayed
      const industryElement = screen.getByText('Industry 1');
      expect(industryElement).toBeInTheDocument();

      // Verify car is displayed under the industry
      const carElement = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'span' && 
               element?.className.includes('font-medium') && 
               content.includes('BNSF 1234');
      });
      expect(carElement).toBeInTheDocument();
      expect(carElement.closest('.ml-4')).toBeTruthy(); // Verify it's indented under the industry
    });
  });

  it('displays tracks and their cars under industries', async () => {
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
        tracks: [
          {
            _id: 'track1',
            name: 'Track 1',
            length: 100,
            capacity: 10,
            maxCars: 5,
            placedCars: ['1']
          },
          {
            _id: 'track2',
            name: 'Track 2',
            length: 100,
            capacity: 10,
            maxCars: 5,
            placedCars: ['2']
          }
        ],
        ownerId: '1'
      }] as Industry[],
      rollingStock: [
        { 
          _id: '1',
          roadName: 'BNSF',
          roadNumber: '1234',
          aarType: 'XM',
          description: '40ft Standard Boxcar',
          color: 'RED',
          note: 'Test note',
          homeYard: 'Yard 1',
          ownerId: '1'
        },
        {
          _id: '2',
          roadName: 'UP',
          roadNumber: '5678',
          aarType: 'HT',
          description: 'Hopper',
          color: 'BLACK',
          note: '',
          homeYard: 'Yard 1',
          ownerId: '1'
        }
      ] as RollingStock[],
    };

    (mockServices.locationService.getAllLocations as jest.Mock).mockResolvedValue(mockData.locations);
    (mockServices.industryService.getAllIndustries as jest.Mock).mockResolvedValue(mockData.industries);
    (mockServices.rollingStockService.getAllRollingStock as jest.Mock).mockResolvedValue(mockData.rollingStock);

    await act(async () => {
      render(<LayoutState services={mockServices} />);
    });

    await waitFor(() => {
      // Verify industry is displayed
      expect(screen.getByText('Industry 1')).toBeInTheDocument();

      // Verify tracks are displayed
      expect(screen.getByText('Track 1')).toBeInTheDocument();
      expect(screen.getByText('Track 2')).toBeInTheDocument();

      // Verify cars are displayed under their respective tracks
      const track1Section = screen.getByText('Track 1').closest('.space-y-2');
      const track2Section = screen.getByText('Track 2').closest('.space-y-2');

      expect(track1Section).toHaveTextContent('BNSF 1234');
      expect(track1Section).toHaveTextContent('40ft Standard Boxcar');
      expect(track2Section).toHaveTextContent('UP 5678');
      expect(track2Section).toHaveTextContent('Hopper');
    });
  });
}); 