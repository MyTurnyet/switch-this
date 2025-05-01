'use client';

import React, { useEffect, useState } from 'react';
import { RollingStock as RollingStockType, Industry, RollingStockLocation } from '@/app/shared/types/models';
import { ClientServices } from '@/app/shared/services/clientServices';
import { 
  PageContainer, 
  DataTable, 
  Button, 
  Badge
} from '@/app/components/ui';
import { Column } from '@/app/components/ui/data-table';
import EditRollingStockModal from './components/EditRollingStockModal';

type RollingStockProps = {
  services: ClientServices;
};

// Map to store industry id -> name for quick lookup
type IndustryMap = {
  [id: string]: string;
};

export default function RollingStock({ services }: RollingStockProps) {
  const [rollingStock, setRollingStock] = useState<RollingStockType[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [industryMap, setIndustryMap] = useState<IndustryMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRollingStock, setSelectedRollingStock] = useState<RollingStockType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      } else {
        // Create new rolling stock (assuming API will be implemented)
        // await services.rollingStockService.createRollingStock(updatedCar);
        
        // For now, just log the data that would be created
        console.log('Would create new rolling stock:', updatedCar);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save rolling stock:', error);
      throw new Error('Failed to save rolling stock. Please try again later.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => handleEdit(car)}
          >
            Edit
          </Button>
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
        data={rollingStock as unknown as Record<string, unknown>[]}
        keyExtractor={(item) => (item as unknown as RollingStockType)._id}
        zebra
        bordered
        hover
      />
      
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