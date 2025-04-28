import React from 'react';
import { RollingStock, Industry } from '@/app/shared/types/models';

interface RollingStockListProps {
  rollingStock: RollingStock[];
  industries: Industry[];
}

interface ColorStyle {
  bg: string;
  text: string;
}

const getAarTypeColor = (aarType: string): ColorStyle => {
  const typeColors: Record<string, ColorStyle> = {
    XM: { bg: 'bg-blue-100', text: 'text-blue-800' },
    XMO: { bg: 'bg-blue-100', text: 'text-blue-800' },
    XPB: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    XPT: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    GS: { bg: 'bg-green-100', text: 'text-green-800' },
    GTS: { bg: 'bg-green-100', text: 'text-green-800' },
    GHC: { bg: 'bg-purple-100', text: 'text-purple-800' },
    FB: { bg: 'bg-orange-100', text: 'text-orange-800' },
    FBC: { bg: 'bg-orange-100', text: 'text-orange-800' },
    HT: { bg: 'bg-red-100', text: 'text-red-800' },
    HM: { bg: 'bg-red-100', text: 'text-red-800' },
    TA: { bg: 'bg-gray-100', text: 'text-gray-800' }
  };

  return typeColors[aarType] || { bg: 'bg-gray-100', text: 'text-gray-800' };
};

const getColorStyle = (color: string): ColorStyle => {
  const colorMap: Record<string, ColorStyle> = {
    RED: { bg: 'bg-red-100', text: 'text-red-800' },
    GREEN: { bg: 'bg-green-100', text: 'text-green-800' },
    BLUE: { bg: 'bg-blue-100', text: 'text-blue-800' },
    YELLOW: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    ORANGE: { bg: 'bg-orange-100', text: 'text-orange-800' },
    PURPLE: { bg: 'bg-purple-100', text: 'text-purple-800' },
    BROWN: { bg: 'bg-amber-100', text: 'text-amber-800' },
    WHITE: { bg: 'bg-gray-50', text: 'text-gray-800' },
    SILVER: { bg: 'bg-gray-100', text: 'text-gray-800' }
  };

  return colorMap[color] || { bg: 'bg-gray-100', text: 'text-gray-800' };
};

const getYardName = (yardId: string, industries: Industry[]): string => {
  const yard = industries.find(industry => industry._id === yardId && industry.industryType === 'YARD');
  return yard ? yard.name : 'Unknown Yard';
};

export default function RollingStockList({ rollingStock, industries }: RollingStockListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rollingStock.map((car) => (
        <div
          key={car._id}
          className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          role="article"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {car.roadName} {car.roadNumber}
              </h3>
              <div className="mt-1 flex gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAarTypeColor(car.aarType).bg} ${getAarTypeColor(car.aarType).text}`}>
                  {car.aarType}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorStyle(car.color).bg} ${getColorStyle(car.color).text}`}>
                  {car.color}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-1">Description</p>
              <p>{car.description}</p>
            </div>
            
            {car.note && (
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-700 mb-1">Note</p>
                <p>{car.note}</p>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-1">Home Yard</p>
              <p>{getYardName(car.homeYard, industries)}</p>
            </div>
          </div>
        </div>
      ))}
      {rollingStock.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-8">
          No rolling stock available
        </div>
      )}
    </div>
  );
} 