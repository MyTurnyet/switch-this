import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SwitchlistPrintPage from '../page';
import { SwitchlistService } from '@/app/shared/services/SwitchlistService';
import { TrainRouteService } from '@/app/shared/services/TrainRouteService';
import { RollingStockService } from '@/app/shared/services/RollingStockService';
import { LocationService } from '@/app/shared/services/LocationService';
import { LocationType } from '@/app/shared/types/models';

// Mock the services
jest.mock('@/app/shared/services/SwitchlistService');
jest.mock('@/app/shared/services/TrainRouteService');
jest.mock('@/app/shared/services/RollingStockService');
jest.mock('@/app/shared/services/LocationService');

// Mock window.print
window.print = jest.fn();

// Mock random for consistent track numbers
jest.spyOn(global.Math, 'random').mockReturnValue(0.5);

// Mock date for consistent testing
jest.spyOn(global.Date.prototype, 'toLocaleDateString').mockImplementation(() => '5/1/2025');

const mockSwitchlist = {
  _id: 'switchlist123',
  name: 'Test Switchlist',
  trainRouteId: 'route123',
  createdAt: '2023-06-01T12:00:00Z',
  status: 'IN_PROGRESS',
  ownerId: 'user1',
  notes: 'Test switchlist notes with instructions'
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
  },
  {
    _id: 'loc3',
    stationName: 'Echo Lake Yard',
    block: 'ECHO',
    locationType: LocationType.FIDDLE_YARD,
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
    destination: {
      immediateDestination: {
        locationId: 'loc3',
        industryId: 'ind3',
        trackId: 'track3'
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
    ownerId: 'user1'
  }
];

describe('SwitchlistPrintPage', () => {
  let mockGetSwitchlistById: jest.Mock;
  let mockGetTrainRouteById: jest.Mock;
  let mockGetAllRollingStock: jest.Mock;
  let mockGetAllLocations: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mocks
    mockGetSwitchlistById = jest.fn().mockResolvedValue(mockSwitchlist);
    mockGetTrainRouteById = jest.fn().mockResolvedValue(mockTrainRoute);
    mockGetAllRollingStock = jest.fn().mockResolvedValue(mockRollingStock);
    mockGetAllLocations = jest.fn().mockResolvedValue(mockLocations);
    
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
  });
  
  it('renders the switchlist print page with correct data', async () => {
    const { container } = render(<SwitchlistPrintPage params={{ id: 'switchlist123' }} />);
    
    // Verify loading state is displayed initially
    expect(screen.getByText('Loading switchlist data...')).toBeInTheDocument();
    
    // Verify switchlist data is displayed after loading
    await waitFor(() => {
      expect(screen.getByText('Test Switchlist')).toBeInTheDocument();
    });
    
    // Check for train route information
    expect(screen.getByText(/Test Route/)).toBeInTheDocument();
    expect(screen.getByText(/TR01/)).toBeInTheDocument();
    
    // Check for instructions - use direct query of the container
    const instructionsDiv = container.querySelector('.border-b.border-gray-300.p-4.bg-gray-50');
    const instructionsText = instructionsDiv?.querySelector('.whitespace-pre-line')?.textContent;
    expect(instructionsText).toBe('Test switchlist notes with instructions');
    
    // Check for status
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('IN_PROGRESS', { exact: false })).toBeInTheDocument();
    
    // Check for document ID using more specific approach
    const documentIdLabel = Array.from(container.querySelectorAll('span'))
      .find(el => el.textContent === 'Document ID:');
    expect(documentIdLabel).toBeTruthy();
    const documentIdValue = documentIdLabel?.parentElement?.textContent;
    expect(documentIdValue).toContain('switchli');
    
    // Verify print button is displayed with icon
    const printButton = screen.getByText('Print Switchlist');
    expect(printButton).toBeInTheDocument();
    expect(printButton.closest('button')).toContainElement(document.querySelector('svg'));
    
    // Verify car list is displayed
    expect(screen.getByText('Car Movement Operations')).toBeInTheDocument();
    expect(screen.getByText('BNSF 12345')).toBeInTheDocument();
    expect(screen.getByText('UP 54321')).toBeInTheDocument();
    
    // Check for off-layout destination
    const offLayoutDestination = screen.getByText('Chicago, IL');
    expect(offLayoutDestination).toBeInTheDocument();
    const viaFiddleYard = screen.getByText('via Fiddle Yard');
    expect(viaFiddleYard).toBeInTheDocument();
    
    // Verify operation summary section exists
    expect(screen.getByText('Operation Summary:')).toBeInTheDocument();
    expect(screen.getByText('Total Cars: 2')).toBeInTheDocument();
    expect(screen.getByText('Estimated Switching Time: 3 minutes')).toBeInTheDocument();
    expect(screen.getByText('Priority: High')).toBeInTheDocument();
    
    // Verify special instructions section exists
    expect(screen.getByText('Special Instructions:')).toBeInTheDocument();
    
    // Verify additional notes section exists
    expect(screen.getByText('Additional Notes:')).toBeInTheDocument();
    
    // Verify signature sections exist
    expect(screen.getByText('Conductor Signature')).toBeInTheDocument();
    expect(screen.getByText('Date & Time Completed')).toBeInTheDocument();
    expect(screen.getByText('Supervisor Verification')).toBeInTheDocument();
    
    // Verify form ID footer
    const footerText = container.querySelector('.text-xs.text-gray-500.mt-8.text-center p')?.textContent;
    expect(footerText).toContain('Form ID: SL-');
    expect(footerText).toContain('Page 1 of 1');
  });
  
  it('calls window.print when print button is clicked', async () => {
    render(<SwitchlistPrintPage params={{ id: 'switchlist123' }} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Switchlist')).toBeInTheDocument();
    });
    
    // Click print button
    fireEvent.click(screen.getByText('Print Switchlist'));
    
    // Verify window.print was called
    expect(window.print).toHaveBeenCalledTimes(1);
  });
  
  it('displays error message when switchlist data fails to load', async () => {
    // Override the mock to simulate an error
    mockGetSwitchlistById.mockRejectedValueOnce(new Error('API Error'));
    
    render(<SwitchlistPrintPage params={{ id: 'switchlist123' }} />);
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load switchlist data. Please try again later.')).toBeInTheDocument();
    });
    
    // Verify back link is displayed
    expect(screen.getByText('← Back to Switchlist')).toBeInTheDocument();
  });
  
  it('displays message when no rolling stock is available', async () => {
    // Override the mock to return empty array
    mockGetAllRollingStock.mockResolvedValueOnce([]);
    
    render(<SwitchlistPrintPage params={{ id: 'switchlist123' }} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Switchlist')).toBeInTheDocument();
    });
    
    // Verify empty message is displayed
    expect(screen.getByText('No cars assigned to this switchlist.')).toBeInTheDocument();
  });
}); 