'use client';

import React, { useEffect, useState } from 'react';
import { services } from '@/app/shared/services';
import { Industry } from '@/app/shared/types/models';
import { groupIndustriesByLocationAndBlock, GroupedIndustries } from '@/app/layout-state/utils/groupIndustries';
import { Card, CardHeader, CardContent, PageContainer, Badge } from '@/app/components/ui';
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
        return 'primary';
      case 'YARD':
        return 'success';
      case 'PASSENGER':
        return 'secondary';
      default:
        return 'info';
    }
  };

  if (editingIndustry) {
    return (
      <PageContainer title="Edit Industry">
        <EditIndustryForm 
          industry={editingIndustry} 
          onSave={handleSaveIndustry} 
          onCancel={handleCancelEdit} 
        />
      </PageContainer>
    );
  }

  if (isAddingIndustry) {
    return (
      <PageContainer title="Add New Industry">
        <AddIndustryForm 
          onSave={handleSaveNewIndustry} 
          onCancel={handleCancelAdd} 
        />
      </PageContainer>
    );
  }

  const actions = [
    {
      label: 'Add New Industry',
      onClick: handleAddNewIndustry,
      variant: 'success' as const,
    }
  ];

  return (
    <PageContainer 
      title="Industries by Location and Block" 
      isLoading={loading}
      error={error || undefined}
      actions={actions}
    >
      {Object.keys(groupedIndustries).length === 0 && !loading ? (
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {blockIndustries.map(industry => (
                      <div key={industry._id} className="cursor-pointer" onClick={() => handleIndustryClick(industry)}>
                        <Card className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div className="font-bold text-lg">{industry.name}</div>
                              <Badge variant={getIndustryTypeStyle(industry.industryType)}>
                                {industry.industryType}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <p><span className="font-medium">Tracks: </span>{industry.tracks.length}</p>
                              {industry.description && (
                                <p><span className="font-medium">Description: </span>{industry.description}</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
} 