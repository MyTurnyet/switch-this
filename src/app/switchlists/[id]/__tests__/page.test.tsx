import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SwitchlistDetailPage from '../page';
import { SwitchlistService } from '@/app/shared/services/SwitchlistService';
import { TrainRouteService } from '@/app/shared/services/TrainRouteService';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}));

// Mock the services
jest.mock('@/app/shared/services/SwitchlistService');
jest.mock('@/app/shared/services/TrainRouteService');

const mockSwitchlist = {
  _id: 'switchlist123',
  name: 'Test Switchlist',
  trainRouteId: 'route123',
  createdAt: '2023-06-01T12:00:00Z',
  status: 'CREATED',
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
  ownerId: 'user1'
};

describe('SwitchlistDetailPage', () => {
  let mockGetSwitchlistById: jest.Mock;
  let mockGetTrainRouteById: jest.Mock;
  let mockUpdateSwitchlist: jest.Mock;
  let mockUpdateSwitchlistStatus: jest.Mock;
  let mockDeleteSwitchlist: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn().mockImplementation(() => true);
    
    // Set up mocks
    mockGetSwitchlistById = jest.fn().mockResolvedValue(mockSwitchlist);
    mockGetTrainRouteById = jest.fn().mockResolvedValue(mockTrainRoute);
    mockUpdateSwitchlist = jest.fn().mockImplementation((id, updates) => 
      Promise.resolve({ ...mockSwitchlist, ...updates })
    );
    mockUpdateSwitchlistStatus = jest.fn().mockImplementation((id, status) => 
      Promise.resolve({ ...mockSwitchlist, status })
    );
    mockDeleteSwitchlist = jest.fn().mockResolvedValue(undefined);
    
    // Assign mocks to service classes
    (SwitchlistService as jest.Mock).mockImplementation(() => ({
      getSwitchlistById: mockGetSwitchlistById,
      updateSwitchlist: mockUpdateSwitchlist,
      updateSwitchlistStatus: mockUpdateSwitchlistStatus,
      deleteSwitchlist: mockDeleteSwitchlist
    }));
    
    (TrainRouteService as jest.Mock).mockImplementation(() => ({
      getTrainRouteById: mockGetTrainRouteById
    }));
  });
  
  it('renders the switchlist detail page with correct data', async () => {
    render(<SwitchlistDetailPage params={{ id: 'switchlist123' }} />);
    
    // Verify loading state is displayed initially
    expect(screen.getByText('Loading switchlist data...')).toBeInTheDocument();
    
    // Verify switchlist data is displayed after loading
    await waitFor(() => {
      expect(screen.getByText('Test Switchlist')).toBeInTheDocument();
      expect(screen.getByText('Test Route (TR01)')).toBeInTheDocument();
      expect(screen.getByText('Test notes')).toBeInTheDocument();
      expect(screen.getByText('CREATED')).toBeInTheDocument();
    });
    
    // Verify edit, operations, print, and delete buttons are present
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    
    // Be more specific when finding the Operations button
    const operationsButton = screen.getByRole('link', { name: 'Operations' });
    expect(operationsButton).toBeInTheDocument();
    
    expect(screen.getByText('Print')).toBeInTheDocument();
    
    // Verify the operations link points to the correct URL
    expect(operationsButton).toHaveAttribute('href', '/switchlists/switchlist123/operations');
    
    // Verify the print link points to the correct URL
    const printLink = screen.getByText('Print').closest('a');
    expect(printLink).toHaveAttribute('href', '/switchlists/switchlist123/print');
  });
  
  it('handles entering edit mode and saving changes', async () => {
    render(<SwitchlistDetailPage params={{ id: 'switchlist123' }} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Switchlist')).toBeInTheDocument();
    });
    
    // Click edit button
    fireEvent.click(screen.getByText('Edit'));
    
    // Verify edit form is displayed
    expect(screen.getByLabelText('Switchlist Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
    
    // Make changes
    fireEvent.change(screen.getByLabelText('Switchlist Name'), { 
      target: { value: 'Updated Switchlist Name' } 
    });
    fireEvent.change(screen.getByLabelText('Notes'), { 
      target: { value: 'Updated notes' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Verify the service was called correctly
    await waitFor(() => {
      expect(mockUpdateSwitchlist).toHaveBeenCalledWith('switchlist123', {
        name: 'Updated Switchlist Name',
        notes: 'Updated notes',
        status: 'CREATED'
      });
    });
  });
  
  it('handles updating the switchlist status', async () => {
    render(<SwitchlistDetailPage params={{ id: 'switchlist123' }} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Switchlist')).toBeInTheDocument();
    });
    
    // Click status button
    fireEvent.click(screen.getByText('In Progress'));
    
    // Verify the service was called correctly
    await waitFor(() => {
      expect(mockUpdateSwitchlistStatus).toHaveBeenCalledWith('switchlist123', 'IN_PROGRESS');
    });
  });
  
  it('handles deleting a switchlist', async () => {
    const { useRouter } = require('next/navigation');
    const mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });
    
    render(<SwitchlistDetailPage params={{ id: 'switchlist123' }} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Switchlist')).toBeInTheDocument();
    });
    
    // Click delete button
    fireEvent.click(screen.getByText('Delete'));
    
    // Verify confirmation was shown
    expect(window.confirm).toHaveBeenCalled();
    
    // Verify the service was called correctly
    await waitFor(() => {
      expect(mockDeleteSwitchlist).toHaveBeenCalledWith('switchlist123');
      expect(mockPush).toHaveBeenCalledWith('/switchlists');
    });
  });
  
  it('handles error when loading switchlist data', async () => {
    // Override the mock to simulate an error
    mockGetSwitchlistById.mockRejectedValueOnce(new Error('API Error'));
    
    render(<SwitchlistDetailPage params={{ id: 'switchlist123' }} />);
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load switchlist. Please try again later.')).toBeInTheDocument();
    });
  });
}); 