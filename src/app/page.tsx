import React from 'react';
import Dashboard from '../components/Dashboard';
import locations from '../data/locations.json';
import { theme } from '../styles/theme';
import { Card } from '../components/ui/Card';
import clsx from 'clsx';

export default function Home() {
  return (
    <main className="min-h-screen bg-background-secondary">
      <div className={clsx(
        'container mx-auto max-w-7xl',
        theme.spacing.page.x,
        theme.spacing.page.y
      )}>
        <Card className="mb-8" testId="header-card">
          <h1 className={theme.typography.title}>Model Railroad Switchlist Generator</h1>
          <p className={clsx(theme.typography.body, 'mt-2')}>
            Generate and manage switchlists for your model railroad layout
          </p>
        </Card>
        <Card testId="dashboard-card">
          <Dashboard locations={locations} />
        </Card>
      </div>
    </main>
  );
}
