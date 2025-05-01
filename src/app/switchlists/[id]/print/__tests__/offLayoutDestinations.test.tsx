import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SwitchlistPrintPage from '../page';
import { SwitchlistService } from '@/app/shared/services/SwitchlistService';
import { TrainRouteService } from '@/app/shared/services/TrainRouteService';
import { RollingStockService } from '@/app/shared/services/RollingStockService';
import { LocationService } from '@/app/shared/services/LocationService';
import { LocationType } from '@/app/shared/types/models';

// Mock the services
jest.mock('@/app/shared/services/SwitchlistService');
jest.mock('@/app/shared/services/TrainRouteService');
jest.mock('@/app/shared/services/RollingStockService');
jest.mock('@/app/shared/services/LocationService');

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock window.print
global.print = jest.fn();
Object.defineProperty(window, 'print', {
  value: jest.fn(),
  writable: true
});

describe('Switchlist Print - Off-Layout Destinations', () => {
  const mockSwitchlist = {
    _id: 'switchlist1',
    trainRouteId: 'route1',
    name: 'Test Switchlist',
    createdAt: '2023-01-01T00:00:00Z',
    status: 'IN_PROGRESS',
    ownerId: 'owner1',
    notes: 'Test notes'
  };

  const mockTrainRoute = {
    _id: 'route1',
    name: 'Test Route',
    routeNumber: 'TR-101',
    routeType: 'MIXED',
    originatingYardId: 'yard1',
    terminatingYardId: 'yard2',
    stations: ['loc1', 'loc3', 'loc2'],
    ownerId: 'owner1'
  };

  const mockLocations = [
    {
      _id: 'loc1',
      stationName: 'Echo Lake, WA',
      block: 'ECHO',
      locationType: LocationType.ON_LAYOUT,
      ownerId: 'owner1'
    },
    {
      _id: 'loc2',
      stationName: 'Chicago, IL',
      block: 'EAST',
      locationType: LocationType.OFF_LAYOUT,
      ownerId: 'owner1'
    },
    {
      _id: 'loc3',
      stationName: 'Echo Lake Yard',
      block: 'ECHO',
      locationType: LocationType.FIDDLE_YARD,
      ownerId: 'owner1'
    }
  ];

  const mockRollingStockWithOffLayoutDestination = {
    _id: 'rs1',
    roadName: 'BNSF',
    roadNumber: '12345',
    aarType: 'Boxcar',
    description: 'Test boxcar',
    color: 'Brown',
    note: '',
    homeYard: 'yard1',
    currentLocation: {
      industryId: 'ind1',
      trackId: 'track1'
    },
    destination: {
      immediateDestination: {
        locationId: 'loc3', // Fiddle yard
        industryId: 'ind3',
        trackId: 'track3'
      },
      finalDestination: {
        locationId: 'loc2', // Chicago
        industryId: 'ind2',
        trackId: 'track2'
      }
    },
    ownerId: 'owner1'
  };

  const mockRollingStockOnLayout = {
    _id: 'rs2',
    roadName: 'UP',
    roadNumber: '54321',
    aarType: 'Tanker',
    description: 'Test tanker',
    color: 'Black',
    note: '',
    homeYard: 'yard1',
    currentLocation: {
      industryId: 'ind1',
      trackId: 'track1'
    },
    // No destination - represents a car that's not moving
    ownerId: 'owner1'
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Set up service mocks
    SwitchlistService.prototype.getSwitchlistById = jest.fn().mockResolvedValue(mockSwitchlist);
    TrainRouteService.prototype.getTrainRouteById = jest.fn().mockResolvedValue(mockTrainRoute);
    LocationService.prototype.getAllLocations = jest.fn().mockResolvedValue(mockLocations);
    
    // Mock RollingStockService to return mock data
    RollingStockService.prototype.getAllRollingStock = jest.fn().mockResolvedValue([
      mockRollingStockWithOffLayoutDestination,
      mockRollingStockOnLayout
    ]);
  });

  it('displays off-layout destinations correctly in the car movement table', async () => {
    // Render the page with a mock params object
    render(<SwitchlistPrintPage params={{ id: 'switchlist1' }} />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading switchlist data/)).not.toBeInTheDocument();
    });

    // Verify the page title is correct
    expect(screen.getByText('Test Switchlist')).toBeInTheDocument();
    expect(screen.getByText(/Test Route/)).toBeInTheDocument();

    // Check the car movement table headers
    expect(screen.getByText('Car')).toBeInTheDocument();
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();

    // Check if the rolling stock is correctly listed
    expect(screen.getByText('BNSF 12345')).toBeInTheDocument();
    expect(screen.getByText('UP 54321')).toBeInTheDocument();

    // Check if the final destination is correctly displayed
    expect(screen.getByText('Chicago, IL')).toBeInTheDocument();
    expect(screen.getByText('via Fiddle Yard')).toBeInTheDocument();
  });

  it('displays default destination for cars without final destination', async () => {
    // Use only the rolling stock without a destination
    RollingStockService.prototype.getAllRollingStock = jest.fn().mockResolvedValue([
      mockRollingStockOnLayout
    ]);

    // Render the page
    render(<SwitchlistPrintPage params={{ id: 'switchlist1' }} />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading switchlist data/)).not.toBeInTheDocument();
    });

    // Check the rolling stock is shown
    expect(screen.getByText('UP 54321')).toBeInTheDocument();

    // Verify that the default destination text is shown
    // The implementation uses a random track number, so we check for the text pattern
    expect(screen.getByText(/Industry Track/)).toBeInTheDocument();
    
    // And should not show "via Fiddle Yard"
    expect(screen.queryByText('via Fiddle Yard')).not.toBeInTheDocument();
  });

  it('handles print button click', async () => {
    // Render the page
    render(<SwitchlistPrintPage params={{ id: 'switchlist1' }} />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading switchlist data/)).not.toBeInTheDocument();
    });

    // Find the print button and click it
    const printButton = screen.getByText('Print Switchlist');
    printButton.click();

    // Verify window.print was called
    expect(window.print).toHaveBeenCalled();
  });
}); 