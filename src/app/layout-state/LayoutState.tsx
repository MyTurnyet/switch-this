'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { groupIndustriesByLocationAndBlock } from './utils/groupIndustries';
import { initializeLayoutState, syncRollingStockLocations } from './utils/layoutStateManager';
import type { Location, Industry, RollingStock, Track } from '@/app/shared/types/models';
import type { ClientServices } from '../shared/services/clientServices';
import RollingStockList from './components/RollingStockList';

// Simple mock interface to replace the missing module
interface LayoutStateData {
  _id?: string;
  industries: Industry[];
  rollingStock: RollingStock[];
}

// Simple mock class to replace the missing module
class LayoutStateService {
  async getLayoutState(): Promise<LayoutStateData | null> {
    return null;
  }
  
  async saveLayoutState(state: LayoutStateData): Promise<LayoutStateData> {
    return { ...state, _id: state._id || 'new-id' };
  }
}

interface LayoutStateProps {
  services: ClientServices;
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

export default function LayoutState({ services }: LayoutStateProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [rollingStock, setRollingStock] = useState<RollingStock[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [layoutStateId, setLayoutStateId] = useState<string | undefined>(undefined);
  
  const layoutStateService = new LayoutStateService();

  const logBackgroundOperationError = (operation: string, err: unknown) => {
    console.error(`Failed to ${operation}:`, err);
    // Background operations don't affect the UI state
  };

  const persistLayoutState = useCallback(async (updatedIndustries: Industry[], updatedRollingStock: RollingStock[]) => {
    try {
      const stateToSave: LayoutStateData = {
        _id: layoutStateId,
        industries: updatedIndustries,
        rollingStock: updatedRollingStock
      };
      
      const savedState = await layoutStateService.saveLayoutState(stateToSave);
      
      updateLayoutStateIdIfNeeded(savedState);
    } catch (err) {
      logBackgroundOperationError('save layout state', err);
    }
  }, [layoutStateId]);

  const updateLayoutStateIdIfNeeded = (savedState: LayoutStateData) => {
    if (!layoutStateId && savedState._id) {
      setLayoutStateId(savedState._id);
    }
  };

  const loadInitialState = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [locationsData, industriesData, rollingStockData] = await loadBaseData();
      
      setLocations(locationsData);
      
      const savedState = await loadSavedLayoutState();
      
      if (savedState) {
        applyExistingSavedState(savedState);
      } else {
        await initializeDefaultState(industriesData, rollingStockData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to connect to the database';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [services, persistLayoutState]);

  const loadSavedLayoutState = async () => {
    return layoutStateService.getLayoutState();
  };

  const applyExistingSavedState = (savedState: LayoutStateData) => {
    console.log('Loading saved layout state from database');
    setIndustries(savedState.industries);
    setRollingStock(savedState.rollingStock);
    setLayoutStateId(savedState._id);
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

  const refreshDataAndUpdateState = async () => {
    const [locationsData, industriesData, rollingStockData] = await loadBaseData();
    
    setLocations(locationsData);
    setIndustries(industriesData);
    setRollingStock(rollingStockData);
    
    return { industriesData, rollingStockData };
  };

  const handleReset = async () => {
    try {
      setIsLoading(true);
      await resetRollingStockToHomeYards();
      
      const { industriesData, rollingStockData } = await refreshDataAndUpdateState();
      
      await persistLayoutState(industriesData, rollingStockData);
      
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset rolling stock';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialState();
  }, [loadInitialState]);

  const groupedIndustries = groupIndustriesByLocationAndBlock(industries, locations);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Layout State</h1>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Reset to Home Yards
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div
                role="status"
                className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"
              />
            </div>
          ) :
            <>
              <div className="space-y-8">
                {Object.entries(groupedIndustries).map(([locationId, locationGroup]) => (
                  <div key={locationId} className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {locationGroup.locationName}
                    </h2>
                    {Object.entries(locationGroup.blocks).map(([blockName, blockIndustries]) => (
                      <div key={blockName} className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                          Block {blockName}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {blockIndustries.map(industry => (
                            <div
                              key={industry._id}
                              className={`p-4 rounded-lg border ${getIndustryTypeStyle(industry.industryType)}`}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {industry.name}
                                </h4>
                                <span className="text-sm text-gray-500">
                                  {industry.industryType}
                                </span>
                              </div>
                              <div className="space-y-3">
                                {industry.tracks.map(track => {
                                  const carsOnTrack = getCarsOnTrack(track, rollingStock);
                                  return (
                                    <div key={track._id} className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">
                                          {track.name}
                                        </span>
                                        <span className={`text-sm font-medium ${getTrackCapacityStyle(carsOnTrack.length, track.maxCars)}`}>
                                          ({carsOnTrack.length}/{track.maxCars} cars)
                                        </span>
                                      </div>
                                      {carsOnTrack.length > 0 && (
                                        <div className="pl-4 border-l-2 border-gray-200 space-y-1">
                                          {carsOnTrack.map(car => (
                                            <div key={car._id} className="text-sm">
                                              {car.roadName} {car.roadNumber} ({car.aarType})
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              
              <div className="mt-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Rolling Stock
                </h2>
                <RollingStockList 
                  rollingStock={rollingStock} 
                  industries={industries} 
                />
              </div>
            </>
          }
        </div>
      </ScrollArea>
    </div>
  );
} 