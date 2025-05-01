import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditRollingStockModal from '../EditRollingStockModal';
import { RollingStock, Industry, IndustryType } from '@/app/shared/types/models';
import { ToastProvider } from '@/app/components/ui';

// Create a wrapper component that includes the ToastProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <ToastProvider>{children}</ToastProvider>;
};

// Custom render function that wraps the component with ToastProvider
const customRender = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper });
};

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
  const rollingStock: RollingStock = {
    _id: 'car1',
    roadName: 'ATSF',
    roadNumber: '12345',
    aarType: 'XM',
    description: 'Boxcar',
    color: 'red',
    note: 'Test note',
    homeYard: 'yard1',
    ownerId: 'owner1'
  };
  
  const industries: Industry[] = [
    {
      _id: 'yard1',
      name: 'Central Yard',
      locationId: 'loc1',
      blockName: 'Block A',
      description: 'Main classification yard',
      industryType: 'YARD' as IndustryType,
      tracks: [{ 
        name: 'Track 1', 
        capacity: 10,
        length: 100,
        maxCars: 10,
        placedCars: [],
        _id: 'track1',
        ownerId: 'owner1'
      }],
      ownerId: 'owner1',
    },
    {
      _id: 'ind1',
      name: 'Acme Factory',
      locationId: 'loc2',
      blockName: 'Block B',
      description: 'Manufacturing plant',
      industryType: 'FACTORY' as IndustryType,
      tracks: [{ 
        name: 'Loading Dock', 
        capacity: 2,
        length: 50,
        maxCars: 2,
        placedCars: [],
        _id: 'track2',
        ownerId: 'owner1'
      }],
      ownerId: 'owner1',
    },
  ];
  
  const mockSave = jest.fn().mockResolvedValue(undefined);
  const mockCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal when isOpen is true', () => {
    customRender(
      <EditRollingStockModal
        rollingStock={rollingStock}
        industries={industries}
        onSave={mockSave}
        onCancel={mockCancel}
        isOpen={true}
      />
    );
    
    expect(screen.getByTestId('rolling-stock-form')).toBeInTheDocument();
    expect(screen.getByText('isNew: false')).toBeInTheDocument();
    expect(screen.getByText('rollingStock: provided')).toBeInTheDocument();
    expect(screen.getByText('industries count: 2')).toBeInTheDocument();
  });

  it('does not render anything when isOpen is false', () => {
    customRender(
      <EditRollingStockModal
        rollingStock={rollingStock}
        industries={industries}
        onSave={mockSave}
        onCancel={mockCancel}
        isOpen={false}
      />
    );
    
    expect(screen.queryByTestId('rolling-stock-form')).not.toBeInTheDocument();
  });

  it('passes correct props to RollingStockForm', () => {
    customRender(
      <EditRollingStockModal
        rollingStock={rollingStock}
        industries={industries}
        onSave={mockSave}
        onCancel={mockCancel}
        isOpen={true}
      />
    );
    
    expect(screen.getByText('isNew: false')).toBeInTheDocument();
    expect(screen.getByText('rollingStock: provided')).toBeInTheDocument();
    expect(screen.getByText('industries count: 2')).toBeInTheDocument();
  });

  it('passes isNew as true when rollingStock is null', () => {
    customRender(
      <EditRollingStockModal
        rollingStock={null}
        industries={industries}
        onSave={mockSave}
        onCancel={mockCancel}
        isOpen={true}
      />
    );
    
    expect(screen.getByText('isNew: true')).toBeInTheDocument();
    expect(screen.getByText('rollingStock: not provided')).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', () => {
    customRender(
      <EditRollingStockModal
        rollingStock={rollingStock}
        industries={industries}
        onSave={mockSave}
        onCancel={mockCancel}
        isOpen={true}
      />
    );
    
    const saveButton = screen.getByText('Save');
    saveButton.click();
    
    expect(mockSave).toHaveBeenCalledWith({
      _id: 'test-id',
      roadName: 'TEST',
      roadNumber: '12345',
      aarType: 'XM',
      description: 'Boxcar',
      color: 'red',
      note: '',
      homeYard: 'yard1',
      ownerId: 'owner1'
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    customRender(
      <EditRollingStockModal
        rollingStock={rollingStock}
        industries={industries}
        onSave={mockSave}
        onCancel={mockCancel}
        isOpen={true}
      />
    );
    
    const cancelButton = screen.getByText('Cancel');
    cancelButton.click();
    
    expect(mockCancel).toHaveBeenCalled();
  });
}); 