import { render, screen } from '@testing-library/react';
import RollingStockList from '../RollingStockList';
import { RollingStock, Industry } from '@/app/shared/types/models';

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
      ownerId: 'owner1'
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
      ownerId: 'owner1'
    }
  ];

  const mockIndustries: Industry[] = [
    {
      _id: 'yard1',
      name: 'BNSF Yard',
      locationId: 'loc1',
      blockName: 'Yard',
      description: 'Main yard',
      industryType: 'YARD',
      tracks: [],
      ownerId: 'owner1'
    },
    {
      _id: 'yard2',
      name: 'UP Yard',
      locationId: 'loc2',
      blockName: 'Yard',
      description: 'Secondary yard',
      industryType: 'YARD',
      tracks: [],
      ownerId: 'owner1'
    },
    {
      _id: 'industry1',
      name: 'Factory',
      locationId: 'loc3',
      blockName: 'Industrial',
      description: 'Manufacturing plant',
      industryType: 'FREIGHT',
      tracks: [],
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
    expect(screen.getByText('BNSF Yard')).toBeInTheDocument();
    expect(screen.getByText('UP Yard')).toBeInTheDocument();
  });

  it('renders empty state when no rolling stock is provided', () => {
    render(<RollingStockList rollingStock={[]} industries={[]} />);
    const cards = screen.queryAllByRole('article');
    expect(cards).toHaveLength(0);
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

  it('shows unknown yard when industry exists but is not a yard', () => {
    const rollingStockWithNonYard: RollingStock[] = [{
      _id: '1',
      roadName: 'BNSF',
      roadNumber: '1234',
      aarType: 'XM',
      description: '40ft Standard Boxcar',
      color: 'RED',
      note: '',
      homeYard: 'industry1',
      ownerId: 'owner1'
    }];
    
    render(<RollingStockList rollingStock={rollingStockWithNonYard} industries={mockIndustries} />);
    expect(screen.getByText('Unknown Yard')).toBeInTheDocument();
  });
}); 