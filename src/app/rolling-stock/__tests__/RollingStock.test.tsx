import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RollingStock from '../RollingStock';
import { ClientServices, RollingStockService, IndustryService } from '@/app/shared/services/clientServices';
import { RollingStock as RollingStockType, Industry, IndustryType } from '@/app/shared/types/models';

describe('RollingStock', () => {
  // Create properly typed mocks
  const mockGetAllRollingStock = jest.fn<Promise<RollingStockType[]>, []>();
  const mockGetAllIndustries = jest.fn<Promise<Industry[]>, []>();
  
  const mockServices = {
    rollingStockService: {
      getAllRollingStock: mockGetAllRollingStock,
    } as unknown as RollingStockService,
    industryService: {
      getAllIndustries: mockGetAllIndustries,
    } as unknown as IndustryService,
  } as unknown as ClientServices;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockGetAllRollingStock.mockImplementation(() => new Promise(() => {})); // Never resolves
    mockGetAllIndustries.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<RollingStock services={mockServices} />);
    expect(screen.getByText(/Loading rolling stock/i)).toBeInTheDocument();
  });

  it('displays rolling stock data when loaded with yard names', async () => {
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

    const mockRollingStock: RollingStockType[] = [
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
      {
        _id: '3',
        roadName: 'UP',
        roadNumber: '54321',
        aarType: 'GS',
        description: 'Gondola',
        color: 'YELLOW',
        note: '',
        homeYard: 'unknown', // Test unknown yard
        ownerId: 'owner3',
      },
    ];

    mockGetAllRollingStock.mockResolvedValue(mockRollingStock);
    mockGetAllIndustries.mockResolvedValue(mockYards);

    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText('ATSF 12345')).toBeInTheDocument();
    });

    // Check if yard names are displayed correctly
    expect(screen.getByText('Central Yard')).toBeInTheDocument();
    expect(screen.getByText('Eastern Yard')).toBeInTheDocument();
    expect(screen.getByText('Unknown Yard')).toBeInTheDocument();

    expect(screen.getByText('CP 67890')).toBeInTheDocument();
    expect(screen.getByText(/XM - Boxcar/i)).toBeInTheDocument();
    expect(screen.getByText(/FB - Flatcar/i)).toBeInTheDocument();
  });

  it('displays error message when fetch fails', async () => {
    mockGetAllRollingStock.mockRejectedValue(
      new Error('Failed to fetch')
    );

    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load rolling stock/i)).toBeInTheDocument();
    });
  });

  it('displays a message when no rolling stock is available', async () => {
    mockGetAllRollingStock.mockResolvedValue([]);
    mockGetAllIndustries.mockResolvedValue([]);

    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText(/No rolling stock available/i)).toBeInTheDocument();
    });
  });
}); 