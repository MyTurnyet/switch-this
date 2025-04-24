import { render, screen } from '@testing-library/react';
import { LayoutProvider } from '@/app/shared/contexts/LayoutContext';
import LayoutStatePage from '../layout-state/page';
import { Industry, Location, RollingStock } from '../../shared/types/models';

describe('LayoutStatePage', () => {
  it('renders the layout state page with initial empty state', () => {
    const emptyState = {
      locations: [] as Location[],
      industries: [] as Industry[],
      rollingStock: [] as RollingStock[]
    };

    render(
      <LayoutProvider initialState={emptyState}>
        <LayoutStatePage initialState={emptyState} />
      </LayoutProvider>
    );

    expect(screen.getByText('Layout State')).toBeInTheDocument();
    expect(screen.getByText('Locations')).toBeInTheDocument();
    expect(screen.getByText('Industries')).toBeInTheDocument();
    expect(screen.getByText('Rolling Stock')).toBeInTheDocument();
    
    // Check that each section shows an empty array
    const sections = screen.getAllByText('[]');
    expect(sections).toHaveLength(3);
  });

  it('displays state data when provided', () => {
    const initialState = {
      locations: [{
        _id: 'loc1',
        stationName: 'Test Location',
        block: 'A',
        ownerId: 'owner1'
      }] as Location[],
      industries: [{
        _id: 'ind1',
        name: 'Test Industry',
        industryType: 'FREIGHT' as const,
        tracks: [{
          _id: 'track1',
          name: 'Track 1',
          maxCars: 3,
          placedCars: []
        }],
        locationId: 'loc1',
        ownerId: 'owner1'
      }] as Industry[],
      rollingStock: [{
        _id: 'car1',
        roadName: 'TEST',
        roadNumber: '1234',
        aarType: 'XM',
        description: 'Test Car',
        color: 'RED',
        note: '',
        homeYard: 'yard1',
        ownerId: 'owner1'
      }] as RollingStock[]
    };

    render(
      <LayoutProvider initialState={initialState}>
        <LayoutStatePage initialState={initialState} />
      </LayoutProvider>
    );

    expect(screen.getByText('Layout State')).toBeInTheDocument();
    expect(screen.getByText('Locations')).toBeInTheDocument();
    expect(screen.getByText('Industries')).toBeInTheDocument();
    expect(screen.getByText('Rolling Stock')).toBeInTheDocument();
    
    // Check that the JSON data is displayed
    expect(screen.getByText(/Test Location/)).toBeInTheDocument();
    expect(screen.getByText(/Test Industry/)).toBeInTheDocument();
    expect(screen.getByText(/TEST.*1234/)).toBeInTheDocument();
  });

  it('shows cars placed at industries', () => {
    const initialState = {
      locations: [{
        _id: 'loc1',
        stationName: 'Test Location',
        block: 'A',
        ownerId: 'owner1'
      }] as Location[],
      industries: [{
        _id: 'ind1',
        name: 'Test Industry',
        industryType: 'FREIGHT' as const,
        tracks: [{
          _id: 'track1',
          name: 'Track 1',
          maxCars: 3,
          placedCars: ['car1']
        }],
        locationId: 'loc1',
        ownerId: 'owner1'
      }] as Industry[],
      rollingStock: [{
        _id: 'car1',
        roadName: 'TEST',
        roadNumber: '1234',
        aarType: 'XM',
        description: 'Test Car',
        color: 'RED',
        note: '',
        homeYard: 'yard1',
        ownerId: 'owner1'
      }] as RollingStock[]
    };

    render(
      <LayoutProvider initialState={initialState}>
        <LayoutStatePage initialState={initialState} />
      </LayoutProvider>
    );

    // Check that the car is shown in the placed cars array
    expect(screen.getByText(/"placedCars":\s*\[\s*"car1"\s*\]/)).toBeInTheDocument();
  });
}); 