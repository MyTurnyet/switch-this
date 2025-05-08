import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditBlockModal from '../EditBlockModal';
import { Block } from '@/app/shared/types/models';

// Mock dialog component
jest.mock('@/app/components/ui/dialog', () => {
  return {
    Dialog: ({ children, isOpen, title }: { 
      children: React.ReactNode;
      isOpen: boolean;
      title: string;
      onClose?: () => void;
    }) => {
      if (!isOpen) return null;
      return (
        <div data-testid="dialog">
          <h2>{title}</h2>
          <div>{children}</div>
        </div>
      );
    }
  };
});

// Mock toast hook
const mockToast = jest.fn();
jest.mock('@/app/components/ui', () => {
  const original = jest.requireActual('@/app/components/ui');
  return {
    ...original,
    useToast: () => ({
      toast: mockToast
    })
  };
});

describe('EditBlockModal Component', () => {
  const mockSave = jest.fn();
  const mockCancel = jest.fn();
  
  const mockBlock: Block = {
    _id: 'block1',
    blockName: 'ECHO',
    description: 'Echo District',
    ownerId: 'owner1'
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the create block form when no block is provided', () => {
    render(
      <EditBlockModal
        block={null}
        onSave={mockSave}
        onCancel={mockCancel}
        isOpen={true}
      />
    );
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add New Block')).toBeInTheDocument();
    
    // Form fields should be empty
    const blockNameInput = screen.getByPlaceholderText('ECHO') as HTMLInputElement;
    expect(blockNameInput.value).toBe('');
    
    const descriptionInput = screen.getByPlaceholderText('Optional description') as HTMLInputElement;
    expect(descriptionInput.value).toBe('');
    
    // Buttons should be present
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });
  
  it('renders the edit block form with populated data when block is provided', () => {
    render(
      <EditBlockModal
        block={mockBlock}
        onSave={mockSave}
        onCancel={mockCancel}
        isOpen={true}
      />
    );
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText(`Edit ${mockBlock.blockName}`)).toBeInTheDocument();
    
    // Form fields should be populated
    const blockNameInput = screen.getByDisplayValue(mockBlock.blockName) as HTMLInputElement;
    expect(blockNameInput.value).toBe(mockBlock.blockName);
    
    const descriptionInput = screen.getByDisplayValue(mockBlock.description as string) as HTMLInputElement;
    expect(descriptionInput.value).toBe(mockBlock.description);
    
    // Buttons should be present
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
  });
  
  it('calls onCancel when cancel button is clicked', () => {
    render(
      <EditBlockModal
        block={null}
        onSave={mockSave}
        onCancel={mockCancel}
        isOpen={true}
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });
  
  it('validates form inputs and shows errors when required fields are missing', async () => {
    render(
      <EditBlockModal
        block={null}
        onSave={mockSave}
        onCancel={mockCancel}
        isOpen={true}
      />
    );
    
    // Submit form without filling required fields
    fireEvent.click(screen.getByText('Create'));
    
    // Validation errors should be displayed
    await waitFor(() => {
      expect(screen.getByText('Block name is required')).toBeInTheDocument();
    });
    
    // onSave should not be called
    expect(mockSave).not.toHaveBeenCalled();
  });
  
  it('calls onSave with form data when submitted successfully', async () => {
    render(
      <EditBlockModal
        block={null}
        onSave={mockSave}
        onCancel={mockCancel}
        isOpen={true}
      />
    );
    
    // Fill out the form
    const blockNameInput = screen.getByPlaceholderText('ECHO');
    fireEvent.change(blockNameInput, { target: { value: 'NEW_BLOCK' } });
    
    const descriptionInput = screen.getByPlaceholderText('Optional description');
    fireEvent.change(descriptionInput, { target: { value: 'New block description' } });
    
    // Submit the form
    mockSave.mockResolvedValueOnce(undefined);
    fireEvent.click(screen.getByText('Create'));
    
    // onSave should be called with form data
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          blockName: 'NEW_BLOCK',
          description: 'New block description',
          _id: '' // New block has empty ID
        })
      );
    });
  });
  
  it('handles API errors gracefully', async () => {
    render(
      <EditBlockModal
        block={mockBlock}
        onSave={mockSave}
        onCancel={mockCancel}
        isOpen={true}
      />
    );
    
    // Make onSave reject with an error
    const error = new Error('API error');
    mockSave.mockRejectedValueOnce(error);
    
    // Submit the form
    fireEvent.click(screen.getByText('Update'));
    
    // Error should be logged and toast notification shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          variant: 'error'
        })
      );
    });
  });
}); 