'use client';

import React, { useEffect, useState } from 'react';
import { services } from '@/app/shared/services/clientServices';
import { Industry, LocationType, Location } from '@/app/shared/types/models';
import { groupIndustriesByLocationAndBlock, GroupedIndustries } from '@/app/layout-state/utils/groupIndustries';
import { Card, CardHeader, CardContent, PageContainer, Badge, ConfirmDialog } from '@/app/components/ui';
import { EditIndustryForm } from '@/app/components/EditIndustryForm';
import { AddIndustryForm } from '@/app/components/AddIndustryForm';

export default function IndustriesPage() {
  const [groupedIndustries, setGroupedIndustries] = useState<GroupedIndustries>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
  const [isAddingIndustry, setIsAddingIndustry] = useState(false);
  const [industryToDelete, setIndustryToDelete] = useState<Industry | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [locationsData, industriesData] = await Promise.all([
          services.locationService.getAllLocations(),
          services.industryService.getAllIndustries()
        ]);
        
        setLocations(locationsData);
        
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
      await services.industryService.updateIndustry(updatedIndustry._id, updatedIndustry);
      
      const newGroupedIndustries = { ...groupedIndustries };
      const locationGroup = newGroupedIndustries[updatedIndustry.locationId];
      
      if (locationGroup) {
        Object.keys(locationGroup.blocks).forEach(blockName => {
          const blockIndustries = locationGroup.blocks[blockName];
          const industryIndex = blockIndustries.findIndex(ind => ind._id === updatedIndustry._id);
          
          if (industryIndex !== -1) {
            blockIndustries[industryIndex] = updatedIndustry;
          }
        });
      }
      
      setGroupedIndustries(newGroupedIndustries);
      setEditingIndustry(null);
    } catch (err) {
      console.error('Error updating industry in UI:', err);
    }
  };

  const handleAddNewIndustry = () => {
    setIsAddingIndustry(true);
  };

  const handleSaveNewIndustry = async (newIndustry: Industry) => {
    try {
      const savedIndustry = await services.industryService.createIndustry(newIndustry);
      
      const newGroupedIndustries = { ...groupedIndustries };
      const locationGroup = newGroupedIndustries[newIndustry.locationId];
      
      if (locationGroup) {
        if (!locationGroup.blocks[newIndustry.blockName]) {
          locationGroup.blocks[newIndustry.blockName] = [];
        }
        
        locationGroup.blocks[newIndustry.blockName].push(savedIndustry);
      } else {
        const locationsData = await services.locationService.getAllLocations();
        const location = locationsData.find(loc => loc._id === newIndustry.locationId);
        
        if (location) {
          newGroupedIndustries[newIndustry.locationId] = {
            locationName: location.stationName,
            blocks: {
              [newIndustry.blockName]: [savedIndustry]
            }
          };
        }
      }
      
      setGroupedIndustries(newGroupedIndustries);
      setIsAddingIndustry(false);
    } catch (err) {
      console.error('Error adding new industry to UI:', err);
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

  const getLocationTypeStyle = (locationType?: LocationType): string => {
    switch (locationType) {
      case LocationType.ON_LAYOUT:
        return 'bg-emerald-50 border-emerald-200';
      case LocationType.OFF_LAYOUT:
        return 'bg-amber-50 border-amber-200';
      case LocationType.FIDDLE_YARD:
        return 'bg-violet-50 border-violet-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getLocationTypeIndicator = (locationType?: LocationType) => {
    switch (locationType) {
      case LocationType.ON_LAYOUT:
        return (
          <Badge className="ml-2 bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200">
            ON LAYOUT
          </Badge>
        );
      case LocationType.OFF_LAYOUT:
        return (
          <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">
            OFF LAYOUT
          </Badge>
        );
      case LocationType.FIDDLE_YARD:
        return (
          <Badge className="ml-2 bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200">
            FIDDLE YARD
          </Badge>
        );
      default:
        return null;
    }
  };

  const sortLocationsByType = (groupedIndustries: GroupedIndustries, locationsList: Location[]) => {
    const typePriority: Record<string, number> = {
      'ON_LAYOUT': 1,
      'FIDDLE_YARD': 2,
      'OFF_LAYOUT': 3,
      'undefined': 4
    };
    
    return Object.entries(groupedIndustries).sort((a, b) => {
      const locationA = locationsList.find(loc => loc._id === a[0]);
      const locationB = locationsList.find(loc => loc._id === b[0]);
      
      const typeA = locationA?.locationType || 'undefined';
      const typeB = locationB?.locationType || 'undefined';
      
      return typePriority[typeA as keyof typeof typePriority] - typePriority[typeB as keyof typeof typePriority];
    });
  };

  const handleDeleteClick = (event: React.MouseEvent, industry: Industry) => {
    event.stopPropagation();
    setIndustryToDelete(industry);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!industryToDelete) return;
    
    try {
      setLoading(true);
      await services.industryService.deleteIndustry(industryToDelete._id);
      
      const newGroupedIndustries = { ...groupedIndustries };
      const locationGroup = newGroupedIndustries[industryToDelete.locationId];
      
      if (locationGroup) {
        Object.keys(locationGroup.blocks).forEach(blockName => {
          const blockIndustries = locationGroup.blocks[blockName];
          const industryIndex = blockIndustries.findIndex(ind => ind._id === industryToDelete._id);
          
          if (industryIndex !== -1) {
            blockIndustries.splice(industryIndex, 1);
            
            if (blockIndustries.length === 0) {
              delete locationGroup.blocks[blockName];
            }
          }
        });
        
        if (Object.keys(locationGroup.blocks).length === 0) {
          delete newGroupedIndustries[industryToDelete.locationId];
        }
      }
      
      setGroupedIndustries(newGroupedIndustries);
      setIsDeleteDialogOpen(false);
      setIndustryToDelete(null);
    } catch (err) {
      console.error('Failed to delete industry:', err);
      setError('Failed to delete industry. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setIndustryToDelete(null);
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
      {isDeleteDialogOpen && industryToDelete && (
        <ConfirmDialog
          title="Delete Industry"
          description={`Are you sure you want to delete "${industryToDelete.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          destructive={true}
          isOpen={isDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          onClose={handleDeleteCancel}
        />
      )}
      
      {Object.keys(groupedIndustries).length === 0 && !loading ? (
        <div className="text-xl text-gray-500">No industries found.</div>
      ) : (
        <div className="space-y-12">
          {sortLocationsByType(groupedIndustries, locations).map(([locationId, locationGroup]) => {
            const location = locations.find(loc => loc._id === locationId);
            const locationType = location?.locationType;
            
            return (
              <div key={locationId} className="space-y-6">
                <h2 className={`text-2xl font-bold text-gray-900 border-b pb-2 flex items-center p-2 rounded ${getLocationTypeStyle(locationType)}`}>
                  {locationGroup.locationName}
                  {getLocationTypeIndicator(locationType)}
                </h2>
                
                {Object.entries(locationGroup.blocks)
                  .sort(([blockNameA], [blockNameB]) => blockNameA.localeCompare(blockNameB))
                  .map(([blockName, blockIndustries]) => (
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
                                <div className="flex items-center space-x-2">
                                  <Badge variant={getIndustryTypeStyle(industry.industryType)}>
                                    {industry.industryType}
                                  </Badge>
                                  <button 
                                    onClick={(e) => handleDeleteClick(e, industry)}
                                    className="text-red-500 hover:text-red-700 focus:outline-none"
                                    aria-label={`Delete ${industry.name}`}
                                    data-testid={`delete-industry-${industry._id}`}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
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
            );
          })}
        </div>
      )}
    </PageContainer>
  );
} 