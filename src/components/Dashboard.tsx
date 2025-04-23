import React from 'react';
import Location from './Location';

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
  <div className="mb-6">
    <h1 className="text-2xl font-bold mb-2">Model Railroad Locations</h1>
    <p className="text-gray-600">Total Locations: {locationCount}</p>
  </div>
);

const BlockSummary: React.FC<{ locations: LocationData[] }> = ({ locations }) => {
  const blockCounts = locations.reduce((acc, location) => {
    acc[location.block] = (acc[location.block] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-3">Block Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(blockCounts).map(([block, count]) => (
          <div key={block} className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium">{block}</div>
            <div className="text-gray-600">{count} location{count !== 1 ? 's' : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LocationList: React.FC<{ locations: LocationData[] }> = ({ locations }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {locations.map(location => (
      <Location key={location._id.$oid} location={location} />
    ))}
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ locations }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader locationCount={locations.length} />
      <BlockSummary locations={locations} />
      <LocationList locations={locations} />
    </div>
  );
};

export default Dashboard; 