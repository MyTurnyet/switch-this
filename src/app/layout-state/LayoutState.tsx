'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { groupIndustriesByBlockAndLocation } from './utils/groupIndustries';
import { initializeLayoutState, syncRollingStockLocations } from './utils/layoutStateManager';
import type { Location, Industry, RollingStock, Track } from '@/app/shared/types/models';
import type { ClientServices, LayoutStateData } from '../shared/services/clientServices';
import RollingStockList from './components/RollingStockList';

interface LayoutStateProps {
  services: ClientServices;
}

// Combined state interface that includes both LayoutStateData properties and our custom properties
interface ExtendedLayoutState {
  _id?: string;
  industries: Industry[];
  rollingStock: RollingStock[];
  rollingStockState: Record<string, {
    locationId: string;
    industryId?: string;
    trackId?: string;
    status: string;
  }>;
  timestamp: number;
}

const getIndustryTypeStyle = (type: string): string => {
  switch (type) {
    case 'YARD':
      return 'bg-blue-50 border-blue-200';
    case 'FREIGHT':
      return 'bg-green-50 border-green-200';
    case 'PASSENGER':
      return 'bg-purple-50 border-purple-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const getLocationTypeStyle = (locationType?: string): string => {
  switch (locationType) {
    case 'ON_LAYOUT':
      return 'bg-emerald-50 border-emerald-200';
    case 'OFF_LAYOUT':
      return 'bg-amber-50 border-amber-200';
    case 'FIDDLE_YARD':
      return 'bg-violet-50 border-violet-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const getLocationTypeIndicator = (locationType?: string) => {
  switch (locationType) {
    case 'ON_LAYOUT':
      return (
        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded bg-emerald-100 text-emerald-800">
          ON LAYOUT
        </span>
      );
    case 'OFF_LAYOUT':
      return (
        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-800">
          OFF LAYOUT
        </span>
      );
    case 'FIDDLE_YARD':
      return (
        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded bg-violet-100 text-violet-800">
          FIDDLE YARD
        </span>
      );
    default:
      return null;
  }
};

const getTrackCapacityStyle = (current: number, max: number): string => {
  const ratio = current / max;
  if (ratio >= 1) return 'text-red-600';
  if (ratio >= 0.75) return 'text-amber-600';
  if (ratio >= 0.5) return 'text-yellow-600';
  return 'text-green-600';
};

const getCarsOnTrack = (track: Track, rollingStock: RollingStock[]) => {
  return rollingStock.filter(car => track.placedCars.includes(car._id));
};

// Component for a collapsible track with cars
const TrackWithCars = ({ track, rollingStock }: { track: Track, rollingStock: RollingStock[] }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const carsOnTrack = getCarsOnTrack(track, rollingStock);
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <div key={track._id} className="border border-gray-100 rounded mb-2 overflow-hidden">
      <div 
        className="flex justify-between items-center py-1 px-2 bg-gray-50 cursor-pointer"
        onClick={toggleCollapse}
      >
        <span className="font-medium text-gray-800">
          {track.name}
        </span>
        <div className="flex items-center">
          <span className={`text-sm font-medium ${getTrackCapacityStyle(carsOnTrack.length, track.maxCars)}`}>
            ({carsOnTrack.length}/{track.maxCars} cars)
          </span>
          <button className="ml-2 text-gray-500">
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {!isCollapsed && carsOnTrack.length > 0 && (
        <div className="pl-4 py-1 space-y-1 bg-white">
          {carsOnTrack.map(car => (
            <div key={car._id} className="text-sm text-gray-700">
              {car.roadName} {car.roadNumber} ({car.aarType})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Add this function to sort locations by type
const sortLocationsByType = (
  locationsMap: {
    [locationId: string]: {
      locationName: string;
      industries: Industry[];
    }
  }, 
  locationsList: Location[]
) => {
  // Define the priority order
  const typePriority: Record<string, number> = {
    'ON_LAYOUT': 1,
    'FIDDLE_YARD': 2,
    'OFF_LAYOUT': 3,
    'undefined': 4 // For any locations without a type
  };
  
  return Object.entries(locationsMap).sort((a, b) => {
    const locationA = locationsList.find(loc => loc._id === a[0]);
    const locationB = locationsList.find(loc => loc._id === b[0]);
    
    const typeA = locationA?.locationType || 'undefined';
    const typeB = locationB?.locationType || 'undefined';
    
    // Sort by type priority first
    return typePriority[typeA as keyof typeof typePriority] - typePriority[typeB as keyof typeof typePriority];
  });
};

export default function LayoutState({ services }: LayoutStateProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [rollingStock, setRollingStock] = useState<RollingStock[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [layoutStateId, setLayoutStateId] = useState<string | undefined>(undefined);

  const logBackgroundOperationError = (operation: string, err: unknown) => {
    console.error(`Failed to ${operation}:`, err);
    // Background operations don't affect the UI state
  };

  const persistLayoutState = useCallback(async (updatedIndustries: Industry[], updatedRollingStock: RollingStock[]) => {
    try {
      // Create rollingStockState record
      const rollingStockState: Record<string, {
        locationId: string;
        industryId?: string;
        trackId?: string;
        status: string;
      }> = {};
      
      // Populate the rolling stock state from the rolling stock data
      updatedRollingStock.forEach(stock => {
        rollingStockState[stock._id] = {
          locationId: stock.currentLocation?.industryId || stock.homeYard || '',
          industryId: stock.currentLocation?.industryId,
          trackId: stock.currentLocation?.trackId,
          status: 'STORED' // Default status
        };
      });
      
      // Create a properly typed state object
      const stateToSave: ExtendedLayoutState = {
        _id: layoutStateId,
        industries: updatedIndustries,
        rollingStock: updatedRollingStock,
        rollingStockState,
        timestamp: Date.now()
      };
      
      // Type assertion to satisfy the API requirements
      const savedState = await services.layoutStateService.saveLayoutState(stateToSave as unknown as LayoutStateData);
      
      if (savedState) {
        // Type assertion for the returned state
        const typedSavedState = savedState as unknown as ExtendedLayoutState;
        if (typedSavedState._id) {
          setLayoutStateId(typedSavedState._id);
        }
      }
    } catch (err) {
      logBackgroundOperationError('save layout state', err);
    }
  }, [layoutStateId, services.layoutStateService]);

  const loadInitialState = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [locationsData, industriesData, rollingStockData] = await loadBaseData();
      
      setLocations(locationsData);
      
      const savedState = await services.layoutStateService.getLayoutState();
      
      if (savedState) {
        // Type assertion for the saved state
        const typedSavedState = savedState as unknown as ExtendedLayoutState;
        applyExistingSavedState(typedSavedState);
      } else {
        await initializeDefaultState(industriesData, rollingStockData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to connect to the database';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [services]);

  const applyExistingSavedState = (savedState: ExtendedLayoutState) => {
    console.log('Loading saved layout state from database');
    setIndustries(savedState.industries);
    setRollingStock(savedState.rollingStock);
    if (savedState._id) {
      setLayoutStateId(savedState._id);
    }
  };

  const initializeDefaultState = async (industriesData: Industry[], rollingStockData: RollingStock[]) => {
    console.log('No saved state found - initializing default state');
    const initializedIndustries = initializeLayoutState(industriesData, rollingStockData);
    const updatedRollingStock = syncRollingStockLocations(initializedIndustries, rollingStockData);
    
    setIndustries(initializedIndustries);
    setRollingStock(updatedRollingStock);
    
    await persistLayoutState(initializedIndustries, updatedRollingStock);
  };

  const loadBaseData = async () => {
    return Promise.all([
      services.locationService.getAllLocations(),
      services.industryService.getAllIndustries(),
      services.rollingStockService.getAllRollingStock()
    ]);
  };

  const resetRollingStockToHomeYards = async () => {
    await services.rollingStockService.resetToHomeYards();
  };

  const handleReset = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Starting complete layout state reset process');
      
      // Step 1: Reset rolling stock to home yards via API
      await resetRollingStockToHomeYards();
      
      // Step 2: Wait a moment to ensure database operations complete
      // This gives time for MongoDB operations to finish before we fetch the updated state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 3: Fetch fresh data from database
      console.log('Fetching fresh data from database');
      const [locationsData, industriesData, rollingStockData] = await loadBaseData();
      
      // Step 4: Initialize a completely new state
      console.log('Creating fresh layout state');
      const initializedIndustries = initializeLayoutState(industriesData, rollingStockData);
      const updatedRollingStock = syncRollingStockLocations(initializedIndustries, rollingStockData);
      
      // Step 5: Update local state
      setLocations(locationsData);
      setIndustries(initializedIndustries);
      setRollingStock(updatedRollingStock);
      
      // Step 6: Persist as new layout state
      console.log('Saving new layout state to database');
      // Clear layout state ID to force creation of a new state
      setLayoutStateId(undefined);
      await persistLayoutState(initializedIndustries, updatedRollingStock);
      
      console.log('Complete reset operation successful');
    } catch (err) {
      console.error('Error during reset operation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset layout state';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialState();
  }, [loadInitialState]);

  const groupedByBlock = groupIndustriesByBlockAndLocation(industries, locations);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Layout State</h1>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Reset Layout State
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-10">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div
                role="status"
                className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"
              />
            </div>
          ) : (
            <div className="space-y-16">
              {Object.entries(groupedByBlock).map(([blockName, blockGroup]) => (
                <div key={blockName} className="pb-8 space-y-2">
                  <div className="pb-1 border-b-2 border-gray-300">
                    <h2 className="text-2xl font-bold text-gray-900">Block {blockName}</h2>
                  </div>
                  
                  <div className="space-y-8 mt-4">
                    {sortLocationsByType(blockGroup.locations, locations).map(([locationId, locationData]) => {
                      // Find the location to get its type
                      const location = locations.find(loc => loc._id === locationId);
                      const locationType = location?.locationType;
                      
                      return (
                        <div key={locationId} className="space-y-2">
                          <h3 className={`text-xl font-semibold text-gray-800 flex items-center p-2 rounded ${getLocationTypeStyle(locationType)}`}>
                            {locationData.locationName}
                            {getLocationTypeIndicator(locationType)}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {locationData.industries.map((industry: Industry) => (
                              <div
                                key={industry._id}
                                className={`p-4 rounded-lg border ${getIndustryTypeStyle(industry.industryType)}`}
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="text-lg font-semibold text-gray-900">
                                    {industry.name}
                                  </h4>
                                  <span className="text-sm font-medium px-2 py-0.5 rounded-full text-gray-700 bg-gray-100">
                                    {industry.industryType}
                                  </span>
                                </div>
                                
                                <div className="space-y-1">
                                  {industry.tracks.map((track: Track) => (
                                    <TrackWithCars key={track._id} track={track} rollingStock={rollingStock} />
                                  ))}
                                  
                                  {industry.tracks.length === 0 && (
                                    <div className="text-sm italic text-gray-500 text-center py-2">
                                      No tracks at this industry
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {Object.keys(groupedByBlock).length === 0 && (
                <div className="text-center text-gray-500 py-10">
                  No blocks or industries found
                </div>
              )}
              
              <div className="pt-8 border-t-2 border-gray-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">All Rolling Stock</h2>
                <RollingStockList rollingStock={rollingStock} industries={industries} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 