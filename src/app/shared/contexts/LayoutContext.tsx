'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Location, Industry, TrainRoute } from '@/shared/types/models';
import { LocationService } from '@/app/shared/services/LocationService';
import { IndustryService } from '@/app/shared/services/IndustryService';
import { TrainRouteService } from '@/app/shared/services/TrainRouteService';

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
  const [locations, setLocations] = useState<Location[] | null>(null);
  const [industries, setIndustries] = useState<Industry[] | null>(null);
  const [trainRoutes, setTrainRoutes] = useState<TrainRoute[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const locationService = new LocationService();
  const industryService = new IndustryService();
  const trainRouteService = new TrainRouteService();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [locationsData, industriesData, trainRoutesData] = await Promise.all([
        locationService.getAllLocations(),
        industryService.getAllIndustries(),
        trainRouteService.getAllTrainRoutes()
      ]);

      setLocations(locationsData);
      setIndustries(industriesData);
      setTrainRoutes(trainRoutesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <LayoutContext.Provider
      value={{
        locations,
        industries,
        trainRoutes,
        error,
        isLoading,
        refreshData
      }}
    >
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