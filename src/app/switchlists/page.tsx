'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SwitchlistService } from '@/app/shared/services/SwitchlistService';
import { Switchlist, TrainRoute } from '@/app/shared/types/models';
import { TrainRouteService } from '@/app/shared/services/TrainRouteService';

export default function SwitchlistsPage() {
  const [switchlists, setSwitchlists] = useState<Switchlist[]>([]);
  const [trainRoutes, setTrainRoutes] = useState<TrainRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newSwitchlist, setNewSwitchlist] = useState({
    name: '',
    trainRouteId: '',
    notes: ''
  });
  
  const switchlistService = new SwitchlistService();
  const trainRouteService = new TrainRouteService();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [switchlistsData, trainRoutesData] = await Promise.all([
          switchlistService.getAllSwitchlists(),
          trainRouteService.getAllTrainRoutes()
        ]);
        
        setSwitchlists(switchlistsData);
        setTrainRoutes(trainRoutesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load switchlists data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleCreateSwitchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSwitchlist.name || !newSwitchlist.trainRouteId) {
      setError('Name and train route are required fields.');
      return;
    }
    
    try {
      setLoading(true);
      const created = await switchlistService.createSwitchlist(
        newSwitchlist.trainRouteId,
        newSwitchlist.name,
        newSwitchlist.notes
      );
      
      setSwitchlists([...switchlists, created]);
      setCreatingNew(false);
      setNewSwitchlist({ name: '', trainRouteId: '', notes: '' });
      setError(null);
    } catch (err) {
      console.error('Error creating switchlist:', err);
      setError('Failed to create switchlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const getTrainRouteName = (trainRouteId: string) => {
    const route = trainRoutes.find(route => route._id === trainRouteId);
    return route ? route.name : 'Unknown Route';
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Switchlists</h1>
        {!creatingNew && (
          <button
            onClick={() => setCreatingNew(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Create New Switchlist
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {creatingNew && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Switchlist</h2>
          <form onSubmit={handleCreateSwitchlist}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Switchlist Name
              </label>
              <input
                type="text"
                id="name"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter switchlist name"
                value={newSwitchlist.name}
                onChange={(e) => setNewSwitchlist({...newSwitchlist, name: e.target.value})}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="trainRoute">
                Train Route
              </label>
              <select
                id="trainRoute"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newSwitchlist.trainRouteId}
                onChange={(e) => setNewSwitchlist({...newSwitchlist, trainRouteId: e.target.value})}
                required
              >
                <option value="">-- Select a train route --</option>
                {trainRoutes.map(route => (
                  <option key={route._id} value={route._id}>
                    {route.name} ({route.routeNumber})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Optional notes about this switchlist"
                rows={3}
                value={newSwitchlist.notes || ''}
                onChange={(e) => setNewSwitchlist({...newSwitchlist, notes: e.target.value})}
              ></textarea>
            </div>
            
            <div className="flex items-center justify-end">
              <button
                type="button"
                className="mr-4 text-gray-500 hover:text-gray-800"
                onClick={() => {
                  setCreatingNew(false);
                  setNewSwitchlist({ name: '', trainRouteId: '', notes: '' });
                  setError(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Switchlist'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Available Switchlists</h2>
        
        {loading && !creatingNew ? (
          <p className="text-gray-600">Loading switchlists...</p>
        ) : switchlists.length === 0 ? (
          <p className="text-gray-600">
            No switchlists available yet. Create your first switchlist to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Train Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {switchlists.map((switchlist) => (
                  <tr key={switchlist._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{switchlist.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{getTrainRouteName(switchlist.trainRouteId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(switchlist.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${switchlist.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                          switchlist.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {switchlist.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link 
                        href={`/switchlists/${switchlist._id}`}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 