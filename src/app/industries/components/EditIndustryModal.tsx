'use client';

import React, { useState, useEffect } from 'react';
import { Industry, IndustryType, Track } from '@/app/shared/types/models';
import { v4 as uuidv4 } from 'uuid';
import { CAR_TYPES } from '@/app/rolling-stock/components/RollingStockForm';
import { Dialog, Button, useToast } from '@/app/components/ui';

interface EditIndustryModalProps {
  industry: Industry | null;
  onSave: (updatedIndustry: Industry) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

export default function EditIndustryModal({
  industry,
  onSave,
  onCancel,
  isOpen
}: EditIndustryModalProps) {
  const [name, setName] = useState('');
  const [industryType, setIndustryType] = useState<IndustryType>(IndustryType.FREIGHT);
  const [description, setDescription] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackCapacity, setNewTrackCapacity] = useState(3); // Default capacity
  const [newTrackCarTypes, setNewTrackCarTypes] = useState<string[]>(CAR_TYPES.map(type => type.aarType)); // Default to all car types
  const { toast } = useToast();

  // Initialize form data when industry changes
  useEffect(() => {
    if (industry) {
      setName(industry.name);
      setIndustryType(industry.industryType);
      setDescription(industry.description || '');
      setTracks(industry.tracks || []);
    } else {
      // Reset form if no industry
      setName('');
      setIndustryType(IndustryType.FREIGHT);
      setDescription('');
      setTracks([]);
    }
  }, [industry]);

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
      
      if (!industry) {
        return;
      }
      
      const updatedData = {
        ...industry,
        name,
        industryType,
        description: description || undefined,
        tracks
      };
      
      await onSave(updatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update industry');
      toast({
        title: 'Error',
        description: `Failed to update industry: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: 'error',
      });
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
      acceptedCarTypes: newTrackCarTypes, // Use the selected car types
      ownerId: industry?.ownerId || 'owner1'
    };

    setTracks([...tracks, newTrack]);
    setNewTrackName(''); // Reset name input
    setNewTrackCapacity(3); // Reset capacity input
    setNewTrackCarTypes(CAR_TYPES.map(type => type.aarType)); // Reset to all car types
    setError(null); // Clear any error messages
  };

  const updateTrack = (index: number, field: keyof Track, value: string | number | string[]) => {
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

  // Helper function to toggle car type selection for new tracks
  const toggleNewTrackCarType = (aarType: string) => {
    if (newTrackCarTypes.includes(aarType)) {
      setNewTrackCarTypes(newTrackCarTypes.filter(type => type !== aarType));
    } else {
      setNewTrackCarTypes([...newTrackCarTypes, aarType]);
    }
  };

  // Function to handle "Select All" and "Clear All" actions
  const handleBulkCarTypeSelection = (selectAll: boolean, index?: number) => {
    if (index !== undefined) {
      // For existing track
      updateTrack(
        index, 
        'acceptedCarTypes', 
        selectAll ? CAR_TYPES.map(type => type.aarType) : []
      );
    } else {
      // For new track
      setNewTrackCarTypes(selectAll ? CAR_TYPES.map(type => type.aarType) : []);
    }
  };

  // Helper function to get color for car type badge
  const getCarTypeBadgeClass = (aarType: string) => {
    const typeMap: Record<string, string> = {
      'XM': 'bg-yellow-100 text-yellow-800',
      'FB': 'bg-green-100 text-green-800',
      'TA': 'bg-red-100 text-red-800',
      'GS': 'bg-blue-100 text-blue-800',
      'HT': 'bg-purple-100 text-purple-800',
      'RB': 'bg-indigo-100 text-indigo-800',
      'CS': 'bg-orange-100 text-orange-800'
    };
    
    // Default fallback
    return typeMap[aarType] || 'bg-gray-100 text-gray-800';
  };

  // Helper to check if a track accepts a specific car type
  const acceptsCarType = (track: Track, carType: string): boolean => {
    return Array.isArray(track.acceptedCarTypes) && track.acceptedCarTypes.includes(carType);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCancel}
      title={industry ? `Edit Industry: ${industry.name}` : 'Add New Industry'}
      size="lg"
    >
      <div className="bg-white">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md" data-testid="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} role="form">
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
              data-testid="industryType"
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
                  <div key={track._id} className="p-3 border rounded bg-gray-50">
                    <div className="flex items-start space-x-2">
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
                              onChange={(e) => updateTrack(index, 'maxCars', parseInt(e.target.value) || 1)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2"
                              disabled={isSubmitting}
                              data-testid={`track-capacity-${index}`}
                            />
                          </div>
                          <div className="pt-6">
                            <button
                              type="button"
                              onClick={() => removeTrack(index)}
                              className="text-red-600 hover:text-red-800"
                              disabled={isSubmitting || (track.placedCars && track.placedCars.length > 0)}
                              title={track.placedCars && track.placedCars.length > 0 ? "Can't remove track with cars" : "Remove track"}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Accepted Car Types</label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <button
                          type="button"
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                          onClick={() => handleBulkCarTypeSelection(true, index)}
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          className="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
                          onClick={() => handleBulkCarTypeSelection(false, index)}
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {CAR_TYPES.map(type => (
                          <button
                            type="button"
                            key={type.aarType}
                            onClick={() => {
                              const currentTypes = Array.isArray(track.acceptedCarTypes) ? [...track.acceptedCarTypes] : [];
                              if (currentTypes.includes(type.aarType)) {
                                updateTrack(index, 'acceptedCarTypes', currentTypes.filter(t => t !== type.aarType));
                              } else {
                                updateTrack(index, 'acceptedCarTypes', [...currentTypes, type.aarType]);
                              }
                            }}
                            className={`text-xs px-2 py-1 rounded border ${
                              acceptsCarType(track, type.aarType) 
                                ? getCarTypeBadgeClass(type.aarType)
                                : 'bg-gray-100 text-gray-400 border-gray-200'
                            }`}
                          >
                            {type.aarType}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add New Track Section */}
            <div className="p-4 border border-dashed rounded mt-4">
              <h4 className="font-medium mb-2">Add New Track</h4>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
                <div className="md:col-span-3">
                  <label htmlFor="new-track-name" className="block text-sm text-gray-700">Track Name</label>
                  <input
                    id="new-track-name"
                    type="text"
                    value={newTrackName}
                    onChange={(e) => setNewTrackName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2"
                    placeholder="Main, Siding 1, etc."
                    disabled={isSubmitting}
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="new-track-capacity" className="block text-sm text-gray-700">Capacity</label>
                  <input
                    id="new-track-capacity"
                    type="number"
                    min="1"
                    value={newTrackCapacity}
                    onChange={(e) => setNewTrackCapacity(parseInt(e.target.value) || 1)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="md:col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={addTrack}
                    className="bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 w-full"
                    disabled={isSubmitting}
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">Accepted Car Types</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  <button
                    type="button"
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                    onClick={() => handleBulkCarTypeSelection(true)}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
                    onClick={() => handleBulkCarTypeSelection(false)}
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {CAR_TYPES.map(type => (
                    <button
                      type="button"
                      key={type.aarType}
                      onClick={() => toggleNewTrackCarType(type.aarType)}
                      className={`text-xs px-2 py-1 rounded border ${
                        newTrackCarTypes.includes(type.aarType) 
                          ? getCarTypeBadgeClass(type.aarType)
                          : 'bg-gray-100 text-gray-400 border-gray-200'
                      }`}
                    >
                      {type.aarType}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={onCancel}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
} 