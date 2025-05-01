'use client';

import React from 'react';

export default function SwitchlistsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Switchlists</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-lg text-gray-700 mb-4">
          Manage and generate switchlists for your train operations.
        </p>
        
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Available Switchlists</h2>
          <p className="text-gray-600">
            No switchlists available yet. Create your first switchlist to get started.
          </p>
          
          <button
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Create New Switchlist
          </button>
        </div>
      </div>
    </div>
  );
} 