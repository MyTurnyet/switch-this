import React from 'react';
import { theme } from '../styles/theme';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
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
  <div className={clsx('mb-6', theme.typography.title)}>
    <h1 className="mb-2">Model Railroad Locations</h1>
    <Badge variant="primary" testId="location-count">
      {locationCount} Total Location{locationCount !== 1 ? 's' : ''}
    </Badge>
  </div>
);

const BlockSummary: React.FC<{ locations: LocationData[] }> = ({ locations }) => {
  const blockCounts = locations.reduce((acc, location) => {
    acc[location.block] = (acc[location.block] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="mb-6">
      <h2 className={clsx(theme.typography.subtitle, 'mb-3')}>Block Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(blockCounts).map(([block, count]) => (
          <Card
            key={block}
            testId={`block-card-${block.toLowerCase()}`}
            className="bg-gradient-to-br from-secondary-50 to-secondary-100"
          >
            <div className={theme.typography.body}>{block}</div>
            <div className={theme.typography.small}>
              {count} location{count !== 1 ? 's' : ''}
            </div>
          </Card>
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