'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SwitchlistService } from '@/app/shared/services/SwitchlistService';
import { RollingStockService } from '@/app/shared/services/RollingStockService';
import { TrainRouteService } from '@/app/shared/services/TrainRouteService';
import { LocationService } from '@/app/shared/services/LocationService';
import { IndustryService } from '@/app/shared/services/IndustryService';
import { Switchlist, RollingStock, TrainRoute, Industry, IndustryType } from '@/app/shared/types/models';
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
  const [buildingTrain, setBuildingTrain] = useState(false);
  
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

  // Function to get random industry from route for car assignment
  const getRandomIndustryAlongRoute = () => {
    if (!trainRoute || !industries.length) return null;
    
    // Filter for industries that are at locations along the route (excluding yards)
    const routeStations = trainRoute.stations;
    const routeIndustries = industries.filter(industry => {
      // Exclude the originating and terminating yards
      if (industry.locationId === trainRoute.originatingYardId || 
          industry.locationId === trainRoute.terminatingYardId) {
        return false;
      }
      
      // Check if the industry is a freight industry - try with enum value first
      const isFreightIndustry = 
        industry.industryType === IndustryType.FREIGHT || 
        (typeof industry.industryType === 'string' && 
         industry.industryType.toUpperCase() === 'FREIGHT');
      
      // Include only industries at locations along the route
      return routeStations.includes(industry.locationId) && isFreightIndustry;
    });
    
    console.log("Available industries along route for assignment:", routeIndustries);
    
    if (routeIndustries.length === 0) {
      // If no freight industries found, try to find any industry along the route
      const anyIndustryAlongRoute = industries.filter(industry => {
        // Exclude the originating and terminating yards
        if (industry.locationId === trainRoute.originatingYardId || 
            industry.locationId === trainRoute.terminatingYardId) {
          return false;
        }
        
        // Include any industry at locations along the route
        return routeStations.includes(industry.locationId);
      });
      
      console.log("No freight industries found, using any industries:", anyIndustryAlongRoute);
      
      if (anyIndustryAlongRoute.length === 0) {
        // If still no industries, return the terminating yard as fallback
        console.log("No industries found along route, using terminating yard as fallback");
        return getTerminatingYardIndustry();
      }
      
      // Return a random industry from any industries found
      const randomIndex = Math.floor(Math.random() * anyIndustryAlongRoute.length);
      return anyIndustryAlongRoute[randomIndex];
    }
    
    // Return a random industry from freight industries
    const randomIndex = Math.floor(Math.random() * routeIndustries.length);
    return routeIndustries[randomIndex];
  };
  
  // Function to get the industry at the terminating yard
  const getTerminatingYardIndustry = () => {
    if (!trainRoute) return null;
    
    // Find the industry at the terminating yard - try with enum value first
    let terminatingYardIndustry = industries.find(
      industry => industry.locationId === trainRoute.terminatingYardId && 
                  industry.industryType === IndustryType.YARD
    );
    
    // If not found, try with string value (case-insensitive)
    if (!terminatingYardIndustry) {
      terminatingYardIndustry = industries.find(
        industry => industry.locationId === trainRoute.terminatingYardId && 
                    (typeof industry.industryType === 'string' && 
                     industry.industryType.toUpperCase() === 'YARD')
      );
    }
    
    // If still not found, try with any industry that has "yard" in the name
    if (!terminatingYardIndustry) {
      terminatingYardIndustry = industries.find(
        industry => industry.locationId === trainRoute.terminatingYardId && 
                    (industry.name.toLowerCase().includes('yard'))
      );
    }
    
    // If still not found, try with any industry at the terminating yard
    if (!terminatingYardIndustry) {
      terminatingYardIndustry = industries.find(
        industry => industry.locationId === trainRoute.terminatingYardId
      );
    }
    
    // Final attempt: Look for any industry at any location that includes the same name as the terminating yard location
    if (!terminatingYardIndustry && trainRoute.terminatingYardId) {
      const terminatingLocation = locations.find(loc => loc._id === trainRoute.terminatingYardId);
      if (terminatingLocation) {
        const locationName = terminatingLocation.stationName.toLowerCase();
        terminatingYardIndustry = industries.find(
          industry => industry.name.toLowerCase().includes(locationName)
        );
      }
    }
    
    return terminatingYardIndustry;
  };
  
  const getOriginatingYardIndustry = () => {
    if (!trainRoute) return null;
    
    // Find the industry at the originating yard - try with enum value first
    let originatingYardIndustry = industries.find(
      industry => industry.locationId === trainRoute.originatingYardId && 
                  industry.industryType === IndustryType.YARD
    );
    
    // If not found, try with string value (case-insensitive)
    if (!originatingYardIndustry) {
      originatingYardIndustry = industries.find(
        industry => industry.locationId === trainRoute.originatingYardId && 
                    (typeof industry.industryType === 'string' && 
                     industry.industryType.toUpperCase() === 'YARD')
      );
    }
    
    // If still not found, try with any industry that has "yard" in the name
    if (!originatingYardIndustry) {
      originatingYardIndustry = industries.find(
        industry => industry.locationId === trainRoute.originatingYardId && 
                    (industry.name.toLowerCase().includes('yard'))
      );
    }
    
    // If still not found, try with any industry at the originating yard
    if (!originatingYardIndustry) {
      originatingYardIndustry = industries.find(
        industry => industry.locationId === trainRoute.originatingYardId
      );
    }
    
    // Final attempt: Look for any industry at any location that includes the same name as the originating yard location
    if (!originatingYardIndustry && trainRoute.originatingYardId) {
      const originatingLocation = locations.find(loc => loc._id === trainRoute.originatingYardId);
      if (originatingLocation) {
        const locationName = originatingLocation.stationName.toLowerCase();
        originatingYardIndustry = industries.find(
          industry => industry.name.toLowerCase().includes(locationName)
        );
      }
    }
    
    return originatingYardIndustry;
  };
  
  const handleBuildTrain = async () => {
    if (!trainRoute) return;
    
    try {
      setBuildingTrain(true);
      
      // Comprehensive debug logging
      console.log("========== BUILD TRAIN DEBUG ==========");
      console.log("Train Route:", trainRoute);
      console.log("Originating Yard ID:", trainRoute.originatingYardId);
      console.log("Terminating Yard ID:", trainRoute.terminatingYardId);
      
      // Log all available industries
      console.log("All Industries:", industries);
      console.log("Industries count:", industries.length);
      industries.forEach(industry => {
        console.log(`Industry: ${industry.name}, Type: ${industry.industryType}, Location: ${industry.locationId}`);
      });
      
      // Log all available locations
      console.log("All Locations:", locations);
      console.log("Locations count:", locations.length);
      locations.forEach(location => {
        console.log(`Location: ${location.stationName}, ID: ${location._id}`);
      });
      
      let originatingYardIndustry = getOriginatingYardIndustry();
      let terminatingYardIndustry = getTerminatingYardIndustry();
      
      console.log("Found Originating Yard Industry:", originatingYardIndustry);
      console.log("Found Terminating Yard Industry:", terminatingYardIndustry);
      
      // Create virtual yard industries if not found
      if (!originatingYardIndustry) {
        const originatingLocation = locations.find(loc => loc._id === trainRoute.originatingYardId);
        if (originatingLocation) {
          originatingYardIndustry = {
            _id: `virtual_${trainRoute.originatingYardId}`,
            name: `${originatingLocation.stationName} Yard`,
            locationId: trainRoute.originatingYardId,
            industryType: IndustryType.YARD,
            blockName: originatingLocation.block || 'YARD',
            tracks: [],
            ownerId: 'system'
          };
          console.log("Created virtual originating yard industry:", originatingYardIndustry);
        } else {
          console.error("Could not find originating location with ID:", trainRoute.originatingYardId);
        }
      }
      
      if (!terminatingYardIndustry) {
        const terminatingLocation = locations.find(loc => loc._id === trainRoute.terminatingYardId);
        if (terminatingLocation) {
          terminatingYardIndustry = {
            _id: `virtual_${trainRoute.terminatingYardId}`,
            name: `${terminatingLocation.stationName} Yard`,
            locationId: trainRoute.terminatingYardId,
            industryType: IndustryType.YARD,
            blockName: terminatingLocation.block || 'YARD',
            tracks: [],
            ownerId: 'system'
          };
          console.log("Created virtual terminating yard industry:", terminatingYardIndustry);
        } else {
          console.error("Could not find terminating location with ID:", trainRoute.terminatingYardId);
        }
      }
      
      if (!originatingYardIndustry || !terminatingYardIndustry) {
        console.error("Failed to find or create yard industries. Origin:", originatingYardIndustry, "Termination:", terminatingYardIndustry);
        setError('Could not find originating or terminating yard industries');
        setBuildingTrain(false);
        return;
      }
      
      // Get cars from the originating yard
      const carsFromOriginatingYard = availableRollingStock.filter(
        car => car.currentLocation?.industryId === originatingYardIndustry._id
      );
      
      console.log("Cars from originating yard:", carsFromOriginatingYard);
      
      // Get cars from industries along the route
      const carsAtIndustries = availableRollingStock.filter(car => {
        if (!car.currentLocation) return false;
        
        // Find the industry
        const industry = industries.find(ind => ind._id === car.currentLocation?.industryId);
        if (!industry) return false;
        
        // Check if this industry is along the route (not at yards)
        return trainRoute.stations.includes(industry.locationId) && 
               industry.locationId !== trainRoute.originatingYardId &&
               industry.locationId !== trainRoute.terminatingYardId;
      });
      
      console.log("Cars at industries along the route:", carsAtIndustries);
      console.log("================================");
      
      // Process cars from originating yard - assign destinations
      const updatedOriginatingYardCars = carsFromOriginatingYard.map(car => {
        const destinationIndustry = getRandomIndustryAlongRoute();
        
        if (destinationIndustry) {
          // Create a copy with destination
          return {
            ...car,
            destination: {
              immediateDestination: {
                locationId: destinationIndustry.locationId,
                industryId: destinationIndustry._id,
                trackId: 'track1' // Simplified for demo
              }
            }
          };
        }
        
        return car;
      });
      
      // Process cars from industries - assign terminating yard as destination
      const updatedIndustryCars = carsAtIndustries.map(car => {
        // Create a copy with destination to terminating yard
        return {
          ...car,
          destination: {
            immediateDestination: {
              locationId: terminatingYardIndustry.locationId,
              industryId: terminatingYardIndustry._id,
              trackId: 'track1' // Simplified for demo
            }
          }
        };
      });
      
      // Combine all cars for the train
      const allTrainCars = [...updatedOriginatingYardCars, ...updatedIndustryCars];
      
      // In a real implementation, we would update each car individually in the backend
      // For demo purposes, we'll just update our local state
      setAssignedRollingStock(allTrainCars);
      setAvailableRollingStock(current => 
        current.filter(car => 
          !allTrainCars.some(trainCar => trainCar._id === car._id)
        )
      );
      
      // Update switchlist status
      if (switchlist) {
        const updatedSwitchlist = {
          ...switchlist,
          status: 'IN_PROGRESS' as const
        };
        await switchlistService.updateSwitchlist(switchlist._id, updatedSwitchlist);
        setSwitchlist(updatedSwitchlist);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error building train:', err);
      setError('Failed to build train. Please try again later.');
    } finally {
      setBuildingTrain(false);
    }
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
          disabled={buildingTrain || assignedRollingStock.length > 0 || switchlist?.status === 'COMPLETED'}
          className={`px-4 py-2 rounded-md 
            ${buildingTrain || assignedRollingStock.length > 0 || switchlist?.status === 'COMPLETED' 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-primary-600 text-white hover:bg-primary-700'}`}
        >
          {buildingTrain ? 'Building Train...' : 'Build Train'}
        </button>
        <p className="text-sm text-gray-500 mt-1">
          {switchlist?.status === 'COMPLETED' 
            ? 'This switchlist has been completed.' 
            : assignedRollingStock.length > 0 
              ? 'Train has been built.' 
              : 'Click to automatically build a train with cars from the originating yard and pick up cars from industries along the route.'}
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
      
      <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Operations</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500 mb-4">
            This panel shows operations for the current switchlist. You can:
          </p>
          <ul className="list-disc ml-6 text-gray-600 space-y-1">
            <li>Build a train using the &quot;Build Train&quot; button above</li>
            <li>Cars from the originating yard will be assigned to industries along the route</li>
            <li>Cars at industries along the route will be picked up and sent to the terminating yard</li>
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