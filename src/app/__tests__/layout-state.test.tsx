import { render, screen } from '@testing-library/react';
import { LayoutProvider } from '../shared/contexts/LayoutContext';
import LayoutStatePage from '../layout-state/page';
import { Industry, Location, RollingStock } from '../shared/types/models';

describe('LayoutStatePage', () => {
  const mockLocation: Location = {
    _id: 'loc1',
    stationName: 'Test Location',
    block: 'A',
    ownerId: 'owner1'
  };

  const mockIndustry: Industry = {
    _id: 'ind1',
    name: 'Test Industry',
    industryType: 'FREIGHT',
    tracks: [{
      _id: 'track1',
      name: 'Track 1',
      maxCars: 3,
      placedCars: []
    }],
    locationId: 'loc1',
    ownerId: 'owner1'
  };

  const mockCar: RollingStock = {
    _id: 'car1',
    roadName: 'TEST',
    roadNumber: '1234',
    aarType: 'XM',
    description: 'Test Car',
    color: 'RED',
    note: '',
    homeYard: 'yard1',
    ownerId: 'owner1'
  };

  it('renders the layout state page with initial empty state', () => {
    render(
      <LayoutProvider>
        <LayoutStatePage initialState={{ locations: [], industries: [], rollingStock: [] }} />
      </LayoutProvider>
    );

    expect(screen.getByText('Layout State')).toBeInTheDocument();
    expect(screen.getByText('No industries found')).toBeInTheDocument();
  });

  it('displays industries grouped by location and block', () => {
    const initialState = {
      locations: [mockLocation],
      industries: [mockIndustry],
      rollingStock: [mockCar]
    };

    render(
      <LayoutProvider initialState={initialState}>
        <LayoutStatePage initialState={initialState} />
      </LayoutProvider>
    );

    expect(screen.getByText('Block A')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('Test Industry')).toBeInTheDocument();
  });

  it('shows cars placed at industries', () => {
    const industryWithCar = {
      ...mockIndustry,
      tracks: [{
        ...mockIndustry.tracks[0],
        placedCars: ['car1']
      }]
    };

    const initialState = {
      locations: [mockLocation],
      industries: [industryWithCar],
      rollingStock: [mockCar]
    };

    render(
      <LayoutProvider initialState={initialState}>
        <LayoutStatePage initialState={initialState} />
      </LayoutProvider>
    );

    expect(screen.getByText('TEST 1234')).toBeInTheDocument();
  });
}); 