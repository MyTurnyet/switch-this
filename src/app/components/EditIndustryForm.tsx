'use client';

import React, { useState } from 'react';
import { Industry, IndustryType, Track } from '@/app/shared/types/models';
import { IndustryService } from '@/app/shared/services/IndustryService';
import { v4 as uuidv4 } from 'uuid';

interface EditIndustryFormProps {
  industry: Industry;
  onSave: (updatedIndustry: Industry) => void;
  onCancel: () => void;
}

export function EditIndustryForm({ industry, onSave, onCancel }: EditIndustryFormProps) {
  const [name, setName] = useState(industry.name);
  const [industryType, setIndustryType] = useState<IndustryType>(industry.industryType);
  const [description, setDescription] = useState(industry.description || '');
  const [tracks, setTracks] = useState<Track[]>(industry.tracks || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackCapacity, setNewTrackCapacity] = useState(3); // Default capacity
  const industryService = new IndustryService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    
    if (!name.trim()) {
      setError('Industry name is required');
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
      
      const updatedData = {
        name,
        industryType,
        description: description || undefined,
        tracks
      };
      
      const updatedIndustry = await industryService.updateIndustry(industry._id, updatedData);
      onSave(updatedIndustry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update industry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTrack = () => {
    if (!newTrackName.trim()) {
      setError('Track name is required');
      return;
    }

    if (newTrackCapacity <= 0) {
      setError('Track capacity must be greater than 0');
      return;
    }

    // Create new track with unique ID
    const newTrack: Track = {
      _id: uuidv4(), // Generate a temporary ID
      name: newTrackName,
      maxCars: newTrackCapacity,
      capacity: newTrackCapacity,
      length: 0,
      placedCars: [],
      ownerId: industry.ownerId
    };

    setTracks([...tracks, newTrack]);
    setNewTrackName(''); // Reset name input
    setNewTrackCapacity(3); // Reset capacity input
    setError(null); // Clear any error messages
  };

  const updateTrack = (index: number, field: keyof Track, value: string | number) => {
    const updatedTracks = [...tracks];
    updatedTracks[index] = {
      ...updatedTracks[index],
      [field]: value
    };
    
    // If maxCars is updated, also update capacity
    if (field === 'maxCars') {
      updatedTracks[index].capacity = value as number;
    }
    
    setTracks(updatedTracks);
  };

  const removeTrack = (index: number) => {
    // Check if track has cars before allowing removal
    const track = tracks[index];
    if (track.placedCars && track.placedCars.length > 0) {
      setError(`Cannot remove track "${track.name}" as it has ${track.placedCars.length} cars placed on it. Remove the cars first.`);
      return;
    }
    
    setTracks(tracks.filter((_, i) => i !== index));
    setError(null); // Clear any error messages
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Edit Industry</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md" data-testid="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1 font-medium">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="industryType" className="block mb-1 font-medium">
            Type
          </label>
          <select
            id="industryType"
            value={industryType}
            onChange={(e) => setIndustryType(e.target.value as IndustryType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={isSubmitting}
          >
            <option value={IndustryType.FREIGHT}>Freight</option>
            <option value={IndustryType.YARD}>Yard</option>
            <option value={IndustryType.PASSENGER}>Passenger</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block mb-1 font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-vertical"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
        
        {/* Tracks Section */}
        <div className="mb-6 border-t pt-4 mt-4">
          <h3 className="text-lg font-medium mb-3">Tracks</h3>
          
          {tracks.length === 0 ? (
            <p className="text-gray-500 italic mb-4">No tracks added yet. Add a track below.</p>
          ) : (
            <div className="space-y-4 mb-4">
              {tracks.map((track, index) => (
                <div key={track._id} className="flex items-start space-x-2 p-3 border rounded bg-gray-50">
                  <div className="flex-grow">
                    <div className="flex space-x-2 mb-2">
                      <div className="flex-grow">
                        <label htmlFor={`track-name-${index}`} className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          id={`track-name-${index}`}
                          type="text"
                          value={track.name}
                          onChange={(e) => updateTrack(index, 'name', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2"
                          disabled={isSubmitting}
                          data-testid={`track-name-${index}`}
                        />
                      </div>
                      <div className="w-24">
                        <label htmlFor={`track-capacity-${index}`} className="block text-sm font-medium text-gray-700">Capacity</label>
                        <input
                          id={`track-capacity-${index}`}
                          type="number"
                          min="1"
                          value={track.maxCars}
                          onChange={(e) => updateTrack(index, 'maxCars', parseInt(e.target.value))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2"
                          disabled={isSubmitting}
                          data-testid={`track-capacity-${index}`}
                        />
                      </div>
                    </div>
                    
                    {/* Show cars if any are placed on this track */}
                    {track.placedCars && track.placedCars.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600" data-testid={`track-cars-count-${index}`}>
                        <span className="font-medium">{track.placedCars.length} car(s)</span> currently placed on this track
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeTrack(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                    disabled={isSubmitting || (track.placedCars && track.placedCars.length > 0)}
                    title={track.placedCars && track.placedCars.length > 0 ? "Remove cars first" : "Remove track"}
                    data-testid={`remove-track-${index}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Add New Track */}
          <div className="flex items-end space-x-2 border p-3 rounded bg-blue-50">
            <div className="flex-grow">
              <label htmlFor="new-track-name" className="block text-sm font-medium">Track Name</label>
              <input
                id="new-track-name"
                type="text"
                value={newTrackName}
                onChange={(e) => setNewTrackName(e.target.value)}
                placeholder="Enter track name"
                className="mt-1 w-full border border-gray-300 rounded-md shadow-sm py-1 px-2"
                disabled={isSubmitting}
                data-testid="new-track-name"
              />
            </div>
            <div className="w-24">
              <label htmlFor="new-track-capacity" className="block text-sm font-medium">Capacity</label>
              <input
                id="new-track-capacity"
                type="number"
                min="1"
                value={newTrackCapacity}
                onChange={(e) => setNewTrackCapacity(parseInt(e.target.value))}
                className="mt-1 w-full border border-gray-300 rounded-md shadow-sm py-1 px-2"
                disabled={isSubmitting}
                data-testid="new-track-capacity"
              />
            </div>
            <button
              type="button"
              onClick={addTrack}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1 flex items-center"
              disabled={isSubmitting}
              data-testid="add-track-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add
            </button>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 