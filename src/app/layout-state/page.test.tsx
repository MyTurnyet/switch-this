import { render, screen } from '@testing-library/react';
import LayoutStatePage from '../layout-state/page';
import { LayoutState } from '../../state/layout-state';
import { Location, RollingStock, Industry } from '../../app/shared/types/models';

describe('LayoutStatePage', () => {
  const mockLocation: Location = {
    _id: { $oid: 'test-location-1' },
    stationName: 'Test Station',
    block: 'TEST',
    ownerId: { $oid: 'test-owner' }
  };

  const mockIndustry: Industry = {
    _id: { $oid: 'test-industry-1' },
    name: 'Test Industry',
    industryType: 'Manufacturing',
    tracks: [
      {
        _id: { $oid: 'test-track-1' },
        name: 'Track 1',
        maxCars: { $numberInt: '3' },
        placedCars: []
      }
    ],
    locationId: { $oid: 'test-location-1' },
    ownerId: { $oid: 'test-owner' }
  };

  const mockCar: RollingStock = {
    _id: { $oid: 'test-car-1' },
    roadName: 'TEST',
    roadNumber: 123,
    aarType: 'FB',
    description: 'Test Car',
    color: 'RED',
    note: '',
    homeYard: { $oid: 'test-yard' },
    ownerId: { $oid: 'test-owner' }
  };

  it('should display empty state when no cars are placed', () => {
    const layoutState = new LayoutState();
    render(
      <LayoutStatePage 
        layoutState={layoutState} 
        locations={[mockLocation]}
        industries={[mockIndustry]} 
      />
    );
    
    expect(screen.getByText('Layout State')).toBeInTheDocument();
    expect(screen.getByText('Test Station')).toBeInTheDocument();
    expect(screen.getByText('Test Industry')).toBeInTheDocument();
    expect(screen.getByText('Track 1 (0/3 cars)')).toBeInTheDocument();
  });

  it('should display cars at their locations and industries', () => {
    const layoutState = new LayoutState();
    const industryWithCar = {
      ...mockIndustry,
      tracks: [{
        ...mockIndustry.tracks[0],
        placedCars: [mockCar._id.$oid]
      }]
    };
    
    render(
      <LayoutStatePage 
        layoutState={layoutState} 
        locations={[mockLocation]}
        industries={[industryWithCar]}
        rollingStock={{ [mockCar._id.$oid]: mockCar }}
      />
    );
    
    expect(screen.getByText('Test Station')).toBeInTheDocument();
    expect(screen.getByText('Test Industry')).toBeInTheDocument();
    expect(screen.getByText('Track 1 (1/3 cars)')).toBeInTheDocument();
    expect(screen.getByText(`${mockCar.roadName} ${mockCar.roadNumber} - ${mockCar.description}`)).toBeInTheDocument();
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
      <LayoutStatePage 
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
      <LayoutStatePage 
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
      <LayoutStatePage 
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
          placedCars: [mockCar._id.$oid]
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
      <LayoutStatePage 
        layoutState={new LayoutState()} 
        locations={[mockLocation]}
        industries={[multiTrackIndustry]}
        rollingStock={{ [mockCar._id.$oid]: mockCar }}
      />
    );
    
    expect(screen.getByText('Track 1 (1/3 cars)')).toBeInTheDocument();
    expect(screen.getByText('Track 2 (0/2 cars)')).toBeInTheDocument();
    expect(screen.getByText(`${mockCar.roadName} ${mockCar.roadNumber} - ${mockCar.description}`)).toBeInTheDocument();
  });

  it('should display industry type chip', () => {
    render(
      <LayoutStatePage 
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
      <LayoutStatePage 
        layoutState={new LayoutState()} 
        locations={[locationWithoutIndustries]}
        industries={[]} 
      />
    );
    
    expect(screen.getByText('Empty Station')).toBeInTheDocument();
    expect(screen.getByText('No industries')).toBeInTheDocument();
  });
}); 