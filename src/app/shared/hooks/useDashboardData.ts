'use client';

import { useState, useEffect } from 'react';
import { Location, Industry, TrainRoute, RollingStock } from '../types/models';
import { ClientServices } from '../services/clientServices';

export interface DashboardData {
  locations: Location[];
  industries: Industry[];
  trainRoutes: TrainRoute[];
  rollingStock: RollingStock[];
  error: string | null;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

export const useDashboardData = (services: ClientServices): DashboardData => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [trainRoutes, setTrainRoutes] = useState<TrainRoute[]>([]);
  const [rollingStock, setRollingStock] = useState<RollingStock[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [locationsData, industriesData, trainRoutesData, rollingStockData] = await Promise.all([
        services.locationService.getAllLocations(),
        services.industryService.getAllIndustries(),
        services.trainRouteService.getAllTrainRoutes(),
        services.rollingStockService.getAllRollingStock()
      ]);

      setLocations(locationsData);
      setIndustries(industriesData);
      setTrainRoutes(trainRoutesData);
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

  return {
    locations,
    industries,
    trainRoutes,
    rollingStock,
    error,
    isLoading,
    refreshData
  };
}; 