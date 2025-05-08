'use client';

import React, { useState, useEffect } from 'react';
import { RollingStock, Industry } from '@/app/shared/types/models';
import { 
  Dialog, 
  Button, 
  Input, 
  Select,
  FileUpload,
  useToast
} from '@/app/components/ui';
import { SelectOption } from '@/app/components/ui/select';

// Component Props
interface EditRollingStockModalProps {
  rollingStock: RollingStock | null;
  industries: Industry[];
  onSave: (updatedCar: RollingStock) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

// Initial form state for a new rolling stock item
const getInitialFormState = (): RollingStock => ({
  _id: '',
  ownerId: '',
  roadName: '',
  roadNumber: '',
  aarType: '',
  description: '',
  color: '',
  note: '',
  homeYard: '',
  currentLocation: undefined
});

export default function EditRollingStockModal({
  rollingStock,
  industries,
  onSave,
  onCancel,
  isOpen
}: EditRollingStockModalProps) {
  const [formData, setFormData] = useState<RollingStock>(getInitialFormState());
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  
  // Update form when rollingStock changes
  useEffect(() => {
    if (rollingStock) {
      setFormData(rollingStock);
    } else {
      setFormData(getInitialFormState());
    }
  }, [rollingStock]);

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

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'homeYard') {
      setFormData(prev => ({
        ...prev,
        homeYard: value
      }));
    } else if (name === 'currentLocation' && value) {
      setFormData(prev => ({
        ...prev,
        currentLocation: {
          industryId: value,
          trackId: '' // Default to empty string since it's required
        }
      }));
    } else if (name === 'currentLocation' && !value) {
      setFormData(prev => ({
        ...prev,
        currentLocation: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: Record<string, string> = {};
    
    if (!formData.roadName) errors.roadName = 'Road name is required';
    if (!formData.roadNumber) errors.roadNumber = 'Road number is required';
    if (!formData.aarType) errors.aarType = 'AAR type is required';
    if (!formData.homeYard) errors.homeYard = 'Home yard is required';
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      setLoading(true);
      await onSave(formData);
      toast({ 
        title: rollingStock ? 'Rolling stock updated' : 'Rolling stock created', 
        description: `${formData.roadName} ${formData.roadNumber} successfully saved.`,
        variant: 'success' 
      });
    } catch (error) {
      console.error('Failed to save:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to save rolling stock. Please try again.',
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      // In a real application, you would upload this file to a server
      // For now, we'll just display a toast notification
      toast({ 
        title: 'File selected', 
        description: `${files[0].name} will be uploaded when you save.`,
        variant: 'info' 
      });
    }
  };

  // Create options for yard selection
  const yardOptions: SelectOption[] = industries
    .filter(industry => industry.industryType === 'YARD')
    .map(yard => ({
      value: yard._id,
      label: yard.name
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // Create options for all industries
  const industryOptions: SelectOption[] = [
    { value: '', label: 'Select Current Location' },
    ...industries.map(industry => ({
      value: industry._id,
      label: industry.name
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCancel}
      title={rollingStock ? `Edit ${rollingStock.roadName} ${rollingStock.roadNumber}` : 'Add New Rolling Stock'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Road Name"
              name="roadName"
              value={formData.roadName}
              onChange={handleChange}
              error={validationErrors.roadName}
              placeholder="UP"
            />
          </div>
          <div>
            <Input
              label="Road Number"
              name="roadNumber"
              value={formData.roadNumber}
              onChange={handleChange}
              error={validationErrors.roadNumber}
              placeholder="1234"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="AAR Type"
              name="aarType"
              value={formData.aarType}
              onChange={handleChange}
              error={validationErrors.aarType}
              placeholder="XM"
            />
          </div>
          <div>
            <Input
              label="Color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="Blue"
            />
          </div>
        </div>
        
        <div>
          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="40' Box Car"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Select
              label="Home Yard"
              name="homeYard"
              value={formData.homeYard}
              onChange={handleIndustryChange}
              error={validationErrors.homeYard}
              options={[
                { value: '', label: 'Select Home Yard' },
                ...yardOptions
              ]}
            />
          </div>
          <div>
            <Select
              label="Current Location"
              name="currentLocation"
              value={formData.currentLocation?.industryId || ''}
              onChange={handleIndustryChange}
              options={industryOptions}
            />
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Upload Photo</p>
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept=".jpg,.jpeg,.png"
            showSelectedFiles={true}
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
            {rollingStock ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
} 