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

interface CurrentLocation {
  industryName: string;
  trackName: string;
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
    SILVER: { bg: 'bg-gray-100', text: 'text-gray-800' },
    BLACK: { bg: 'bg-gray-700', text: 'text-gray-100' }
  };

  return colorMap[color] || { bg: 'bg-gray-100', text: 'text-gray-800' };
};

const getYardName = (yardId: string, industries: Industry[]): string => {
  const yard = industries.find(industry => industry._id === yardId);
  return yard ? yard.name : 'Unknown Yard';
};

const getCurrentLocation = (car: RollingStock, industries: Industry[]): CurrentLocation | null => {
  if (!car.currentLocation) {
    return null;
  }

  const { industryId, trackId } = car.currentLocation;
  const industry = industries.find(ind => ind._id === industryId);
  
  if (!industry) {
    return null;
  }
  
  const track = industry.tracks.find(t => t._id === trackId);
  
  if (!track) {
    return null;
  }
  
  return {
    industryName: industry.name,
    trackName: track.name
  };
};

const sortRollingStockByRoadNameAndNumber = (rollingStock: RollingStock[]): RollingStock[] => {
  return [...rollingStock].sort((a, b) => {
    if (a.roadName !== b.roadName) {
      return a.roadName < b.roadName ? -1 : 1;
    }
    
    const aNum = String(a.roadNumber || '');
    const bNum = String(b.roadNumber || '');
    return aNum < bNum ? -1 : aNum > bNum ? 1 : 0;
  });
};

export default function RollingStockList({ rollingStock, industries }: RollingStockListProps) {
  const sortedRollingStock = sortRollingStockByRoadNameAndNumber(rollingStock);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedRollingStock.map((car) => {
        const currentLocation = getCurrentLocation(car, industries);
        const homeYardName = getYardName(car.homeYard, industries);
        
        return (
          <div
            key={car._id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            role="article"
            data-testid="rolling-stock-item"
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
              {car.description && (
                <div className="text-sm text-gray-600">
                  <p>{car.description}</p>
                </div>
              )}
              
              <div className="text-sm">
                <div className="font-medium text-gray-700">Location:</div>
                <div className={currentLocation ? "text-green-600" : "text-red-600"}>
                  {currentLocation 
                    ? `${currentLocation.industryName} - ${currentLocation.trackName}`
                    : 'Not placed on any track'}
                </div>
              </div>
              
              <div className="text-sm">
                <div className="font-medium text-gray-700">Home Yard:</div>
                <div>{homeYardName}</div>
              </div>
              
              {car.note && (
                <div className="text-sm">
                  <div className="font-medium text-gray-700">Note:</div>
                  <div className="text-gray-600">{car.note}</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {rollingStock.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-8">
          No rolling stock available
        </div>
      )}
    </div>
  );
} 