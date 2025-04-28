'use client';

import React from 'react';
import { Dashboard } from './components/Dashboard';
import { services } from './shared/services/clientServices';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Dashboard services={services} />
    </div>
  );
}
