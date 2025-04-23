import React from 'react';
import Dashboard from '../components/Dashboard';
import locations from '../data/locations.json';

const IndexPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard locations={locations} />
    </div>
  );
};

export default IndexPage; 