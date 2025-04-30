'use client';

import React, { useEffect, useState } from 'react';
import { RollingStock as RollingStockType, Industry, RollingStockLocation } from '@/app/shared/types/models';
import { ClientServices } from '@/app/shared/services/clientServices';
import { 
  PageContainer, 
  DataTable, 
  Input, 
  Select, 
  Button, 
  Badge,
  Form,
  FormSection,
  FormGroup,
  FormLabel,
  FormActions
} from '@/app/components/ui';
import { Column } from '@/app/components/ui/data-table';

type RollingStockProps = {
  services: ClientServices;
};

// Map to store industry id -> name for quick lookup
type IndustryMap = {
  [id: string]: string;
};

// Car types data
export const CAR_TYPES = [
  { aarType: 'XM', description: 'Boxcar' },
  { aarType: 'FB', description: 'Flatcar BlhHd' },
  { aarType: 'FBC', description: 'Flatcar Centerbeam' },
  { aarType: 'FD', description: 'FlatCar' },
  { aarType: 'GS', description: 'Gondola' },
  { aarType: 'GHC', description: 'Coal Hopper' },
  { aarType: 'GTS', description: 'Woodchip Car' },
  { aarType: 'HK', description: 'Hopper' },
  { aarType: 'HM', description: 'Hopper - 2-Bay' },
  { aarType: 'HT', description: 'Hopper' },
  { aarType: 'HTC', description: 'Hopper - Cylndr' },
  { aarType: 'RB', description: 'Refrigerator Car' },
  { aarType: 'TA', description: 'Tank Car' },
  { aarType: 'XMO', description: 'Boxcar - Hi-Cube' },
  { aarType: 'XPB', description: 'Boxcar - Beer' },
  { aarType: 'XPT', description: 'Boxcar - Thrall' },
  { aarType: 'CS', description: 'Caboose' },
];

export default function RollingStock({ services }: RollingStockProps) {
  const [rollingStock, setRollingStock] = useState<RollingStockType[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [industryMap, setIndustryMap] = useState<IndustryMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ 
    roadName: string; 
    roadNumber: string;
    carType: string;
    homeYard: string;
  }>({
    roadName: '',
    roadNumber: '',
    carType: '',
    homeYard: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [rollingStockData, industriesData] = await fetchRollingStockAndIndustries();
        const industryNameMap = createIndustryNameMap(industriesData);

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

  const fetchRollingStockAndIndustries = async () => {
    return await Promise.all([
      services.rollingStockService.getAllRollingStock(),
      services.industryService.getAllIndustries()
    ]);
  };

  const createIndustryNameMap = (industries: Industry[]): IndustryMap => {
    const industryNameMap: IndustryMap = {};
    industries.forEach(industry => {
      industryMap[industry._id] = industry.name;
    });
    return industryNameMap;
  };

  const getIndustryName = (industryId: string | RollingStockLocation | undefined | null): string => {
    if (!industryId) return 'Unassigned';
    if (typeof industryId === 'object') {
      return industryMap[industryId.industryId] || 'Unknown Industry';
    }
    return industryMap[industryId] || 'Unknown Industry';
  };

  const handleEdit = (car: RollingStockType) => {
    setEditingId(car._id);
    
    const carTypeValue = buildCarTypeValue(car);
    
    setEditForm({
      roadName: car.roadName,
      roadNumber: car.roadNumber,
      carType: carTypeValue,
      homeYard: car.homeYard
    });
  };

  const buildCarTypeValue = (car: RollingStockType): string => {
    return `${car.aarType}|${car.description}`;
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = async (carId: string) => {
    try {
      const carToUpdate = rollingStock.find(car => car._id === carId);
      if (!carToUpdate) return;

      const { aarType, description } = parseCarTypeValue(editForm.carType, carToUpdate);

      const updatedCar = {
        ...carToUpdate,
        roadName: editForm.roadName,
        roadNumber: editForm.roadNumber,
        aarType,
        description,
        homeYard: editForm.homeYard
      };

      await services.rollingStockService.updateRollingStock(carId, updatedCar);

      updateLocalRollingStock(carId, updatedCar);
      exitEditMode();
    } catch (error) {
      console.error('Failed to update rolling stock:', error);
      setError('Failed to update rolling stock. Please try again later.');
    }
  };

  const parseCarTypeValue = (carTypeValue: string, carToUpdate: RollingStockType) => {
    let aarType, description;
    if (carTypeValue.includes('|')) {
      [aarType, description] = carTypeValue.split('|');
    } else {
      const selectedCarType = findCarTypeByAarType(carTypeValue);
      aarType = selectedCarType?.aarType || carToUpdate.aarType;
      description = selectedCarType?.description || carToUpdate.description;
    }
    return { aarType, description };
  };

  const findCarTypeByAarType = (aarType: string) => {
    return CAR_TYPES.find(ct => ct.aarType === aarType);
  };

  const updateLocalRollingStock = (carId: string, updatedCar: RollingStockType) => {
    setRollingStock(prev => 
      prev.map(car => car._id === carId ? updatedCar : car)
    );
  };

  const exitEditMode = () => {
    setEditingId(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
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

  // Define columns with proper typing
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
        return <span>{getIndustryName(car.currentLocation)}</span>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (item: Record<string, unknown>) => {
        const car = item as unknown as RollingStockType;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(car);
            }}
          >
            Edit
          </Button>
        );
      }
    }
  ];

  if (editingId) {
    const car = rollingStock.find(c => c._id === editingId);
    if (!car) return null;
    
    const carTypeOptions = CAR_TYPES.map(ct => ({
      value: `${ct.aarType}|${ct.description}`,
      label: `${ct.aarType} - ${ct.description}`
    }));
    
    const yardOptions = industries
      .filter(ind => ind.industryType === 'YARD')
      .map(yard => ({
        value: yard._id,
        label: yard.name
      }));
    
    return (
      <PageContainer title={`Edit Car ${car.roadName} ${car.roadNumber}`}>
        <div className="max-w-2xl mx-auto">
          <Form onSubmit={(e) => { 
            e.preventDefault();
            handleSave(car._id);
          }}>
            <FormSection>
              <FormGroup>
                <FormLabel htmlFor="roadName" required>Road Name</FormLabel>
                <Input
                  id="roadName"
                  name="roadName"
                  value={editForm.roadName}
                  onChange={handleInputChange}
                  fullWidth
                  data-testid="roadName-input"
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="roadNumber" required>Road Number</FormLabel>
                <Input
                  id="roadNumber"
                  name="roadNumber"
                  value={editForm.roadNumber}
                  onChange={handleInputChange}
                  fullWidth
                  data-testid="roadNumber-input"
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="carType">Car Type</FormLabel>
                <Select
                  id="carType"
                  name="carType"
                  value={editForm.carType}
                  onChange={handleInputChange}
                  options={carTypeOptions}
                  fullWidth
                  data-testid="carType-select"
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="homeYard">Home Yard</FormLabel>
                <Select
                  id="homeYard"
                  name="homeYard"
                  value={editForm.homeYard}
                  onChange={handleInputChange}
                  options={yardOptions}
                  fullWidth
                  data-testid="homeYard-select"
                />
              </FormGroup>
              
              <FormActions>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                >
                  Save Changes
                </Button>
              </FormActions>
            </FormSection>
          </Form>
        </div>
      </PageContainer>
    );
  }

  const actions = [
    {
      label: 'Add Car',
      onClick: () => alert('Adding a new car functionality to be implemented'),
      variant: 'success' as const
    }
  ];

  return (
    <PageContainer 
      title="Rolling Stock" 
      description="Manage your fleet of cars and locomotives"
      actions={actions}
      error={error || undefined}
      isLoading={loading}
    >
      <DataTable
        columns={columns}
        data={rollingStock as unknown as Record<string, unknown>[]}
        keyExtractor={(item) => item._id as string}
        zebra
        bordered
      />
    </PageContainer>
  );
}

export function getColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    brown: 'bg-stone-700',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    gray: 'bg-gray-500',
    amber: 'bg-amber-500',
    black: 'bg-black',
  };

  return colorMap[color.toLowerCase()] || 'bg-gray-500';
} 