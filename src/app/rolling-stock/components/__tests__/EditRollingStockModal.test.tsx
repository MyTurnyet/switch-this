import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditRollingStockModal from '../EditRollingStockModal';
import { RollingStock, Industry, IndustryType } from '@/app/shared/types/models';

// Mock the RollingStockForm component
jest.mock('../RollingStockForm', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function RollingStockFormMock({
    rollingStock,
    industries,
    onSave,
    onCancel,
    isNew,
  }: {
    rollingStock?: RollingStock;
    industries: Industry[];
    onSave: (rollingStock: RollingStock) => Promise<void>;
    onCancel: () => void;
    isNew?: boolean;
  }) {
    return (
      <div data-testid="rolling-stock-form">
        <div>isNew: {isNew ? 'true' : 'false'}</div>
        <div>rollingStock: {rollingStock ? 'provided' : 'not provided'}</div>
        <div>industries count: {industries?.length || 0}</div>
        <button onClick={() => onCancel()}>Cancel</button>
        <button onClick={() => onSave({ 
          _id: 'test-id',
          roadName: 'TEST',
          roadNumber: '12345',
          aarType: 'XM',
          description: 'Boxcar',
          color: 'red',
          note: '',
          homeYard: 'yard1',
          ownerId: 'owner1'
        } as RollingStock)}>
          Save
        </button>
      </div>
    );
  };
});

describe('EditRollingStockModal', () => {
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
    onSave: jest.fn().mockImplementation(() => Promise.resolve()),
    onCancel: jest.fn(),
    isOpen: true,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal when isOpen is true', () => {
    render(<EditRollingStockModal {...mockProps} />);
    
    // Check that the form is rendered
    expect(screen.getByTestId('rolling-stock-form')).toBeInTheDocument();
  });

  it('does not render anything when isOpen is false', () => {
    render(<EditRollingStockModal {...mockProps} isOpen={false} />);
    
    // Check that the form is not rendered
    expect(screen.queryByTestId('rolling-stock-form')).not.toBeInTheDocument();
  });

  it('passes correct props to RollingStockForm', () => {
    render(<EditRollingStockModal {...mockProps} />);
    
    // Check the props are passed correctly
    expect(screen.getByText('isNew: false')).toBeInTheDocument();
    expect(screen.getByText('rollingStock: provided')).toBeInTheDocument();
    expect(screen.getByText('industries count: 2')).toBeInTheDocument();
  });

  it('passes isNew as true when rollingStock is null', () => {
    render(<EditRollingStockModal {...mockProps} rollingStock={null} />);
    
    // Check isNew is true
    expect(screen.getByText('isNew: true')).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', () => {
    render(<EditRollingStockModal {...mockProps} />);
    
    // Click save button
    screen.getByText('Save').click();
    
    // Check onSave was called
    expect(mockProps.onSave).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<EditRollingStockModal {...mockProps} />);
    
    // Click cancel button
    screen.getByText('Cancel').click();
    
    // Check onCancel was called
    expect(mockProps.onCancel).toHaveBeenCalled();
  });
}); 