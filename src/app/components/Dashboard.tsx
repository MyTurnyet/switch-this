'use client';

import React, { useEffect, useState } from 'react';
import { StatCard } from './StatCard';
import { Location, Industry, TrainRoute, RollingStock } from '../shared/types/models';
import { ClientServices } from '../shared/services/clientServices';

interface DashboardProps {
  services: ClientServices;
}

interface DashboardData {
  locations: Location[];
  industries: Industry[];
  trainRoutes: TrainRoute[];
  rollingStock: RollingStock[];
  error: string | null;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const useDashboardData = (services: ClientServices): DashboardData => {
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

export const Dashboard: React.FC<DashboardProps> = ({ services }) => {
  const { locations, industries, trainRoutes, rollingStock, error, isLoading } = useDashboardData(services);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <p className="font-medium">Connection Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <div data-testid="dashboard-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            count={0} 
            label="Locations" 
            isLoading={isLoading} 
          />
          <StatCard 
            count={0} 
            label="Industries" 
            isLoading={isLoading} 
          />
          <StatCard 
            count={0} 
            label="Train Routes" 
            isLoading={isLoading} 
          />
          <StatCard 
            count={0} 
            label="Rolling Stock" 
            isLoading={isLoading} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div data-testid="dashboard-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          count={locations?.length ?? 0} 
          label="Locations" 
          isLoading={isLoading} 
        />
        <StatCard 
          count={industries?.length ?? 0} 
          label="Industries" 
          isLoading={isLoading} 
        />
        <StatCard 
          count={trainRoutes?.length ?? 0} 
          label="Train Routes" 
          isLoading={isLoading} 
        />
        <StatCard 
          count={rollingStock?.length ?? 0} 
          label="Rolling Stock" 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}; 