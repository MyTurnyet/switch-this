import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
        <div aria-modal="true" role="dialog">
          <div>
            <h3>{title}</h3>
            <button aria-label="Close dialog" onClick={onClose}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
          </div>
          <div>{children}</div>
        </div>
      );
    },
    Button: ({ children, onClick, type }: {
      children: React.ReactNode;
      onClick?: () => void;
      type?: 'button' | 'submit' | 'reset';
    }) => (
      <button type={type} onClick={onClick}>
        {children}
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
        <label>{label}</label>
        <input 
          name={name} 
          value={value || ''} 
          onChange={onChange} 
          placeholder={placeholder}
          data-testid={`input-${name}`}
        />
        {error && <div>{error}</div>}
      </div>
    ),
    Select: ({ label, name, value, onChange, options }: {
      label: string;
      name: string;
      value: string;
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      options: Array<{ value: string; label: string }>;
    }) => (
      <div>
        <label>{label}</label>
        <select name={name} value={value || ''} onChange={onChange} data-testid={`select-${name}`}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    ),
    FileUpload: ({ onFilesSelected }: {
      onFilesSelected: (files: File[]) => void;
    }) => (
      <div data-testid="file-upload">
        <button onClick={() => onFilesSelected([new File([''], 'test.jpg')])}>
          Upload file
        </button>
      </div>
    ),
    useToast: () => ({
      toast: jest.fn()
    })
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
        ownerId: 'owner1',
        acceptedCarTypes: []
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
        ownerId: 'owner1',
        acceptedCarTypes: []
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
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit ATSF 12345')).toBeInTheDocument();
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
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays different title for new vs existing rolling stock', () => {
    // Test with existing rolling stock
    customRender(
      <EditRollingStockModal
        rollingStock={rollingStock}
        industries={industries}
        onSave={mockSave}
        onCancel={mockCancel}
        isOpen={true}
      />
    );
    
    expect(screen.getByText('Edit ATSF 12345')).toBeInTheDocument();
    
    // Cleanup
    customRender(<></>);
    
    // Test with new rolling stock
    customRender(
      <EditRollingStockModal
        rollingStock={null}
        industries={industries}
        onSave={mockSave}
        onCancel={mockCancel}
        isOpen={true}
      />
    );
    
    expect(screen.getByText('Add New Rolling Stock')).toBeInTheDocument();
  });

  it('calls onSave when update button is clicked for existing rolling stock', async () => {
    customRender(
      <EditRollingStockModal
        rollingStock={rollingStock}
        industries={industries}
        onSave={mockSave}
        onCancel={mockCancel}
        isOpen={true}
      />
    );
    
    // Required fields need values
    fireEvent.change(screen.getByTestId('input-roadName'), { target: { value: 'TEST' } });
    fireEvent.change(screen.getByTestId('input-roadNumber'), { target: { value: '54321' } });
    fireEvent.change(screen.getByTestId('input-aarType'), { target: { value: 'XM' } });
    fireEvent.change(screen.getByTestId('select-homeYard'), { target: { value: 'yard1' } });
    
    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);
    
    expect(mockSave).toHaveBeenCalled();
  });

  it('calls onSave when create button is clicked for new rolling stock', async () => {
    customRender(
      <EditRollingStockModal
        rollingStock={null}
        industries={industries}
        onSave={mockSave}
        onCancel={mockCancel}
        isOpen={true}
      />
    );
    
    // Required fields need values
    fireEvent.change(screen.getByTestId('input-roadName'), { target: { value: 'NEW' } });
    fireEvent.change(screen.getByTestId('input-roadNumber'), { target: { value: '77777' } });
    fireEvent.change(screen.getByTestId('input-aarType'), { target: { value: 'XM' } });
    fireEvent.change(screen.getByTestId('select-homeYard'), { target: { value: 'yard1' } });
    
    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);
    
    expect(mockSave).toHaveBeenCalled();
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
    fireEvent.click(cancelButton);
    
    expect(mockCancel).toHaveBeenCalled();
  });

  it('displays dropdown options in alphabetical order', () => {
    // Create an array of industries with non-alphabetical names to test sorting
    const unsortedIndustries: Industry[] = [
      {
        _id: 'yard3',
        name: 'Zebra Yard',
        locationId: 'loc3',
        blockName: 'Block C',
        description: 'Switching yard',
        industryType: 'YARD' as IndustryType,
        tracks: [{ 
          name: 'Track 3', 
          capacity: 8,
          length: 120,
          maxCars: 8,
          placedCars: [],
          _id: 'track3',
          ownerId: 'owner1',
          acceptedCarTypes: []
        }],
        ownerId: 'owner1',
      },
      {
        _id: 'yard2',
        name: 'Bravo Yard',
        locationId: 'loc4',
        blockName: 'Block D',
        description: 'Engine facility',
        industryType: 'YARD' as IndustryType,
        tracks: [{ 
          name: 'Track 4', 
          capacity: 5,
          length: 80,
          maxCars: 5,
          placedCars: [],
          _id: 'track4',
          ownerId: 'owner1',
          acceptedCarTypes: []
        }],
        ownerId: 'owner1',
      },
      {
        _id: 'ind2',
        name: 'Manufacturing Plant',
        locationId: 'loc5',
        blockName: 'Block E',
        description: 'Production facility',
        industryType: 'FACTORY' as IndustryType,
        tracks: [{ 
          name: 'Dock A', 
          capacity: 3,
          length: 60,
          maxCars: 3,
          placedCars: [],
          _id: 'track5',
          ownerId: 'owner1',
          acceptedCarTypes: []
        }],
        ownerId: 'owner1',
      },
      ...industries, // Add original industries
    ];

    customRender(
      <EditRollingStockModal
        rollingStock={null}
        industries={unsortedIndustries}
        onSave={mockSave}
        onCancel={mockCancel}
        isOpen={true}
      />
    );
    
    // Get all options from the homeYard select
    const homeYardSelect = screen.getByTestId('select-homeYard') as HTMLSelectElement;
    const homeYardOptionElements = Array.from(homeYardSelect.options).slice(1); // Skip the first "Select Home Yard" option
    
    // Get all options from the currentLocation select
    const currentLocationSelect = screen.getByTestId('select-currentLocation') as HTMLSelectElement;
    const currentLocationOptionElements = Array.from(currentLocationSelect.options).slice(1); // Skip the first "Select Current Location" option
    
    // Check that homeYard options are alphabetically sorted
    expect(homeYardOptionElements.map(option => option.text)).toEqual([
      'Bravo Yard',
      'Central Yard',
      'Zebra Yard'
    ]);
    
    // Check that currentLocation options are alphabetically sorted
    expect(currentLocationOptionElements.map(option => option.text)).toEqual([
      'Acme Factory',
      'Bravo Yard',
      'Central Yard',
      'Manufacturing Plant',
      'Zebra Yard'
    ]);
    
    // Also verify using sequential comparison
    for (let i = 0; i < homeYardOptionElements.length - 1; i++) {
      expect(homeYardOptionElements[i].text.localeCompare(homeYardOptionElements[i + 1].text)).toBeLessThanOrEqual(0);
    }
    
    for (let i = 0; i < currentLocationOptionElements.length - 1; i++) {
      expect(currentLocationOptionElements[i].text.localeCompare(currentLocationOptionElements[i + 1].text)).toBeLessThanOrEqual(0);
    }
  });
}); 