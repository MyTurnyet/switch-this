'use client';

import React, { useEffect, useState } from 'react';
import { services } from '@/app/shared/services/clientServices';
import { Industry, LocationType, Location } from '@/app/shared/types/models';
import { groupIndustriesByLocationAndBlock, GroupedIndustries } from '@/app/layout-state/utils/groupIndustries';
import { Card, CardHeader, CardContent, PageContainer, Badge, ConfirmDialog } from '@/app/components/ui';
import { AddIndustryForm } from '@/app/components/AddIndustryForm';
import EditIndustryModal from '@/app/industries/components/EditIndustryModal';

export default function IndustriesPage() {
  const [groupedIndustries, setGroupedIndustries] = useState<GroupedIndustries>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
    setIsEditModalOpen(true);
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
      setIsEditModalOpen(false);
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
    setIsEditModalOpen(false);
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

  return (
    <PageContainer 
      title="Industries" 
      actions={[
        { label: 'Add New Industry', onClick: handleAddNewIndustry }
      ]}
    >
      {/* Edit Industry Modal */}
      <EditIndustryModal
        industry={editingIndustry}
        isOpen={isEditModalOpen}
        onSave={handleSaveIndustry}
        onCancel={handleCancelEdit}
      />
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Industry"
        description={`Are you sure you want to delete ${industryToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        destructive
      />
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : Object.keys(groupedIndustries).length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-500">No industries added yet</h3>
          <p className="mt-2 text-sm text-gray-400">Get started by adding a new industry</p>
          <button
            onClick={handleAddNewIndustry}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Industry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortLocationsByType(groupedIndustries, locations).map(([locationId, locationGroup]) => {
            const location = locations.find(l => l._id === locationId);
            
            return (
              <Card key={locationId}>
                <CardHeader>
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium">
                      {locationGroup.locationName}
                    </h3>
                    {location && getLocationTypeIndicator(location.locationType)}
                  </div>
                </CardHeader>
                <CardContent>
                  {Object.entries(locationGroup.blocks).map(([blockName, industries]) => (
                    <div key={blockName} className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">{blockName}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {industries.map((industry) => (
                          <div 
                            key={industry._id} 
                            className="border rounded p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleIndustryClick(industry)}
                          >
                            <div className="flex justify-between">
                              <div>
                                <h5 className="font-medium">{industry.name}</h5>
                                <Badge className={`mt-1 ${getIndustryTypeStyle(industry.industryType)}`}>
                                  {industry.industryType}
                                </Badge>
                              </div>
                              <button
                                onClick={(e) => handleDeleteClick(e, industry)}
                                className="text-gray-400 hover:text-red-500"
                                title="Delete Industry"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              </button>
                            </div>
                            {industry.description && (
                              <p className="text-sm text-gray-600 mt-2">{industry.description}</p>
                            )}
                            {industry.tracks && industry.tracks.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-gray-500">Tracks: {industry.tracks.length}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
} 