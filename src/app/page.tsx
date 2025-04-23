import React from 'react';
import Dashboard from '../components/Dashboard';
import locations from '../data/locations.json';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Model Railroad Switchlist Generator</h1>
          <p className="mt-2 text-lg text-gray-600">
            Generate and manage switchlists for your model railroad layout
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Dashboard locations={locations} />
        </div>
      </div>
    </main>
  );
}
