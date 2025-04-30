'use client';

import React, { useEffect, useState } from 'react';
import { services } from '@/app/shared/services';
import { Industry, IndustryType, Track } from '@/app/shared/types/models';
import { groupIndustriesByLocationAndBlock, GroupedIndustries } from '@/app/layout-state/utils/groupIndustries';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';

// Define API response type
interface ApiIndustry {
  _id: string;
  name: string;
  industryType: string;
  locationId: string;
  tracks: Array<{
    _id: string;
    name: string;
    maxCars: number;
    placedCars: string[];
  }>;
  ownerId: string;
}

// Type converter function to ensure API response data matches our expected model types
const convertApiIndustryToModel = (apiIndustry: ApiIndustry): Industry => {
  // Convert API tracks to model tracks
  const tracks: Track[] = apiIndustry.tracks.map(track => ({
    _id: track._id,
    name: track.name,
    maxCars: track.maxCars,
    placedCars: track.placedCars,
    length: 0, // Default value
    capacity: track.maxCars, // Use maxCars as capacity
    ownerId: apiIndustry.ownerId
  }));

  return {
    _id: apiIndustry._id,
    name: apiIndustry.name,
    locationId: apiIndustry.locationId,
    blockName: '', // Default value
    industryType: apiIndustry.industryType === 'FREIGHT' 
      ? IndustryType.FREIGHT 
      : apiIndustry.industryType === 'YARD' 
        ? IndustryType.YARD 
        : IndustryType.PASSENGER,
    tracks,
    ownerId: apiIndustry.ownerId
  };
};

export default function IndustriesPage() {
  const [groupedIndustries, setGroupedIndustries] = useState<GroupedIndustries>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [locationsData, industriesData] = await Promise.all([
          services.locationService.getAllLocations(),
          services.industryService.getAllIndustries()
        ]);
        
        // Convert API data to match model types
        const convertedIndustries = (industriesData as ApiIndustry[]).map(convertApiIndustryToModel);
        
        const grouped = groupIndustriesByLocationAndBlock(convertedIndustries, locationsData);
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

  const getIndustryTypeStyle = (type: string) => {
    switch (type) {
      case 'FREIGHT':
        return 'border-blue-200 bg-blue-50';
      case 'YARD':
        return 'border-green-200 bg-green-50';
      case 'PASSENGER':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading industries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Industries by Location and Block</h1>
      
      {Object.keys(groupedIndustries).length === 0 ? (
        <div className="text-xl text-gray-500">No industries found.</div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedIndustries).map(([locationId, locationGroup]) => (
            <div key={locationId} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">
                {locationGroup.locationName}
              </h2>
              
              {Object.entries(locationGroup.blocks).map(([blockName, blockIndustries]) => (
                <div key={blockName} className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Block: {blockName}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {blockIndustries.map((industry) => (
                      <Card key={industry._id} className={getIndustryTypeStyle(industry.industryType)}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{industry.name}</CardTitle>
                            <span className="text-sm font-medium px-2 py-1 rounded-full bg-white bg-opacity-60">
                              {industry.industryType}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-gray-600">
                            <div>Tracks: {industry.tracks.length}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 