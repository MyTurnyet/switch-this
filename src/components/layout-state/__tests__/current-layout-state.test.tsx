import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CurrentLayoutState from '../current-layout-state';
import { LayoutState } from '@state/layout-state';
import { Location, Industry, RollingStock, Track } from '@shared/types/models';

describe('CurrentLayoutState', () => {
  const mockLayoutState = {
    getCarsAtLocation: jest.fn().mockReturnValue([])
  } as unknown as LayoutState;

  const mockLocation: Location = {
    _id: { $oid: 'loc1' },
    stationName: 'Test Station',
    block: 'A',
    ownerId: { $oid: 'owner1' }
  };

  const mockTrack: Track = {
    _id: { $oid: 'track1' },
    name: 'Track 1',
    maxCars: { $numberInt: '5' },
    placedCars: []
  };

  const mockIndustry: Industry = {
    _id: { $oid: 'ind1' },
    name: 'Test Industry',
    industryType: 'FREIGHT',
    locationId: { $oid: 'loc1' },
    ownerId: { $oid: 'owner1' },
    tracks: [mockTrack]
  };

  const mockRollingStock: Record<string, RollingStock> = {
    'car1': {
      _id: { $oid: 'car1' },
      roadName: 'BNSF',
      roadNumber: '1234',
      aarType: 'BOX',
      description: 'Box Car',
      color: 'Red',
      note: '',
      homeYard: { $oid: 'yard1' },
      ownerId: { $oid: 'owner1' }
    }
  };

  it('renders the layout state title', () => {
    render(
      <CurrentLayoutState
        layoutState={mockLayoutState}
        locations={[mockLocation]}
        industries={[mockIndustry]}
        rollingStock={mockRollingStock}
      />
    );

    expect(screen.getByText('Layout State')).toBeInTheDocument();
  });

  it('displays location and industry information', () => {
    render(
      <CurrentLayoutState
        layoutState={mockLayoutState}
        locations={[mockLocation]}
        industries={[mockIndustry]}
        rollingStock={mockRollingStock}
      />
    );

    expect(screen.getByText('Test Station')).toBeInTheDocument();
    expect(screen.getByText('Test Industry')).toBeInTheDocument();
    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.getByText('0/5 cars')).toBeInTheDocument();
  });

  it('displays car information when cars are placed', () => {
    const industryWithCar: Industry = {
      ...mockIndustry,
      tracks: [{
        ...mockTrack,
        placedCars: [mockRollingStock['car1']._id.$oid]
      }]
    };

    render(
      <CurrentLayoutState
        layoutState={mockLayoutState}
        locations={[mockLocation]}
        industries={[industryWithCar]}
        rollingStock={mockRollingStock}
      />
    );

    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.getByText('1/5 cars')).toBeInTheDocument();
    expect(screen.getByText('BNSF 1234 - Box Car')).toBeInTheDocument();
  });

  it('should display empty state when no cars are placed', () => {
    render(
      <CurrentLayoutState
        layoutState={mockLayoutState}
        locations={[mockLocation]}
        industries={[mockIndustry]}
        rollingStock={mockRollingStock}
      />
    );

    expect(screen.getByText('Test Station')).toBeInTheDocument();
    expect(screen.getByText('Test Industry')).toBeInTheDocument();
    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.getByText('0/5 cars')).toBeInTheDocument();
  });

  it('should display cars at their locations and industries', () => {
    const industryWithCar: Industry = {
      ...mockIndustry,
      tracks: [{
        ...mockTrack,
        placedCars: [mockRollingStock['car1']._id.$oid]
      }]
    };

    render(
      <CurrentLayoutState
        layoutState={mockLayoutState}
        locations={[mockLocation]}
        industries={[industryWithCar]}
        rollingStock={mockRollingStock}
      />
    );

    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.getByText('1/5 cars')).toBeInTheDocument();
    expect(screen.getByText('BNSF 1234 - Box Car')).toBeInTheDocument();
  });

  it('should handle multiple tracks in an industry', () => {
    const multiTrackIndustry: Industry = {
      ...mockIndustry,
      tracks: [
        {
          ...mockTrack,
          _id: { $oid: 'test-track-1' },
          name: 'Track 1',
          maxCars: { $numberInt: '3' },
          placedCars: [mockRollingStock['car1']._id.$oid]
        },
        {
          ...mockTrack,
          _id: { $oid: 'test-track-2' },
          name: 'Track 2',
          maxCars: { $numberInt: '2' },
          placedCars: []
        }
      ]
    };
    
    render(
      <CurrentLayoutState 
        layoutState={new LayoutState()} 
        locations={[mockLocation]}
        industries={[multiTrackIndustry]}
        rollingStock={mockRollingStock}
      />
    );
    
    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.getByText('1/3 cars')).toBeInTheDocument();
    expect(screen.getByText('Track 2')).toBeInTheDocument();
    expect(screen.getByText('0/2 cars')).toBeInTheDocument();
    expect(screen.getByText(`${mockRollingStock['car1'].roadName} ${mockRollingStock['car1'].roadNumber} - ${mockRollingStock['car1'].description}`)).toBeInTheDocument();
  });

  it('should handle tracks with undefined or null data', () => {
    const industryWithInvalidTrack: Industry = {
      ...mockIndustry,
      tracks: [
        {
          ...mockTrack,
          _id: { $oid: 'test-track-1' },
          name: 'Track 1',
          maxCars: undefined as unknown as { $numberInt: string },
          placedCars: []
        },
        {
          ...mockTrack,
          _id: { $oid: 'test-track-2' },
          name: 'Track 2',
          maxCars: null as unknown as { $numberInt: string },
          placedCars: []
        }
      ]
    };
    
    render(
      <CurrentLayoutState 
        layoutState={new LayoutState()} 
        locations={[mockLocation]}
        industries={[industryWithInvalidTrack]}
        rollingStock={mockRollingStock}
      />
    );
    
    const track1 = screen.getByText('Track 1');
    const track2 = screen.getByText('Track 2');
    
    expect(track1).toBeInTheDocument();
    expect(track2).toBeInTheDocument();
    
    // Find the car count text within each track's container
    const track1Container = track1.closest('.MuiBox-root');
    const track2Container = track2.closest('.MuiBox-root');
    
    expect(track1Container).not.toBeNull();
    expect(track2Container).not.toBeNull();
    
    expect(track1Container?.querySelector('p')?.textContent).toBe('0/0 cars');
    expect(track2Container?.querySelector('p')?.textContent).toBe('0/0 cars');
  });

  it('should handle tracks with invalid maxCars format', () => {
    const industryWithInvalidMaxCars: Industry = {
      ...mockIndustry,
      tracks: [{
        ...mockTrack,
        _id: { $oid: 'test-track-1' },
        name: 'Track 1',
        maxCars: { $numberInt: 'invalid' },
        placedCars: []
      }]
    };
    
    render(
      <CurrentLayoutState 
        layoutState={new LayoutState()} 
        locations={[mockLocation]}
        industries={[industryWithInvalidMaxCars]}
        rollingStock={mockRollingStock}
      />
    );
    
    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.getByText('0/0 cars')).toBeInTheDocument();
  });

  it('should display correct maxCars for tracks with different capacities', () => {
    const industryWithVariousCapacities: Industry = {
      ...mockIndustry,
      tracks: [
        {
          ...mockTrack,
          _id: { $oid: 'test-track-1' },
          name: 'Small Track',
          maxCars: { $numberInt: '2' },
          placedCars: []
        },
        {
          ...mockTrack,
          _id: { $oid: 'test-track-2' },
          name: 'Medium Track',
          maxCars: { $numberInt: '5' },
          placedCars: []
        },
        {
          ...mockTrack,
          _id: { $oid: 'test-track-3' },
          name: 'Large Track',
          maxCars: { $numberInt: '10' },
          placedCars: []
        }
      ]
    };
    
    render(
      <CurrentLayoutState 
        layoutState={new LayoutState()} 
        locations={[mockLocation]}
        industries={[industryWithVariousCapacities]}
        rollingStock={mockRollingStock}
      />
    );
    
    expect(screen.getByText('Small Track')).toBeInTheDocument();
    expect(screen.getByText('0/2 cars')).toBeInTheDocument();
    expect(screen.getByText('Medium Track')).toBeInTheDocument();
    expect(screen.getByText('0/5 cars')).toBeInTheDocument();
    expect(screen.getByText('Large Track')).toBeInTheDocument();
    expect(screen.getByText('0/10 cars')).toBeInTheDocument();
  });

  it('should display correct maxCars for industry fetched from MongoDB', () => {
    const mongoIndustry: Industry = {
      _id: { $oid: 'mongo-industry-1' },
      name: 'Weyerhaeuser',
      industryType: 'FREIGHT',
      locationId: { $oid: 'loc1' },
      ownerId: { $oid: 'owner1' },
      tracks: [
        {
          ...mockTrack,
          _id: { $oid: '67d9f9e6da5d86ace37386c3' },
          name: 'shipping',
          maxCars: { $numberInt: '3' },
          placedCars: []
        },
        {
          ...mockTrack,
          _id: { $oid: '67d9f9e6da5d86ace37386c4' },
          name: 'receiving',
          maxCars: { $numberInt: '5' },
          placedCars: []
        }
      ]
    };

    render(
      <CurrentLayoutState 
        layoutState={new LayoutState()} 
        locations={[mockLocation]}
        industries={[mongoIndustry]}
        rollingStock={mockRollingStock}
      />
    );
    
    expect(screen.getByText('shipping')).toBeInTheDocument();
    expect(screen.getByText('0/3 cars')).toBeInTheDocument();
    expect(screen.getByText('receiving')).toBeInTheDocument();
    expect(screen.getByText('0/5 cars')).toBeInTheDocument();
    expect(screen.getByText('Weyerhaeuser')).toBeInTheDocument();
    expect(screen.getByText('FREIGHT')).toBeInTheDocument();
  });
}); 