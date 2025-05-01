import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SwitchlistsPage from '../page';
import { SwitchlistService } from '@/app/shared/services/SwitchlistService';
import { TrainRouteService } from '@/app/shared/services/TrainRouteService';

// Mock the services
jest.mock('@/app/shared/services/SwitchlistService');
jest.mock('@/app/shared/services/TrainRouteService');

const mockSwitchlists = [
  {
    _id: '1',
    name: 'Switchlist 1',
    trainRouteId: 'tr1',
    createdAt: '2023-06-01T12:00:00Z',
    status: 'CREATED',
    ownerId: 'user1'
  },
  {
    _id: '2',
    name: 'Switchlist 2',
    trainRouteId: 'tr2',
    createdAt: '2023-06-02T12:00:00Z',
    status: 'IN_PROGRESS',
    ownerId: 'user1'
  }
];

const mockTrainRoutes = [
  {
    _id: 'tr1',
    name: 'Local Freight',
    routeNumber: 'L1',
    routeType: 'FREIGHT',
    originatingYardId: 'yard1',
    terminatingYardId: 'yard2',
    ownerId: 'user1'
  },
  {
    _id: 'tr2',
    name: 'Express Freight',
    routeNumber: 'E1',
    routeType: 'FREIGHT',
    originatingYardId: 'yard1',
    terminatingYardId: 'yard3',
    ownerId: 'user1'
  }
];

describe('SwitchlistsPage', () => {
  let mockGetAllSwitchlists: jest.Mock;
  let mockGetAllTrainRoutes: jest.Mock;
  let mockCreateSwitchlist: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mocks
    mockGetAllSwitchlists = jest.fn().mockResolvedValue(mockSwitchlists);
    mockGetAllTrainRoutes = jest.fn().mockResolvedValue(mockTrainRoutes);
    mockCreateSwitchlist = jest.fn().mockImplementation((trainRouteId, name, notes) => 
      Promise.resolve({
        _id: '3',
        trainRouteId,
        name,
        notes,
        createdAt: new Date().toISOString(),
        status: 'CREATED',
        ownerId: 'user1'
      })
    );
    
    // Assign mocks to service classes
    (SwitchlistService as jest.Mock).mockImplementation(() => ({
      getAllSwitchlists: mockGetAllSwitchlists,
      createSwitchlist: mockCreateSwitchlist
    }));
    
    (TrainRouteService as jest.Mock).mockImplementation(() => ({
      getAllTrainRoutes: mockGetAllTrainRoutes
    }));
  });
  
  it('renders the switchlists page with heading', async () => {
    render(<SwitchlistsPage />);
    
    // Verify the heading is displayed
    expect(screen.getByText('Switchlists')).toBeInTheDocument();
    
    // Verify loading state is displayed initially
    expect(screen.getByText('Loading switchlists...')).toBeInTheDocument();
    
    // Verify switchlists are loaded and displayed
    await waitFor(() => {
      expect(screen.getByText('Switchlist 1')).toBeInTheDocument();
      expect(screen.getByText('Switchlist 2')).toBeInTheDocument();
    });
    
    // Verify the create button is displayed
    expect(screen.getByText('Create New Switchlist')).toBeInTheDocument();
  });
  
  it('shows create switchlist form when button is clicked', async () => {
    render(<SwitchlistsPage />);
    
    // Wait for the initial data to load
    await waitFor(() => {
      expect(screen.getByText('Create New Switchlist')).toBeInTheDocument();
    });
    
    // Click the create button
    fireEvent.click(screen.getByText('Create New Switchlist'));
    
    // Verify form elements are displayed
    expect(screen.getByLabelText('Switchlist Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Train Route')).toBeInTheDocument();
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create Switchlist')).toBeInTheDocument();
  });
  
  it('creates a new switchlist', async () => {
    render(<SwitchlistsPage />);
    
    // Wait for the initial data to load and create button to be available
    await waitFor(() => {
      expect(screen.getByText('Create New Switchlist')).toBeInTheDocument();
    });
    
    // Click the create button
    fireEvent.click(screen.getByText('Create New Switchlist'));
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Switchlist Name'), { target: { value: 'New Test Switchlist' } });
    
    // Select train route from dropdown
    const trainRouteSelect = screen.getByLabelText('Train Route');
    fireEvent.change(trainRouteSelect, { target: { value: 'tr1' } });
    
    // Add notes
    fireEvent.change(screen.getByLabelText('Notes'), { target: { value: 'Test notes' } });
    
    // Submit the form by clicking the submit button instead of using form submission
    fireEvent.click(screen.getByText('Create Switchlist'));
    
    // Wait for the mock to be called
    await waitFor(() => {
      // Check if createSwitchlist was called with the right arguments
      expect(mockCreateSwitchlist).toHaveBeenCalledWith('tr1', 'New Test Switchlist', 'Test notes');
    });
  });
  
  it('handles no switchlists scenario', async () => {
    // Override the mock for this test only
    mockGetAllSwitchlists.mockResolvedValueOnce([]);
    
    render(<SwitchlistsPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('No switchlists available yet. Create your first switchlist to get started.')).toBeInTheDocument();
    });
  });
  
  it('handles error scenario', async () => {
    // Override the mock to simulate an error
    mockGetAllSwitchlists.mockRejectedValueOnce(new Error('API Error'));
    
    render(<SwitchlistsPage />);
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load switchlists data. Please try again later.')).toBeInTheDocument();
    });
  });
}); 