'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { Location, Industry, TrainRoute, RollingStock } from '@/shared/types/models';
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

interface Services {
  locationService: {
    getAllLocations: () => Promise<Location[]>;
  };
  industryService: {
    getAllIndustries: () => Promise<Industry[]>;
  };
  trainRouteService: {
    getAllTrainRoutes: () => Promise<TrainRoute[]>;
  };
  rollingStockService: {
    getAllRollingStock: () => Promise<RollingStock[]>;
  };
}

interface LayoutProviderProps {
  children: ReactNode;
  services: Services;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ 
  children,
  services
}) => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const cache = useMemo(() => {
    const cacheInstance = new LayoutDataCache();
    return cacheInstance;
  }, []);

  const fetchData = useMemo(() => async (forceRefresh = false) => {
    if (!forceRefresh && cache.isDataLoaded()) {
      return; // Don't fetch if we have data and not forcing refresh
    }
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
      fetchData(false);
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
    refreshData: () => fetchData(true)
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