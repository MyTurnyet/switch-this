import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RollingStock from '../RollingStock';
import { ClientServices, RollingStockService } from '@/app/shared/services/clientServices';
import { RollingStock as RollingStockType } from '@/app/shared/types/models';

describe('RollingStock', () => {
  // Create a properly typed mock
  const mockGetAllRollingStock = jest.fn<Promise<RollingStockType[]>, []>();
  
  const mockServices = {
    rollingStockService: {
      getAllRollingStock: mockGetAllRollingStock,
    } as unknown as RollingStockService,
  } as unknown as ClientServices;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockGetAllRollingStock.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<RollingStock services={mockServices} />);
    expect(screen.getByText(/Loading rolling stock/i)).toBeInTheDocument();
  });

  it('displays rolling stock data when loaded', async () => {
    const mockRollingStock: RollingStockType[] = [
      {
        _id: '1',
        roadName: 'ATSF',
        roadNumber: '12345',
        aarType: 'XM',
        description: 'Boxcar',
        color: 'RED',
        note: 'Test note',
        homeYard: 'Yard1',
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
        homeYard: 'Yard2',
        ownerId: 'owner2',
      },
    ];

    mockGetAllRollingStock.mockResolvedValue(mockRollingStock);

    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText('ATSF 12345')).toBeInTheDocument();
    });

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

    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText(/No rolling stock available/i)).toBeInTheDocument();
    });
  });
}); 