'use client';

import React from 'react';
import { Dashboard } from './components/Dashboard';
import { LayoutProvider } from './shared/contexts/LayoutContext';

export default function Home() {
  return (
    <LayoutProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Welcome to Switch This
          </h1>
          <Dashboard />
        </div>
      </div>
    </LayoutProvider>
  );
}
