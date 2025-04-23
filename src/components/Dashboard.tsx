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
  <Card testId="dashboard-header" className="mb-8">
    <h1 className={clsx(theme.typography.title, 'mb-3')}>Model Railroad Locations</h1>
    <Badge variant="primary" testId="location-count">
      {locationCount} Total Location{locationCount !== 1 ? 's' : ''}
    </Badge>
  </Card>
);

const BlockSummary: React.FC<{ locations: LocationData[] }> = ({ locations }) => {
  const blockCounts = locations.reduce((acc, location) => {
    acc[location.block] = (acc[location.block] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card testId="block-summary" className="mb-8">
      <h2 className={clsx(theme.typography.subtitle, 'mb-4')}>Block Summary</h2>
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
    </Card>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ locations }) => {
  return (
    <div className="min-h-screen bg-background-secondary">
      <div className={clsx(
        'container mx-auto max-w-7xl',
        theme.spacing.page.x,
        theme.spacing.page.y
      )}>
        <DashboardHeader locationCount={locations.length} />
        <BlockSummary locations={locations} />
      </div>
    </div>
  );
};

export default Dashboard; 