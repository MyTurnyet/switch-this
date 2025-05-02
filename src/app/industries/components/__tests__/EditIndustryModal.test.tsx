import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditIndustryModal from '../EditIndustryModal';
import { Industry, IndustryType } from '@/app/shared/types/models';
import '@testing-library/jest-dom';

// Define types for the mocked components
interface DialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  title?: string;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Mock the Dialog component
jest.mock('@/app/components/ui', () => ({
  Dialog: ({ children, isOpen, title }: DialogProps) => 
    isOpen ? (
      <div data-testid="mock-dialog">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
  Button: ({ children, onClick, type }: ButtonProps) => (
    <button onClick={onClick} type={type} data-testid={`button-${type || 'button'}`}>
      {children}
    </button>
  ),
  useToast: () => ({
    toast: jest.fn()
  })
}));

// Sample industry data for testing
const mockIndustry: Industry = {
  _id: 'ind-123',
  name: 'Test Industry',
  industryType: IndustryType.FREIGHT,
  description: 'Test description',
  tracks: [
    {
      _id: 'track-1',
      name: 'Track 1',
      maxCars: 3,
      capacity: 3,
      length: 0,
      placedCars: [],
      acceptedCarTypes: ['XM', 'FB'],
      ownerId: 'owner1'
    }
  ],
  locationId: 'loc-1',
  blockName: 'BLOCK1',
  ownerId: 'owner1'
};

describe('EditIndustryModal', () => {
  const mockOnSave = jest.fn().mockResolvedValue(undefined);
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders when isOpen is true', () => {
    render(
      <EditIndustryModal
        industry={mockIndustry}
        isOpen={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Industry: Test Industry')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    render(
      <EditIndustryModal
        industry={mockIndustry}
        isOpen={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByTestId('mock-dialog')).not.toBeInTheDocument();
  });

  test('initializes form with industry data', () => {
    render(
      <EditIndustryModal
        industry={mockIndustry}
        isOpen={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Use getByTestId instead of getByLabelText for the name field
    expect(screen.getByDisplayValue('Test Industry')).toBeInTheDocument();
    expect(screen.getByTestId('industryType')).toHaveValue('FREIGHT');
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    
    // Check if the track is displayed
    expect(screen.getByTestId('track-name-0')).toHaveValue('Track 1');
    // Use getAttribute to check number input value
    expect(screen.getByTestId('track-capacity-0')).toHaveValue(3);
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(
      <EditIndustryModal
        industry={mockIndustry}
        isOpen={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('validates form before submission', async () => {
    render(
      <EditIndustryModal
        industry={mockIndustry}
        isOpen={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Clear the name field
    const nameInput = screen.getByDisplayValue('Test Industry');
    fireEvent.change(nameInput, { target: { value: '' } });
    
    // Try to submit the form
    fireEvent.submit(screen.getByRole('form'));
    
    // onSave should not be called when validation fails
    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  test('calls onSave with updated industry data when form is valid', async () => {
    render(
      <EditIndustryModal
        industry={mockIndustry}
        isOpen={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Change the name field - use a more specific selector
    const nameInput = screen.getByDisplayValue('Test Industry');
    fireEvent.change(nameInput, { target: { value: 'Updated Industry Name' } });
    
    // Submit the form
    fireEvent.submit(screen.getByRole('form'));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        ...mockIndustry,
        name: 'Updated Industry Name'
      }));
    });
  });

  test('allows adding a new track', async () => {
    render(
      <EditIndustryModal
        industry={mockIndustry}
        isOpen={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Fill in new track details - use more specific selectors
    const trackNameInput = screen.getByPlaceholderText('Main, Siding 1, etc.');
    fireEvent.change(trackNameInput, { target: { value: 'New Track' } });
    
    // Use id to find the capacity input
    const capacityInput = document.getElementById('new-track-capacity') as HTMLInputElement;
    fireEvent.change(capacityInput, { target: { value: '5' } });
    
    // Add the track
    fireEvent.click(screen.getByText('Add'));
    
    // Now we should have two tracks
    expect(screen.getByTestId('track-name-0')).toHaveValue('Track 1');
    expect(screen.getByTestId('track-name-1')).toHaveValue('New Track');
    // Check number value correctly
    expect(screen.getByTestId('track-capacity-1')).toHaveValue(5);
  });

  test('shows error when trying to add track without a name', () => {
    render(
      <EditIndustryModal
        industry={mockIndustry}
        isOpen={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Leave track name empty
    fireEvent.change(screen.getByLabelText(/Track Name/), { target: { value: '' } });
    
    // Try to add the track
    fireEvent.click(screen.getByText('Add'));
    
    // Check for validation error
    expect(screen.getByText('Track name is required')).toBeInTheDocument();
  });
}); 