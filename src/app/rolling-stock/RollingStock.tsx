'use client';

import React, { useEffect, useState } from 'react';
import { RollingStock as RollingStockType } from '@/app/shared/types/models';
import { ClientServices } from '@/app/shared/services/clientServices';

type RollingStockProps = {
  services: ClientServices;
};

export default function RollingStock({ services }: RollingStockProps) {
  const [rollingStock, setRollingStock] = useState<RollingStockType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRollingStock = async () => {
      try {
        setLoading(true);
        const data = await services.rollingStockService.getAllRollingStock();
        setRollingStock(data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch rolling stock:', error);
        setError('Failed to load rolling stock. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRollingStock();
  }, [services.rollingStockService]);

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
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className={`h-3 w-full bg-${getColorClass(car.color)}-500`}></div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {car.roadName} {car.roadNumber}
                </h2>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Type:</span> {car.aarType} - {car.description}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Home Yard:</span> {car.homeYard}
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