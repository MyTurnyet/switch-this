'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Location, Industry, TrainRoute } from '@/shared/types/models';
import { LocationService } from '../services/LocationService';
import { IndustryService } from '../services/IndustryService';
import { TrainRouteService } from '../services/TrainRouteService';

interface LayoutContextType {
  locations: Location[];
  industries: Industry[];
  trainRoutes: TrainRoute[];
  isLoadingLocations: boolean;
  isLoadingIndustries: boolean;
  isLoadingTrainRoutes: boolean;
  locationError: string | null;
  industryError: string | null;
  trainRouteError: string | null;
  fetchLocations: () => Promise<void>;
  fetchIndustries: () => Promise<void>;
  fetchTrainRoutes: () => Promise<void>;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [trainRoutes, setTrainRoutes] = useState<TrainRoute[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [isLoadingIndustries, setIsLoadingIndustries] = useState(true);
  const [isLoadingTrainRoutes, setIsLoadingTrainRoutes] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [industryError, setIndustryError] = useState<string | null>(null);
  const [trainRouteError, setTrainRouteError] = useState<string | null>(null);

  const fetchLocations = async () => {
    setIsLoadingLocations(true);
    try {
      const locationService = new LocationService();
      const fetchedLocations = await locationService.getAllLocations();
      React.startTransition(() => {
        setLocations(fetchedLocations);
        setLocationError(null);
      });
    } catch (error) {
      console.error('Error loading locations:', error);
      if (error instanceof Error) {
        setLocationError(`Failed to load locations: ${error.message}`);
      } else {
        setLocationError('Failed to load locations');
      }
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const fetchIndustries = async () => {
    setIsLoadingIndustries(true);
    try {
      const industryService = new IndustryService();
      const fetchedIndustries = await industryService.getAllIndustries();
      React.startTransition(() => {
        setIndustries(fetchedIndustries);
        setIndustryError(null);
      });
    } catch (error) {
      console.error('Error loading industries:', error);
      if (error instanceof Error) {
        setIndustryError(`Failed to load industries: ${error.message}`);
      } else {
        setIndustryError('Failed to load industries');
      }
    } finally {
      setIsLoadingIndustries(false);
    }
  };

  const fetchTrainRoutes = async () => {
    setIsLoadingTrainRoutes(true);
    try {
      const trainRouteService = new TrainRouteService();
      const fetchedTrainRoutes = await trainRouteService.getAllTrainRoutes();
      React.startTransition(() => {
        setTrainRoutes(fetchedTrainRoutes);
        setTrainRouteError(null);
      });
    } catch (error) {
      console.error('Error loading train routes:', error);
      if (error instanceof Error) {
        setTrainRouteError(`Failed to load train routes: ${error.message}`);
      } else {
        setTrainRouteError('Failed to load train routes');
      }
    } finally {
      setIsLoadingTrainRoutes(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchIndustries();
    fetchTrainRoutes();
  }, []);

  return (
    <LayoutContext.Provider
      value={{
        locations,
        industries,
        trainRoutes,
        isLoadingLocations,
        isLoadingIndustries,
        isLoadingTrainRoutes,
        locationError,
        industryError,
        trainRouteError,
        fetchLocations,
        fetchIndustries,
        fetchTrainRoutes,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
}; 