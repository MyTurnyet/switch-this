'use client';

import React, { useState } from 'react';
import { RollingStock, Industry } from '@/app/shared/types/models';
import {
  Form,
  FormGroup,
  FormLabel,
  FormSection,
  FormActions,
  Input,
  Select,
  Button
} from '@/app/components/ui';

// Car types data
export const CAR_TYPES = [
  { aarType: 'XM', description: 'Boxcar' },
  { aarType: 'FB', description: 'Flatcar BlhHd' },
  { aarType: 'FBC', description: 'Flatcar Centerbeam' },
  { aarType: 'FD', description: 'FlatCar' },
  { aarType: 'GS', description: 'Gondola' },
  { aarType: 'GHC', description: 'Coal Hopper' },
  { aarType: 'GTS', description: 'Woodchip Car' },
  { aarType: 'HK', description: 'Hopper' },
  { aarType: 'HM', description: 'Hopper - 2-Bay' },
  { aarType: 'HT', description: 'Hopper' },
  { aarType: 'HTC', description: 'Hopper - Cylndr' },
  { aarType: 'RB', description: 'Refrigerator Car' },
  { aarType: 'TA', description: 'Tank Car' },
  { aarType: 'XMO', description: 'Boxcar - Hi-Cube' },
  { aarType: 'XPB', description: 'Boxcar - Beer' },
  { aarType: 'XPT', description: 'Boxcar - Thrall' },
  { aarType: 'CS', description: 'Caboose' },
];

// Railroad colors for selection
export const RAILROAD_COLORS = [
  { name: 'Black', value: 'black' },
  { name: 'Blue', value: 'blue' },
  { name: 'Brown', value: 'brown' },
  { name: 'Green', value: 'green' },
  { name: 'Orange', value: 'orange' },
  { name: 'Red', value: 'red' },
  { name: 'Yellow', value: 'yellow' }
];

interface RollingStockFormProps {
  rollingStock?: RollingStock;
  industries: Industry[];
  onSave: (rollingStock: RollingStock) => Promise<void>;
  onCancel: () => void;
  isNew?: boolean;
}

export default function RollingStockForm({
  rollingStock,
  industries,
  onSave,
  onCancel,
  isNew = false
}: RollingStockFormProps) {
  const [formData, setFormData] = useState<Partial<RollingStock>>(
    rollingStock || {
      roadName: '',
      roadNumber: '',
      aarType: 'XM',
      description: 'Boxcar',
      color: 'black',
      homeYard: ''
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'carType' && value) {
      const [aarType, description] = value.split('|');
      setFormData(prev => ({ 
        ...prev, 
        aarType: aarType,
        description: description
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Make sure required fields are present
      if (!formData.roadName || !formData.roadNumber || !formData.aarType) {
        throw new Error('Please fill in all required fields');
      }
      
      await onSave(formData as RollingStock);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create car type options for select
  const carTypeOptions = CAR_TYPES.map(type => ({
    value: `${type.aarType}|${type.description}`,
    label: `${type.aarType} - ${type.description}`
  }));

  // Create color options for select
  const colorOptions = RAILROAD_COLORS.map(color => ({
    value: color.value,
    label: color.name
  }));

  // Create industry options for select
  const industryOptions = [
    { value: '', label: 'Select home yard' },
    ...industries
      .filter(industry => industry.industryType === 'YARD' || industry.industryType === 'FREIGHT')
      .map(industry => ({
        value: industry._id,
        label: industry.name
      }))
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-3xl mx-auto">
      <div className="p-4 border-b">
        <h3 className="text-2xl font-semibold">
          {isNew ? 'Create New Rolling Stock' : 'Edit Rolling Stock'}
        </h3>
      </div>
      
      <Form onSubmit={handleSubmit}>
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <FormSection title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup>
                <FormLabel htmlFor="roadName" required>Railroad</FormLabel>
                <Input
                  id="roadName"
                  name="roadName"
                  type="text"
                  value={formData.roadName || ''}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="roadNumber" required>Number</FormLabel>
                <Input
                  id="roadNumber"
                  name="roadNumber"
                  type="text"
                  value={formData.roadNumber || ''}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup>
                <FormLabel htmlFor="carType" required>Car Type</FormLabel>
                <Select
                  id="carType"
                  name="carType"
                  value={`${formData.aarType}|${formData.description}`}
                  onChange={handleSelectChange}
                  options={carTypeOptions}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="color">Color</FormLabel>
                <Select
                  id="color"
                  name="color"
                  value={formData.color || 'black'}
                  onChange={handleSelectChange}
                  options={colorOptions}
                />
              </FormGroup>
            </div>
          </FormSection>
          
          <FormSection title="Assignment">
            <FormGroup>
              <FormLabel htmlFor="homeYard" required>Home Yard</FormLabel>
              <Select
                id="homeYard"
                name="homeYard"
                value={formData.homeYard || ''}
                onChange={handleSelectChange}
                options={industryOptions}
                required
              />
            </FormGroup>
          </FormSection>
          
          <FormActions>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </FormActions>
        </div>
      </Form>
    </div>
  );
} 