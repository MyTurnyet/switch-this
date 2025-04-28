import { render, screen } from '@testing-library/react';
import RollingStockList from '../RollingStockList';
import { RollingStock } from '@/app/shared/types/models';

describe('RollingStockList', () => {
  const mockRollingStock: RollingStock[] = [
    {
      _id: '1',
      name: 'Boxcar 1234',
      type: 'Boxcar',
      description: '40ft Standard Boxcar',
      currentLocationId: 'Location 1'
    },
    {
      _id: '2',
      name: 'Tank Car 5678',
      type: 'Tank Car',
      currentLocationId: 'Location 2'
    }
  ];

  it('renders rolling stock items correctly', () => {
    render(<RollingStockList rollingStock={mockRollingStock} />);
    
    // Check for car names
    expect(screen.getByText('Boxcar 1234')).toBeInTheDocument();
    expect(screen.getByText('Tank Car 5678')).toBeInTheDocument();
    
    // Check for car types
    expect(screen.getByText('Boxcar')).toBeInTheDocument();
    expect(screen.getByText('Tank Car')).toBeInTheDocument();
    
    // Check for descriptions when present
    expect(screen.getByText('40ft Standard Boxcar')).toBeInTheDocument();
    
    // Check for locations
    expect(screen.getByText('Location 1')).toBeInTheDocument();
    expect(screen.getByText('Location 2')).toBeInTheDocument();
  });

  it('renders empty state when no rolling stock is provided', () => {
    render(<RollingStockList rollingStock={[]} />);
    const cards = screen.queryAllByRole('article');
    expect(cards).toHaveLength(0);
  });
}); 