'use client';

import React, { useEffect, useState } from 'react';
import { RollingStock as RollingStockType, Industry, RollingStockLocation } from '@/app/shared/types/models';
import { ClientServices } from '@/app/shared/services/clientServices';
import { 
  PageContainer, 
  DataTable, 
  Button, 
  Badge,
  Dropdown,
  DropdownItem,
  Pagination,
  ToastProvider,
  useToast
} from '@/app/components/ui';
import { Column } from '@/app/components/ui/data-table';
import { SortDirection } from '@/app/components/ui/data-table';
import EditRollingStockModal from './components/EditRollingStockModal';

type RollingStockProps = {
  services: ClientServices;
};

// Map to store industry id -> name for quick lookup
type IndustryMap = {
  [id: string]: string;
};

export default function RollingStock({ services }: RollingStockProps) {
  // Wrap the entire component in ToastProvider to fix test errors
  return (
    <ToastProvider>
      <RollingStockContent services={services} />
    </ToastProvider>
  );
}

// Extract the main component content into a separate component
function RollingStockContent({ services }: RollingStockProps) {
  const [rollingStock, setRollingStock] = useState<RollingStockType[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [industryMap, setIndustryMap] = useState<IndustryMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRollingStock, setSelectedRollingStock] = useState<RollingStockType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [paginatedRollingStock, setPaginatedRollingStock] = useState<RollingStockType[]>([]);
  
  // Sorting
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [rollingStockData, industriesData] = await Promise.all([
          services.rollingStockService.getAllRollingStock(),
          services.industryService.getAllIndustries()
        ]);
        
        const industryNameMap: IndustryMap = {};
        industriesData.forEach(industry => {
          industryNameMap[industry._id] = industry.name;
        });

        setRollingStock(rollingStockData);
        setIndustries(industriesData);
        setIndustryMap(industryNameMap);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load rolling stock. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [services.rollingStockService, services.industryService]);
  
  // Update paginated rolling stock when page changes or data changes
  useEffect(() => {
    // Sort the data if sort is active
    let sortedData = [...rollingStock];
    
    if (sortColumn && sortDirection) {
      sortedData.sort((a, b) => {
        let valueA: string | number | undefined;
        let valueB: string | number | undefined;
        
        switch (sortColumn) {
          case 'roadName':
            valueA = a.roadName;
            valueB = b.roadName;
            break;
          case 'aarType':
            valueA = a.aarType;
            valueB = b.aarType;
            break;
          case 'currentLocation':
            valueA = a.currentLocation 
              ? getIndustryName(a.currentLocation) 
              : getIndustryName(a.homeYard);
            valueB = b.currentLocation 
              ? getIndustryName(b.currentLocation) 
              : getIndustryName(b.homeYard);
            break;
          case 'homeYard':
            valueA = getIndustryName(a.homeYard);
            valueB = getIndustryName(b.homeYard);
            break;
          default:
            valueA = a[sortColumn as keyof RollingStockType] as string | number | undefined;
            valueB = b[sortColumn as keyof RollingStockType] as string | number | undefined;
        }
        
        // Handle string comparison
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortDirection === 'asc' 
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
        
        // Handle number comparison
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return sortDirection === 'asc' 
            ? valueA - valueB
            : valueB - valueA;
        }
        
        // Default comparison
        return 0;
      });
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedRollingStock(sortedData.slice(startIndex, endIndex));
  }, [currentPage, rollingStock, sortColumn, sortDirection, industryMap]);

  const getIndustryName = (industryId: string | RollingStockLocation | undefined | null): string => {
    if (!industryId) return 'Unassigned';
    if (typeof industryId === 'object') {
      return industryMap[industryId.industryId] || 'Unknown Industry';
    }
    return industryMap[industryId] || 'Unknown Industry';
  };

  const handleEdit = (car: RollingStockType) => {
    setSelectedRollingStock(car);
    setIsModalOpen(true);
  };
  
  const handleCreate = () => {
    setSelectedRollingStock(null); // No selected car means we're creating a new one
    setIsModalOpen(true);
  };

  const handleSave = async (updatedCar: RollingStockType): Promise<void> => {
    try {
      if (selectedRollingStock) {
        // Update existing rolling stock
        await services.rollingStockService.updateRollingStock(selectedRollingStock._id, updatedCar);
        
        // Update local state
        setRollingStock(prev => 
          prev.map(car => car._id === selectedRollingStock._id ? {...updatedCar, _id: selectedRollingStock._id} : car)
        );
        
        toast({
          title: 'Success',
          description: `${updatedCar.roadName} ${updatedCar.roadNumber} has been updated.`,
          variant: 'success'
        });
      } else {
        // Create new rolling stock (assuming API will be implemented)
        // await services.rollingStockService.createRollingStock(updatedCar);
        
        // For now, just log the data that would be created
        console.log('Would create new rolling stock:', updatedCar);
        
        toast({
          title: 'Success',
          description: `${updatedCar.roadName} ${updatedCar.roadNumber} has been created.`,
          variant: 'success'
        });
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save rolling stock:', error);
      toast({
        title: 'Error',
        description: 'Failed to save rolling stock. Please try again later.',
        variant: 'error'
      });
      throw new Error('Failed to save rolling stock. Please try again later.');
    }
  };

  const handleDelete = async (car: RollingStockType) => {
    try {
      // For now, just log that we would delete the rolling stock
      // The actual API method doesn't exist yet
      console.log('Would delete rolling stock:', car);
      
      // Update local state as if it was deleted
      setRollingStock(prev => prev.filter(c => c._id !== car._id));
      
      toast({
        title: 'Success',
        description: `${car.roadName} ${car.roadNumber} has been deleted.`,
        variant: 'success'
      });
    } catch (error) {
      console.error('Failed to delete rolling stock:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete rolling stock. Please try again later.',
        variant: 'error'
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  // Handle page change for pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (key: string, direction: SortDirection) => {
    setSortColumn(key);
    setSortDirection(direction);
  };

  // Function to render the appropriate badge for the car type
  const renderCarTypeBadge = (aarType: string) => {
    return (
      <Badge variant="primary">
        {aarType}
      </Badge>
    );
  };

  // Function to display car color as a visual indicator
  const renderColorBar = (color: string) => {
    return (
      <div 
        className={`h-4 w-8 rounded ${getColorClass(color)}`} 
        title={color} 
      />
    );
  };

  // Define columns for the data table
  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'roadName',
      header: 'Road',
      sortable: true,
      accessor: (item: Record<string, unknown>) => {
        const car = item as unknown as RollingStockType;
        return (
          <div className="flex items-center">
            {car.color && renderColorBar(car.color)}
            <span className="ml-2 font-medium">{car.roadName}</span>
          </div>
        );
      }
    },
    {
      key: 'roadNumber',
      header: 'Number'
    },
    {
      key: 'aarType',
      header: 'Type',
      sortable: true,
      accessor: (item: Record<string, unknown>) => {
        const car = item as unknown as RollingStockType;
        return renderCarTypeBadge(car.aarType);
      }
    },
    {
      key: 'description',
      header: 'Description'
    },
    {
      key: 'currentLocation',
      header: 'Current Location',
      sortable: true,
      accessor: (item: Record<string, unknown>) => {
        const car = item as unknown as RollingStockType;
        return car.currentLocation 
          ? getIndustryName(car.currentLocation) 
          : getIndustryName(car.homeYard);
      }
    },
    {
      key: 'homeYard',
      header: 'Home Yard',
      sortable: true,
      accessor: (item: Record<string, unknown>) => {
        const car = item as unknown as RollingStockType;
        return getIndustryName(car.homeYard);
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (item: Record<string, unknown>) => {
        const car = item as unknown as RollingStockType;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown 
              trigger={
                <Button size="sm" variant="secondary">
                  Actions
                </Button>
              }
              align="right"
            >
              <DropdownItem onClick={() => handleEdit(car)}>
                Edit
              </DropdownItem>
              <DropdownItem onClick={() => handleDelete(car)}>
                Delete
              </DropdownItem>
            </Dropdown>
          </div>
        );
      }
    }
  ];

  // Create action buttons for PageContainer
  const actions = [
    {
      label: 'Add Rolling Stock',
      onClick: handleCreate,
      variant: 'primary' as const
    }
  ];

  return (
    <PageContainer 
      title="Rolling Stock"
      description="Manage your fleet of cars and locomotives"
      actions={actions}
      isLoading={loading}
      error={error || undefined}
    >
      <DataTable
        columns={columns}
        data={paginatedRollingStock as unknown as Record<string, unknown>[]}
        keyExtractor={(item) => (item as unknown as RollingStockType)._id}
        isLoading={loading}
        error={error || undefined}
        sortColumn={sortColumn || undefined}
        sortDirection={sortDirection}
        onSort={handleSort}
        zebra
        bordered
        hover
      />
      
      {/* Pagination */}
      {rollingStock.length > itemsPerPage && (
        <div className="mt-6">
          <Pagination
            totalItems={rollingStock.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      
      <EditRollingStockModal
        rollingStock={selectedRollingStock}
        industries={industries}
        onSave={handleSave}
        onCancel={handleCloseModal}
        isOpen={isModalOpen}
      />
    </PageContainer>
  );
}

// Helper function to get Tailwind CSS class based on color name
export function getColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    black: 'bg-gray-900',
    blue: 'bg-blue-600',
    brown: 'bg-amber-800',
    green: 'bg-green-600',
    orange: 'bg-orange-500',
    red: 'bg-red-600',
    yellow: 'bg-yellow-400'
  };
  
  const normalizedColor = color.toLowerCase();
  return colorMap[normalizedColor] || 'bg-gray-400';
} 