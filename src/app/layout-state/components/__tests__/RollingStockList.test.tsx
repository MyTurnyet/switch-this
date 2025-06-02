import { render, screen } from '@testing-library/react';
import RollingStockList from '../RollingStockList';
import { RollingStock, Industry } from '@/app/shared/types/models';
import { IndustryType } from '@/app/shared/types/models';

describe('RollingStockList', () => {
  const mockRollingStock: RollingStock[] = [
    {
      _id: '1',
      roadName: 'BNSF',
      roadNumber: '1234',
      aarType: 'XM',
      description: '40ft Standard Boxcar',
      color: 'RED',
      note: 'Needs repair',
      homeYard: 'yard1',
      ownerId: 'owner1',
      currentLocation: {
        industryId: 'yard1',
        trackId: 'track1'
      }
    },
    {
      _id: '2',
      roadName: 'UP',
      roadNumber: '5678',
      aarType: 'GS',
      description: '50ft Gondola',
      color: 'GREEN',
      note: '',
      homeYard: 'yard2',
      ownerId: 'owner1',
      currentLocation: {
        industryId: 'industry1',
        trackId: 'track3'
      }
    }
  ];

  const mockIndustries: Industry[] = [
    {
      _id: 'yard1',
      name: 'BNSF Yard',
      locationId: 'loc1',
      blockName: 'Yard',
      description: 'Main yard',
      industryType: IndustryType.YARD,
      tracks: [
        {
          _id: 'track1',
          name: 'Track 1',
          length: 100,
          capacity: 5,
          maxCars: 5,
          placedCars: ['1'],
          acceptedCarTypes: [],
          ownerId: 'owner1',
        }
      ],
      ownerId: 'owner1'
    },
    {
      _id: 'yard2',
      name: 'UP Yard',
      locationId: 'loc2',
      blockName: 'Yard',
      description: 'Secondary yard',
      industryType: IndustryType.YARD,
      tracks: [
        {
          _id: 'track2',
          name: 'Track 2',
          length: 100,
          capacity: 5,
          maxCars: 5,
          placedCars: [],
          acceptedCarTypes: [],
          ownerId: 'owner1',
        }
      ],
      ownerId: 'owner1'
    },
    {
      _id: 'industry1',
      name: 'Factory',
      locationId: 'loc3',
      blockName: 'Industrial',
      description: 'Manufacturing plant',
      industryType: IndustryType.FREIGHT,
      tracks: [
        {
          _id: 'track3',
          name: 'Track 3',
          length: 100,
          capacity: 5,
          maxCars: 5,
          placedCars: ['2'],
          acceptedCarTypes: [],
          ownerId: 'owner1',
        }
      ],
      ownerId: 'owner1'
    }
  ];

  it('renders rolling stock items correctly', () => {
    render(<RollingStockList rollingStock={mockRollingStock} industries={mockIndustries} />);
    
    // Check for road name and number
    expect(screen.getByText('BNSF 1234')).toBeInTheDocument();
    expect(screen.getByText('UP 5678')).toBeInTheDocument();
    
    // Check for AAR types
    expect(screen.getByText('XM')).toBeInTheDocument();
    expect(screen.getByText('GS')).toBeInTheDocument();
    
    // Check for descriptions
    expect(screen.getByText('40ft Standard Boxcar')).toBeInTheDocument();
    expect(screen.getByText('50ft Gondola')).toBeInTheDocument();
    
    // Check for colors
    expect(screen.getByText('RED')).toBeInTheDocument();
    expect(screen.getByText('GREEN')).toBeInTheDocument();
    
    // Check for notes when present
    expect(screen.getByText('Needs repair')).toBeInTheDocument();
    
    // Check for home yards
    expect(screen.getAllByText('BNSF Yard')[0]).toBeInTheDocument();
    expect(screen.getAllByText('UP Yard')[0]).toBeInTheDocument();

    // Check for current locations
    expect(screen.getByText('BNSF Yard - Track 1')).toBeInTheDocument();
    expect(screen.getByText('Factory - Track 3')).toBeInTheDocument();
  });

  it('renders empty state when no rolling stock is provided', () => {
    render(<RollingStockList rollingStock={[]} industries={[]} />);
    const cards = screen.queryAllByRole('article');
    expect(cards).toHaveLength(0);
    expect(screen.getByText('No rolling stock available')).toBeInTheDocument();
  });

  it('shows unknown yard when yard is not found', () => {
    const rollingStockWithUnknownYard: RollingStock[] = [{
      _id: '1',
      roadName: 'BNSF',
      roadNumber: '1234',
      aarType: 'XM',
      description: '40ft Standard Boxcar',
      color: 'RED',
      note: '',
      homeYard: 'unknown-yard',
      ownerId: 'owner1'
    }];
    
    render(<RollingStockList rollingStock={rollingStockWithUnknownYard} industries={mockIndustries} />);
    expect(screen.getByText('Unknown Yard')).toBeInTheDocument();
  });

  it('shows not placed message when car is not on any track', () => {
    const unplacedRollingStock: RollingStock[] = [{
      _id: '3',
      roadName: 'CSX',
      roadNumber: '9012',
      aarType: 'XM',
      description: '40ft Boxcar',
      color: 'BLUE',
      note: '',
      homeYard: 'yard1',
      ownerId: 'owner1'
    }];
    
    render(<RollingStockList rollingStock={unplacedRollingStock} industries={mockIndustries} />);
    expect(screen.getByText('Not placed on any track')).toBeInTheDocument();
  });

  it('sorts rolling stock by roadName and roadNumber', () => {
    const unsortedRollingStock: RollingStock[] = [
      {
        _id: '3',
        roadName: 'CSX',
        roadNumber: '9012',
        aarType: 'XM',
        description: '40ft Boxcar',
        color: 'BLUE',
        note: '',
        homeYard: 'yard1',
        ownerId: 'owner1'
      },
      {
        _id: '4',
        roadName: 'BNSF',
        roadNumber: '5678',
        aarType: 'GS',
        description: '50ft Gondola',
        color: 'BLACK',
        note: '',
        homeYard: 'yard1',
        ownerId: 'owner1'
      },
      {
        _id: '1',
        roadName: 'BNSF',
        roadNumber: '1234',
        aarType: 'XM',
        description: '40ft Standard Boxcar',
        color: 'RED',
        note: '',
        homeYard: 'yard1',
        ownerId: 'owner1'
      }
    ];
    
    const { container } = render(<RollingStockList rollingStock={unsortedRollingStock} industries={mockIndustries} />);
    
    const stockItems = container.querySelectorAll('[data-testid="rolling-stock-item"]');
    expect(stockItems).toHaveLength(3);
    
    // Check first item is BNSF 1234 (lexicographically first)
    expect(stockItems[0]).toHaveTextContent('BNSF 1234');
    
    // Check second item is BNSF 5678
    expect(stockItems[1]).toHaveTextContent('BNSF 5678');
    
    // Check third item is CSX 9012
    expect(stockItems[2]).toHaveTextContent('CSX 9012');
  });
}); 