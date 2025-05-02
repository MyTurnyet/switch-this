'use client';

import React, { useState, useEffect } from 'react';
import { Industry, IndustryType, Track, Location } from '@/app/shared/types/models';
import { IndustryService } from '@/app/shared/services/IndustryService';
import { services } from '@/app/shared/services';
import { v4 as uuidv4 } from 'uuid';

interface AddIndustryFormProps {
  onSave: (newIndustry: Industry) => void;
  onCancel: () => void;
}

export function AddIndustryForm({ onSave, onCancel }: AddIndustryFormProps) {
  const [name, setName] = useState('');
  const [industryType, setIndustryType] = useState<IndustryType>(IndustryType.FREIGHT);
  const [description, setDescription] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackCapacity, setNewTrackCapacity] = useState(3); // Default capacity
  const [locationId, setLocationId] = useState('');
  const [blockName, setBlockName] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const industryService = new IndustryService();

  useEffect(() => {
    async function fetchLocations() {
      try {
        const locationsData = await services.locationService.getAllLocations();
        setLocations(locationsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load locations. Please try again later.');
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    
    if (!name.trim()) {
      setError('Industry name is required');
      return;
    }

    if (!locationId) {
      setError('Location is required');
      return;
    }

    if (!blockName) {
      setError('Block name is required');
      return;
    }
    
    // Validate tracks
    for (const track of tracks) {
      if (!track.name.trim()) {
        setError('All tracks must have a name');
        return;
      }
      if (track.maxCars <= 0) {
        setError('All tracks must have a capacity greater than 0');
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      
      const newIndustryData = {
        name,
        industryType,
        description,
        tracks,
        locationId,
        blockName,
        ownerId: 'user-id' // This should be dynamically set based on your auth system
      };
      
      const newIndustry = await industryService.createIndustry(newIndustryData);
      onSave(newIndustry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create industry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTrack = () => {
    if (!newTrackName.trim()) {
      setError('Track name is required');
      return;
    }
    
    if (newTrackCapacity <= 0) {
      setError('Track capacity must be greater than 0');
      return;
    }
    
    const newTrack: Track = {
      _id: uuidv4(), // Generate a temporary ID
      name: newTrackName,
      capacity: newTrackCapacity,
      maxCars: newTrackCapacity,
      length: 0,
      placedCars: [],
      acceptedCarTypes: [],
      ownerId: 'user-id' // This should be dynamically set
    };
    
    setTracks([...tracks, newTrack]);
    setNewTrackName('');
    setNewTrackCapacity(3); // Reset to default
    setError(null);
  };

  const handleRemoveTrack = (trackId: string) => {
    setTracks(tracks.filter(track => track._id !== trackId));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Add New Industry</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} role="form">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Industry Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter industry name"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
            Location
          </label>
          <select
            id="location"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select a location</option>
            {locations.map(location => (
              <option key={location._id} value={location._id}>
                {location.stationName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="blockName">
            Block Name
          </label>
          <input
            id="blockName"
            type="text"
            value={blockName}
            onChange={(e) => setBlockName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter block name"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="industryType">
            Industry Type
          </label>
          <select
            id="industryType"
            value={industryType}
            onChange={(e) => setIndustryType(e.target.value as IndustryType)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={IndustryType.FREIGHT}>{IndustryType.FREIGHT}</option>
            <option value={IndustryType.YARD}>{IndustryType.YARD}</option>
            <option value={IndustryType.PASSENGER}>{IndustryType.PASSENGER}</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter description (optional)"
            rows={3}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Tracks
          </label>
          
          <div className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTrackName}
                onChange={(e) => setNewTrackName(e.target.value)}
                placeholder="Track name"
                className="flex-grow shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <input
                type="number"
                value={newTrackCapacity}
                onChange={(e) => setNewTrackCapacity(parseInt(e.target.value))}
                placeholder="Capacity"
                className="w-24 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <button
                type="button"
                onClick={handleAddTrack}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Add
              </button>
            </div>
          </div>
          
          {tracks.length > 0 ? (
            <div className="bg-gray-50 p-3 rounded border">
              <ul className="divide-y divide-gray-200">
                {tracks.map((track) => (
                  <li key={track._id} className="py-3 flex justify-between items-center">
                    <div>
                      <span className="font-medium">{track.name}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        (Capacity: {track.capacity})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTrack(track._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 italic">No tracks added yet.</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Industry'}
          </button>
        </div>
      </form>
    </div>
  );
} 