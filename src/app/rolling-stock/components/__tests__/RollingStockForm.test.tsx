import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RollingStockForm, { CAR_TYPES } from '../RollingStockForm';
import { RollingStock, Industry, IndustryType } from '@/app/shared/types/models';

describe('RollingStockForm', () => {
  const mockRollingStock: RollingStock = {
    _id: 'test-id',
    roadName: 'TEST',
    roadNumber: '12345',
    aarType: 'XM',
    description: 'Boxcar',
    color: 'red',
    note: '',
    homeYard: 'yard1',
    ownerId: 'owner1',
  };

  const mockIndustries: Industry[] = [
    { 
      _id: 'yard1', 
      name: 'Test Yard',
      locationId: 'loc1',
      blockName: 'Block A',
      industryType: IndustryType.YARD,
      tracks: [],
      ownerId: 'owner1',
      description: ''
    },
    { 
      _id: 'yard2', 
      name: 'Test Yard 2',
      locationId: 'loc2',
      blockName: 'Block B',
      industryType: IndustryType.YARD,
      tracks: [],
      ownerId: 'owner2',
      description: ''
    },
  ];

  const mockProps = {
    rollingStock: mockRollingStock,
    industries: mockIndustries,
    onSave: jest.fn().mockResolvedValue(undefined),
    onCancel: jest.fn(),
    isNew: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with correct title for editing existing rolling stock', () => {
    render(<RollingStockForm {...mockProps} />);
    
    expect(screen.getByText('Edit Rolling Stock')).toBeInTheDocument();
  });

  it('renders the form with correct title for creating new rolling stock', () => {
    render(<RollingStockForm {...mockProps} isNew={true} />);
    
    expect(screen.getByText('Create New Rolling Stock')).toBeInTheDocument();
  });

  it('renders form with correct initial values when editing', () => {
    render(<RollingStockForm {...mockProps} />);
    
    // Check input values match the provided rolling stock
    expect(screen.getByLabelText(/Railroad/i)).toHaveValue('TEST');
    expect(screen.getByLabelText(/Number/i)).toHaveValue('12345');
  });

  it('renders form with empty values when creating', () => {
    render(<RollingStockForm {...mockProps} isNew={true} rollingStock={undefined} />);
    
    // Check input values are empty
    expect(screen.getByLabelText(/Railroad/i)).toHaveValue('');
    expect(screen.getByLabelText(/Number/i)).toHaveValue('');
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<RollingStockForm {...mockProps} />);
    
    // Click cancel button
    screen.getByText('Cancel').click();
    
    // Check onCancel was called
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it('validates required fields when form is submitted without required data', async () => {
    const mockSave = jest.fn().mockImplementation(() => Promise.resolve());
    render(
      <RollingStockForm 
        {...mockProps} 
        isNew={true} 
        rollingStock={undefined} 
        onSave={mockSave}
      />
    );
    
    // Submit without filling required fields
    fireEvent.click(screen.getByText('Save'));
    
    // Ensure onSave was not called
    await waitFor(() => {
      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  it('calls onSave with updated data when form is submitted with valid data', async () => {
    render(<RollingStockForm {...mockProps} />);
    
    // Change road name
    const roadNameInput = screen.getByLabelText(/Railroad/i);
    fireEvent.change(roadNameInput, { target: { value: 'BNSF' } });
    
    // Submit form
    screen.getByText('Save').click();
    
    // Check onSave was called with updated data
    await waitFor(() => {
      expect(mockProps.onSave).toHaveBeenCalledWith(expect.objectContaining({
        roadName: 'BNSF',
        roadNumber: '12345',
      }));
    });
  });

  it('handles submit state correctly', async () => {
    // Make onSave not resolve immediately
    const delayedSave = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(
      <RollingStockForm 
        {...mockProps} 
        onSave={delayedSave}
      />
    );
    
    // Submit form
    fireEvent.click(screen.getByText('Save'));
    
    // Wait for save to complete
    await waitFor(() => {
      expect(delayedSave).toHaveBeenCalled();
    });
  });

  it('includes all car types in the dropdown', () => {
    render(<RollingStockForm {...mockProps} />);
    
    // Get the car type select element
    const carTypeSelect = screen.getByLabelText(/Car Type/i);
    
    // All car types should be included as options
    CAR_TYPES.forEach(carType => {
      expect(carTypeSelect).toContainElement(
        screen.getByText(`${carType.aarType} - ${carType.description}`)
      );
    });
  });
}); 