import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LayoutState from '../LayoutState';
import { services } from '../../shared/services/clientServices';

// Mock the client services
jest.mock('../../shared/services/clientServices', () => ({
  services: {
    locationService: {
      getAllLocations: jest.fn().mockResolvedValue([
        {
          _id: 'loc1',
          stationName: 'Location 1',
          block: 'A',
          ownerId: 'owner1'
        },
        {
          _id: 'loc2',
          stationName: 'Location 2',
          block: 'B',
          ownerId: 'owner1'
        }
      ])
    },
    industryService: {
      getAllIndustries: jest.fn().mockResolvedValue([
        {
          _id: 'ind1',
          name: 'Industry 1',
          locationId: 'loc1',
          blockName: 'A',
          industryType: 'FREIGHT',
          tracks: [
            {
              _id: 'track1',
              name: 'Track 1',
              length: 100,
              capacity: 5,
              maxCars: 5,
              placedCars: ['car1']
            },
            {
              _id: 'track2',
              name: 'Track 2',
              length: 100,
              capacity: 5,
              maxCars: 5,
              placedCars: ['car2']
            }
          ],
          ownerId: 'owner1'
        },
        {
          _id: 'ind2',
          name: 'Factory',
          locationId: 'loc2',
          blockName: 'B',
          industryType: 'FREIGHT',
          tracks: [
            {
              _id: 'track3',
              name: 'Loading Dock',
              length: 50,
              capacity: 2,
              maxCars: 2,
              placedCars: []
            }
          ],
          ownerId: 'owner1'
        },
        {
          _id: 'yard1',
          name: 'Yard',
          locationId: 'loc2',
          blockName: 'B',
          industryType: 'YARD',
          tracks: [
            {
              _id: 'track4',
              name: 'Yard Track',
              length: 200,
              capacity: 10,
              maxCars: 10,
              placedCars: []
            }
          ],
          ownerId: 'owner1'
        },
        {
          _id: 'station1',
          name: 'Station',
          locationId: 'loc1',
          blockName: 'A',
          industryType: 'PASSENGER',
          tracks: [
            {
              _id: 'track5',
              name: 'Platform',
              length: 150,
              capacity: 3,
              maxCars: 3,
              placedCars: []
            }
          ],
          ownerId: 'owner1'
        }
      ])
    },
    rollingStockService: {
      getAllRollingStock: jest.fn().mockResolvedValue([
        {
          _id: 'car1',
          roadName: 'BNSF',
          roadNumber: '1234',
          aarType: 'XM',
          description: '40ft Standard Boxcar',
          color: 'RED',
          note: 'Test note',
          homeYard: 'yard1',
          ownerId: 'owner1',
          currentLocation: {
            industryId: 'ind1',
            trackId: 'track1'
          }
        },
        {
          _id: 'car2',
          roadName: 'UP',
          roadNumber: '5678',
          aarType: 'HT',
          description: 'Hopper',
          color: 'BLACK',
          note: '',
          homeYard: 'yard1',
          ownerId: 'owner1',
          currentLocation: {
            industryId: 'ind1',
            trackId: 'track2'
          }
        }
      ]),
      resetToHomeYards: jest.fn().mockResolvedValue(undefined)
    }
  }
}));

// Mock the ScrollArea component
jest.mock('@/app/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('LayoutState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Loading state initially', () => {
    render(<LayoutState services={services} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays the main layout elements after loading', async () => {
    render(<LayoutState services={services} />);
    
    await waitFor(() => {
      expect(screen.getByText('Layout State')).toBeInTheDocument();
      expect(screen.getByText('Reset to Home Yards')).toBeInTheDocument();
      expect(screen.getByText('Location 1')).toBeInTheDocument();
      expect(screen.getByText('Block A')).toBeInTheDocument();
    });
  });

  it('displays cars under their respective industries', async () => {
    render(<LayoutState services={services} />);
    
    await waitFor(() => {
      expect(screen.getByText('BNSF 1234 (XM)')).toBeInTheDocument();
      expect(screen.getByText('UP 5678 (HT)')).toBeInTheDocument();
    });
  });

  it('displays tracks and their cars under industries', async () => {
    render(<LayoutState services={services} />);
    
    await waitFor(() => {
      // Find the track sections
      const trackElements = screen.getAllByText(/Track \d/);
      expect(trackElements.length).toBeGreaterThan(0);
      
      // Verify cars are displayed under tracks
      expect(screen.getByText('BNSF 1234 (XM)')).toBeInTheDocument();
      expect(screen.getByText('UP 5678 (HT)')).toBeInTheDocument();
    });
  });

  it('displays industries grouped by location and block with proper hierarchy', async () => {
    render(<LayoutState services={services} />);
    
    await waitFor(() => {
      // Locations
      expect(screen.getByText('Location 1')).toBeInTheDocument();
      expect(screen.getByText('Location 2')).toBeInTheDocument();
      
      // Blocks
      expect(screen.getByText('Block A')).toBeInTheDocument();
      expect(screen.getByText('Block B')).toBeInTheDocument();
      
      // Industries
      expect(screen.getByText('Industry 1')).toBeInTheDocument();
      expect(screen.getByText('Factory')).toBeInTheDocument();
      
      // Industry styling (assuming we can't test CSS directly very easily)
      expect(screen.getAllByText('FREIGHT')[0]).toBeInTheDocument();
    });
  });

  it('displays proper visual indicators for industry types', async () => {
    render(<LayoutState services={services} />);
    
    await waitFor(() => {
      expect(screen.getAllByText('FREIGHT')[0]).toBeInTheDocument();
      expect(screen.getByText('PASSENGER')).toBeInTheDocument();
      expect(screen.getByText('YARD')).toBeInTheDocument();
    });
  });

  it('handles the reset action correctly', async () => {
    render(<LayoutState services={services} />);
    
    await waitFor(() => {
      expect(screen.getByText('Reset to Home Yards')).toBeInTheDocument();
    });
    
    // Click the reset button
    const resetButton = screen.getByText('Reset to Home Yards');
    userEvent.click(resetButton);
    
    // Check if the reset service was called
    await waitFor(() => {
      expect(services.rollingStockService.resetToHomeYards).toHaveBeenCalled();
    });
  });

  it('handles errors gracefully', async () => {
    // Mock an error response
    const errorMessage = 'Failed to load data';
    (services.locationService.getAllLocations as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    
    render(<LayoutState services={services} />);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
}); 