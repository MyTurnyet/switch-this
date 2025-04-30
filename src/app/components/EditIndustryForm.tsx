'use client';

import React, { useState } from 'react';
import { Industry, IndustryType } from '@/app/shared/types/models';
import { IndustryService } from '@/app/shared/services/IndustryService';

interface EditIndustryFormProps {
  industry: Industry;
  onSave: (updatedIndustry: Industry) => void;
  onCancel: () => void;
}

export function EditIndustryForm({ industry, onSave, onCancel }: EditIndustryFormProps) {
  const [name, setName] = useState(industry.name);
  const [industryType, setIndustryType] = useState<IndustryType>(industry.industryType);
  const [description, setDescription] = useState(industry.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const industryService = new IndustryService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    
    if (!name.trim()) {
      setError('Industry name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const updatedData = {
        name,
        industryType,
        description: description || undefined,
      };
      
      const updatedIndustry = await industryService.updateIndustry(industry._id, updatedData);
      onSave(updatedIndustry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update industry');
    } finally {
      setIsSubmitting(false);
    }
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
        
        <div className="flex justify-end space-x-3">
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