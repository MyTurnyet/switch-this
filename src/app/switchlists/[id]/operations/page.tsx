'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SwitchlistService } from '@/app/shared/services/SwitchlistService';
import { RollingStockService } from '@/app/shared/services/RollingStockService';
import { TrainRouteService } from '@/app/shared/services/TrainRouteService';
import { LocationService } from '@/app/shared/services/LocationService';
import { IndustryService } from '@/app/shared/services/IndustryService';
import { Switchlist, RollingStock, TrainRoute, Industry } from '@/app/shared/types/models';
import { Location } from '@/shared/types/models';

export default function SwitchlistOperationsPage({ params }: { params: { id: string } }) {
  const [switchlist, setSwitchlist] = useState<Switchlist | null>(null);
  const [trainRoute, setTrainRoute] = useState<TrainRoute | null>(null);
  const [availableRollingStock, setAvailableRollingStock] = useState<RollingStock[]>([]);
  const [assignedRollingStock, setAssignedRollingStock] = useState<RollingStock[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const switchlistService = new SwitchlistService();
  const rollingStockService = new RollingStockService();
  const trainRouteService = new TrainRouteService();
  const locationService = new LocationService();
  const industryService = new IndustryService();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data in parallel
        const [
          switchlistData, 
          locationsData, 
          industriesData, 
          rollingStockData
        ] = await Promise.all([
          switchlistService.getSwitchlistById(params.id),
          locationService.getAllLocations(),
          industryService.getAllIndustries(),
          rollingStockService.getAllRollingStock()
        ]);
        
        setSwitchlist(switchlistData);
        setLocations(locationsData);
        setIndustries(industriesData);
        
        // Fetch associated train route
        const trainRouteData = await trainRouteService.getTrainRouteById(switchlistData.trainRouteId);
        setTrainRoute(trainRouteData);
        
        // In a real implementation, we would fetch assigned rolling stock from the backend
        // For now, we'll just simulate that all rolling stock is available
        setAvailableRollingStock(rollingStockData);
        setAssignedRollingStock([]);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching switchlist data:', err);
        setError('Failed to load switchlist operations data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);
  
  // Get location and industry names for display
  const getLocationName = (locationId?: string) => {
    if (!locationId) return 'Unknown';
    const location = locations.find(loc => loc._id === locationId);
    return location ? location.stationName : 'Unknown';
  };
  
  const getIndustryName = (industryId?: string) => {
    if (!industryId) return 'Unknown';
    const industry = industries.find(ind => ind._id === industryId);
    return industry ? industry.name : 'Unknown';
  };

  // Empty handler for the Build Train button
  const handleBuildTrain = () => {
    console.log('Build Train button clicked, but functionality has been removed');
  };
  
  const handleAssignRollingStock = (rollingStock: RollingStock) => {
    // In a real implementation, we would call an API to assign the rolling stock
    // For now, we'll just update our local state
    setAvailableRollingStock(current => 
      current.filter(rs => rs._id !== rollingStock._id)
    );
    setAssignedRollingStock(current => [...current, rollingStock]);
  };
  
  const handleRemoveRollingStock = (rollingStock: RollingStock) => {
    // In a real implementation, we would call an API to remove the assignment
    // For now, we'll just update our local state
    setAssignedRollingStock(current => 
      current.filter(rs => rs._id !== rollingStock._id)
    );
    setAvailableRollingStock(current => [...current, rollingStock]);
  };
  
  // Render loading state
  if (loading && !switchlist) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading switchlist operations data...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error && !switchlist) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link href={`/switchlists/${params.id}`} className="text-primary-600 hover:underline">
          ← Back to Switchlist
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <Link href={`/switchlists/${params.id}`} className="text-primary-600 hover:underline mb-2 inline-block">
            ← Back to Switchlist
          </Link>
          <h1 className="text-3xl font-bold">Switchlist Operations</h1>
          {switchlist && (
            <p className="text-gray-600">
              {switchlist.name} - {trainRoute?.name} ({trainRoute?.routeNumber})
            </p>
          )}
        </div>
        
        <div className="mt-4 sm:mt-0">
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
            ${switchlist?.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
              switchlist?.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
              'bg-gray-100 text-gray-800'}`}
          >
            {switchlist?.status}
          </span>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <button
          onClick={handleBuildTrain}
          disabled={true}
          className="px-4 py-2 rounded-md bg-gray-300 text-gray-500 cursor-not-allowed"
        >
          Build Train functionality has been removed.
        </button>
        <p className="text-sm text-gray-500 mt-1">
          Build Train functionality has been removed.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assigned Rolling Stock */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Assigned Rolling Stock</h2>
          </div>
          <div className="p-4">
            {assignedRollingStock.length === 0 ? (
              <p className="text-gray-500">No rolling stock assigned to this switchlist yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {assignedRollingStock.map(rs => (
                  <li key={rs._id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{rs.roadName} {rs.roadNumber}</p>
                      <p className="text-sm text-gray-500">{rs.aarType} - {rs.description}</p>
                      {rs.destination?.immediateDestination && (
                        <p className="text-xs text-blue-500">
                          Destination: {getLocationName(rs.destination.immediateDestination.locationId)} - 
                          {getIndustryName(rs.destination.immediateDestination.industryId)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveRollingStock(rs)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Available Rolling Stock */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Available Rolling Stock</h2>
          </div>
          <div className="p-4">
            {availableRollingStock.length === 0 ? (
              <p className="text-gray-500">No rolling stock available.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {availableRollingStock.map(rs => (
                  <li key={rs._id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{rs.roadName} {rs.roadNumber}</p>
                      <p className="text-sm text-gray-500">{rs.aarType} - {rs.description}</p>
                      {rs.currentLocation?.industryId && (
                        <p className="text-xs text-gray-500">
                          Current location: {getIndustryName(rs.currentLocation.industryId)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAssignRollingStock(rs)}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors"
                    >
                      Assign
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {trainRoute && (
        <TrainRouteProgress trainRoute={trainRoute} locations={locations} />
      )}
      
      <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Operations</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500 mb-4">
            This panel shows operations for the current switchlist. You can:
          </p>
          <ul className="list-disc ml-6 text-gray-600 space-y-1">
            <li>The &quot;Build Train&quot; functionality has been removed</li>
            <li>Manually assign or remove rolling stock using the panels above</li>
            <li>View the complete switchlist in the Print view</li>
          </ul>
          
          <div className="mt-6 border-t border-gray-200 pt-4">
            <Link href={`/switchlists/${params.id}/print`} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
              View Printable Switchlist
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RouteStationProps {
  name: string;
  isTerminal: boolean;
  isVisited?: boolean;
}

const RouteStation: React.FC<RouteStationProps> = ({ name, isTerminal, isVisited = false }) => {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-4 h-4 rounded-full ${isVisited ? 'bg-primary-600' : 'bg-gray-300'} ${isTerminal ? 'border-2 border-primary-800' : ''}`} />
      <span className="text-xs mt-1 text-center">{name}</span>
    </div>
  );
};

interface TrainRouteProgressProps {
  trainRoute: TrainRoute | null;
  locations: Location[];
}

const TrainRouteProgress: React.FC<TrainRouteProgressProps> = ({ trainRoute, locations }) => {
  if (!trainRoute) return null;
  
  // Get station names in order
  const stationNames = trainRoute.stations.map(stationId => {
    const location = locations.find(loc => loc._id === stationId);
    return location ? location.stationName : 'Unknown';
  });
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6 mb-6">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Train Route</h2>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center">
          {stationNames.map((name, index) => (
            <React.Fragment key={index}>
              <RouteStation 
                name={name} 
                isTerminal={index === 0 || index === stationNames.length - 1} 
                isVisited={true} // All stations are considered visited in this view
              />
              {index < stationNames.length - 1 && (
                <div className="h-0.5 bg-primary-600 flex-grow mx-1" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}; 