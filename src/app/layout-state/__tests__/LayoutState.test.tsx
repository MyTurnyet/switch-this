import { render, screen } from '@testing-library/react';
import LayoutState from '../LayoutState';
import { useLayout } from '@/app/shared/contexts/LayoutContext';

// Mock the useLayout hook
jest.mock('@/app/shared/contexts/LayoutContext', () => ({
  useLayout: jest.fn()
}));

describe('LayoutState', () => {
  const mockRefreshData = jest.fn();

  const mockData = {
    locations: [
      { _id: '1', stationName: 'Station A', block: 'Block 1' },
      { _id: '2', stationName: 'Station B', block: 'Block 2' }
    ],
    industries: [
      { _id: '1', name: 'Industry 1', locationId: '1', block: 'Block 1' },
      { _id: '2', name: 'Industry 2', locationId: '1', block: 'Block 1' },
      { _id: '3', name: 'Industry 3', locationId: '2', block: 'Block 2' }
    ],
    rollingStock: [],
    error: '',
    isLoading: false,
    refreshData: mockRefreshData
  };

  beforeEach(() => {
    (useLayout as jest.Mock).mockReturnValue(mockData);
  });

  it('displays industries grouped by location and block', () => {
    render(<LayoutState />);

    // Check for location headings
    expect(screen.getByText('Station A')).toBeInTheDocument();
    expect(screen.getByText('Station B')).toBeInTheDocument();

    // Check for block headings
    expect(screen.getByText('Block 1')).toBeInTheDocument();
    expect(screen.getByText('Block 2')).toBeInTheDocument();

    // Check for industries
    expect(screen.getByText('Industry 1')).toBeInTheDocument();
    expect(screen.getByText('Industry 2')).toBeInTheDocument();
    expect(screen.getByText('Industry 3')).toBeInTheDocument();
  });
}); 