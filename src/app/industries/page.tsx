'use client';

import React, { useEffect, useState } from 'react';
import { services } from '@/app/shared/services';
import { Industry } from '@/app/shared/types/models';
import { groupIndustriesByLocationAndBlock, GroupedIndustries } from '@/app/layout-state/utils/groupIndustries';
import { Card, CardHeader, CardContent } from '@/app/components/ui/card';
import { EditIndustryForm } from '@/app/components/EditIndustryForm';
import { AddIndustryForm } from '@/app/components/AddIndustryForm';
import { IndustryService } from '@/app/shared/services/IndustryService';

export default function IndustriesPage() {
  const [groupedIndustries, setGroupedIndustries] = useState<GroupedIndustries>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
  const [isAddingIndustry, setIsAddingIndustry] = useState(false);
  const industryService = new IndustryService();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [locationsData, industriesData] = await Promise.all([
          services.locationService.getAllLocations(),
          industryService.getAllIndustries() // Use the updated service with type conversion
        ]);
        
        // Use the data that's already converted by the service
        const grouped = groupIndustriesByLocationAndBlock(industriesData, locationsData);
        setGroupedIndustries(grouped);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    }

    fetchData();
  }, []);

  const handleIndustryClick = (industry: Industry) => {
    setEditingIndustry(industry);
  };

  const handleSaveIndustry = async (updatedIndustry: Industry) => {
    try {
      // Update the grouped industries with the updated industry
      const newGroupedIndustries = { ...groupedIndustries };
      const locationGroup = newGroupedIndustries[updatedIndustry.locationId];
      
      if (locationGroup) {
        // Find the block that contains this industry
        Object.keys(locationGroup.blocks).forEach(blockName => {
          const blockIndustries = locationGroup.blocks[blockName];
          const industryIndex = blockIndustries.findIndex(ind => ind._id === updatedIndustry._id);
          
          if (industryIndex !== -1) {
            // Replace the industry with the updated one
            blockIndustries[industryIndex] = updatedIndustry;
          }
        });
      }
      
      setGroupedIndustries(newGroupedIndustries);
      setEditingIndustry(null);
    } catch (err) {
      console.error('Error updating industry in UI:', err);
      // Optionally show an error message
    }
  };

  const handleAddNewIndustry = () => {
    setIsAddingIndustry(true);
  };

  const handleSaveNewIndustry = async (newIndustry: Industry) => {
    try {
      // Add the new industry to the grouped industries
      const newGroupedIndustries = { ...groupedIndustries };
      const locationGroup = newGroupedIndustries[newIndustry.locationId];
      
      if (locationGroup) {
        // Check if the block exists
        if (!locationGroup.blocks[newIndustry.blockName]) {
          locationGroup.blocks[newIndustry.blockName] = [];
        }
        
        // Add the new industry to the block
        locationGroup.blocks[newIndustry.blockName].push(newIndustry);
      } else {
        // If the location doesn't exist in our current grouped data, fetch the data again
        const locationsData = await services.locationService.getAllLocations();
        const location = locationsData.find(loc => loc._id === newIndustry.locationId);
        
        if (location) {
          newGroupedIndustries[newIndustry.locationId] = {
            locationName: location.stationName,
            blocks: {
              [newIndustry.blockName]: [newIndustry]
            }
          };
        }
      }
      
      setGroupedIndustries(newGroupedIndustries);
      setIsAddingIndustry(false);
    } catch (err) {
      console.error('Error adding new industry to UI:', err);
      // Optionally show an error message
    }
  };

  const handleCancelEdit = () => {
    setEditingIndustry(null);
  };

  const handleCancelAdd = () => {
    setIsAddingIndustry(false);
  };

  const getIndustryTypeStyle = (type: string) => {
    switch (type) {
      case 'FREIGHT':
        return 'border-blue-200 bg-blue-50';
      case 'YARD':
        return 'border-green-200 bg-green-50';
      case 'PASSENGER':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading industries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (editingIndustry) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Edit Industry</h1>
        <EditIndustryForm 
          industry={editingIndustry} 
          onSave={handleSaveIndustry} 
          onCancel={handleCancelEdit} 
        />
      </div>
    );
  }

  if (isAddingIndustry) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Add New Industry</h1>
        <AddIndustryForm 
          onSave={handleSaveNewIndustry} 
          onCancel={handleCancelAdd} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Industries by Location and Block</h1>
        <button
          onClick={handleAddNewIndustry}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow"
        >
          Add New Industry
        </button>
      </div>
      
      {Object.keys(groupedIndustries).length === 0 ? (
        <div className="text-xl text-gray-500">No industries found.</div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedIndustries).map(([locationId, locationGroup]) => (
            <div key={locationId} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">
                {locationGroup.locationName}
              </h2>
              
              {Object.entries(locationGroup.blocks).map(([blockName, blockIndustries]) => (
                <div key={blockName} className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Block: {blockName}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {blockIndustries.map((industry) => (
                      <Card key={industry._id} className={getIndustryTypeStyle(industry.industryType)}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <div 
                              className="text-lg font-semibold leading-none tracking-tight cursor-pointer hover:text-blue-600 hover:underline"
                              onClick={() => handleIndustryClick(industry)}
                            >
                              {industry.name}
                            </div>
                            <span className="text-sm font-medium px-2 py-1 rounded-full bg-white bg-opacity-60">
                              {industry.industryType}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-gray-600">
                            <div>Tracks: {industry.tracks.length}</div>
                            {industry.description && (
                              <div className="mt-2">{industry.description}</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 