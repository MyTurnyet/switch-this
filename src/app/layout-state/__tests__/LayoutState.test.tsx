import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LayoutState from '../LayoutState';
import { ClientServices } from '@/app/shared/services/clientServices';
import { act } from 'react-dom/test-utils';

// Mock the ScrollArea component
jest.mock('@/app/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div data-testid="scroll-area">{children}</div>,
}));

// Mock the groupIndustries utility
jest.mock('../utils/groupIndustries', () => ({
  groupIndustriesByLocationAndBlock: jest.fn().mockReturnValue({
    'loc1': {
      locationName: 'Test Location',
      blocks: {
        'block1': [
          {
            _id: 'ind1',
            name: 'Test Industry',
            industryType: 'YARD',
            tracks: [
              {
                _id: 'track1',
                name: 'Track 1',
                maxCars: 5,
                placedCars: ['car1', 'car2']
              }
            ]
          }
        ]
      }
    }
  }),
  groupIndustriesByBlockAndLocation: jest.fn().mockReturnValue({
    'block1': {
      blockName: 'block1',
      locations: {
        'loc1': {
          locationName: 'Test Location',
          industries: [
            {
              _id: 'ind1',
              name: 'Test Industry',
              industryType: 'YARD',
              tracks: [
                {
                  _id: 'track1',
                  name: 'Track 1',
                  maxCars: 5,
                  placedCars: ['car1', 'car2']
                }
              ]
            }
          ]
        }
      }
    }
  })
}));

describe('LayoutState Component', () => {
  // Create mock services
  const mockGetLayoutState = jest.fn();
  const mockSaveLayoutState = jest.fn();
  
  const mockServices = {
    locationService: {
      getAll: jest.fn(),
      getAllLocations: jest.fn().mockResolvedValue([{ _id: 'loc1', name: 'Test Location' }])
    },
    industryService: {
      getAll: jest.fn(),
      getAllIndustries: jest.fn().mockResolvedValue([
        {
          _id: 'ind1',
          name: 'Test Industry',
          locationId: 'loc1',
          blockName: 'block1',
          industryType: 'YARD',
          tracks: [
            {
              _id: 'track1',
              name: 'Track 1',
              length: 100,
              capacity: 5,
              maxCars: 5,
              placedCars: ['car1', 'car2']
            }
          ],
          ownerId: 'owner1'
        }
      ])
    },
    rollingStockService: {
      getAll: jest.fn(),
      getAllRollingStock: jest.fn().mockResolvedValue([
        {
          _id: 'car1',
          roadName: 'BNSF',
          roadNumber: '1234',
          aarType: 'XM',
          description: 'Boxcar',
          color: 'RED',
          note: '',
          homeYard: 'ind1',
          ownerId: 'owner1',
          currentLocation: {
            industryId: 'ind1',
            trackId: 'track1'
          }
        },
        {
          _id: 'car2',
          roadName: 'UP',
          roadNumber: '5678',
          aarType: 'GS',
          description: 'Gondola',
          color: 'GREEN',
          note: '',
          homeYard: 'ind1',
          ownerId: 'owner1',
          currentLocation: {
            industryId: 'ind1',
            trackId: 'track1'
          }
        }
      ]),
      updateRollingStock: jest.fn(),
      resetToHomeYards: jest.fn()
    },
    trainRouteService: {
      getAll: jest.fn(),
      getAllTrainRoutes: jest.fn()
    },
    layoutStateService: {
      getLayoutState: mockGetLayoutState,
      saveLayoutState: mockSaveLayoutState
    }
  } as ClientServices;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads saved state when available', async () => {
    // Setup mock to return an existing layout state
    const mockExistingState = {
      _id: 'existing-state',
      industries: [
        {
          _id: 'ind1',
          name: 'Test Industry',
          locationId: 'loc1',
          blockName: 'block1',
          industryType: 'YARD',
          tracks: [
            {
              _id: 'track1',
              name: 'Track 1',
              length: 100,
              capacity: 5,
              maxCars: 5,
              placedCars: ['car1', 'car2']
            }
          ],
          ownerId: 'owner1'
        }
      ],
      rollingStock: [
        {
          _id: 'car1',
          roadName: 'BNSF',
          roadNumber: '1234',
          aarType: 'XM',
          description: 'Boxcar',
          color: 'RED',
          note: '',
          homeYard: 'ind1',
          ownerId: 'owner1',
          currentLocation: {
            industryId: 'ind1',
            trackId: 'track1'
          }
        }
      ]
    };
    
    mockGetLayoutState.mockResolvedValue(mockExistingState);
    
    // Render component
    await act(async () => {
      render(<LayoutState services={mockServices} />);
    });
    
    // Verify the layout state service was called to get the state
    await waitFor(() => {
      expect(mockGetLayoutState).toHaveBeenCalled();
    });
    
    // Verify the component loaded without trying to save a new state
    await waitFor(() => {
      expect(mockSaveLayoutState).not.toHaveBeenCalled();
    });
    
    // Verify the title appeared
    expect(screen.getByText('Layout State')).toBeInTheDocument();
  });

  it('initializes and saves new state when none exists', async () => {
    // Setup mock to return null (no existing state)
    mockGetLayoutState.mockResolvedValue(null);
    
    // Mock the save state method to return a state with ID
    mockSaveLayoutState.mockImplementation((state) => {
      return Promise.resolve({
        ...state,
        _id: 'new-state-id'
      });
    });
    
    // Render component
    await act(async () => {
      render(<LayoutState services={mockServices} />);
    });
    
    // Verify the layout state service was called to get the state
    await waitFor(() => {
      expect(mockGetLayoutState).toHaveBeenCalled();
    });
    
    // Verify a new state was saved
    await waitFor(() => {
      expect(mockSaveLayoutState).toHaveBeenCalled();
    });
    
    // Verify the title appeared (indicating successful loading)
    expect(screen.getByText('Layout State')).toBeInTheDocument();
  });

  it('displays error message when fetching layout state fails', async () => {
    // Setup mock to throw an error
    mockGetLayoutState.mockRejectedValue(new Error('Failed to load layout state'));
    
    // Render component
    await act(async () => {
      render(<LayoutState services={mockServices} />);
    });
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load layout state')).toBeInTheDocument();
    });
  });

  it('resets rolling stock to home yards and saves updated state when reset button is clicked', async () => {
    // Setup mock to return an existing layout state
    const mockExistingState = {
      _id: 'existing-state',
      industries: [
        {
          _id: 'ind1',
          name: 'Test Industry',
          locationId: 'loc1',
          blockName: 'block1',
          industryType: 'YARD',
          tracks: [
            {
              _id: 'track1',
              name: 'Track 1',
              length: 100,
              capacity: 5,
              maxCars: 5,
              placedCars: ['car1', 'car2']
            }
          ],
          ownerId: 'owner1'
        }
      ],
      rollingStock: [
        {
          _id: 'car1',
          roadName: 'BNSF',
          roadNumber: '1234',
          aarType: 'XM',
          description: 'Boxcar',
          color: 'RED',
          note: '',
          homeYard: 'ind1',
          ownerId: 'owner1',
          currentLocation: {
            industryId: 'ind1',
            trackId: 'track1'
          }
        }
      ]
    };
    
    mockGetLayoutState.mockResolvedValue(mockExistingState);
    
    // Mock resetToHomeYards to simulate successful reset
    mockServices.rollingStockService.resetToHomeYards = jest.fn().mockResolvedValue(undefined);
    
    // Mock setTimeout to avoid waiting in tests
    jest.useFakeTimers();
    
    // Render component
    await act(async () => {
      render(<LayoutState services={mockServices} />);
    });
    
    // Find and click the reset button
    const resetButton = await screen.findByText('Reset to Home Yards');
    await act(async () => {
      fireEvent.click(resetButton);
    });
    
    // Fast-forward timer to skip the delay
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    
    // Verify resetToHomeYards was called
    await waitFor(() => {
      expect(mockServices.rollingStockService.resetToHomeYards).toHaveBeenCalled();
    });
    
    // Verify data was refreshed
    await waitFor(() => {
      expect(mockServices.locationService.getAllLocations).toHaveBeenCalledTimes(2);
      expect(mockServices.industryService.getAllIndustries).toHaveBeenCalledTimes(2);
      expect(mockServices.rollingStockService.getAllRollingStock).toHaveBeenCalledTimes(2);
    });
    
    // Verify state was saved to the database
    await waitFor(() => {
      expect(mockSaveLayoutState).toHaveBeenCalled();
    });
    
    // Restore real timers
    jest.useRealTimers();
  });
}); 