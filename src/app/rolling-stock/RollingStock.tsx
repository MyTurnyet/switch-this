'use client';

import React, { useEffect, useState } from 'react';
import { RollingStock as RollingStockType, Industry } from '@/app/shared/types/models';
import { ClientServices } from '@/app/shared/services/clientServices';

type RollingStockProps = {
  services: ClientServices;
};

// Map to store industry id -> name for quick lookup
type IndustryMap = {
  [id: string]: string;
};

// Car types data
const CAR_TYPES = [
  { aarType: 'XM', description: 'Boxcar' },
  { aarType: 'FB', description: 'Flatcar' },
  { aarType: 'GS', description: 'Gondola' },
  { aarType: 'HK', description: 'Hopper' },
  { aarType: 'RB', description: 'Refrigerator Car' },
  { aarType: 'TG', description: 'Tank Car' },
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
        
        // Fetch both rolling stock and industries in parallel
        const [rollingStockData, industriesData] = await Promise.all([
          services.rollingStockService.getAllRollingStock(),
          services.industryService.getAllIndustries()
        ]);

        // Create a map of industry IDs to industry names
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

  // Helper function to get industry name from id
  const getIndustryName = (industryId: string): string => {
    return industryMap[industryId] || 'Unknown Industry';
  };

  const handleEdit = (car: RollingStockType) => {
    setEditingId(car._id);
    setEditForm({
      roadName: car.roadName,
      roadNumber: car.roadNumber,
      carType: `${car.aarType}|${car.description}`,
      homeYard: car.homeYard
    });
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = async (carId: string) => {
    try {
      const carToUpdate = rollingStock.find(car => car._id === carId);
      if (!carToUpdate) return;

      // Parse car type value (format: "aarType|description")
      const [aarType, description] = editForm.carType.split('|');

      const updatedCar = {
        ...carToUpdate,
        roadName: editForm.roadName,
        roadNumber: editForm.roadNumber,
        aarType,
        description,
        homeYard: editForm.homeYard
      };

      await services.rollingStockService.updateRollingStock(carId, updatedCar);

      // Update local state after successful API call
      setRollingStock(prev => 
        prev.map(car => car._id === carId ? updatedCar : car)
      );
      
      // Exit edit mode
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update rolling stock:', error);
      setError('Failed to update rolling stock. Please try again later.');
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading rolling stock...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Rolling Stock</h1>
      
      {rollingStock.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No rolling stock available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rollingStock.map((car) => (
            <div
              key={car._id}
              data-testid={`car-${car._id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className={`h-3 w-full bg-${getColorClass(car.color)}-500`}></div>
              <div className="p-4">
                {editingId === car._id ? (
                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <label htmlFor="roadName" className="block text-sm font-medium text-gray-700">
                          Road Name
                        </label>
                        <input
                          type="text"
                          id="roadName"
                          name="roadName"
                          value={editForm.roadName}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="roadNumber" className="block text-sm font-medium text-gray-700">
                          Road Number
                        </label>
                        <input
                          type="text"
                          id="roadNumber"
                          name="roadNumber"
                          value={editForm.roadNumber}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 mb-3">
                      <div>
                        <label htmlFor="carType" className="block text-sm font-medium text-gray-700">
                          Car Type
                        </label>
                        <select
                          id="carType"
                          name="carType"
                          value={editForm.carType}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          aria-label="Car Type"
                        >
                          {CAR_TYPES.map((type) => (
                            <option key={type.aarType} value={`${type.aarType}|${type.description}`}>
                              {type.aarType} - {type.description}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="homeYard" className="block text-sm font-medium text-gray-700">
                          Home Yard
                        </label>
                        <select
                          id="homeYard"
                          name="homeYard"
                          value={editForm.homeYard}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          aria-label="Home Yard"
                        >
                          {industries.map((industry) => (
                            <option key={industry._id} value={industry._id}>
                              {industry.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="py-1 px-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(car._id)}
                        className="py-1 px-3 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <h2 
                    className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-indigo-600"
                    onClick={() => handleEdit(car)}
                  >
                    {car.roadName} {car.roadNumber}
                  </h2>
                )}
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Type:</span> {car.aarType} - {car.description}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Home Yard:</span> {getIndustryName(car.homeYard)}
                  </p>
                  {car.note && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Note:</span> {car.note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to map color names to Tailwind classes
function getColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    RED: 'red',
    BLUE: 'blue',
    GREEN: 'green',
    YELLOW: 'yellow',
    ORANGE: 'orange',
    PURPLE: 'purple',
    BLACK: 'gray',
    WHITE: 'gray',
    BROWN: 'amber',
    GRAY: 'gray',
  };

  return colorMap[color.toUpperCase()] || 'gray';
} 