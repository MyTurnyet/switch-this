'use client';

import React, { useEffect } from 'react';
import { StatCard } from './StatCard';
import { useLayout } from '../shared/contexts/LayoutContext';

export const Dashboard: React.FC = () => {
  const { locations, industries, trainRoutes, error, isLoading, fetchLocations, fetchIndustries, fetchTrainRoutes } = useLayout();

  useEffect(() => {
    fetchLocations();
    fetchIndustries();
    fetchTrainRoutes();
  }, [fetchLocations, fetchIndustries, fetchTrainRoutes]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard count={locations?.length ?? 0} label="Locations" isLoading={isLoading} />
      <StatCard count={industries?.length ?? 0} label="Industries" isLoading={isLoading} />
      <StatCard count={trainRoutes?.length ?? 0} label="Train Routes" isLoading={isLoading} />
    </div>
  );
}; 