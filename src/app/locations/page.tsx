'use client';

import React, { useEffect, useState } from 'react';
import { Location, Block } from '@/app/shared/types/models';
import { LocationService } from '@/app/shared/services/LocationService';
import { BlockService } from '@/app/shared/services/BlockService';
import { 
  PageContainer, 
  DataTable, 
  Button, 
  Badge,
  Pagination,
  ToastProvider,
  useToast,
  ConfirmDialog,
  ActionButton
} from '@/app/components/ui';
import { Column } from '@/app/components/ui/data-table';
import { SortDirection } from '@/app/components/ui/data-table';
import EditLocationModal from './components/EditLocationModal';
import BlocksSection from './components/BlocksSection';

export default function LocationsPage() {
  return (
    <ToastProvider>
      <LocationsContent />
    </ToastProvider>
  );
}

function LocationsContent() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [paginatedLocations, setPaginatedLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>('stationName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { toast } = useToast();
  
  const itemsPerPage = 10;
  const locationService = new LocationService();
  const blockService = new BlockService();

  // Fetch data on component mount
  useEffect(() => {
    fetchLocations();
    fetchBlocks();
  }, []);

  // Fetch locations from API
  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await locationService.getAllLocations();
      setLocations(data);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch blocks from API
  const fetchBlocks = async () => {
    try {
      const data = await blockService.getAllBlocks();
      setBlocks(data);
    } catch (err) {
      console.error('Failed to fetch blocks:', err);
      // Don't set error state as the blocks are secondary
    }
  };

  // Edit location
  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
  };
  
  // Create new location
  const handleCreate = () => {
    setSelectedLocation(null);
    setIsModalOpen(true);
  };

  // Click on delete button
  const handleDeleteClick = (location: Location) => {
    setLocationToDelete(location);
    setIsDeleteDialogOpen(true);
  };

  // Get block name for a location
  const getBlockName = (blockId?: string): string => {
    if (!blockId) return '-';
    const block = blocks.find(b => b._id === blockId);
    return block ? block.blockName : blockId;
  };

  // Table columns
  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'stationName',
      header: 'Station Name',
      sortable: true
    },
    {
      key: 'block',
      header: 'Block',
      accessor: (item: Record<string, unknown>) => {
        const location = item as unknown as Location;
        // Display block name using blockId if available, otherwise use legacy block field
        return location.blockId ? getBlockName(location.blockId) : (location.block || '-');
      },
      sortable: true
    },
    {
      key: 'locationType',
      header: 'Type',
      accessor: (item: Record<string, unknown>) => {
        const location = item as unknown as Location;
        return (
          <Badge variant="secondary">
            {location.locationType?.replace('_', ' ') || 'Unknown'}
          </Badge>
        );
      },
      sortable: true
    },
    {
      key: 'description',
      header: 'Description',
      accessor: (item: Record<string, unknown>) => {
        const location = item as unknown as Location;
        return location.description || '-';
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (item: Record<string, unknown>) => {
        const location = item as unknown as Location;
        return (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleEdit(location)}
            >
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="danger"
              onClick={() => handleDeleteClick(location)}
            >
              Delete
            </Button>
          </div>
        );
      }
    }
  ];

  // Action buttons for page header
  const actions: ActionButton[] = [
    {
      label: 'Add New Location',
      onClick: handleCreate,
      variant: 'primary'
    }
  ];

  // Sort the data and update pagination
  useEffect(() => {
    if (!locations.length) return;
    
    let sortedData = [...locations];
    
    if (sortColumn) {
      sortedData.sort((a, b) => {
        // Special case for block column which might use blockId
        if (sortColumn === 'block') {
          const aBlockName = a.blockId ? getBlockName(a.blockId) : (a.block || '');
          const bBlockName = b.blockId ? getBlockName(b.blockId) : (b.block || '');
          return sortDirection === 'asc' 
            ? aBlockName.localeCompare(bBlockName) 
            : bBlockName.localeCompare(aBlockName);
        }
        
        const aValue = a[sortColumn as keyof Location];
        const bValue = b[sortColumn as keyof Location];
        
        if (aValue === undefined || bValue === undefined) return 0;
        
        // String comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        // Number comparison
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' 
            ? aValue - bValue 
            : bValue - aValue;
        }
        
        return 0;
      });
    }
    
    // Paginate the sorted data
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedLocations(sortedData.slice(startIndex, endIndex));
  }, [currentPage, locations, sortColumn, sortDirection, blocks]);

  // Handle sort change
  const handleSort = (columnId: string, direction: SortDirection) => {
    setSortColumn(columnId);
    setSortDirection(direction);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Save location (create or update)
  const handleSave = async (updatedLocation: Location): Promise<void> => {
    try {
      if (updatedLocation._id) {
        // Update existing location
        await locationService.updateLocation(updatedLocation._id, updatedLocation);
        setLocations(prev => 
          prev.map(item => item._id === updatedLocation._id ? updatedLocation : item)
        );
      } else {
        // Create new location
        const newLocation = await locationService.createLocation(updatedLocation);
        setLocations(prev => [...prev, newLocation]);
      }
      setIsModalOpen(false);
      toast({
        title: updatedLocation._id ? 'Location Updated' : 'Location Created',
        description: `Successfully ${updatedLocation._id ? 'updated' : 'created'} location: ${updatedLocation.stationName}`,
        variant: 'success'
      });
    } catch (error) {
      console.error('Failed to save location:', error);
      toast({
        title: 'Error',
        description: `Failed to save location: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'error'
      });
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return;
    
    try {
      await locationService.deleteLocation(locationToDelete._id);
      setLocations(prev => prev.filter(location => location._id !== locationToDelete._id));
      toast({
        title: 'Location Deleted',
        description: `Successfully deleted location: ${locationToDelete.stationName}`,
        variant: 'success'
      });
    } catch (error) {
      console.error('Failed to delete location:', error);
      toast({
        title: 'Error',
        description: `Failed to delete location: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'error'
      });
    } finally {
      setLocationToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Cancel delete
  const handleDeleteCancel = () => {
    setLocationToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  return (
    <PageContainer
      title="Locations"
      description="Manage your layout locations"
      actions={actions}
    >
      {/* Blocks Section */}
      <BlocksSection />
      
      {/* Locations Section */}
      {error && (
        <div className="error-message p-4 mb-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <DataTable
        columns={columns}
        data={paginatedLocations as unknown as Record<string, unknown>[]}
        keyExtractor={(item) => (item as unknown as Location)._id}
        isLoading={loading}
        onSort={handleSort}
        sortColumn={sortColumn || undefined}
        sortDirection={sortDirection}
      />
      
      {locations.length > itemsPerPage && (
        <div className="mt-6">
          <Pagination
            totalItems={locations.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      
      <EditLocationModal
        location={selectedLocation}
        blocks={blocks}
        isOpen={isModalOpen}
        onSave={handleSave}
        onCancel={handleCloseModal}
      />
      
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title={`Delete Location: ${locationToDelete?.stationName}`}
        description="Are you sure you want to delete this location? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteCancel}
      />
    </PageContainer>
  );
} 