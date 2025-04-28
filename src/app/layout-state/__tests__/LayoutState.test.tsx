import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import LayoutState from '../LayoutState';
import { ClientServices } from '../../shared/services/clientServices';

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

describe('LayoutState', () => {
  it('renders loading state correctly', () => {
    render(<LayoutState services={mockServices} />);
    expect(screen.getByText('Layout State')).toBeInTheDocument();
  });

  it('renders data correctly', async () => {
    const mockData = {
      locations: [
        { _id: '1', stationName: 'Station 1', block: 'A', ownerId: '1' }
      ],
      industries: [
        { _id: '1', name: 'Industry 1', locationId: '1', blockName: 'A', industryType: 'FREIGHT' as const, tracks: [], ownerId: '1' }
      ],
      rollingStock: [
        { _id: '1', name: 'Stock 1', type: 'Engine', currentLocationId: '1' }
      ]
    };

    const dataServices = {
      ...mockServices,
      locationService: {
        getAllLocations: jest.fn().mockResolvedValue(mockData.locations)
      },
      industryService: {
        getAllIndustries: jest.fn().mockResolvedValue(mockData.industries)
      },
      rollingStockService: {
        getAllRollingStock: jest.fn().mockResolvedValue(mockData.rollingStock)
      }
    };

    render(<LayoutState services={dataServices} />);

    await waitFor(() => {
      expect(screen.getByText('Station 1')).toBeInTheDocument();
      expect(screen.getByText('Industry 1')).toBeInTheDocument();
      expect(screen.getByText(/Stock 1/)).toBeInTheDocument();
      expect(screen.getByText('Industries by Location')).toBeInTheDocument();
      expect(screen.getByText('Rolling Stock')).toBeInTheDocument();
    });
  });
}); 