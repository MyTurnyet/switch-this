import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock the useServices function before importing the hook
jest.mock('../useQueries', () => {
  const originalModule = jest.requireActual('../useQueries');
  return {
    ...originalModule,
    useServices: jest.fn().mockReturnValue({
      locationService: {
        getAll: jest.fn(),
        getAllLocations: jest.fn(),
        getById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    }),
  };
});

// Import the hooks after the mock is set up
import { useLocationQueries } from '../useLocationQueries';
import { useServices } from '../useQueries';

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  
  Wrapper.displayName = 'QueryClientWrapper';
  
  return Wrapper;
};

describe('useLocationQueries', () => {
  const mockLocations = [
    { _id: '1', stationName: 'Station 1', block: 'A', locationType: 'ON_LAYOUT', ownerId: '1' },
    { _id: '2', stationName: 'Station 2', block: 'B', locationType: 'ON_LAYOUT', ownerId: '1' },
  ];
  
  const mockLocation = { _id: '1', stationName: 'Station 1', block: 'A', locationType: 'ON_LAYOUT', ownerId: '1' };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useLocations', () => {
    it('fetches locations successfully', async () => {
      // Mock implementation
      const mockedUseServices = useServices as jest.Mock;
      mockedUseServices.mockReturnValue({
        locationService: {
          getAll: jest.fn().mockResolvedValue(mockLocations),
          getAllLocations: jest.fn(),
          getById: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      });

      // Render the hook
      const { result } = renderHook(() => useLocationQueries().useLocations(), {
        wrapper: createWrapper(),
      });

      // Initially should be loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      // Wait for the query to complete
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Verify data is loaded
      expect(result.current.data).toEqual(mockLocations);
      expect(result.current.error).toBeNull();
    });

    it('handles error when fetching locations fails', async () => {
      // Mock implementation with error
      const mockedUseServices = useServices as jest.Mock;
      mockedUseServices.mockReturnValue({
        locationService: {
          getAll: jest.fn().mockRejectedValue(new Error('Failed to fetch locations')),
          getAllLocations: jest.fn(),
          getById: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      });

      // Render the hook
      const { result } = renderHook(() => useLocationQueries().useLocations(), {
        wrapper: createWrapper(),
      });

      // Wait for the query to complete
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Verify error is captured
      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useLocation', () => {
    it('fetches location by id successfully', async () => {
      // Mock implementation
      const mockedUseServices = useServices as jest.Mock;
      mockedUseServices.mockReturnValue({
        locationService: {
          getAll: jest.fn().mockResolvedValue([mockLocation]),
          getAllLocations: jest.fn(),
          getById: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      });

      // Render the hook
      const { result } = renderHook(() => useLocationQueries().useLocation('1'), {
        wrapper: createWrapper(),
      });

      // Initially should be loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      // Wait for the query to complete
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Verify data is loaded
      expect(result.current.data).toEqual(mockLocation);
      expect(result.current.error).toBeNull();
    });

    it('handles error when fetching location by id fails', async () => {
      // Mock implementation with error
      const mockedUseServices = useServices as jest.Mock;
      mockedUseServices.mockReturnValue({
        locationService: {
          getAll: jest.fn(),
          getAllLocations: jest.fn(),
          getById: jest.fn().mockRejectedValue(new Error('Failed to fetch location')),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      });

      // Render the hook
      const { result } = renderHook(() => useLocationQueries().useLocation('1'), {
        wrapper: createWrapper(),
      });

      // Wait for the query to complete
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Verify error is captured
      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeUndefined();
    });
  });
}); 