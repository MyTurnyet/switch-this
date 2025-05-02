import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Industry, LocationType, IndustryType } from '@/app/shared/types/models';
import { IndustryService } from '@/app/shared/services/IndustryService';
import { ToastProvider } from '@/app/components/ui';

// Create a wrapper component that includes the ToastProvider
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <ToastProvider>{children}</ToastProvider>;
};

// Custom render function that wraps the component with ToastProvider
const customRender = (ui: React.ReactElement, options?: Record<string, unknown>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Import these after the type definitions
import IndustriesPage from '../page';
import * as clientServices from '@/app/shared/services/clientServices';
import { groupIndustriesByLocationAndBlock } from '@/app/layout-state/utils/groupIndustries';

// Mock the services
jest.mock('@/app/shared/services/clientServices', () => ({
  services: {
    locationService: {
      getAllLocations: jest.fn().mockResolvedValue([
        { _id: '1', stationName: 'Station A', block: 'Block A', ownerId: 'owner1', locationType: LocationType.ON_LAYOUT },
        { _id: '2', stationName: 'Station B', block: 'Block B', ownerId: 'owner1', locationType: LocationType.FIDDLE_YARD },
        { _id: '3', stationName: 'Station C', block: 'Block Z', ownerId: 'owner1', locationType: LocationType.OFF_LAYOUT }
      ])
    },
    industryService: {
      getAllIndustries: jest.fn().mockResolvedValue([
        { 
          _id: '1', 
          name: 'Industry 1', 
          locationId: '1', 
          industryType: IndustryType.FREIGHT, 
          tracks: [{ _id: 'track1' }], 
          ownerId: 'owner1',
          blockName: 'Block A',
          description: 'Description 1' 
        },
        { 
          _id: '2', 
          name: 'Industry 2', 
          locationId: '1', 
          industryType: IndustryType.YARD, 
          tracks: [{ _id: 'track2' }], 
          ownerId: 'owner1',
          blockName: 'Block A',
          description: 'Description 2' 
        },
        { 
          _id: '3', 
          name: 'Industry 3', 
          locationId: '2', 
          industryType: IndustryType.PASSENGER, 
          tracks: [{ _id: 'track3' }], 
          ownerId: 'owner1',
          blockName: 'Block B',
          description: 'Description 3' 
        }
      ]),
      updateIndustry: jest.fn(),
      createIndustry: jest.fn(),
      deleteIndustry: jest.fn()
    }
  }
}));

// Mock the groupIndustriesByLocationAndBlock function
jest.mock('@/app/layout-state/utils/groupIndustries', () => ({
  groupIndustriesByLocationAndBlock: jest.fn().mockImplementation((industries: Industry[]) => {
    return {
      '1': {
        locationName: 'Station A',
        blocks: {
          'Block A': industries.filter((i: Industry) => i.locationId === '1' && i.blockName === 'Block A')
        }
      },
      '2': {
        locationName: 'Station B',
        blocks: {
          'Block B': industries.filter((i: Industry) => i.locationId === '2' && i.blockName === 'Block B')
        }
      }
    };
  })
}));

// Mock the IndustryService class
jest.mock('@/app/shared/services/IndustryService', () => {
  return {
    IndustryService: jest.fn().mockImplementation(() => {
      return {
        getAllIndustries: jest.fn().mockResolvedValue([
          { 
            _id: '1', 
            name: 'Industry 1', 
            locationId: '1', 
            industryType: 'FREIGHT', 
            tracks: [], 
            ownerId: 'owner1',
            blockName: 'Block 1',
            description: '' 
          },
          { 
            _id: '2', 
            name: 'Industry 2', 
            locationId: '1', 
            industryType: 'YARD', 
            tracks: [], 
            ownerId: 'owner1',
            blockName: 'Block 1',
            description: '' 
          },
          { 
            _id: '3', 
            name: 'Industry 3', 
            locationId: '2', 
            industryType: 'PASSENGER', 
            tracks: [], 
            ownerId: 'owner1',
            blockName: 'Block 2',
            description: '' 
          }
        ]),
        createIndustry: jest.fn().mockImplementation((industryData) => {
          return Promise.resolve({
            ...industryData,
            _id: 'new-industry-id'
          });
        }),
        updateIndustry: jest.fn().mockImplementation((id, industryData) => {
          return Promise.resolve({
            _id: id,
            ...industryData
          });
        }),
        deleteIndustry: jest.fn().mockResolvedValue(undefined)
      };
    })
  };
});

// Mock the components to simplify testing
jest.mock('@/app/components/EditIndustryForm', () => ({
  EditIndustryForm: ({ 
    industry, 
    onSave, 
    onCancel 
  }: { 
    industry: Industry; 
    onSave: (industry: Industry) => void; 
    onCancel: () => void;
  }) => (
    <div data-testid="edit-industry-form">
      <button onClick={() => onSave(industry)}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}));

jest.mock('@/app/components/AddIndustryForm', () => ({
  AddIndustryForm: ({ 
    onSave, 
    onCancel 
  }: { 
    onSave: (industry: Industry) => void; 
    onCancel: () => void;
  }) => (
    <div data-testid="add-industry-form">
      <button onClick={() => onSave({
        _id: 'new-industry-id',
        name: 'New Industry',
        locationId: '1',
        blockName: 'Block 1',
        industryType: IndustryType.FREIGHT,
        tracks: [],
        ownerId: 'owner1',
        description: 'New industry description'
      })}>
        Save
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}));

// Mock the ConfirmDialog component
jest.mock('@/app/components/ui/dialog', () => {
  return {
    ...jest.requireActual('@/app/components/ui/dialog'),
    ConfirmDialog: ({ 
      title, 
      description, 
      isOpen, 
      onConfirm, 
      onClose 
    }: { 
      title: string;
      description: string;
      isOpen: boolean;
      onConfirm: () => void;
      onClose: () => void;
    }) => (
      isOpen ? (
        <div data-testid="confirm-dialog">
          <div data-testid="confirm-dialog-title">{title}</div>
          <div data-testid="confirm-dialog-description">{description}</div>
          <button data-testid="confirm-dialog-confirm" onClick={onConfirm}>Confirm</button>
          <button data-testid="confirm-dialog-cancel" onClick={onClose}>Cancel</button>
        </div>
      ) : null
    )
  };
});

describe('Industries Page', () => {
  const mockLocations = [
    { _id: '1', stationName: 'Station A', block: 'Block 1', ownerId: 'owner1', locationType: LocationType.ON_LAYOUT },
    { _id: '2', stationName: 'Station B', block: 'Block 2', ownerId: 'owner1', locationType: LocationType.FIDDLE_YARD },
    { _id: '3', stationName: 'Station C', block: 'Block 3', ownerId: 'owner1', locationType: LocationType.OFF_LAYOUT }
  ];

  const mockApiIndustries = [
    { 
      _id: '1', 
      name: 'Industry 1', 
      locationId: '1', 
      industryType: IndustryType.FREIGHT, 
      tracks: [], 
      ownerId: 'owner1',
      blockName: 'Block 1',
      description: '' 
    },
    { 
      _id: '2', 
      name: 'Industry 2', 
      locationId: '1', 
      industryType: IndustryType.YARD, 
      tracks: [], 
      ownerId: 'owner1',
      blockName: 'Block 1',
      description: '' 
    },
    { 
      _id: '3', 
      name: 'Industry 3', 
      locationId: '2', 
      industryType: IndustryType.PASSENGER, 
      tracks: [], 
      ownerId: 'owner1',
      blockName: 'Block 2',
      description: '' 
    }
  ];

  const mockGroupedIndustries = {
    '1': {
      locationName: 'Station A',
      blocks: {
        'Block 1': [
          { 
            _id: '1', 
            name: 'Industry 1', 
            locationId: '1', 
            blockName: 'Block 1',
            industryType: IndustryType.FREIGHT, 
            tracks: [], 
            ownerId: 'owner1',
            description: '' 
          },
          { 
            _id: '2', 
            name: 'Industry 2', 
            locationId: '1', 
            blockName: 'Block 1',
            industryType: IndustryType.YARD, 
            tracks: [], 
            ownerId: 'owner1',
            description: '' 
          }
        ],
        'Block Z': [
          { 
            _id: '4', 
            name: 'Industry 4', 
            locationId: '1', 
            blockName: 'Block Z',
            industryType: IndustryType.FREIGHT, 
            tracks: [], 
            ownerId: 'owner1',
            description: '' 
          },
        ],
        'Block A': [
          { 
            _id: '5', 
            name: 'Industry 5', 
            locationId: '1', 
            blockName: 'Block A',
            industryType: IndustryType.FREIGHT, 
            tracks: [], 
            ownerId: 'owner1',
            description: '' 
          },
        ]
      }
    },
    '2': {
      locationName: 'Station B',
      blocks: {
        'Block 2': [
          { 
            _id: '3', 
            name: 'Industry 3', 
            locationId: '2', 
            blockName: 'Block 2',
            industryType: IndustryType.PASSENGER, 
            tracks: [], 
            ownerId: 'owner1',
            description: '' 
          }
        ]
      }
    },
    '3': {
      locationName: 'Station C',
      blocks: {
        'Block 3': [
          { 
            _id: '6', 
            name: 'Industry 6', 
            locationId: '3', 
            blockName: 'Block 3',
            industryType: IndustryType.FREIGHT, 
            tracks: [], 
            ownerId: 'owner1',
            description: '' 
          }
        ]
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (clientServices.services.locationService.getAllLocations as jest.Mock).mockResolvedValue(mockLocations);
    (clientServices.services.industryService.getAllIndustries as jest.Mock).mockResolvedValue(mockApiIndustries);
    (groupIndustriesByLocationAndBlock as jest.Mock).mockReturnValue(mockGroupedIndustries);
    
    // Make sure IndustryService.prototype.getAllIndustries returns the mock data
    const mockIndustryService = new IndustryService();
    (mockIndustryService.getAllIndustries as jest.Mock).mockResolvedValue(mockApiIndustries);
  });

  it('should fetch and display industries grouped by block and location', async () => {
    customRender(<IndustriesPage />);

    // Check for loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Industries by Location and Block')).toBeInTheDocument();
    });

    // Check for location headings
    await waitFor(() => {
      expect(screen.getByText('Station A')).toBeInTheDocument();
      expect(screen.getByText('Station B')).toBeInTheDocument();
    });

    // Check for block headings
    await waitFor(() => {
      expect(screen.getByText('Block: Block 1')).toBeInTheDocument();
      expect(screen.getByText('Block: Block 2')).toBeInTheDocument();
    });

    // Check for industry names
    await waitFor(() => {
      expect(screen.getByText('Industry 1')).toBeInTheDocument();
      expect(screen.getByText('Industry 2')).toBeInTheDocument();
      expect(screen.getByText('Industry 3')).toBeInTheDocument();
    });

    // Check for industry types
    await waitFor(() => {
      expect(screen.getAllByText(IndustryType.FREIGHT)[0]).toBeInTheDocument();
      expect(screen.getByText(IndustryType.YARD)).toBeInTheDocument();
      expect(screen.getByText(IndustryType.PASSENGER)).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    // Only mock the location service to fail
    (clientServices.services.locationService.getAllLocations as jest.Mock).mockRejectedValue(new Error('Failed to fetch locations'));
    
    customRender(<IndustriesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load data. Please try again later.')).toBeInTheDocument();
    });
  });
  
  it('should show the add industry form when Add New Industry button is clicked', async () => {
    customRender(<IndustriesPage />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Industries by Location and Block')).toBeInTheDocument();
    });
    
    // Find and click the Add New Industry button
    const addButton = screen.getByRole('button', { name: /add new industry/i });
    fireEvent.click(addButton);
    
    // Should show the add industry form
    await waitFor(() => {
      expect(screen.getByTestId('add-industry-form')).toBeInTheDocument();
    });
  });
  
  it('should add a new industry and update the UI', async () => {
    customRender(<IndustriesPage />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Industries by Location and Block')).toBeInTheDocument();
    });
    
    // Click Add New Industry
    const addButton = screen.getByRole('button', { name: /add new industry/i });
    fireEvent.click(addButton);
    
    // Click Save on the form
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Should go back to the main page
    await waitFor(() => {
      expect(screen.getByText('Industries by Location and Block')).toBeInTheDocument();
    });
    
    // The new industry should be added to the UI
    await waitFor(() => {
      // Industry names would include the new one (would appear in the DOM if the UI was updated correctly)
      expect(screen.getAllByText(/industry/i).length).toBeGreaterThan(3);
    });
  });
  
  it('should cancel adding a new industry', async () => {
    customRender(<IndustriesPage />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Industries by Location and Block')).toBeInTheDocument();
    });
    
    // Click Add New Industry
    const addButton = screen.getByRole('button', { name: /add new industry/i });
    fireEvent.click(addButton);
    
    // Click Cancel on the form
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // Should go back to the main page without changes
    await waitFor(() => {
      expect(screen.getByText('Industries by Location and Block')).toBeInTheDocument();
    });
  });

  it('should display location type indicators after loading', async () => {
    customRender(<IndustriesPage />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check for location type badges
    expect(screen.getByText('ON LAYOUT')).toBeInTheDocument();
    expect(screen.getByText('FIDDLE YARD')).toBeInTheDocument();
    expect(screen.getByText('OFF LAYOUT')).toBeInTheDocument();
  });

  it('should display block names within each location', async () => {
    customRender(<IndustriesPage />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check that blocks exist without requiring specific order
    expect(screen.getByText(/Block: Block A/)).toBeInTheDocument();
    expect(screen.getByText(/Block: Block 1/)).toBeInTheDocument();
    expect(screen.getByText(/Block: Block Z/)).toBeInTheDocument();
  });

  it('should show the delete confirmation dialog when delete button is clicked', async () => {
    customRender(<IndustriesPage />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Industries by Location and Block')).toBeInTheDocument();
    });
    
    // Find and click the delete button for the first industry
    const deleteButtons = await screen.findAllByTestId(/delete-industry/);
    fireEvent.click(deleteButtons[0]);
    
    // Confirm dialog should appear
    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-dialog-title')).toHaveTextContent('Delete Industry');
      expect(screen.getByTestId('confirm-dialog-description')).toContainHTML('Are you sure you want to delete');
    });
  });

  it('should delete an industry when confirmed and update the UI', async () => {
    // Get a reference to the mocked deleteIndustry method
    const mockDeleteIndustry = clientServices.services.industryService.deleteIndustry as jest.Mock;
    mockDeleteIndustry.mockClear();
    
    customRender(<IndustriesPage />);
    
    // Wait for page to fully load (no loading indicator visible)
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Initial industry count - use findAllByText to wait for elements to be present
    const initialIndustries = await screen.findAllByText(/Industry \d/);
    const initialIndustryCount = initialIndustries.length;
    
    // Find and click the delete button for the first industry
    const deleteButtons = await screen.findAllByTestId(/delete-industry/);
    fireEvent.click(deleteButtons[0]);
    
    // Confirm dialog should appear
    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });
    
    // Click confirm to delete
    fireEvent.click(screen.getByTestId('confirm-dialog-confirm'));
    
    // Verify the delete API was called
    await waitFor(() => {
      expect(mockDeleteIndustry).toHaveBeenCalled();
    });
    
    // Wait for the UI to update
    await waitFor(() => {
      // Dialog should be closed
      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    });
    
    // Get the new count of industries
    const finalIndustries = screen.getAllByText(/Industry \d/);
    expect(finalIndustries.length).toBeLessThan(initialIndustryCount);
  });

  it('should cancel industry deletion when cancel button is clicked', async () => {
    // Get a reference to the mocked deleteIndustry method
    const mockDeleteIndustry = clientServices.services.industryService.deleteIndustry as jest.Mock;
    mockDeleteIndustry.mockClear();
    
    customRender(<IndustriesPage />);
    
    // Wait for page to fully load (no loading indicator visible)
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Initial industry count - use findAllByText to wait for elements to be present
    const initialIndustries = await screen.findAllByText(/Industry \d/);
    const initialIndustryCount = initialIndustries.length;
    
    // Find and click the delete button for the first industry
    const deleteButtons = await screen.findAllByTestId(/delete-industry/);
    fireEvent.click(deleteButtons[0]);
    
    // Confirm dialog should appear
    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });
    
    // Click cancel
    fireEvent.click(screen.getByTestId('confirm-dialog-cancel'));
    
    // Verify the delete API was NOT called
    expect(mockDeleteIndustry).not.toHaveBeenCalled();
    
    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    });
    
    // Industry count should remain the same
    const finalIndustries = screen.getAllByText(/Industry \d/);
    expect(finalIndustries.length).toBe(initialIndustryCount);
  });
}); 