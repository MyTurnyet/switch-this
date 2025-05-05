import { render, screen, waitFor } from '@testing-library/react';
import SwitchlistOperationsPage from '../page';
import { SwitchlistService } from '@/app/shared/services/SwitchlistService';
import { RollingStockService } from '@/app/shared/services/RollingStockService';
import { TrainRouteService } from '@/app/shared/services/TrainRouteService';
import { LocationService } from '@/app/shared/services/LocationService';
import { IndustryService } from '@/app/shared/services/IndustryService';
import { LocationType, IndustryType } from '@/app/shared/types/models';

// Mock the services
jest.mock('@/app/shared/services/SwitchlistService');
jest.mock('@/app/shared/services/RollingStockService');
jest.mock('@/app/shared/services/TrainRouteService');
jest.mock('@/app/shared/services/LocationService');
jest.mock('@/app/shared/services/IndustryService');

describe('Switchlist Operations', () => {
  const mockSwitchlist = {
    _id: 'switchlist1',
    trainRouteId: 'route1',
    name: 'Test Switchlist',
    createdAt: '2023-01-01T00:00:00Z',
    status: 'CREATED',
    ownerId: 'owner1'
  };

  const mockTrainRoute = {
    _id: 'route1',
    name: 'Test Route',
    routeNumber: 'TR-101',
    routeType: 'FREIGHT',
    originatingYardId: 'yard1',
    terminatingYardId: 'yard2',
    stations: ['yard1', 'loc1', 'loc2', 'yard2'],
    ownerId: 'owner1'
  };

  const mockLocations = [
    {
      _id: 'yard1',
      stationName: 'Starting Yard',
      block: 'YARD',
      locationType: LocationType.FIDDLE_YARD,
      ownerId: 'owner1'
    },
    {
      _id: 'loc1',
      stationName: 'Echo Lake, WA',
      block: 'ECHO',
      locationType: LocationType.ON_LAYOUT,
      ownerId: 'owner1'
    },
    {
      _id: 'loc2',
      stationName: 'Pine Ridge, OR',
      block: 'PINE',
      locationType: LocationType.ON_LAYOUT,
      ownerId: 'owner1'
    },
    {
      _id: 'yard2',
      stationName: 'Ending Yard',
      block: 'YARD2',
      locationType: LocationType.FIDDLE_YARD,
      ownerId: 'owner1'
    }
  ];

  const mockIndustries = [
    {
      _id: 'ind_yard1',
      name: 'Starting Yard',
      locationId: 'yard1',
      blockName: 'YARD',
      industryType: IndustryType.YARD,
      tracks: [],
      ownerId: 'owner1'
    },
    {
      _id: 'ind1',
      name: 'Echo Lake Factory',
      locationId: 'loc1',
      blockName: 'ECHO',
      industryType: IndustryType.FREIGHT,
      tracks: [],
      ownerId: 'owner1'
    },
    {
      _id: 'ind2',
      name: 'Pine Ridge Mill',
      locationId: 'loc2',
      blockName: 'PINE',
      industryType: IndustryType.FREIGHT,
      tracks: [],
      ownerId: 'owner1'
    },
    {
      _id: 'ind_yard2',
      name: 'Ending Yard',
      locationId: 'yard2',
      blockName: 'YARD2',
      industryType: IndustryType.YARD,
      tracks: [],
      ownerId: 'owner1'
    }
  ];

  // Rolling stock at the originating yard
  const mockRollingStockAtYard = [
    {
      _id: 'rs1',
      roadName: 'UP',
      roadNumber: '12345',
      aarType: 'Boxcar',
      description: 'UP Boxcar',
      color: 'Yellow',
      note: '',
      homeYard: 'yard1',
      ownerId: 'owner1',
      currentLocation: {
        industryId: 'ind_yard1',
        trackId: 'track1'
      }
    },
    {
      _id: 'rs2',
      roadName: 'BNSF',
      roadNumber: '54321',
      aarType: 'Tanker',
      description: 'BNSF Tanker',
      color: 'Black',
      note: '',
      homeYard: 'yard1',
      ownerId: 'owner1',
      currentLocation: {
        industryId: 'ind_yard1',
        trackId: 'track1'
      }
    }
  ];

  // Rolling stock at industries along the route
  const mockRollingStockAtIndustries = [
    {
      _id: 'rs3',
      roadName: 'CSX',
      roadNumber: '67890',
      aarType: 'Hopper',
      description: 'CSX Hopper',
      color: 'Gray',
      note: '',
      homeYard: 'yard1',
      ownerId: 'owner1',
      currentLocation: {
        industryId: 'ind1',
        trackId: 'track1'
      }
    },
    {
      _id: 'rs4',
      roadName: 'NS',
      roadNumber: '45678',
      aarType: 'Gondola',
      description: 'NS Gondola',
      color: 'Blue',
      note: '',
      homeYard: 'yard1',
      ownerId: 'owner1',
      currentLocation: {
        industryId: 'ind2',
        trackId: 'track1'
      }
    }
  ];

  const mockAllRollingStock = [...mockRollingStockAtYard, ...mockRollingStockAtIndustries];

  beforeEach(() => {
    // Setup mocks
    (SwitchlistService.prototype.getSwitchlistById as jest.Mock).mockResolvedValue(mockSwitchlist);
    (TrainRouteService.prototype.getTrainRouteById as jest.Mock).mockResolvedValue(mockTrainRoute);
    (LocationService.prototype.getAllLocations as jest.Mock).mockResolvedValue(mockLocations);
    (IndustryService.prototype.getAllIndustries as jest.Mock).mockResolvedValue(mockIndustries);
    (RollingStockService.prototype.getAllRollingStock as jest.Mock).mockResolvedValue(mockAllRollingStock);
    (RollingStockService.prototype.updateRollingStock as jest.Mock).mockResolvedValue(undefined);
  });

  test('should display the build train button as disabled', async () => {
    render(<SwitchlistOperationsPage params={{ id: 'switchlist1' }} />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Build Train functionality has been removed.').length).toBeGreaterThan(0);
    });
  });

  test('should display available rolling stock', async () => {
    render(<SwitchlistOperationsPage params={{ id: 'switchlist1' }} />);
    
    await waitFor(() => {
      expect(screen.getByText('Available Rolling Stock')).toBeInTheDocument();
    });
    
    // Verify rolling stock is displayed
    expect(screen.getByText('UP 12345')).toBeInTheDocument();
    expect(screen.getByText('BNSF 54321')).toBeInTheDocument();
    expect(screen.getByText('CSX 67890')).toBeInTheDocument();
    expect(screen.getByText('NS 45678')).toBeInTheDocument();
  });

  test('should display train route visualization', async () => {
    render(<SwitchlistOperationsPage params={{ id: 'switchlist1' }} />);
    
    // Verify the train route component appears
    await waitFor(() => {
      expect(screen.getByText('Train Route')).toBeInTheDocument();
    });
    
    // Check for station names
    expect(screen.getByText('Starting Yard')).toBeInTheDocument();
    expect(screen.getByText('Echo Lake, WA')).toBeInTheDocument();
    expect(screen.getByText('Pine Ridge, OR')).toBeInTheDocument();
    expect(screen.getByText('Ending Yard')).toBeInTheDocument();
  });
}); 