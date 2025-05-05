import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

const mockSwitchlist = {
  _id: 'switchlist123',
  name: 'Test Switchlist',
  trainRouteId: 'route123',
  createdAt: '2023-06-01T12:00:00Z',
  status: 'IN_PROGRESS',
  ownerId: 'user1',
  notes: 'Test notes'
};

const mockTrainRoute = {
  _id: 'route123',
  name: 'Test Route',
  routeNumber: 'TR01',
  routeType: 'FREIGHT',
  originatingYardId: 'yard1',
  terminatingYardId: 'yard2',
  stations: ['loc1', 'loc2'],
  ownerId: 'user1'
};

const mockLocations = [
  {
    _id: 'yard1',
    stationName: 'Origin Yard',
    block: 'YARD',
    locationType: LocationType.FIDDLE_YARD,
    ownerId: 'user1'
  },
  {
    _id: 'loc1',
    stationName: 'Echo Lake, WA',
    block: 'ECHO',
    locationType: LocationType.ON_LAYOUT,
    ownerId: 'user1'
  },
  {
    _id: 'loc2',
    stationName: 'Chicago, IL',
    block: 'EAST',
    locationType: LocationType.OFF_LAYOUT,
    ownerId: 'user1'
  }
];

const mockIndustries = [
  {
    _id: 'yard_ind1',
    name: 'Origin Yard Industry',
    locationId: 'yard1',
    blockName: 'YARD',
    industryType: IndustryType.YARD,
    tracks: [],
    ownerId: 'user1'
  },
  {
    _id: 'ind1',
    name: 'Echo Lake Factory',
    locationId: 'loc1',
    blockName: 'ECHO',
    industryType: IndustryType.FREIGHT,
    tracks: [],
    ownerId: 'user1'
  },
  {
    _id: 'ind2',
    name: 'Chicago Steel Mill',
    locationId: 'loc2',
    blockName: 'EAST',
    industryType: IndustryType.FREIGHT,
    tracks: [],
    ownerId: 'user1'
  }
];

const mockRollingStock = [
  {
    _id: 'rs1',
    roadName: 'BNSF',
    roadNumber: '12345',
    aarType: 'Boxcar',
    description: 'Test Boxcar 1',
    color: 'Yellow',
    note: '',
    homeYard: 'yard1',
    ownerId: 'user1',
    currentLocation: {
      industryId: 'yard_ind1', // Located at the yard
      trackId: 'track1'
    },
    destination: {
      immediateDestination: {
        locationId: 'loc1',
        industryId: 'ind1',
        trackId: 'track1'
      },
      finalDestination: {
        locationId: 'loc2',
        industryId: 'ind2'
      }
    }
  },
  {
    _id: 'rs2',
    roadName: 'UP',
    roadNumber: '54321',
    aarType: 'Tanker',
    description: 'Test Tanker 1',
    color: 'Black',
    note: '',
    homeYard: 'yard1',
    ownerId: 'user1',
    currentLocation: {
      industryId: 'yard_ind1', // Located at the yard
      trackId: 'track2'
    }
  },
  {
    _id: 'rs3',
    roadName: 'CSX',
    roadNumber: '67890',
    aarType: 'Gondola',
    description: 'Test Gondola',
    color: 'Gray',
    note: '',
    homeYard: 'yard1',
    ownerId: 'user1',
    currentLocation: {
      industryId: 'ind1', // Not at the yard - shouldn't be shown
      trackId: 'track3'
    }
  }
];

describe('SwitchlistOperationsPage', () => {
  let mockGetSwitchlistById: jest.Mock;
  let mockGetTrainRouteById: jest.Mock;
  let mockGetAllRollingStock: jest.Mock;
  let mockGetAllLocations: jest.Mock;
  let mockGetAllIndustries: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mocks
    mockGetSwitchlistById = jest.fn().mockResolvedValue(mockSwitchlist);
    mockGetTrainRouteById = jest.fn().mockResolvedValue(mockTrainRoute);
    mockGetAllRollingStock = jest.fn().mockResolvedValue(mockRollingStock);
    mockGetAllLocations = jest.fn().mockResolvedValue(mockLocations);
    mockGetAllIndustries = jest.fn().mockResolvedValue(mockIndustries);
    
    // Assign mocks to service classes
    (SwitchlistService as jest.Mock).mockImplementation(() => ({
      getSwitchlistById: mockGetSwitchlistById
    }));
    
    (TrainRouteService as jest.Mock).mockImplementation(() => ({
      getTrainRouteById: mockGetTrainRouteById
    }));
    
    (RollingStockService as jest.Mock).mockImplementation(() => ({
      getAllRollingStock: mockGetAllRollingStock
    }));
    
    (LocationService as jest.Mock).mockImplementation(() => ({
      getAllLocations: mockGetAllLocations
    }));
    
    (IndustryService as jest.Mock).mockImplementation(() => ({
      getAllIndustries: mockGetAllIndustries
    }));
  });
  
  it('renders the switchlist operations page with correct data', async () => {
    render(<SwitchlistOperationsPage params={{ id: 'switchlist123' }} />);
    
    // Verify loading state is displayed initially
    expect(screen.getByText('Loading switchlist operations data...')).toBeInTheDocument();
    
    // Verify switchlist data is displayed after loading
    await waitFor(() => {
      expect(screen.getByText('Switchlist Operations')).toBeInTheDocument();
      expect(screen.getByText(/Test Switchlist - Test Route/)).toBeInTheDocument();
      expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument();
    });
    
    // Verify only rolling stock at originating yard is displayed
    expect(screen.getByText('BNSF 12345')).toBeInTheDocument();
    expect(screen.getByText('UP 54321')).toBeInTheDocument();
    
    // Verify rolling stock not at yard is NOT displayed
    expect(screen.queryByText('CSX 67890')).not.toBeInTheDocument();
    
    // Verify the filtering message is displayed
    expect(screen.getByText('Only showing rolling stock currently in the originating yard')).toBeInTheDocument();
    
    // Verify the assign buttons are present (only for yard rolling stock)
    const assignButtons = screen.getAllByText('Assign');
    expect(assignButtons.length).toBe(2);
  });
  
  it('handles assigning rolling stock', async () => {
    render(<SwitchlistOperationsPage params={{ id: 'switchlist123' }} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('BNSF 12345')).toBeInTheDocument();
    });
    
    // Initially the rolling stock should be in the available section
    expect(screen.getByText('No rolling stock assigned to this switchlist yet.')).toBeInTheDocument();
    
    // Click assign button for the first rolling stock
    const assignButtons = screen.getAllByText('Assign');
    fireEvent.click(assignButtons[0]);
    
    // The rolling stock should now be in the assigned section
    expect(screen.queryByText('No rolling stock assigned to this switchlist yet.')).not.toBeInTheDocument();
    
    // Check that the rolling stock appears in the assigned section
    const assignedSection = screen.getAllByRole('list')[0]; // First list is assigned section
    expect(assignedSection).toHaveTextContent('BNSF 12345');
    
    // Check that a "Remove" button now exists
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });
  
  it('handles removing rolling stock', async () => {
    render(<SwitchlistOperationsPage params={{ id: 'switchlist123' }} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('BNSF 12345')).toBeInTheDocument();
    });
    
    // Assign a rolling stock first
    const assignButtons = screen.getAllByText('Assign');
    fireEvent.click(assignButtons[0]);
    
    // Verify it's assigned
    expect(screen.getByText('Remove')).toBeInTheDocument();
    
    // Now remove it
    fireEvent.click(screen.getByText('Remove'));
    
    // It should be back in the available section
    expect(screen.getByText('No rolling stock assigned to this switchlist yet.')).toBeInTheDocument();
    
    // Both yard rolling stock should be available again
    const availableButtons = screen.getAllByText('Assign');
    expect(availableButtons.length).toBe(2);
  });
  
  it('handles error when loading switchlist data', async () => {
    // Override the mock to simulate an error
    mockGetSwitchlistById.mockRejectedValueOnce(new Error('API Error'));
    
    render(<SwitchlistOperationsPage params={{ id: 'switchlist123' }} />);
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load switchlist operations data. Please try again later.')).toBeInTheDocument();
    });
  });
}); 