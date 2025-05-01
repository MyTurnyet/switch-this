'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SwitchlistService } from '@/app/shared/services/SwitchlistService';
import { TrainRouteService } from '@/app/shared/services/TrainRouteService';
import { Switchlist, TrainRoute } from '@/app/shared/types/models';
import Link from 'next/link';

export default function SwitchlistDetailPage({ params }: { params: { id: string } }) {
  const [switchlist, setSwitchlist] = useState<Switchlist | null>(null);
  const [trainRoute, setTrainRoute] = useState<TrainRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editedSwitchlist, setEditedSwitchlist] = useState<Partial<Switchlist>>({});
  
  const router = useRouter();
  const switchlistService = new SwitchlistService();
  const trainRouteService = new TrainRouteService();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const switchlistData = await switchlistService.getSwitchlistById(params.id);
        setSwitchlist(switchlistData);
        
        // Fetch associated train route
        const trainRouteData = await trainRouteService.getTrainRouteById(switchlistData.trainRouteId);
        setTrainRoute(trainRouteData);
        
        // Initialize edited switchlist with current values
        setEditedSwitchlist({
          name: switchlistData.name,
          notes: switchlistData.notes || '',
          status: switchlistData.status
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching switchlist data:', err);
        setError('Failed to load switchlist. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);
  
  const handleUpdateStatus = async (newStatus: Switchlist['status']) => {
    if (!switchlist) return;
    
    try {
      setLoading(true);
      const updated = await switchlistService.updateSwitchlistStatus(switchlist._id, newStatus);
      setSwitchlist(updated);
      setError(null);
    } catch (err) {
      console.error('Error updating switchlist status:', err);
      setError('Failed to update switchlist status. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!switchlist) return;
    
    try {
      setLoading(true);
      const updated = await switchlistService.updateSwitchlist(switchlist._id, editedSwitchlist);
      setSwitchlist(updated);
      setEditing(false);
      setError(null);
    } catch (err) {
      console.error('Error updating switchlist:', err);
      setError('Failed to update switchlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!switchlist || !window.confirm('Are you sure you want to delete this switchlist?')) return;
    
    try {
      setLoading(true);
      await switchlistService.deleteSwitchlist(switchlist._id);
      router.push('/switchlists');
    } catch (err) {
      console.error('Error deleting switchlist:', err);
      setError('Failed to delete switchlist. Please try again.');
      setLoading(false);
    }
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
  
  // Render loading state
  if (loading && !switchlist) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading switchlist data...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error && !switchlist) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link href="/switchlists" className="text-primary-600 hover:underline">
          ← Back to Switchlists
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      <Link href="/switchlists" className="text-primary-600 hover:underline mb-6 inline-block">
        ← Back to Switchlists
      </Link>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {switchlist && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
            {!editing ? (
              <>
                <h1 className="text-2xl font-bold text-gray-800">{switchlist.name}</h1>
                <div className="flex space-x-2">
                  <Link 
                    href={`/switchlists/${switchlist._id}/operations`}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Operations
                  </Link>
                  <Link 
                    href={`/switchlists/${switchlist._id}/print`}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </Link>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <h1 className="text-2xl font-bold text-gray-800">Edit Switchlist</h1>
            )}
          </div>
          
          {!editing ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Switchlist Details</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <div className="flex items-center mt-1">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${switchlist.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                            switchlist.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'}`}
                        >
                          {switchlist.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Train Route</p>
                      <p className="text-base font-medium">
                        {trainRoute ? `${trainRoute.name} (${trainRoute.routeNumber})` : 'Loading...'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-base">{formatDate(switchlist.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="text-base">{switchlist.notes || 'No notes provided'}</p>
                    </div>
                  </div>
                  
                  <h2 className="text-lg font-semibold mt-8 mb-4">Update Status</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateStatus('CREATED')}
                      className={`px-3 py-1 rounded-md ${
                        switchlist.status === 'CREATED' 
                          ? 'bg-gray-300 text-gray-800' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      disabled={switchlist.status === 'CREATED' || loading}
                    >
                      Created
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('IN_PROGRESS')}
                      className={`px-3 py-1 rounded-md ${
                        switchlist.status === 'IN_PROGRESS' 
                          ? 'bg-blue-300 text-blue-800' 
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                      disabled={switchlist.status === 'IN_PROGRESS' || loading}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('COMPLETED')}
                      className={`px-3 py-1 rounded-md ${
                        switchlist.status === 'COMPLETED' 
                          ? 'bg-green-300 text-green-800' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      disabled={switchlist.status === 'COMPLETED' || loading}
                    >
                      Completed
                    </button>
                  </div>
                </div>
                
                <div>
                  {/* Add section for rolling stock or operation details in future features */}
                  <h2 className="text-lg font-semibold mb-4">Operations</h2>
                  <p className="text-gray-500">
                    Future enhancement: This section will display the rolling stock and 
                    operations information for this switchlist.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <form onSubmit={handleSaveChanges}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Switchlist Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={editedSwitchlist.name || ''}
                    onChange={(e) => setEditedSwitchlist({...editedSwitchlist, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={editedSwitchlist.status || 'CREATED'}
                    onChange={(e) => setEditedSwitchlist({
                      ...editedSwitchlist, 
                      status: e.target.value as Switchlist['status']
                    })}
                  >
                    <option value="CREATED">Created</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows={4}
                    value={editedSwitchlist.notes || ''}
                    onChange={(e) => setEditedSwitchlist({...editedSwitchlist, notes: e.target.value})}
                  ></textarea>
                </div>
                
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    className="mr-4 text-gray-500 hover:text-gray-800"
                    onClick={() => {
                      setEditing(false);
                      // Reset form with original values
                      if (switchlist) {
                        setEditedSwitchlist({
                          name: switchlist.name,
                          notes: switchlist.notes || '',
                          status: switchlist.status
                        });
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 