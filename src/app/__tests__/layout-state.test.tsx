import { render, screen } from '@testing-library/react';
import LayoutStatePage from '../layout-state/page';
import { services } from '../shared/services/clientServices';

jest.mock('../shared/services/clientServices', () => ({
  services: {
    locationService: {
      getAllLocations: jest.fn().mockResolvedValue([])
    },
    industryService: {
      getAllIndustries: jest.fn().mockResolvedValue([])
    },
    trainRouteService: {
      getAllTrainRoutes: jest.fn().mockResolvedValue([])
    },
    rollingStockService: {
      getAllRollingStock: jest.fn().mockResolvedValue([])
    }
  }
}));

describe('LayoutStatePage', () => {
  it('renders the LayoutState component with services', () => {
    render(<LayoutStatePage />);
    expect(screen.getByText('Layout State')).toBeInTheDocument();
  });
}); 