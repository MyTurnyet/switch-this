import { render, screen } from '@testing-library/react';
import LayoutState from '../layout-state/LayoutState';
import { useLayout } from '@/app/shared/contexts/LayoutContext';

jest.mock('@/app/shared/contexts/LayoutContext', () => ({
  useLayout: jest.fn()
}));

describe('LayoutStatePage', () => {
  const mockRefreshData = jest.fn();

  beforeEach(() => {
    (useLayout as jest.Mock).mockReturnValue({
      locations: [],
      industries: [],
      rollingStock: [],
      error: '',
      isLoading: false,
      refreshData: mockRefreshData
    });
  });

  it('renders the layout state page with initial empty state', () => {
    render(<LayoutState />);

    expect(screen.getByText('Layout State')).toBeInTheDocument();
    expect(screen.getByText('Industries by Location')).toBeInTheDocument();
    expect(screen.getByText('Rolling Stock')).toBeInTheDocument();
  });

  it('displays state data when provided', () => {
    const mockData = {
      locations: [
        { _id: 'loc1', stationName: 'Test Location', block: 'Block 1', ownerId: 'owner1' }
      ],
      industries: [
        { 
          _id: 'ind1', 
          name: 'Test Industry', 
          locationId: 'loc1',
          industryType: 'FREIGHT',
          tracks: [],
          ownerId: 'owner1'
        }
      ],
      rollingStock: [
        {
          _id: 'car1',
          roadName: 'TEST',
          roadNumber: '1234',
          aarType: 'XM',
          description: 'Test Car',
          color: 'RED',
          note: '',
          homeYard: 'yard1',
          ownerId: 'owner1'
        }
      ],
      error: '',
      isLoading: false,
      refreshData: mockRefreshData
    };

    (useLayout as jest.Mock).mockReturnValue(mockData);

    render(<LayoutState />);

    expect(screen.getByText('Layout State')).toBeInTheDocument();
    expect(screen.getByText('Industries by Location')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('Test Industry')).toBeInTheDocument();
    expect(screen.getByText('Rolling Stock')).toBeInTheDocument();
    expect(screen.getByText(/"roadName":\s*"TEST"/)).toBeInTheDocument();
  });
}); 