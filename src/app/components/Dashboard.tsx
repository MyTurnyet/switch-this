'use client';

import React from 'react';
import { useLayoutContext } from '../shared/contexts/LayoutContext';

interface StatCardProps {
  count: number;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ count, label }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="text-4xl font-bold text-blue-600">{count}</div>
    <div className="text-gray-600 mt-2">{label}</div>
  </div>
);

export const Dashboard: React.FC = () => {
  const {
    locations,
    industries,
    trainRoutes,
    isLoadingLocations,
    isLoadingIndustries,
    isLoadingTrainRoutes,
    locationError,
    industryError,
    trainRouteError,
  } = useLayoutContext();

  const isLoading = isLoadingLocations || isLoadingIndustries || isLoadingTrainRoutes;
  const hasError = locationError || industryError || trainRouteError;

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="text-xl text-gray-600">Loading statistics...</div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="text-center p-8">
        <div className="text-xl text-red-600">Error loading statistics</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
      <StatCard count={locations.length} label="Total Locations" />
      <StatCard count={industries.length} label="Total Industries" />
      <StatCard count={trainRoutes.length} label="Total Train Routes" />
    </div>
  );
}; 