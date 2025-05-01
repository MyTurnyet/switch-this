'use client';

import React, { useEffect, useState } from 'react';
import { services } from '@/app/shared/services/clientServices';
import { Location, Industry, IndustryType, TrainRoute } from '@/app/shared/types/models';
import { Card, CardHeader, CardContent, Pagination, ToastProvider } from '@/app/components/ui';
import EditTrainRouteModal from './components/EditTrainRouteModal';

export default function TrainRoutesPage() {
  const [trainRoutes, setTrainRoutes] = useState<TrainRoute[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [paginatedRoutes, setPaginatedRoutes] = useState<TrainRoute[]>([]);

  // Find train route by ID
  const findTrainRouteById = (id: string): TrainRoute | null => {
    return trainRoutes.find(route => route._id === id) || null;
  };

  // Get originating yard name
  const getYardName = (yardId: string): string => {
    const industry = industries.find(ind => ind._id === yardId);
    return industry ? industry.name : 'Unknown Yard';
  };

  // Get all industries from API
  const getAllIndustries = async (): Promise<Industry[]> => {
    // Safely check if the service exists (for tests)
    if (!services.industryService?.getAllIndustries) {
      console.error('Industry service not available');
      return [];
    }
    
    return await services.industryService.getAllIndustries();
  };

  // Get station name
  const getStationName = (stationId: string): string => {
    const station = locations.find(loc => loc._id === stationId);
    return station ? station.stationName : 'Unknown Station';
  };

  // Update paginated routes when page changes or routes change
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedRoutes(trainRoutes.slice(startIndex, endIndex));
  }, [currentPage, trainRoutes]);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Get train routes
        const routesData = await services.trainRouteService.getAllTrainRoutes();
        setTrainRoutes(routesData);
        
        // Get locations
        const locationsData = await services.locationService.getAllLocations();
        setLocations(locationsData);
        
        // Get industries - handling the case where it might not exist in tests
        try {
          const industriesData = await getAllIndustries();
          setIndustries(industriesData);
        } catch (err) {
          console.error('Failed to load industries:', err);
          // Don't set an error, we can still proceed
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    }
    
    fetchData();
  }, []);

  // Handle edit train route
  const handleEditRoute = (routeId: string) => {
    setEditingRouteId(routeId);
  };

  // Save edited train route
  const handleSaveRoute = async (updatedRoute: TrainRoute): Promise<void> => {
    try {
      await services.trainRouteService.updateTrainRoute(updatedRoute._id, updatedRoute);
      
      // Update local state
      setTrainRoutes(prevRoutes => 
        prevRoutes.map(route => route._id === updatedRoute._id ? updatedRoute : route)
      );
      
      // Close modal
      setEditingRouteId(null);
    } catch (err) {
      console.error('Error saving train route:', err);
      throw new Error('Failed to save train route');
    }
  };

  // Get yards only (for originating and terminating yard selects)
  const getYardsOnly = (): Industry[] => {
    return industries.filter(industry => industry.industryType === IndustryType.YARD);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <ToastProvider>
      <div className="container mx-auto py-8 px-4">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Loading train routes...</p>
          </div>
        ) : trainRoutes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-xl text-gray-600">No train routes found.</p>
            <button 
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => setEditingRouteId('new')}
            >
              Create Train Route
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Train Routes</h1>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={() => setEditingRouteId('new')}
              >
                Create Train Route
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {paginatedRoutes.map(route => (
                <Card key={route._id} className="shadow-md">
                  <CardHeader className="flex flex-row items-start justify-between bg-gray-50">
                    <div>
                      <h2 className="text-xl font-bold">{route.name}</h2>
                      <p className="text-gray-500">Route Number: {route.routeNumber}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {route.routeType}
                      </span>
                      <button 
                        className="text-blue-600 hover:text-blue-800 transition"
                        onClick={() => handleEditRoute(route._id)}
                      >
                        Edit
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-600">Originating Yard</h3>
                        <p>{getYardName(route.originatingYardId)}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-600">Terminating Yard</h3>
                        <p>{getYardName(route.terminatingYardId)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-600 mb-2">Stations</h3>
                      {route.stations && route.stations.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {route.stations.map((stationId: string, index: number) => (
                            <div key={`${stationId}-${index}`} className="flex items-center">
                              <span className="bg-gray-100 text-xs px-2 py-1 rounded-full mr-1">
                                {index + 1}
                              </span>
                              <span>{getStationName(stationId)}</span>
                              {index < route.stations.length - 1 && (
                                <span className="mx-2 text-gray-400">→</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No stations added to this route</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Pagination */}
            {trainRoutes.length > itemsPerPage && (
              <div className="mt-6">
                <Pagination
                  totalItems={trainRoutes.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}

        {editingRouteId && (
          <EditTrainRouteModal
            trainRoute={editingRouteId === 'new' ? null : findTrainRouteById(editingRouteId)}
            locations={locations}
            industries={getYardsOnly()}
            onSave={handleSaveRoute}
            onCancel={() => setEditingRouteId(null)}
            isOpen={!!editingRouteId}
          />
        )}
      </div>
    </ToastProvider>
  );
} 