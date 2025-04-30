'use client';

import React, { useEffect, useState } from 'react';
import { services } from '@/app/shared/services';
import { Card, CardHeader, CardContent } from '@/app/components/ui/card';

// Define the interfaces explicitly here to avoid import conflicts
interface Location {
  _id: string;
  stationName: string;
  block: string;
  ownerId: string;
}

// Define the TrainRoute interface to match what comes from the database
interface TrainRoute {
  _id: string;
  name: string;
  routeNumber: string;
  routeType: 'MIXED' | 'PASSENGER' | 'FREIGHT';
  originatingYardId: string;
  terminatingYardId: string;
  stations: string[]; // Array of location IDs, not Location objects
  ownerId: string;
}

export default function TrainRoutesPage() {
  const [trainRoutes, setTrainRoutes] = useState<TrainRoute[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        console.log('Fetching train routes and locations from the database...');
        const [trainRoutesData, locationsData] = await Promise.all([
          services.trainRouteService.getAllTrainRoutes(),
          services.locationService.getAllLocations()
        ]);
        
        console.log('Received train routes:', trainRoutesData);
        console.log('Received locations:', locationsData);
        
        // Use type assertion with 'unknown' to bridge between the different interfaces
        setTrainRoutes(trainRoutesData as unknown as TrainRoute[]);
        setLocations(locationsData as unknown as Location[]);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    }

    fetchData();
  }, []);

  const getLocationNameById = (locationId: string): string => {
    const location = locations.find(loc => loc._id === locationId);
    return location ? location.stationName : 'Unknown Location';
  };

  const getRouteTypeColor = (routeType: 'MIXED' | 'PASSENGER' | 'FREIGHT'): string => {
    switch (routeType) {
      case 'PASSENGER':
        return 'bg-purple-100 text-purple-800';
      case 'FREIGHT':
        return 'bg-blue-100 text-blue-800';
      case 'MIXED':
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 px-4 text-center">Loading train routes...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Train Routes</h1>
      </div>
      
      {trainRoutes.length === 0 ? (
        <div className="text-xl text-gray-500">No train routes found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trainRoutes.map((route) => (
            <Card key={route._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{route.name}</h2>
                    <p className="text-sm text-gray-500">{route.routeNumber}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRouteTypeColor(route.routeType)}`}>
                    {route.routeType}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Route Details</div>
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Originating Yard:</span>
                      <span>{getLocationNameById(route.originatingYardId)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Terminating Yard:</span>
                      <span>{getLocationNameById(route.terminatingYardId)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Stations</div>
                  <div className="space-y-1">
                    {route.stations && route.stations.length > 0 ? (
                      route.stations.map((stationId, index) => (
                        <div 
                          key={stationId}
                          className="flex items-center py-1"
                        >
                          <div className="flex-shrink-0 w-6 text-center text-gray-500">{index + 1}.</div>
                          <div className="ml-2">{getLocationNameById(stationId)}</div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No stations assigned to this route</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 