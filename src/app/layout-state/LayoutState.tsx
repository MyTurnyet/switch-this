'use client';

import { useLayout } from '@/app/shared/contexts/LayoutContext';
import { ScrollArea } from '@/app/components/ui/scroll-area';

export default function LayoutState() {
  const { locations, industries, rollingStock, refreshData } = useLayout();

  const handleReset = () => {
    refreshData();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Layout State</h1>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Reset State
        </button>
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Locations</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(locations, null, 2)}
            </pre>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Industries</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(industries, null, 2)}
            </pre>
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