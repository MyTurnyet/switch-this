import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '../Dashboard';
import { ClientServices } from '../../shared/services/clientServices';
import { act } from 'react-dom/test-utils';

const mockServices: ClientServices = {
  locationService: {
    getAllLocations: jest.fn().mockResolvedValue([])
  },
  industryService: {
    getAllIndustries: jest.fn().mockResolvedValue([])
  },
  trainRouteService: {
    getAllTrainRoutes: jest.fn().mockResolvedValue([])
  },
  rollingStockService: {
    getAllRollingStock: jest.fn().mockResolvedValue([])
  }
};

describe('Dashboard', () => {
  it('renders loading state correctly', () => {
    render(<Dashboard services={mockServices} />);
    
    const loadingElements = screen.getAllByText('...');
    expect(loadingElements).toHaveLength(4);
    loadingElements.forEach(element => {
      expect(element).toHaveClass('animate-pulse');
    });
  });

  it('renders error state correctly', async () => {
    const errorServices = {
      ...mockServices,
      locationService: {
        getAllLocations: jest.fn().mockRejectedValue(new Error('Failed to load locations'))
      }
    };

    render(<Dashboard services={errorServices} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load locations')).toBeInTheDocument();
    });
    
    const zeroCounts = screen.getAllByText('0');
    expect(zeroCounts).toHaveLength(4);
  });

  it('renders data correctly', async () => {
    const mockData = {
      locations: [{ _id: '1', stationName: 'Station 1', block: 'A', ownerId: '1' }],
      industries: [{ _id: '1', name: 'Industry 1', locationId: '1', blockName: 'A', industryType: 'FREIGHT', tracks: [], ownerId: '1' }],
      trainRoutes: [{ _id: '1', name: 'Route 1', startLocationId: '1', endLocationId: '2' }],
      rollingStock: [{ _id: '1', name: 'Stock 1', type: 'Engine', currentLocationId: '1' }]
    };

    const dataServices = {
      ...mockServices,
      locationService: {
        getAllLocations: jest.fn().mockResolvedValue(mockData.locations)
      },
      industryService: {
        getAllIndustries: jest.fn().mockResolvedValue(mockData.industries)
      },
      trainRouteService: {
        getAllTrainRoutes: jest.fn().mockResolvedValue(mockData.trainRoutes)
      },
      rollingStockService: {
        getAllRollingStock: jest.fn().mockResolvedValue(mockData.rollingStock)
      }
    };

    render(<Dashboard services={dataServices} />);

    await waitFor(() => {
      expect(screen.getAllByText('1')).toHaveLength(4);
      expect(screen.getByText('Locations')).toBeInTheDocument();
      expect(screen.getByText('Industries')).toBeInTheDocument();
      expect(screen.getByText('Train Routes')).toBeInTheDocument();
      expect(screen.getByText('Rolling Stock')).toBeInTheDocument();
    });
  });
}); 