'use client';

import React, { useEffect } from 'react';
import { StatCard } from './StatCard';
import { useLayout } from '../shared/contexts/LayoutContext';

export const Dashboard: React.FC = () => {
  const { locations, industries, trainRoutes, rollingStock, error, isLoading, refreshData } = useLayout();

  useEffect(() => {
    refreshData();
  }, [refreshData]);

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
            isLoading={false} 
          />
          <StatCard 
            count={0} 
            label="Industries" 
            isLoading={false} 
          />
          <StatCard 
            count={0} 
            label="Train Routes" 
            isLoading={false} 
          />
          <StatCard 
            count={0} 
            label="Rolling Stock" 
            isLoading={false} 
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