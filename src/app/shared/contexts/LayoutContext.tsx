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

type DataType = 'locations' | 'industries' | 'trainRoutes';

interface LocationServiceInterface {
  getAllLocations(): Promise<Location[]>;
}

interface IndustryServiceInterface {
  getAllIndustries(): Promise<Industry[]>;
}

interface TrainRouteServiceInterface {
  getAllTrainRoutes(): Promise<TrainRoute[]>;
}

type ServiceType = LocationServiceInterface | IndustryServiceInterface | TrainRouteServiceInterface;

interface DataFetchConfig<T, S extends ServiceType> {
  service: S;
  fetchMethod: keyof S;
  setData: (data: T[]) => void;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  dataType: DataType;
}

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

  const fetchData = async <T, S extends ServiceType>(config: DataFetchConfig<T, S>) => {
    const { service, fetchMethod, setData, setError, setIsLoading, dataType } = config;
    
    setIsLoading(true);
    try {
      const method = service[fetchMethod] as () => Promise<T[]>;
      const data = await method();
      React.startTransition(() => {
        setData(data);
        setError(null);
      });
    } catch (error) {
      console.error(`Error loading ${dataType}:`, error);
      if (error instanceof Error) {
        setError(`Failed to load ${dataType}: ${error.message}`);
      } else {
        setError(`Failed to load ${dataType}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    await fetchData<Location, LocationServiceInterface>({
      service: new LocationService(),
      fetchMethod: 'getAllLocations',
      setData: setLocations,
      setError: setLocationError,
      setIsLoading: setIsLoadingLocations,
      dataType: 'locations'
    });
  };

  const fetchIndustries = async () => {
    await fetchData<Industry, IndustryServiceInterface>({
      service: new IndustryService(),
      fetchMethod: 'getAllIndustries',
      setData: setIndustries,
      setError: setIndustryError,
      setIsLoading: setIsLoadingIndustries,
      dataType: 'industries'
    });
  };

  const fetchTrainRoutes = async () => {
    await fetchData<TrainRoute, TrainRouteServiceInterface>({
      service: new TrainRouteService(),
      fetchMethod: 'getAllTrainRoutes',
      setData: setTrainRoutes,
      setError: setTrainRouteError,
      setIsLoading: setIsLoadingTrainRoutes,
      dataType: 'trainRoutes'
    });
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