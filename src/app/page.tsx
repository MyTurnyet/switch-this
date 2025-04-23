import React from 'react';
import Dashboard from '../components/Dashboard';
import locations from '../data/locations.json';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Dashboard locations={locations} />
    </main>
  );
}
