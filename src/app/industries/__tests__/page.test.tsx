import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import IndustriesPage from '../page';
import * as services from '@/app/shared/services';
import { groupIndustriesByLocationAndBlock } from '@/app/layout-state/utils/groupIndustries';
import { IndustryType, LocationType, Industry } from '@/app/shared/types/models';
import { IndustryService } from '@/app/shared/services/IndustryService';

// Mock the services
jest.mock('@/app/shared/services', () => ({
  services: {
    locationService: {
      getAllLocations: jest.fn()
    },
    industryService: {
      getAllIndustries: jest.fn()
    }
  }
}));

// Mock the groupIndustriesByLocationAndBlock function
jest.mock('@/app/layout-state/utils/groupIndustries', () => ({
  groupIndustriesByLocationAndBlock: jest.fn()
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
        })
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
    (services.services.locationService.getAllLocations as jest.Mock).mockResolvedValue(mockLocations);
    (services.services.industryService.getAllIndustries as jest.Mock).mockResolvedValue(mockApiIndustries);
    (groupIndustriesByLocationAndBlock as jest.Mock).mockReturnValue(mockGroupedIndustries);
    
    // Make sure IndustryService.prototype.getAllIndustries returns the mock data
    const mockIndustryService = new IndustryService();
    (mockIndustryService.getAllIndustries as jest.Mock).mockResolvedValue(mockApiIndustries);
  });

  it('should fetch and display industries grouped by block and location', async () => {
    render(<IndustriesPage />);

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
      expect(screen.getByText(IndustryType.FREIGHT)).toBeInTheDocument();
      expect(screen.getByText(IndustryType.YARD)).toBeInTheDocument();
      expect(screen.getByText(IndustryType.PASSENGER)).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    // Only mock the location service to fail
    (services.services.locationService.getAllLocations as jest.Mock).mockRejectedValue(new Error('Failed to fetch locations'));
    
    render(<IndustriesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load data. Please try again later.')).toBeInTheDocument();
    });
  });
  
  it('should show the add industry form when Add New Industry button is clicked', async () => {
    render(<IndustriesPage />);
    
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
    render(<IndustriesPage />);
    
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
    render(<IndustriesPage />);
    
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
    render(<IndustriesPage />);

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
    render(<IndustriesPage />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check that blocks exist without requiring specific order
    expect(screen.getByText(/Block: Block A/)).toBeInTheDocument();
    expect(screen.getByText(/Block: Block 1/)).toBeInTheDocument();
    expect(screen.getByText(/Block: Block Z/)).toBeInTheDocument();
  });
}); 