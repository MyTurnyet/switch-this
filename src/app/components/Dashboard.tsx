'use client';

import React from 'react';
import { StatCard } from './StatCard';
import { 
  useLocationQueries, 
  useIndustryQueries, 
  useRollingStockQueries, 
  useTrainRouteQueries 
} from '../shared/hooks/queries';

export const Dashboard: React.FC = () => {
  // Use our new query hooks
  const { useLocations } = useLocationQueries();
  const { useIndustries } = useIndustryQueries();
  const { useRollingStockList } = useRollingStockQueries();
  const { useTrainRoutes } = useTrainRouteQueries();

  // Fetch data with React Query
  const locations = useLocations();
  const industries = useIndustries();
  const rollingStock = useRollingStockList();
  const trainRoutes = useTrainRoutes();

  // Determine loading state for the whole dashboard
  const isLoading = 
    locations.isLoading || 
    industries.isLoading || 
    rollingStock.isLoading || 
    trainRoutes.isLoading;

  // Check for any errors
  const errors = [
    locations.error,
    industries.error,
    rollingStock.error,
    trainRoutes.error
  ].filter(Boolean);

  const hasError = errors.length > 0;
  
  if (hasError) {
    const errorMessage = errors[0]?.message || 'Unable to connect to the database';
    
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <p className="font-medium">Connection Error</p>
          <p className="text-sm mt-1">{errorMessage}</p>
        </div>
        <div data-testid="dashboard-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard count={0} label="Locations" isLoading={isLoading} />
          <StatCard count={0} label="Industries" isLoading={isLoading} />
          <StatCard count={0} label="Train Routes" isLoading={isLoading} />
          <StatCard count={0} label="Rolling Stock" isLoading={isLoading} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div data-testid="dashboard-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          count={locations.data?.length ?? 0} 
          label="Locations" 
          isLoading={locations.isLoading} 
        />
        <StatCard 
          count={industries.data?.length ?? 0} 
          label="Industries" 
          isLoading={industries.isLoading} 
        />
        <StatCard 
          count={trainRoutes.data?.length ?? 0} 
          label="Train Routes" 
          isLoading={trainRoutes.isLoading} 
        />
        <StatCard 
          count={rollingStock.data?.length ?? 0} 
          label="Rolling Stock" 
          isLoading={rollingStock.isLoading} 
        />
      </div>
    </div>
  );
}; 