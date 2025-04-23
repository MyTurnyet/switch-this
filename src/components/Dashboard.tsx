import React from 'react';
import { theme } from '../styles/theme';
import clsx from 'clsx';

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
  <div className="mb-8 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl p-6 shadow-lg">
    <h1 className="text-3xl font-bold mb-3">Model Railroad Locations</h1>
    <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
      {locationCount} Total Location{locationCount !== 1 ? 's' : ''}
    </div>
  </div>
);

const BlockSummary: React.FC<{ locations: LocationData[] }> = ({ locations }) => {
  const blockCounts = locations.reduce((acc, location) => {
    acc[location.block] = (acc[location.block] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="mb-8">
      <h2 className={clsx(theme.typography.subtitle, 'mb-4')}>Block Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(blockCounts).map(([block, count]) => (
          <div
            key={block}
            className="relative group"
            data-testid={`block-card-${block.toLowerCase()}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-500 rounded-lg transform transition-transform group-hover:scale-[1.02] -z-10" />
            <div className="bg-white rounded-lg p-4 transform transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
              <div className="font-semibold text-lg text-gray-900">{block}</div>
              <div className="text-sm text-gray-600">
                {count} location{count !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ locations }) => {
  return (
    <div className="space-y-6">
      <DashboardHeader locationCount={locations.length} />
      <BlockSummary locations={locations} />
    </div>
  );
};

export default Dashboard; 