import React from 'react';
import Dashboard from '../components/Dashboard';
import locations from '../data/locations.json';
import { theme } from '../styles/theme';
import clsx from 'clsx';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background-secondary via-background-tertiary to-background-accent">
      <div className={clsx(
        'container mx-auto max-w-7xl',
        theme.spacing.page.x,
        theme.spacing.page.y
      )}>
        <div className="mb-8 bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg border border-primary-100">
          <h1 className="text-4xl font-bold text-primary-900 mb-3">
            Model Railroad Switchlist Generator
          </h1>
          <p className="text-lg text-primary-700">
            Generate and manage switchlists for your model railroad layout
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg border border-primary-100">
          <Dashboard locations={locations} />
        </div>
      </div>
    </main>
  );
}
