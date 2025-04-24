'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Location, Industry, TrainRoute } from '@/shared/types/models';
import { LocationService } from '../services/LocationService';
import { IndustryService } from '../services/IndustryService';
import { TrainRouteService } from '../services/TrainRouteService';

interface LayoutContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  locations: Location[];
  industries: Industry[];
  trainRoutes: TrainRoute[];
  isLoadingLocations: boolean;
  isLoadingIndustries: boolean;
  isLoadingTrainRoutes: boolean;
  locationError: string | null;
  industryError: string | null;
  trainRouteError: string | null;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [trainRoutes, setTrainRoutes] = useState<TrainRoute[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [isLoadingIndustries, setIsLoadingIndustries] = useState(true);
  const [isLoadingTrainRoutes, setIsLoadingTrainRoutes] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [industryError, setIndustryError] = useState<string | null>(null);
  const [trainRouteError, setTrainRouteError] = useState<string | null>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const fetchLocations = async () => {
    try {
      const locationService = new LocationService();
      const fetchedLocations = await locationService.getAllLocations();
      setLocations(fetchedLocations);
      setLocationError(null);
    } catch (error) {
      console.error('Error loading locations:', error);
      setLocationError('Failed to load locations');
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const fetchIndustries = async () => {
    try {
      const industryService = new IndustryService();
      const fetchedIndustries = await industryService.getAllIndustries();
      setIndustries(fetchedIndustries);
      setIndustryError(null);
    } catch (error) {
      console.error('Error loading industries:', error);
      setIndustryError('Failed to load industries');
    } finally {
      setIsLoadingIndustries(false);
    }
  };

  const fetchTrainRoutes = async () => {
    try {
      const trainRouteService = new TrainRouteService();
      const fetchedTrainRoutes = await trainRouteService.getAllTrainRoutes();
      setTrainRoutes(fetchedTrainRoutes);
      setTrainRouteError(null);
    } catch (error) {
      console.error('Error loading train routes:', error);
      setTrainRouteError('Failed to load train routes');
    } finally {
      setIsLoadingTrainRoutes(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchIndustries();
    fetchTrainRoutes();
  }, []);

  const value = {
    isSidebarOpen,
    toggleSidebar,
    locations,
    industries,
    trainRoutes,
    isLoadingLocations,
    isLoadingIndustries,
    isLoadingTrainRoutes,
    locationError,
    industryError,
    trainRouteError,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}; 