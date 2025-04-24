'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Location, Industry, TrainRoute, RollingStock } from '@/shared/types/models';
import { LocationService } from '@/app/shared/services/LocationService';
import { IndustryService } from '@/app/shared/services/IndustryService';
import { TrainRouteService } from '@/app/shared/services/TrainRouteService';
import { RollingStockService } from '@/app/shared/services/RollingStockService';
import { LayoutDataCache } from './LayoutDataCache';

interface LayoutContextType {
  locations: Location[];
  industries: Industry[];
  trainRoutes: TrainRoute[];
  rollingStock: RollingStock[];
  error: string;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const defaultContext: LayoutContextType = {
  locations: [],
  industries: [],
  trainRoutes: [],
  rollingStock: [],
  error: '',
  isLoading: false,
  refreshData: async () => {}
};

const LayoutContext = createContext<LayoutContextType>(defaultContext);

interface LayoutProviderProps {
  children: React.ReactNode;
  locationService?: LocationService;
  industryService?: IndustryService;
  trainRouteService?: TrainRouteService;
  rollingStockService?: RollingStockService;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ 
  children,
  locationService: injectedLocationService,
  industryService: injectedIndustryService,
  trainRouteService: injectedTrainRouteService,
  rollingStockService: injectedRollingStockService
}) => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const cache = useMemo(() => new LayoutDataCache(), []);

  // Memoize service instances
  const services = useMemo(() => ({
    locationService: injectedLocationService || new LocationService(),
    industryService: injectedIndustryService || new IndustryService(),
    trainRouteService: injectedTrainRouteService || new TrainRouteService(),
    rollingStockService: injectedRollingStockService || new RollingStockService()
  }), [injectedLocationService, injectedIndustryService, injectedTrainRouteService, injectedRollingStockService]);

  const fetchData = useMemo(() => async () => {
    setIsLoading(true);
    setError('');

    try {
      const [locationsData, industriesData, trainRoutesData, rollingStockData] = await Promise.all([
        services.locationService.getAllLocations(),
        services.industryService.getAllIndustries(),
        services.trainRouteService.getAllTrainRoutes(),
        services.rollingStockService.getAllRollingStock()
      ]);

      cache.setLocations(locationsData);
      cache.setIndustries(industriesData);
      cache.setTrainRoutes(trainRoutesData);
      cache.setRollingStock(rollingStockData);
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
    rollingStock: cache.getRollingStock(),
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
  if (!context.refreshData) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}; 