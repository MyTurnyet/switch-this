import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditLocationModal from '../EditLocationModal';
import { LocationType, Block } from '@/app/shared/types/models';

// Mock blocks data
const mockBlocks: Block[] = [
  {
    _id: 'block1',
    blockName: 'ECHO',
    description: 'Echo District',
    ownerId: 'owner1'
  },
  {
    _id: 'block2',
    blockName: 'YARD',
    description: 'Main Yard',
    ownerId: 'owner1'
  }
];

// Mock the components/ui module
jest.mock('@/app/components/ui', () => {
  const originalModule = jest.requireActual('@/app/components/ui');
  return {
    ...originalModule,
    Dialog: ({ isOpen, onClose, title, children }: {
      isOpen: boolean;
      onClose: () => void;
      title: string;
      children: React.ReactNode;
    }) => {
      if (!isOpen) return null;
      return (
        <div data-testid="mock-dialog" aria-modal="true" role="dialog">
          <div data-testid="dialog-header">
            <h3>{title}</h3>
            <button aria-label="Close dialog" onClick={onClose}>
              Close
            </button>
          </div>
          <div data-testid="dialog-body">{children}</div>
        </div>
      );
    },
    Button: ({ children, onClick, type, isLoading, variant }: {
      children: React.ReactNode;
      onClick?: () => void;
      type?: 'button' | 'submit' | 'reset';
      isLoading?: boolean;
      variant?: string;
    }) => (
      <button 
        type={type} 
        onClick={onClick} 
        disabled={isLoading}
        data-variant={variant}
        data-testid={`button-${children?.toString().toLowerCase()}`}
      >
        {isLoading ? 'Loading...' : children}
      </button>
    ),
    Input: ({ label, name, value, onChange, error, placeholder }: {
      label: string;
      name: string;
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      placeholder?: string;
    }) => (
      <div>
        <label htmlFor={name}>{label}</label>
        <input 
          id={name}
          name={name} 
          value={value || ''} 
          onChange={onChange} 
          placeholder={placeholder}
          data-testid={`input-${name}`}
        />
        {error && <div data-testid={`error-${name}`}>{error}</div>}
      </div>
    ),
    Select: ({ label, name, value, onChange, options, error }: {
      label: string;
      name: string;
      value: string;
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      options: Array<{ value: string; label: string }>;
      error?: string;
    }) => (
      <div>
        <label htmlFor={name}>{label}</label>
        <select 
          id={name}
          name={name} 
          value={value} 
          onChange={onChange}
          data-testid={`select-${name}`}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <div data-testid={`error-${name}`}>{error}</div>}
      </div>
    ),
    useToast: () => ({
      toast: jest.fn()
    })
  };
});

describe('EditLocationModal', () => {
  const mockLocation = {
    _id: 'loc1',
    stationName: 'Echo Lake, WA',
    blockId: 'block1',
    block: 'ECHO', // for backward compatibility
    locationType: LocationType.ON_LAYOUT,
    ownerId: 'owner1',
    description: 'A beautiful lake'
  };

  const mockOnSave = jest.fn().mockResolvedValue(undefined);
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <EditLocationModal
        location={mockLocation}
        blocks={mockBlocks}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isOpen={false}
      />
    );

    expect(screen.queryByTestId('mock-dialog')).not.toBeInTheDocument();
  });

  it('should render the dialog with correct title for editing', () => {
    render(
      <EditLocationModal
        location={mockLocation}
        blocks={mockBlocks}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isOpen={true}
      />
    );

    expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
    expect(screen.getByText(`Edit ${mockLocation.stationName}`)).toBeInTheDocument();
  });

  it('should render the dialog with correct title for creating', () => {
    render(
      <EditLocationModal
        location={null}
        blocks={mockBlocks}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isOpen={true}
      />
    );

    expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
    expect(screen.getByText('Add New Location')).toBeInTheDocument();
  });

  it('should populate form with location data when editing', () => {
    render(
      <EditLocationModal
        location={mockLocation}
        blocks={mockBlocks}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isOpen={true}
      />
    );

    expect(screen.getByTestId('input-stationName')).toHaveValue(mockLocation.stationName);
    expect(screen.getByTestId('select-blockId')).toHaveValue(mockLocation.blockId);
    expect(screen.getByTestId('select-locationType')).toHaveValue(mockLocation.locationType);
    expect(screen.getByTestId('input-description')).toHaveValue(mockLocation.description);
  });

  it('should initialize with empty form when creating', () => {
    render(
      <EditLocationModal
        location={null}
        blocks={mockBlocks}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isOpen={true}
      />
    );

    expect(screen.getByTestId('input-stationName')).toHaveValue('');
    expect(screen.getByTestId('select-blockId')).toHaveValue('');
    expect(screen.getByTestId('input-description')).toHaveValue('');
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <EditLocationModal
        location={mockLocation}
        blocks={mockBlocks}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isOpen={true}
      />
    );

    fireEvent.click(screen.getByTestId('button-cancel'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should show validation errors when submitting empty form', async () => {
    render(
      <EditLocationModal
        location={null}
        blocks={mockBlocks}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isOpen={true}
      />
    );

    // Clear the form fields
    fireEvent.change(screen.getByTestId('input-stationName'), { target: { value: '' } });
    
    // Ensure blockId is empty
    fireEvent.change(screen.getByTestId('select-blockId'), { target: { value: '' } });

    // Submit the form
    fireEvent.click(screen.getByTestId('button-create'));

    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByTestId('error-stationName')).toBeInTheDocument();
      expect(screen.getByTestId('error-blockId')).toBeInTheDocument();
    });

    // Verify that onSave was not called
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should call onSave with updated data when submitting a valid form', async () => {
    render(
      <EditLocationModal
        location={mockLocation}
        blocks={mockBlocks}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isOpen={true}
      />
    );

    // Update form fields
    fireEvent.change(screen.getByTestId('input-stationName'), { 
      target: { value: 'Updated Station Name' } 
    });
    
    // Update block selection
    fireEvent.change(screen.getByTestId('select-blockId'), { 
      target: { value: 'block2' } 
    });
    
    fireEvent.change(screen.getByTestId('input-description'), { 
      target: { value: 'Updated description' } 
    });

    // Submit the form
    fireEvent.click(screen.getByTestId('button-update'));

    // Verify that onSave was called with the updated data
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: mockLocation._id,
          stationName: 'Updated Station Name',
          blockId: 'block2',
          description: 'Updated description'
        })
      );
    });
  });

  it('should convert block string to blockId for backward compatibility', () => {
    // Create a location with only block property (no blockId)
    const legacyLocation = {
      _id: 'loc2',
      ownerId: 'owner1',
      stationName: 'Old Location',
      blockId: 'block1',
      block: 'Old Block',
      locationType: LocationType.ON_LAYOUT,
      description: 'Legacy location for test',
    };

    render(
      <EditLocationModal
        location={legacyLocation}
        blocks={mockBlocks}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isOpen={true}
      />
    );

    // The blockId should be automatically set based on the block name
    expect(screen.getByTestId('select-blockId')).toHaveValue('block1');
  });
}); 