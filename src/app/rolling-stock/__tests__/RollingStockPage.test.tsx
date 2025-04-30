import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import RollingStockPage from '@/app/rolling-stock/page';
import { services } from '@/app/shared/services/clientServices';
import { RollingStock, Industry, IndustryType } from '@/app/shared/types/models';

// Mock the services
jest.mock('@/app/shared/services/clientServices', () => ({
  services: {
    rollingStockService: {
      getAllRollingStock: jest.fn(),
    },
    industryService: {
      getAllIndustries: jest.fn(),
    },
  },
}));

describe('RollingStockPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page with a title', async () => {
    // Setup a simple resolved value to avoid test errors
    (services.rollingStockService.getAllRollingStock as jest.Mock).mockResolvedValue([]);
    (services.industryService.getAllIndustries as jest.Mock).mockResolvedValue([]);
    
    render(<RollingStockPage />);
    
    // Wait for the title to appear after loading state finishes
    await waitFor(() => {
      expect(screen.getByText('Rolling Stock')).toBeInTheDocument();
    });
  });

  it('fetches and displays rolling stock data', async () => {
    // Mock data
    const mockYards: Industry[] = [
      {
        _id: 'yard1',
        name: 'Central Yard',
        industryType: IndustryType.YARD,
        tracks: [],
        locationId: 'loc1',
        blockName: 'Block A',
        ownerId: 'owner1',
        description: ''
      },
      {
        _id: 'yard2',
        name: 'Eastern Yard',
        industryType: IndustryType.YARD,
        tracks: [],
        locationId: 'loc2',
        blockName: 'Block B',
        ownerId: 'owner2',
        description: ''
      }
    ];

    const mockRollingStock: RollingStock[] = [
      {
        _id: '1',
        roadName: 'ATSF',
        roadNumber: '12345',
        aarType: 'XM',
        description: 'Boxcar',
        color: 'RED',
        note: 'Test note',
        homeYard: 'yard1',
        ownerId: 'owner1',
      },
      {
        _id: '2',
        roadName: 'CP',
        roadNumber: '67890',
        aarType: 'FB',
        description: 'Flatcar',
        color: 'BLUE',
        note: '',
        homeYard: 'yard2',
        ownerId: 'owner2',
      },
    ];

    // Setup the mock to return our test data
    (services.rollingStockService.getAllRollingStock as jest.Mock).mockResolvedValue(mockRollingStock);
    (services.industryService.getAllIndustries as jest.Mock).mockResolvedValue(mockYards);

    render(<RollingStockPage />);

    // Should show loading initially
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('ATSF')).toBeInTheDocument();
      expect(screen.getByText('12345')).toBeInTheDocument();
    });

    // Check if other data is displayed
    expect(screen.getByText('CP')).toBeInTheDocument();
    expect(screen.getByText('67890')).toBeInTheDocument();
    expect(screen.getByText('XM')).toBeInTheDocument();
    expect(screen.getByText('Boxcar')).toBeInTheDocument();
    expect(screen.getByText('FB')).toBeInTheDocument();
    expect(screen.getByText('Flatcar')).toBeInTheDocument();

    // Check location text is displayed
    expect(screen.getAllByText('Unassigned').length).toBeGreaterThan(0);
  });

  it('displays an error message when fetching fails', async () => {
    // Setup the mock to throw an error
    (services.rollingStockService.getAllRollingStock as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch rolling stock')
    );

    render(<RollingStockPage />);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to load rolling stock/i)).toBeInTheDocument();
    });
  });
}); 