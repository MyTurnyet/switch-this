import { render, screen } from '@testing-library/react';
import LayoutStatePage from './page';
import { LayoutState } from '../../state/layout-state';
import { Location, RollingStock } from '../shared/types/models';

describe('LayoutStatePage', () => {
  const mockLocation: Location = {
    _id: { $oid: 'test-location-1' },
    stationName: 'Test Station',
    block: 'TEST',
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
    render(<LayoutStatePage layoutState={layoutState} locations={[mockLocation]} />);
    
    expect(screen.getByText('Layout State')).toBeInTheDocument();
    expect(screen.getByText('Test Station')).toBeInTheDocument();
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('should display cars at their locations', () => {
    const layoutState = new LayoutState();
    layoutState.setCarPosition(mockCar._id.$oid, mockLocation._id.$oid);
    
    render(<LayoutStatePage layoutState={layoutState} locations={[mockLocation]} />);
    
    expect(screen.getByText('Test Station')).toBeInTheDocument();
    expect(screen.getByText(mockCar._id.$oid)).toBeInTheDocument();
  });

  it('should group locations by block', () => {
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

    const layoutState = new LayoutState();
    render(
      <LayoutStatePage 
        layoutState={layoutState} 
        locations={[mockLocation, location2, location3]} 
      />
    );

    expect(screen.getByText('TEST Block')).toBeInTheDocument();
    expect(screen.getByText('OTHER Block')).toBeInTheDocument();
  });
}); 