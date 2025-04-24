import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../Dashboard';
import { Location, Industry, RollingStock } from '@shared/types/models';

describe('Dashboard', () => {
  const mockLocations: Location[] = [
    { 
      _id: { $oid: '000000000000000000000001' }, 
      stationName: 'Location 1', 
      block: 'NORTH', 
      ownerId: { $oid: '000000000000000000000010' }
    },
    { 
      _id: { $oid: '000000000000000000000002' }, 
      stationName: 'Location 2', 
      block: 'NORTH', 
      ownerId: { $oid: '000000000000000000000010' }
    },
    { 
      _id: { $oid: '000000000000000000000003' }, 
      stationName: 'Location 3', 
      block: 'SOUTH', 
      ownerId: { $oid: '000000000000000000000010' }
    }
  ];

  const mockIndustries: Industry[] = [
    { 
      _id: { $oid: '000000000000000000000004' },
      name: 'Industry 1', 
      industryType: 'FREIGHT',
      locationId: { $oid: '000000000000000000000002' },
      ownerId: { $oid: '000000000000000000000010' },
      tracks: [
        { _id: { $oid: '000000000000000000000005' }, maxCars: { $numberInt: '2' }, name: 'Track 1', placedCars: [] },
        { _id: { $oid: '000000000000000000000006' }, maxCars: { $numberInt: '3' }, name: 'Track 2', placedCars: [] }
      ]
    },
    { 
      _id: { $oid: '000000000000000000000007' },
      name: 'Industry 2', 
      industryType: 'YARD',
      locationId: { $oid: '000000000000000000000003' },
      ownerId: { $oid: '000000000000000000000010' },
      tracks: [
        { _id: { $oid: '000000000000000000000008' }, maxCars: { $numberInt: '4' }, name: 'Track 1', placedCars: [] }
      ]
    }
  ];

  const mockRollingStock: RollingStock[] = [
    { 
      _id: { $oid: '000000000000000000000009' },
      roadName: 'UP', 
      roadNumber: '1234', 
      aarType: 'BOX', 
      description: 'Box Car', 
      color: 'Red', 
      note: '', 
      homeYard: { $oid: '000000000000000000000001' },
      ownerId: { $oid: '000000000000000000000010' }
    },
    { 
      _id: { $oid: '000000000000000000000011' },
      roadName: 'BNSF', 
      roadNumber: '5678', 
      aarType: 'TANK', 
      description: 'Tank Car', 
      color: 'Black', 
      note: '', 
      homeYard: { $oid: '000000000000000000000002' },
      ownerId: { $oid: '000000000000000000000010' }
    }
  ];

  it('renders layout statistics correctly', () => {
    render(<Dashboard locations={mockLocations} industries={mockIndustries} rollingStock={mockRollingStock} />);
    
    expect(screen.getByText('Layout Statistics')).toBeInTheDocument();
    
    const totalLocationsSection = screen.getByText('Total Locations').parentElement;
    expect(within(totalLocationsSection!).getByText('3')).toBeInTheDocument();
    
    const totalIndustriesSection = screen.getByText('Total Industries').parentElement;
    expect(within(totalIndustriesSection!).getByText('2')).toBeInTheDocument();
    
    const totalTrackCapacitySection = screen.getByText('Total Track Capacity').parentElement;
    expect(within(totalTrackCapacitySection!).getByText('9 cars')).toBeInTheDocument();
  });

  it('displays location statistics correctly', () => {
    render(<Dashboard locations={mockLocations} industries={mockIndustries} rollingStock={mockRollingStock} />);
    
    const locationStats = screen.getByText('Location Statistics').parentElement;
    expect(locationStats).toBeInTheDocument();
    expect(screen.getByText('NORTH: 2')).toBeInTheDocument();
    expect(screen.getByText('SOUTH: 1')).toBeInTheDocument();
  });

  it('displays industry statistics correctly', () => {
    render(<Dashboard locations={mockLocations} industries={mockIndustries} rollingStock={mockRollingStock} />);
    
    const industryStats = screen.getByText('Industry Statistics').parentElement;
    expect(industryStats).toBeInTheDocument();
    expect(screen.getByText('FREIGHT: 1')).toBeInTheDocument();
    expect(screen.getByText('YARD: 1')).toBeInTheDocument();
  });

  it('displays rolling stock statistics correctly', () => {
    render(<Dashboard locations={mockLocations} industries={mockIndustries} rollingStock={mockRollingStock} />);
    
    expect(screen.getByText('Rolling Stock (2 total)')).toBeInTheDocument();
    expect(screen.getByText('Car Types')).toBeInTheDocument();
    
    const boxBadge = screen.getByText('BOX');
    expect(boxBadge).toBeInTheDocument();
    expect(boxBadge.closest('[aria-label="Box Car"]')).toBeInTheDocument();
    
    const tankBadge = screen.getByText('TANK');
    expect(tankBadge).toBeInTheDocument();
    expect(tankBadge.closest('[aria-label="Tank Car"]')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<Dashboard locations={[]} industries={[]} rollingStock={[]} />);
    
    const totalLocationsSection = screen.getByText('Total Locations').parentElement;
    expect(within(totalLocationsSection!).getByText('0')).toBeInTheDocument();
    
    const totalTrackCapacitySection = screen.getByText('Total Track Capacity').parentElement;
    expect(within(totalTrackCapacitySection!).getByText('0 cars')).toBeInTheDocument();
    
    const rollingStockSection = screen.getByText('Rolling Stock (0 total)');
    expect(rollingStockSection).toBeInTheDocument();
    
    const carTypesSection = screen.getByText('Car Types');
    expect(carTypesSection).toBeInTheDocument();
    expect(carTypesSection.parentElement?.querySelector('.MuiBox-root')?.children.length).toBe(0);
  });
}); 