'use client';

import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { groupIndustriesByLocationAndBlock } from './utils/groupIndustries';
import { Location, Industry, RollingStock } from '@/app/shared/types/models';
import { ClientServices } from '../shared/services/clientServices';
import RollingStockList from './components/RollingStockList';

interface LayoutStateProps {
  services: ClientServices;
}

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

  useEffect(() => {
    refreshData();
  }, [services]);

  const groupedIndustries = groupIndustriesByLocationAndBlock(industries, locations);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Layout State</h1>
        <button 
          onClick={refreshData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Reset State
        </button>
      </div>
      {error && (
        <div className="text-red-500 mb-4" role="alert">
          {error}
        </div>
      )}
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-6">
          {isLoading ? (
            <div data-testid="loading-pulse" className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-semibold mb-4">Industries by Location</h2>
                {Object.entries(groupedIndustries).map(([locationId, locationGroup]) => (
                  <div key={locationId} className="mb-6">
                    <h3 className="text-lg font-semibold text-primary-600 mb-2">
                      {locationGroup.locationName}
                    </h3>
                    {Object.entries(locationGroup.blocks).map(([blockName, blockIndustries]) => (
                      <div key={blockName} className="ml-4 mb-4">
                        <h4 className="text-md font-medium text-gray-700 mb-2">
                          {blockName}
                        </h4>
                        <div className="ml-4 space-y-1">
                          {blockIndustries.map(industry => (
                            <div key={industry._id} className="text-gray-600">
                              {industry.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Rolling Stock</h2>
                <RollingStockList rollingStock={rollingStock} />
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 