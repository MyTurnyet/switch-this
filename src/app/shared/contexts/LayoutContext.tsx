'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Location, Industry, TrainRoute } from '@/shared/types/models';
import { LocationService } from '@/app/shared/services/LocationService';
import { IndustryService } from '@/app/shared/services/IndustryService';
import { TrainRouteService } from '@/app/shared/services/TrainRouteService';
import { LayoutDataCache } from './LayoutDataCache';

interface LayoutContextType {
  locations: Location[] | null;
  industries: Industry[] | null;
  trainRoutes: TrainRoute[] | null;
  error: string | null;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const cache = useMemo(() => new LayoutDataCache(), []);

  // Memoize service instances
  const services = useMemo(() => ({
    locationService: new LocationService(),
    industryService: new IndustryService(),
    trainRouteService: new TrainRouteService()
  }), []);

  const fetchData = useMemo(() => async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [locationsData, industriesData, trainRoutesData] = await Promise.all([
        services.locationService.getAllLocations(),
        services.industryService.getAllIndustries(),
        services.trainRouteService.getAllTrainRoutes()
      ]);

      cache.setLocations(locationsData);
      cache.setIndustries(industriesData);
      cache.setTrainRoutes(trainRoutesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
    } finally {
      setIsLoading(false);
    }
  }, [services, cache]);

  useEffect(() => {
    if (!cache.isDataLoaded()) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [fetchData, cache]);

  const contextValue = useMemo(() => ({
    locations: cache.getLocations(),
    industries: cache.getIndustries(),
    trainRoutes: cache.getTrainRoutes(),
    error,
    isLoading,
    refreshData: fetchData
  }), [cache, error, isLoading, fetchData]);

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}; 