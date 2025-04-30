'use client';

import React, { useState, useEffect } from 'react';
import { TrainRoute, Location, Industry } from '@/app/shared/types/models';

interface TrainRouteFormProps {
  trainRoute?: TrainRoute;
  locations: Location[];
  industries: Industry[];
  onSave: (trainRoute: TrainRoute) => Promise<void>;
  onCancel: () => void;
  isNew?: boolean;
}

export default function TrainRouteForm({
  trainRoute,
  locations,
  industries,
  onSave,
  onCancel,
  isNew = false
}: TrainRouteFormProps) {
  const [formData, setFormData] = useState<Partial<TrainRoute>>(
    trainRoute || {
      name: '',
      routeNumber: '',
      routeType: 'MIXED',
      originatingYardId: '',
      terminatingYardId: '',
      stations: []
    }
  );
  const [availableStations, setAvailableStations] = useState<Location[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter locations that are either yards or stations
  useEffect(() => {
    setAvailableStations(locations);
  }, [locations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStation = () => {
    if (!selectedStationId) return;
    
    setFormData(prev => ({
      ...prev,
      stations: [...(prev.stations || []), selectedStationId]
    }));
    
    setSelectedStationId('');
  };

  const handleRemoveStation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stations: (prev.stations || []).filter((_, i) => i !== index)
    }));
  };

  const handleMoveStationUp = (index: number) => {
    if (index === 0) return;
    
    const newStations = [...(formData.stations || [])];
    const temp = newStations[index - 1];
    newStations[index - 1] = newStations[index];
    newStations[index] = temp;
    
    setFormData(prev => ({
      ...prev,
      stations: newStations
    }));
  };

  const handleMoveStationDown = (index: number) => {
    if (!formData.stations || index >= formData.stations.length - 1) return;
    
    const newStations = [...(formData.stations || [])];
    const temp = newStations[index + 1];
    newStations[index + 1] = newStations[index];
    newStations[index] = temp;
    
    setFormData(prev => ({
      ...prev,
      stations: newStations
    }));
  };

  const getLocationNameById = (id: string): string => {
    const location = locations.find(loc => loc._id === id);
    return location ? location.stationName : 'Unknown Location';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Make sure required fields are present
      if (!formData.name || !formData.routeNumber || !formData.routeType || 
          !formData.originatingYardId || !formData.terminatingYardId) {
        throw new Error('Please fill in all required fields');
      }
      
      await onSave(formData as TrainRoute);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-3xl mx-auto">
      <div className="p-4 border-b">
        <h3 className="text-2xl font-semibold">
          {isNew ? 'Create New Train Route' : 'Edit Train Route'}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Route Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name || ''}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="routeNumber" className="block text-sm font-medium text-gray-700">Route Number</label>
              <input
                id="routeNumber"
                name="routeNumber"
                type="text"
                value={formData.routeNumber || ''}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="routeType" className="block text-sm font-medium text-gray-700">Route Type</label>
            <select
              id="routeType"
              name="routeType"
              value={formData.routeType || 'MIXED'}
              onChange={handleSelectChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="MIXED">Mixed</option>
              <option value="PASSENGER">Passenger</option>
              <option value="FREIGHT">Freight</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="originatingYardId" className="block text-sm font-medium text-gray-700">Originating Yard</label>
              <select
                id="originatingYardId"
                name="originatingYardId"
                value={formData.originatingYardId || ''}
                onChange={handleSelectChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select originating yard</option>
                {industries.map((industry) => (
                  <option key={industry._id} value={industry._id}>
                    {industry.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="terminatingYardId" className="block text-sm font-medium text-gray-700">Terminating Yard</label>
              <select
                id="terminatingYardId"
                name="terminatingYardId"
                value={formData.terminatingYardId || ''}
                onChange={handleSelectChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select terminating yard</option>
                {industries.map((industry) => (
                  <option key={industry._id} value={industry._id}>
                    {industry.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Stations</label>
            
            <div className="flex space-x-2">
              <select
                value={selectedStationId}
                onChange={(e) => setSelectedStationId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a station to add</option>
                {availableStations.map((station) => (
                  <option key={station._id} value={station._id}>
                    {station.stationName}
                  </option>
                ))}
              </select>
              <button 
                type="button" 
                onClick={handleAddStation}
                disabled={!selectedStationId}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                Add Station
              </button>
            </div>
            
            <div className="border rounded-md">
              {formData.stations && formData.stations.length > 0 ? (
                <ul className="divide-y">
                  {formData.stations.map((stationId, index) => (
                    <li key={`${stationId}-${index}`} className="flex items-center justify-between p-3">
                      <div className="flex items-center">
                        <span className="bg-gray-100 text-gray-700 w-8 h-8 flex items-center justify-center rounded-full mr-3">
                          {index + 1}
                        </span>
                        <span>{getLocationNameById(stationId)}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          onClick={() => handleMoveStationUp(index)}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          onClick={() => handleMoveStationDown(index)}
                          disabled={index === (formData.stations?.length || 0) - 1}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="p-1 text-red-400 hover:text-red-600"
                          onClick={() => handleRemoveStation(index)}
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No stations added to this route
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 