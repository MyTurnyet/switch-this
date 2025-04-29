'use client';

import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { groupIndustriesByLocationAndBlock } from './utils/groupIndustries';
import type { Location, Industry, RollingStock, Track } from '@/app/shared/types/models';
import type { ClientServices } from '../shared/services/clientServices';
import RollingStockList from './components/RollingStockList';

interface LayoutStateProps {
  services: ClientServices;
}

const getIndustryTypeStyle = (type: string) => {
  switch (type) {
    case 'FREIGHT':
      return 'border-blue-200 bg-blue-50';
    case 'PASSENGER':
      return 'border-green-200 bg-green-50';
    case 'YARD':
      return 'border-gray-200 bg-gray-50';
    default:
      return 'border-gray-200 bg-white';
  }
};

const getTrackCapacityStyle = (current: number, max: number) => {
  if (current === 0) return 'text-gray-500';
  if (current === max) return 'text-red-600';
  if (current > max * 0.8) return 'text-yellow-600';
  return 'text-green-600';
};

const getCarsOnTrack = (track: Track, rollingStock: RollingStock[]) => {
  console.log(`Track ${track.name} has placedCars: ${JSON.stringify(track.placedCars)}`);
  const cars = rollingStock.filter(car => track.placedCars.includes(car._id));
  console.log(`Found ${cars.length} cars on track ${track.name}`);
  return cars;
};

export default function LayoutState({ services }: LayoutStateProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [rollingStock, setRollingStock] = useState<RollingStock[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [locationsData, industriesData, rollingStockData] = await Promise.all([
        services.locationService.getAllLocations(),
        services.industryService.getAllIndustries(),
        services.rollingStockService.getAllRollingStock()
      ]);

      setLocations(locationsData);
      setIndustries(industriesData);
      setRollingStock(rollingStockData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to connect to the database';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await services.rollingStockService.resetToHomeYards();
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset rolling stock';
      setError(errorMessage);
    }
  };

  useEffect(() => {
    refreshData();
  }, [services]);

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
          ) : (
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
                                        <div className="ml-2 space-y-2">
                                          {carsOnTrack.map(car => (
                                            <div
                                              key={car._id}
                                              className="bg-white p-2 rounded border border-gray-200"
                                            >
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                  {car.roadName} {car.roadNumber}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                  {car.aarType} - {car.description}
                                                </span>
                                              </div>
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
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">All Rolling Stock</h2>
                <RollingStockList rollingStock={rollingStock} industries={industries} />
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 