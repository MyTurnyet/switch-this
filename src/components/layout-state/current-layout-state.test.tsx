import { render, screen } from '@testing-library/react';
import CurrentLayoutState from './current-layout-state';
import { LayoutState } from '../../state/layout-state';
import { Location, Industry, RollingStock } from '../../app/shared/types/models';

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

  const mockIndustry: Industry = {
    _id: { $oid: 'ind1' },
    name: 'Test Industry',
    industryType: 'Manufacturing',
    locationId: { $oid: 'loc1' },
    ownerId: { $oid: 'owner1' },
    tracks: [{
      _id: { $oid: 'track1' },
      name: 'Track 1',
      maxCars: { $numberInt: '5' },
      placedCars: []
    }]
  };

  const mockRollingStock: Record<string, RollingStock> = {
    'car1': {
      _id: { $oid: 'car1' },
      roadName: 'BNSF',
      roadNumber: 1234,
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
    expect(screen.getByText('Track 1 (0/5 cars)')).toBeInTheDocument();
  });

  it('displays car information when cars are placed', () => {
    const industryWithCar = {
      ...mockIndustry,
      tracks: [{
        ...mockIndustry.tracks[0],
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

    expect(screen.getByText('Track 1 (1/5 cars)')).toBeInTheDocument();
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
    expect(screen.getByText('Track 1 (0/5 cars)')).toBeInTheDocument();
  });

  it('should display cars at their locations and industries', () => {
    const industryWithCar = {
      ...mockIndustry,
      tracks: [{
        ...mockIndustry.tracks[0],
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

    expect(screen.getByText('Track 1 (1/5 cars)')).toBeInTheDocument();
    expect(screen.getByText('BNSF 1234 - Box Car')).toBeInTheDocument();
  });

  it('should group locations and industries by block', () => {
    const location2: Location = {
      _id: { $oid: 'test-location-2' },
      stationName: 'Another Station',
      block: 'TEST',
      ownerId: { $oid: 'test-owner' }
    };

    const location3: Location = {
      _id: { $oid: 'test-location-3' },
      stationName: 'Different Block Station',
      block: 'OTHER',
      ownerId: { $oid: 'test-owner' }
    };

    const industry2: Industry = {
      ...mockIndustry,
      _id: { $oid: 'test-industry-2' },
      name: 'Another Industry',
      locationId: location2._id
    };

    const industry3: Industry = {
      ...mockIndustry,
      _id: { $oid: 'test-industry-3' },
      name: 'Different Industry',
      locationId: location3._id
    };

    const layoutState = new LayoutState();
    render(
      <CurrentLayoutState 
        layoutState={layoutState} 
        locations={[mockLocation, location2, location3]}
        industries={[mockIndustry, industry2, industry3]} 
      />
    );

    expect(screen.getByText('TEST Block')).toBeInTheDocument();
    expect(screen.getByText('OTHER Block')).toBeInTheDocument();
    expect(screen.getByText('Test Industry')).toBeInTheDocument();
    expect(screen.getByText('Another Industry')).toBeInTheDocument();
    expect(screen.getByText('Different Industry')).toBeInTheDocument();
  });

  it('should handle empty locations and industries arrays', () => {
    const layoutState = new LayoutState();
    render(
      <CurrentLayoutState 
        layoutState={layoutState} 
        locations={[]}
        industries={[]} 
      />
    );
    
    expect(screen.getByText('Layout State')).toBeInTheDocument();
    expect(screen.queryByText('TEST Block')).not.toBeInTheDocument();
  });

  it('should display error state when rolling stock data is missing', () => {
    const layoutState = new LayoutState();
    const industryWithCar = {
      ...mockIndustry,
      tracks: [{
        ...mockIndustry.tracks[0],
        placedCars: ['missing-car-id']
      }]
    };
    
    render(
      <CurrentLayoutState 
        layoutState={layoutState} 
        locations={[mockLocation]}
        industries={[industryWithCar]}
        rollingStock={{}}
      />
    );
    
    expect(screen.getByText('missing-car-id')).toBeInTheDocument();
  });

  it('should handle multiple tracks in an industry', () => {
    const multiTrackIndustry: Industry = {
      ...mockIndustry,
      tracks: [
        {
          _id: { $oid: 'test-track-1' },
          name: 'Track 1',
          maxCars: { $numberInt: '3' },
          placedCars: [mockRollingStock['car1']._id.$oid]
        },
        {
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
    
    expect(screen.getByText('Track 1 (1/3 cars)')).toBeInTheDocument();
    expect(screen.getByText('Track 2 (0/2 cars)')).toBeInTheDocument();
    expect(screen.getByText(`${mockRollingStock['car1'].roadName} ${mockRollingStock['car1'].roadNumber} - ${mockRollingStock['car1'].description}`)).toBeInTheDocument();
  });

  it('should display industry type chip', () => {
    render(
      <CurrentLayoutState 
        layoutState={new LayoutState()} 
        locations={[mockLocation]}
        industries={[mockIndustry]} 
      />
    );
    
    expect(screen.getByText('Manufacturing')).toBeInTheDocument();
  });

  it('should handle locations without industries', () => {
    const locationWithoutIndustries: Location = {
      _id: { $oid: 'test-location-2' },
      stationName: 'Empty Station',
      block: 'TEST',
      ownerId: { $oid: 'test-owner' }
    };

    render(
      <CurrentLayoutState 
        layoutState={new LayoutState()} 
        locations={[locationWithoutIndustries]}
        industries={[]} 
      />
    );
    
    expect(screen.getByText('Empty Station')).toBeInTheDocument();
    expect(screen.getByText('No industries')).toBeInTheDocument();
  });
}); 