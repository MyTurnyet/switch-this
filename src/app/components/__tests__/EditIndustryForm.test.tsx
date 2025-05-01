import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditIndustryForm } from '../EditIndustryForm';
import { Industry, IndustryType, Track } from '@/app/shared/types/models';
import { IndustryService } from '@/app/shared/services/IndustryService';

// Mock uuid to return predictable IDs
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid')
}));

// Mock the industry service
jest.mock('@/app/shared/services/IndustryService', () => {
  return {
    IndustryService: jest.fn().mockImplementation(() => {
      return {
        updateIndustry: jest.fn().mockResolvedValue({
          _id: '123',
          name: 'Updated Industry',
          industryType: 'FREIGHT',
          tracks: [
            {
              _id: 'track1',
              name: 'Track 1',
              maxCars: 3,
              capacity: 3,
              length: 0,
              placedCars: [],
              ownerId: '789'
            }
          ],
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
  const mockTrack: Track = {
    _id: 'track1',
    name: 'Track 1',
    maxCars: 3,
    capacity: 3,
    length: 0,
    placedCars: [],
    acceptedCarTypes: ['XM', 'FB', 'TA'],
    ownerId: '789'
  };
  
  const mockIndustry: Industry = {
    _id: '123',
    name: 'Test Industry',
    industryType: IndustryType.FREIGHT,
    tracks: [mockTrack],
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
  
  it('renders the form with industry data including tracks', () => {
    render(
      <EditIndustryForm 
        industry={mockIndustry} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByText('Edit Industry')).toBeInTheDocument();
    expect(screen.getByLabelText(/Name \*/)).toHaveValue('Test Industry');
    expect(screen.getByLabelText('Type')).toHaveValue('FREIGHT');
    expect(screen.getByLabelText(/Description/)).toHaveValue('Test description');
    
    // Check track section
    expect(screen.getByText('Tracks')).toBeInTheDocument();
    expect(screen.getByTestId('track-name-0')).toHaveValue('Track 1');
    expect(screen.getByTestId('track-capacity-0')).toHaveValue(3);
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
    fireEvent.change(screen.getByLabelText(/Name \*/), { target: { value: '' } });
    
    // Submit the form 
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Verify the service wasn't called (validation prevents submission)
    expect(mockUpdateIndustry).not.toHaveBeenCalled();
    expect(mockOnSave).not.toHaveBeenCalled();
  });
  
  it('allows adding a new track', () => {
    render(
      <EditIndustryForm 
        industry={mockIndustry} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Enter new track information using testids
    fireEvent.change(screen.getByTestId('new-track-name'), { target: { value: 'New Track' } });
    fireEvent.change(screen.getByTestId('new-track-capacity'), { target: { value: '5' } });
    
    // Click add button
    fireEvent.click(screen.getByTestId('add-track-button'));
    
    // Verify new track was added to the list
    expect(screen.getByTestId('track-name-1')).toBeInTheDocument(); // We should now have track-name-0 and track-name-1
    expect(screen.getByDisplayValue('New Track')).toBeInTheDocument();
  });
  
  it('validates new track fields', () => {
    render(
      <EditIndustryForm 
        industry={mockIndustry} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Try to add track without a name
    fireEvent.click(screen.getByTestId('add-track-button'));
    
    // Verify error message
    expect(screen.getByText('Track name is required')).toBeInTheDocument();
  });
  
  it('allows updating a track', () => {
    render(
      <EditIndustryForm 
        industry={mockIndustry} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Find track inputs using testids
    const trackNameInput = screen.getByTestId('track-name-0');
    const trackCapacityInput = screen.getByTestId('track-capacity-0');
    
    // Update the track
    fireEvent.change(trackNameInput, { target: { value: 'Updated Track' } });
    fireEvent.change(trackCapacityInput, { target: { value: '4' } });
    
    // Verify the changes
    expect(trackNameInput).toHaveValue('Updated Track');
    expect(trackCapacityInput).toHaveValue(4);
  });
  
  it('allows updating accepted car types for a track', async () => {
    // Set up mock implementation before rendering
    const mockUpdateIndustry = jest.fn().mockResolvedValue({
      _id: '123',
      name: 'Test Industry',
      industryType: IndustryType.FREIGHT,
      tracks: [
        {
          _id: 'track1',
          name: 'Track 1',
          maxCars: 3,
          capacity: 3,
          length: 0,
          placedCars: [],
          acceptedCarTypes: ['GS'], // Only GS accepted
          ownerId: '789'
        }
      ]
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
    
    // Initially, the track has XM, FB, and TA car types
    
    // Find and click "Clear All" to clear existing car types
    fireEvent.click(screen.getByTestId('clear-all-0'));
    
    // Now select a specific car type - use the checkbox
    const gsCheckbox = screen.getByTestId('track-car-type-checkbox-0-GS');
    fireEvent.click(gsCheckbox);
    
    // Car type badges should show the updated selection
    expect(screen.getByTestId('track-0-type-GS')).toBeInTheDocument();
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Wait for the async operation to complete
    await waitFor(() => {
      expect(mockUpdateIndustry).toHaveBeenCalled();
      expect(mockOnSave).toHaveBeenCalled();
    });
  });
  
  it('allows "Select All" and "Clear All" for car types', () => {
    render(
      <EditIndustryForm 
        industry={mockIndustry} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Click "Clear All" to clear car types
    fireEvent.click(screen.getByTestId('clear-all-0'));
    
    // Should show the "no car types selected" message
    expect(screen.getByTestId('track-0-no-types')).toBeInTheDocument();
    
    // Now click "Select All" to select all car types
    fireEvent.click(screen.getByTestId('select-all-0'));
    
    // Check some car types to verify all are selected
    expect(screen.getByTestId('track-0-type-XM')).toBeInTheDocument();
    expect(screen.getByTestId('track-0-type-FB')).toBeInTheDocument();
    expect(screen.getByTestId('track-0-type-TA')).toBeInTheDocument();
  });
  
  it('allows selecting car types when adding a new track', () => {
    render(
      <EditIndustryForm 
        industry={mockIndustry} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Clear new track car types and select only one
    fireEvent.click(screen.getByTestId('new-track-clear-all'));
    
    // Select a specific car type for the new track
    const xmCheckbox = screen.getByTestId('new-track-car-type-XM');
    fireEvent.click(xmCheckbox);
    
    // Verify that XM is shown as selected in the new track section
    expect(screen.getByTestId('new-track-type-XM')).toBeInTheDocument();
    
    // Enter new track information
    fireEvent.change(screen.getByTestId('new-track-name'), { target: { value: 'Boxcar Track' } });
    fireEvent.change(screen.getByTestId('new-track-capacity'), { target: { value: '5' } });
    
    // Click add button
    fireEvent.click(screen.getByTestId('add-track-button'));
    
    // Verify new track was added with only XM car type
    const addedTrack = screen.getByTestId('track-name-1');
    expect(addedTrack).toHaveValue('Boxcar Track');
    
    // The newly added track should show the XM badge for the second track (index 1)
    expect(screen.getByTestId('track-1-type-XM')).toBeInTheDocument();
  });
  
  it('allows removing a track', () => {
    render(
      <EditIndustryForm 
        industry={mockIndustry} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Find and click the remove button
    const removeButton = screen.getByTestId('remove-track-0');
    fireEvent.click(removeButton);
    
    // Verify the track was removed
    expect(screen.queryByTestId('track-name-0')).not.toBeInTheDocument();
    expect(screen.getByText('No tracks added yet. Add a track below.')).toBeInTheDocument();
  });
  
  it('prevents removing track with cars on it', () => {
    // Create a mock industry with a track that has cars on it
    const mockTrackWithCars: Track = {
      _id: 'track2',
      name: 'Track 2',
      maxCars: 5,
      capacity: 5,
      length: 0,
      placedCars: ['car1', 'car2'],
      acceptedCarTypes: ['XM', 'FB', 'TA'],
      ownerId: '789'
    };
    
    const mockIndustryWithCarsOnTrack: Industry = {
      ...mockIndustry,
      tracks: [mockTrackWithCars]
    };
    
    render(
      <EditIndustryForm 
        industry={mockIndustryWithCarsOnTrack} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    // Verify the car count is displayed
    const carCountElement = screen.getByTestId('track-cars-count-0');
    expect(carCountElement).toBeInTheDocument();
    expect(carCountElement).toHaveTextContent('2 car(s)');
    
    // Find the remove button that should be disabled
    const removeButton = screen.getByTestId('remove-track-0');
    expect(removeButton).toBeDisabled();
    expect(removeButton).toHaveAttribute('title', 'Remove cars first');
    
    // Try to click it anyway (won't have an effect since it's disabled)
    fireEvent.click(removeButton);
    
    // Verify the track was NOT removed
    expect(screen.getByTestId('track-name-0')).toBeInTheDocument();
  });
  
  it('submits the form with updated data including tracks', async () => {
    const mockUpdateIndustry = jest.fn().mockResolvedValue({
      ...mockIndustry,
      name: 'Updated Industry',
      description: 'Updated description',
      tracks: [
        {
          _id: 'track1',
          name: 'Updated Track',
          maxCars: 4,
          capacity: 4,
          length: 0,
          placedCars: [],
          ownerId: '789'
        }
      ]
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
    fireEvent.change(screen.getByLabelText(/Name \*/), { target: { value: 'Updated Industry' } });
    const typeSelect = screen.getByTestId('industryType') || screen.getByLabelText('Type');
    fireEvent.change(typeSelect, { target: { value: 'YARD' } });
    fireEvent.change(screen.getByLabelText(/Description/), { target: { value: 'Updated description' } });
    
    // Update track using testids
    const trackNameInput = screen.getByTestId('track-name-0');
    const trackCapacityInput = screen.getByTestId('track-capacity-0');
    
    fireEvent.change(trackNameInput, { target: { value: 'Updated Track' } });
    fireEvent.change(trackCapacityInput, { target: { value: '4' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Verify service was called with the updated data
    await waitFor(() => {
      expect(mockUpdateIndustry).toHaveBeenCalledWith('123', expect.objectContaining({
        name: 'Updated Industry',
        industryType: 'YARD',
        description: 'Updated description',
        tracks: [
          expect.objectContaining({
            _id: 'track1',
            name: 'Updated Track',
            maxCars: 4
          })
        ]
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