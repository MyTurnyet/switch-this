import React from 'react';
import { RollingStock } from '@/app/shared/types/models';

interface RollingStockListProps {
  rollingStock: RollingStock[];
}

export default function RollingStockList({ rollingStock }: RollingStockListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rollingStock.map((car) => (
        <div
          key={car._id}
          className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {car.name}
              </h3>
              <p className="text-sm text-gray-500">{car.type}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {car.description && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-24 font-medium">Description:</span>
                <span>{car.description}</span>
              </div>
            )}
            {car.currentLocationId && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-24 font-medium">Location:</span>
                <span>{car.currentLocationId}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 