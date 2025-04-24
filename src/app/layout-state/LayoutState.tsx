'use client';

import { useLayout } from '@/app/shared/contexts/LayoutContext';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { groupIndustriesByLocationAndBlock } from './utils/groupIndustries';

export default function LayoutState() {
  const { locations, industries, rollingStock, refreshData } = useLayout();
  const groupedIndustries = groupIndustriesByLocationAndBlock(industries, locations);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Layout State</h1>
        <button 
          onClick={refreshData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Reset State
        </button>
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Industries by Location</h2>
            {Object.entries(groupedIndustries).map(([locationId, locationGroup]) => (
              <div key={locationId} className="mb-6">
                <h3 className="text-lg font-semibold text-primary-600 mb-2">
                  {locationGroup.locationName}
                </h3>
                {Object.entries(locationGroup.blocks).map(([blockName, blockIndustries]) => (
                  <div key={blockName} className="ml-4 mb-4">
                    <h4 className="text-md font-medium text-gray-700 mb-2">
                      {blockName}
                    </h4>
                    <div className="ml-4 space-y-1">
                      {blockIndustries.map(industry => (
                        <div key={industry._id} className="text-gray-600">
                          {industry.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Rolling Stock</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(rollingStock, null, 2)}
            </pre>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
} 