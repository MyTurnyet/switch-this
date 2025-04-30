import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LayoutState from '../LayoutState';
import { services } from '../../shared/services/clientServices';
import { act } from 'react-dom/test-utils';

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
    },
    trainRouteService: {
      getAllTrainRoutes: jest.fn().mockResolvedValue([])
    },
    layoutStateService: {
      getLayoutState: jest.fn().mockResolvedValue(null),
      saveLayoutState: jest.fn().mockImplementation(state => Promise.resolve({ ...state, _id: 'test-id' }))
    }
  }
}));

// Mock the ScrollArea component
jest.mock('@/app/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div data-testid="scroll-area">{children}</div>,
}));

describe('LayoutState', () => {
  it('renders the LayoutState component with services', async () => {
    await act(async () => {
      render(<LayoutState services={services} />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Layout State')).toBeInTheDocument();
    });
  });
}); 