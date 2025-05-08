'use client';

import React, { useState, useEffect } from 'react';
import { Location, LocationType, Block } from '@/app/shared/types/models';
import { 
  Dialog, 
  Button, 
  Input,
  Select,
  useToast
} from '@/app/components/ui';

// Component Props
interface EditLocationModalProps {
  location: Location | null;
  blocks: Block[];
  onSave: (location: Location) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

function getInitialFormState(): Location {
  return {
    _id: '',
    stationName: '',
    blockId: '',
    locationType: LocationType.ON_LAYOUT,
    ownerId: 'owner1'  // Default owner
  };
}

export default function EditLocationModal({
  location,
  blocks,
  onSave,
  onCancel,
  isOpen
}: EditLocationModalProps) {
  const [formData, setFormData] = useState<Location>(getInitialFormState());
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  
  // Update form when location changes
  useEffect(() => {
    if (location) {
      // Convert block string to blockId if needed for backward compatibility
      const updatedLocation = { ...location };
      if (!updatedLocation.blockId && updatedLocation.block) {
        const matchingBlock = blocks.find(b => b.blockName === updatedLocation.block);
        if (matchingBlock) {
          updatedLocation.blockId = matchingBlock._id;
        }
      }
      setFormData(updatedLocation);
    } else {
      setFormData(getInitialFormState());
    }
  }, [location, blocks]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.stationName.trim()) {
      errors.stationName = 'Station name is required';
    }
    
    if (!formData.blockId) {
      errors.blockId = 'Block is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save location:', error);
      toast({
        title: 'Error',
        description: `Failed to ${location ? 'update' : 'create'} location: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create block options
  const blockOptions = [
    { value: '', label: 'Select a Block' },
    ...blocks.map(block => ({
      value: block._id,
      label: block.blockName
    }))
  ];

  // Create location type options
  const locationTypeOptions = Object.values(LocationType).map(type => ({
    value: type,
    label: type.replace('_', ' ')
  }));

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCancel}
      title={location ? `Edit ${location.stationName}` : 'Add New Location'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Station Name"
            name="stationName"
            value={formData.stationName}
            onChange={handleChange}
            error={validationErrors.stationName}
            placeholder="Echo Lake, WA"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Select
              label="Block"
              name="blockId"
              value={formData.blockId}
              onChange={handleChange}
              options={blockOptions}
              error={validationErrors.blockId}
            />
          </div>
          <div>
            <Select
              label="Location Type"
              name="locationType"
              value={formData.locationType}
              onChange={handleChange}
              options={locationTypeOptions}
            />
          </div>
        </div>
        
        <div>
          <Input
            label="Description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Optional description"
          />
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
            isLoading={loading}
          >
            {location ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
} 