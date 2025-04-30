import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import IndustriesPage from '../page';
import * as services from '@/app/shared/services';
import { groupIndustriesByLocationAndBlock } from '@/app/layout-state/utils/groupIndustries';
import { IndustryType } from '@/app/shared/types/models';
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
        ])
      };
    })
  };
});

describe('Industries Page', () => {
  const mockLocations = [
    { _id: '1', stationName: 'Station A', block: 'Block 1', ownerId: 'owner1' },
    { _id: '2', stationName: 'Station B', block: 'Block 2', ownerId: 'owner1' }
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
}); 