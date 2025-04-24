import { render, screen, act } from '@testing-library/react';
import { LayoutProvider, useLayout } from '../LayoutContext';
import { Location, Industry, RollingStock } from '@/shared/types/models';

describe('LayoutProvider', () => {
  const mockLocations: Location[] = [
    { _id: '1', stationName: 'Station A', block: 'Block 1', ownerId: 'owner1' },
    { _id: '2', stationName: 'Station B', block: 'Block 2', ownerId: 'owner2' }
  ];

  const mockIndustries: Industry[] = [
    { 
      _id: '1', 
      name: 'Industry 1', 
      locationId: '1', 
      industryType: 'FREIGHT',
      tracks: [],
      ownerId: 'owner1'
    },
    { 
      _id: '2', 
      name: 'Industry 2', 
      locationId: '2', 
      industryType: 'FREIGHT',
      tracks: [],
      ownerId: 'owner2'
    }
  ];

  const mockRollingStock: RollingStock[] = [
    {
      _id: '1',
      roadName: 'TEST',
      roadNumber: '1234',
      aarType: 'XM',
      description: 'Test Car',
      color: 'RED',
      note: '',
      homeYard: 'yard1',
      ownerId: 'owner1'
    }
  ];

  const mockServices = {
    locationService: {
      getAllLocations: jest.fn().mockResolvedValue(mockLocations)
    },
    industryService: {
      getAllIndustries: jest.fn().mockResolvedValue(mockIndustries)
    },
    trainRouteService: {
      getAllTrainRoutes: jest.fn().mockResolvedValue([])
    },
    rollingStockService: {
      getAllRollingStock: jest.fn().mockResolvedValue(mockRollingStock)
    }
  };

  const TestComponent = () => {
    const { locations, industries, rollingStock, error, isLoading } = useLayout();
    return (
      <div>
        {isLoading && <div>Loading...</div>}
        {error && <div>Error: {error}</div>}
        {locations.map(loc => (
          <div key={loc._id}>{loc.stationName}</div>
        ))}
        {industries.map(ind => (
          <div key={ind._id}>{ind.name}</div>
        ))}
        {rollingStock.map(rs => (
          <div key={rs._id}>{rs.roadName} {rs.roadNumber}</div>
        ))}
      </div>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides location data to children', async () => {
    render(
      <LayoutProvider services={mockServices}>
        <TestComponent />
      </LayoutProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('Station A')).toBeInTheDocument();
    expect(screen.getByText('Station B')).toBeInTheDocument();
    expect(mockServices.locationService.getAllLocations).toHaveBeenCalledTimes(1);
  });

  it('provides industry data to children', async () => {
    render(
      <LayoutProvider services={mockServices}>
        <TestComponent />
      </LayoutProvider>
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('Industry 1')).toBeInTheDocument();
    expect(screen.getByText('Industry 2')).toBeInTheDocument();
    expect(mockServices.industryService.getAllIndustries).toHaveBeenCalledTimes(1);
  });

  it('provides rolling stock data to children', async () => {
    render(
      <LayoutProvider services={mockServices}>
        <TestComponent />
      </LayoutProvider>
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('TEST 1234')).toBeInTheDocument();
    expect(mockServices.rollingStockService.getAllRollingStock).toHaveBeenCalledTimes(1);
  });

  it('handles fetch errors gracefully', async () => {
    const errorMessage = 'Failed to fetch data';
    const errorServices = {
      ...mockServices,
      locationService: {
        getAllLocations: jest.fn().mockRejectedValue(new Error(errorMessage))
      }
    };

    render(
      <LayoutProvider services={errorServices}>
        <TestComponent />
      </LayoutProvider>
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });
}); 