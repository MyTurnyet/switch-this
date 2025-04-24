'use client';

import React from 'react';
import { Dashboard } from './components/Dashboard';
import { LayoutProvider } from './shared/contexts/LayoutContext';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <LayoutProvider>
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Layout Dashboard</h1>
          <Dashboard />
        </div>
      </LayoutProvider>
    </main>
  );
}
