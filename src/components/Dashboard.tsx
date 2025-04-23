import React from 'react';

interface LocationData {
  _id: { $oid: string };
  stationName: string;
  block: string;
  ownerId: { $oid: string };
}

interface DashboardProps {
  locations: LocationData[];
}

const DashboardHeader: React.FC<{ locationCount: number }> = ({ locationCount }) => (
  <div className="mb-8 bg-white rounded-xl shadow-sm p-6" data-testid="dashboard-header">
    <h1 className="text-3xl font-bold text-gray-900 mb-3">Model Railroad Locations</h1>
    <div className="flex items-center">
      <div className="bg-blue-100 text-blue-800 rounded-full px-4 py-1 text-sm font-medium">
        {locationCount} Total Location{locationCount !== 1 ? 's' : ''}
      </div>
    </div>
  </div>
);

const BlockSummary: React.FC<{ locations: LocationData[] }> = ({ locations }) => {
  const blockCounts = locations.reduce((acc, location) => {
    acc[location.block] = (acc[location.block] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="mb-8 bg-white rounded-xl shadow-sm p-6" data-testid="block-summary">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Block Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(blockCounts).map(([block, count]) => (
          <div 
            key={block} 
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200"
            data-testid={`block-card-${block.toLowerCase()}`}
          >
            <div className="text-lg font-medium text-gray-900">{block}</div>
            <div className="text-sm text-gray-600">
              {count} location{count !== 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ locations }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <DashboardHeader locationCount={locations.length} />
        <BlockSummary locations={locations} />
      </div>
    </div>
  );
};

export default Dashboard; 