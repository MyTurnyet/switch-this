import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import RollingStockPage from '@/app/rolling-stock/page';
import { services } from '@/app/shared/services/clientServices';
import { RollingStock } from '@/app/shared/types/models';

// Mock the services
jest.mock('@/app/shared/services/clientServices', () => ({
  services: {
    rollingStockService: {
      getAllRollingStock: jest.fn(),
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
    
    render(<RollingStockPage />);
    
    // Wait for the title to appear after loading state finishes
    await waitFor(() => {
      expect(screen.getByText('Rolling Stock')).toBeInTheDocument();
    });
  });

  it('fetches and displays rolling stock data', async () => {
    // Mock data
    const mockRollingStock: RollingStock[] = [
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

    // Setup the mock to return our test data
    (services.rollingStockService.getAllRollingStock as jest.Mock).mockResolvedValue(mockRollingStock);

    render(<RollingStockPage />);

    // Should show loading initially
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('ATSF 12345')).toBeInTheDocument();
    });

    // Check if other data is displayed
    expect(screen.getByText('CP 67890')).toBeInTheDocument();
    expect(screen.getByText(/XM - Boxcar/i)).toBeInTheDocument();
    expect(screen.getByText(/FB - Flatcar/i)).toBeInTheDocument();
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