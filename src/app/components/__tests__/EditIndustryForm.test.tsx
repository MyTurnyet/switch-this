import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditIndustryForm } from '../EditIndustryForm';
import { Industry, IndustryType } from '@/app/shared/types/models';
import { IndustryService } from '@/app/shared/services/IndustryService';

// Mock the industry service
jest.mock('@/app/shared/services/IndustryService', () => {
  return {
    IndustryService: jest.fn().mockImplementation(() => {
      return {
        updateIndustry: jest.fn().mockResolvedValue({
          _id: '123',
          name: 'Updated Industry',
          industryType: 'FREIGHT',
          tracks: [],
          locationId: '456',
          blockName: 'Test Block',
          ownerId: '789',
          description: 'Updated description'
        })
      };
    })
  };
});

describe('EditIndustryForm', () => {
  const mockIndustry: Industry = {
    _id: '123',
    name: 'Test Industry',
    industryType: IndustryType.FREIGHT,
    tracks: [],
    locationId: '456',
    blockName: 'Test Block',
    ownerId: '789',
    description: 'Test description'
  };
  
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the form with industry data', () => {
    render(
      <EditIndustryForm 
        industry={mockIndustry} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByText('Edit Industry')).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/)).toHaveValue('Test Industry');
    expect(screen.getByLabelText(/Type/)).toHaveValue('FREIGHT');
    expect(screen.getByLabelText(/Description/)).toHaveValue('Test description');
  });
  
  it('calls onCancel when cancel button is clicked', () => {
    render(
      <EditIndustryForm 
        industry={mockIndustry} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
  
  it('validates required fields', () => {
    // Verify form validation by checking that updateIndustry isn't called
    // with empty name and onSave isn't called
    const mockUpdateIndustry = jest.fn();
    (IndustryService as jest.Mock).mockImplementation(() => ({
      updateIndustry: mockUpdateIndustry
    }));
    
    render(
      <EditIndustryForm 
        industry={mockIndustry} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Clear the name field
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: '' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Verify the service wasn't called (validation prevents submission)
    expect(mockUpdateIndustry).not.toHaveBeenCalled();
    expect(mockOnSave).not.toHaveBeenCalled();
  });
  
  it('submits the form with updated data', async () => {
    const mockUpdateIndustry = jest.fn().mockResolvedValue({
      ...mockIndustry,
      name: 'Updated Industry',
      description: 'Updated description'
    });
    
    (IndustryService as jest.Mock).mockImplementation(() => ({
      updateIndustry: mockUpdateIndustry
    }));
    
    render(
      <EditIndustryForm 
        industry={mockIndustry} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Update form fields
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Updated Industry' } });
    fireEvent.change(screen.getByLabelText(/Type/), { target: { value: 'YARD' } });
    fireEvent.change(screen.getByLabelText(/Description/), { target: { value: 'Updated description' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Verify service was called with the updated data
    await waitFor(() => {
      expect(mockUpdateIndustry).toHaveBeenCalledWith('123', expect.objectContaining({
        name: 'Updated Industry',
        industryType: 'YARD',
        description: 'Updated description'
      }));
    });
    
    // Verify onSave was called with the updated industry
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });
  
  it('handles errors during form submission', async () => {
    const mockError = new Error('Failed to update industry');
    const mockUpdateIndustry = jest.fn().mockRejectedValue(mockError);
    
    (IndustryService as jest.Mock).mockImplementation(() => ({
      updateIndustry: mockUpdateIndustry
    }));
    
    render(
      <EditIndustryForm 
        industry={mockIndustry} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Check for error message
    expect(await screen.findByTestId('error-message')).toHaveTextContent('Failed to update industry');
    expect(mockOnSave).not.toHaveBeenCalled();
  });
}); 