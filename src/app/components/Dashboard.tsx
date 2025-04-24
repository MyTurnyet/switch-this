'use client';

import React, { useEffect } from 'react';
import { useLayoutContext } from '../shared/contexts/LayoutContext';
import { StatCard } from './StatCard';
import { isLoading, hasError } from '../shared/utils/loadingUtils';

const LoadingView: React.FC = () => (
  <div className="text-center p-8">
    <div className="text-xl text-gray-600">Loading statistics...</div>
    <div className="mt-4">
      <div role="status" className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
    </div>
  </div>
);

interface ErrorViewProps {
  locationError: string | null;
  industryError: string | null;
  trainRouteError: string | null;
  onRetry: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({ locationError, industryError, trainRouteError, onRetry }) => (
  <div className="text-center p-8">
    <div className="text-xl text-red-600 mb-4">Unable to load dashboard data</div>
    <div className="text-gray-600 mb-4">
      {locationError && <div>• {locationError}</div>}
      {industryError && <div>• {industryError}</div>}
      {trainRouteError && <div>• {trainRouteError}</div>}
    </div>
    <button
      onClick={onRetry}
      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
    >
      Retry
    </button>
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
    fetchLocations,
    fetchIndustries,
    fetchTrainRoutes,
  } = useLayoutContext();

  useEffect(() => {
    fetchLocations();
    fetchIndustries();
    fetchTrainRoutes();
  }, []);

  const loadingState = { isLoadingLocations, isLoadingIndustries, isLoadingTrainRoutes };
  const errorState = { locationError, industryError, trainRouteError };

  const handleRetry = () => {
    if (locationError) fetchLocations();
    if (industryError) fetchIndustries();
    if (trainRouteError) fetchTrainRoutes();
  };

  if (isLoading(loadingState)) {
    return <LoadingView />;
  }

  if (hasError(errorState)) {
    return <ErrorView {...errorState} onRetry={handleRetry} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
      <StatCard count={locations.length} label="Total Locations" />
      <StatCard count={industries.length} label="Total Industries" />
      <StatCard count={trainRoutes.length} label="Total Train Routes" />
    </div>
  );
}; 