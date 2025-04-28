import { render, screen, waitFor } from '@testing-library/react';
import LayoutState from '../LayoutState';
import { services } from '../../shared/services/clientServices';

jest.mock('../../shared/services/clientServices', () => ({
  services: {
    locationService: {
      getAllLocations: jest.fn().mockResolvedValue([])
    },
    industryService: {
      getAllIndustries: jest.fn().mockResolvedValue([])
    },
    rollingStockService: {
      getAllRollingStock: jest.fn().mockResolvedValue([])
    }
  }
}));

describe('LayoutState', () => {
  it('renders the LayoutState component with services', async () => {
    render(<LayoutState />);
    await waitFor(() => {
      expect(screen.getByText('Layout State')).toBeInTheDocument();
    });
  });
}); 