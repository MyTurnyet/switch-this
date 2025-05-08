'use client';

import React, { useState, useEffect } from 'react';
import { Block } from '@/app/shared/types/models';
import { 
  Dialog, 
  Button, 
  Input,
  useToast
} from '@/app/components/ui';

// Component Props
interface EditBlockModalProps {
  block: Block | null;
  onSave: (block: Block) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

function getInitialFormState(): Block {
  return {
    _id: '',
    blockName: '',
    ownerId: 'owner1'  // Default owner
  };
}

export default function EditBlockModal({
  block,
  onSave,
  onCancel,
  isOpen
}: EditBlockModalProps) {
  const [formData, setFormData] = useState<Block>(getInitialFormState());
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  
  // Update form when block changes
  useEffect(() => {
    if (block) {
      setFormData(block);
    } else {
      setFormData(getInitialFormState());
    }
  }, [block]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    if (!formData.blockName.trim()) {
      errors.blockName = 'Block name is required';
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
      console.error('Failed to save block:', error);
      toast({
        title: 'Error',
        description: `Failed to ${block ? 'update' : 'create'} block: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCancel}
      title={block ? `Edit ${block.blockName}` : 'Add New Block'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Block Name"
            name="blockName"
            value={formData.blockName}
            onChange={handleChange}
            error={validationErrors.blockName}
            placeholder="ECHO"
          />
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
            {block ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
} 