import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../Dashboard';
import CarTypeBadge from '../CarTypeBadge';
import { Location, Industry, RollingStock } from '../../shared/types/models';

describe('Dashboard', () => {
  const mockLocations: Location[] = [
    {
      _id: { $oid: '1' },
      stationName: 'Location 1',
      block: 'NORTH',
      ownerId: { $oid: 'owner1' }
    },
    {
      _id: { $oid: '2' },
      stationName: 'Location 2',
      block: 'SOUTH',
      ownerId: { $oid: 'owner1' }
    },
    {
      _id: { $oid: '3' },
      stationName: 'Location 3',
      block: 'NORTH',
      ownerId: { $oid: 'owner1' }
    }
  ];

  const mockIndustries: Industry[] = [
    {
      _id: { $oid: '1' },
      name: 'Industry 1',
      industryType: 'FREIGHT',
      tracks: [
        {
          _id: { $oid: 'track1' },
          name: 'Track 1',
          maxCars: { $numberInt: '5' },
          placedCars: []
        }
      ],
      locationId: { $oid: '1' },
      ownerId: { $oid: 'owner1' }
    },
    {
      _id: { $oid: '2' },
      name: 'Industry 2',
      industryType: 'YARD',
      tracks: [
        {
          _id: { $oid: 'track2' },
          name: 'Track 2',
          maxCars: { $numberInt: '10' },
          placedCars: []
        }
      ],
      locationId: { $oid: '2' },
      ownerId: { $oid: 'owner1' }
    }
  ];

  const mockRollingStock: RollingStock[] = [
    {
      _id: { $oid: '1' },
      roadName: 'GSVR',
      roadNumber: 459003,
      aarType: 'FB',
      description: 'Flatcar BlhHd',
      color: 'RED',
      note: '',
      homeYard: { $oid: 'yard1' },
      ownerId: { $oid: 'owner1' }
    },
    {
      _id: { $oid: '2' },
      roadName: 'CP',
      roadNumber: 317642,
      aarType: 'FB',
      description: 'Flatcar BlhHd',
      color: 'RED',
      note: '',
      homeYard: { $oid: 'yard2' },
      ownerId: { $oid: 'owner1' }
    },
    {
      _id: { $oid: '3' },
      roadName: 'BNSF',
      roadNumber: 559519,
      aarType: 'FBC',
      description: 'Flatcar',
      color: 'BROWN',
      note: 'Center Beam',
      homeYard: { $oid: 'yard3' },
      ownerId: { $oid: 'owner1' }
    }
  ];

  it('renders the dashboard title', () => {
    render(<Dashboard locations={mockLocations} industries={mockIndustries} rollingStock={mockRollingStock} />);
    expect(screen.getByText('System Overview')).toBeInTheDocument();
  });

  it('displays correct total number of locations', () => {
    render(<Dashboard locations={mockLocations} industries={mockIndustries} rollingStock={mockRollingStock} />);
    expect(screen.getByText('Total Locations: 3')).toBeInTheDocument();
  });

  it('displays correct total number of industries', () => {
    render(<Dashboard locations={mockLocations} industries={mockIndustries} rollingStock={mockRollingStock} />);
    expect(screen.getByText('Total Industries: 2')).toBeInTheDocument();
  });

  it('displays correct total track capacity', () => {
    render(<Dashboard locations={mockLocations} industries={mockIndustries} rollingStock={mockRollingStock} />);
    expect(screen.getByText('Total Track Capacity: 15 cars')).toBeInTheDocument();
  });

  it('displays correct locations by block', () => {
    render(<Dashboard locations={mockLocations} industries={mockIndustries} rollingStock={mockRollingStock} />);
    expect(screen.getByText('NORTH: 2')).toBeInTheDocument();
    expect(screen.getByText('SOUTH: 1')).toBeInTheDocument();
  });

  it('displays correct industries by type', () => {
    render(<Dashboard locations={mockLocations} industries={mockIndustries} rollingStock={mockRollingStock} />);
    expect(screen.getByText('FREIGHT: 1')).toBeInTheDocument();
    expect(screen.getByText('YARD: 1')).toBeInTheDocument();
  });

  it('displays correct total number of rolling stock', () => {
    render(<Dashboard locations={mockLocations} industries={mockIndustries} rollingStock={mockRollingStock} />);
    expect(screen.getByText('Rolling Stock (3 total)')).toBeInTheDocument();
  });

  it('displays car type badges with correct counts', () => {
    render(<Dashboard locations={mockLocations} industries={mockIndustries} rollingStock={mockRollingStock} />);
    
    // Check for FB badge (2 cars)
    const fbBadge = screen.getByText('FB');
    expect(fbBadge).toBeInTheDocument();
    expect(fbBadge.parentElement).toHaveTextContent('2');
    
    // Check for FBC badge (1 car)
    const fbcBadge = screen.getByText('FBC');
    expect(fbcBadge).toBeInTheDocument();
    expect(fbcBadge.parentElement).toHaveTextContent('1');
  });

  it('displays car type badges in a flex container', () => {
    render(<Dashboard locations={mockLocations} industries={mockIndustries} rollingStock={mockRollingStock} />);
    const badgesContainer = screen.getByText('Car Types').parentElement?.querySelector('div');
    expect(badgesContainer).toHaveStyle({ display: 'flex', flexWrap: 'wrap' });
  });

  it('handles empty data gracefully', () => {
    render(<Dashboard locations={[]} industries={[]} rollingStock={[]} />);
    
    // Check for zero counts
    expect(screen.getByText('Total Locations: 0')).toBeInTheDocument();
    expect(screen.getByText('Total Industries: 0')).toBeInTheDocument();
    expect(screen.getByText('Total Track Capacity: 0 cars')).toBeInTheDocument();
    expect(screen.getByText('Rolling Stock (0 total)')).toBeInTheDocument();
    
    // Check that no car type badges are displayed
    const carTypesSection = screen.getByText('Car Types').parentElement;
    expect(carTypesSection).not.toContainElement(screen.queryByText('FB'));
    expect(carTypesSection).not.toContainElement(screen.queryByText('FBC'));
  });
}); 