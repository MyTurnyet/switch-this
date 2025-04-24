'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Location, Industry, TrainRoute } from '@/shared/types/models';
import { LocationService } from '@/app/shared/services/LocationService';
import { IndustryService } from '@/app/shared/services/IndustryService';
import { TrainRouteService } from '@/app/shared/services/TrainRouteService';

export interface LayoutContextType {
  locations: Location[] | null;
  industries: Industry[] | null;
  trainRoutes: TrainRoute[] | null;
  error: string | null;
  isLoading: boolean;
  fetchLocations: () => Promise<void>;
  fetchIndustries: () => Promise<void>;
  fetchTrainRoutes: () => Promise<void>;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<Location[] | null>(null);
  const [industries, setIndustries] = useState<Industry[] | null>(null);
  const [trainRoutes, setTrainRoutes] = useState<TrainRoute[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const locationService = new LocationService();
  const industryService = new IndustryService();
  const trainRouteService = new TrainRouteService();

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await locationService.getAllLocations();
      setLocations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load locations';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchIndustries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await industryService.getAllIndustries();
      setIndustries(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load industries';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTrainRoutes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await trainRouteService.getAllTrainRoutes();
      setTrainRoutes(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load train routes';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchLocations(),
          fetchIndustries(),
          fetchTrainRoutes()
        ]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchLocations, fetchIndustries, fetchTrainRoutes]);

  const value = {
    locations,
    industries,
    trainRoutes,
    error,
    isLoading,
    fetchLocations,
    fetchIndustries,
    fetchTrainRoutes
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}; 