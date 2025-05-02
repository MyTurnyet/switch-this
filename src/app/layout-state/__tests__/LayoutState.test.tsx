import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import LayoutState from '../LayoutState';
import { ClientServices } from '@/app/shared/services/clientServices';
import { LocationType } from '@/app/shared/types/models';

// Mock the ScrollArea component
jest.mock('@/app/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div data-testid="scroll-area">{children}</div>,
}));

// Mock the groupIndustries utility
jest.mock('../utils/groupIndustries', () => ({
  groupIndustriesByLocationAndBlock: jest.fn().mockReturnValue({
    'loc1': {
      locationName: 'On Layout Location',
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
    },
    'loc2': {
      locationName: 'Fiddle Yard Location',
      blocks: {
        'block2': [
          {
            _id: 'ind2',
            name: 'Test Industry 2',
            industryType: 'FREIGHT',
            tracks: [
              {
                _id: 'track2',
                name: 'Track 2',
                maxCars: 5,
                placedCars: ['car3']
              }
            ]
          }
        ]
      }
    },
    'loc3': {
      locationName: 'Off Layout Location',
      blocks: {
        'block3': [
          {
            _id: 'ind3',
            name: 'Test Industry 3',
            industryType: 'PASSENGER',
            tracks: [
              {
                _id: 'track3',
                name: 'Track 3',
                maxCars: 5,
                placedCars: ['car4']
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
      getAllLocations: jest.fn().mockResolvedValue([
        { _id: 'loc1', stationName: 'On Layout Location', locationType: LocationType.ON_LAYOUT },
        { _id: 'loc2', stationName: 'Fiddle Yard Location', locationType: LocationType.FIDDLE_YARD },
        { _id: 'loc3', stationName: 'Off Layout Location', locationType: LocationType.OFF_LAYOUT }
      ])
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
      getAllTrainRoutes: jest.fn(),
      updateTrainRoute: jest.fn()
    },
    layoutStateService: {
      getLayoutState: mockGetLayoutState,
      saveLayoutState: mockSaveLayoutState
    }
  } as unknown as ClientServices;

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
}); 