import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import RollingStockPage from '@/app/rolling-stock/page';
import { services } from '@/app/shared/services/clientServices';
import { RollingStock, Industry, IndustryType } from '@/app/shared/types/models';
import { ToastProvider } from '@/app/components/ui';

// Create a wrapper component that includes the ToastProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <ToastProvider>{children}</ToastProvider>;
};

// Custom render function that wraps the component with ToastProvider
const customRender = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper });
};

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
    // Mock empty data
    (services.rollingStockService.getAllRollingStock as jest.Mock).mockResolvedValue([]);
    (services.industryService.getAllIndustries as jest.Mock).mockResolvedValue([]);

    customRender(<RollingStockPage />);
    
    // Verify the title is present
    expect(screen.getByText('Rolling Stock')).toBeInTheDocument();
    expect(screen.getByText('Manage your fleet of cars and locomotives')).toBeInTheDocument();
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
        note: '',
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
        homeYard: 'yard1',
        ownerId: 'owner1',
      }
    ];
    
    const mockIndustries: Industry[] = [
      {
        _id: 'yard1',
        name: 'Central Yard',
        locationId: 'loc1',
        blockName: 'Block A',
        description: 'Main classification yard',
        industryType: IndustryType.YARD,
        tracks: [],
        ownerId: 'owner1',
      },
      {
        _id: 'yard2',
        name: 'Eastern Yard',
        locationId: 'loc2',
        blockName: 'Block B',
        description: 'Secondary yard',
        industryType: IndustryType.YARD,
        tracks: [],
        ownerId: 'owner1',
      }
    ];
    
    (services.rollingStockService.getAllRollingStock as jest.Mock).mockResolvedValue(mockRollingStock);
    (services.industryService.getAllIndustries as jest.Mock).mockResolvedValue(mockIndustries);

    customRender(<RollingStockPage />);

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

    // Check yard locations are displayed
    expect(screen.getAllByText('Central Yard').length).toBeGreaterThan(0);
    // Eastern Yard isn't displayed because both cars have homeYard: 'yard1'
  });

  it('displays an error message when fetching fails', async () => {
    // Setup the mock to throw an error
    (services.rollingStockService.getAllRollingStock as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch rolling stock')
    );

    customRender(<RollingStockPage />);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getAllByText(/Failed to load rolling stock/i)[0]).toBeInTheDocument();
    });
  });
}); 