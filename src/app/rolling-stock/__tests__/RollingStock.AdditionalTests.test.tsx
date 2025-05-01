import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RollingStock from '../RollingStock';
import EditRollingStockModal from '../components/EditRollingStockModal';
import { ClientServices, RollingStockService, IndustryService } from '@/app/shared/services/clientServices';
import { RollingStock as RollingStockType, Industry, IndustryType } from '@/app/shared/types/models';
import { ToastProvider } from '@/app/components/ui';

// Create a wrapper component that includes the ToastProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <ToastProvider>{children}</ToastProvider>;
};

// Custom render function that wraps the component with ToastProvider
const customRender = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper });
};

// Mock the EditRollingStockModal component
jest.mock('../components/EditRollingStockModal', () => {
  return jest.fn(({ rollingStock, onSave, onCancel, isOpen }) => {
    if (!isOpen) return null;
    
    // For testing error handling
    const handleSaveClick = async () => {
      try {
        await onSave({
          ...rollingStock,
          roadName: 'UPDATED',
          roadNumber: '99999'
        });
      } catch (error) {
        // Do nothing with the error - we're just testing that it's thrown
      }
    };
    
    return (
      <div data-testid="modal-content">
        <div>Editing: {rollingStock ? rollingStock.roadName : 'New Rolling Stock'}</div>
        <div>Number: {rollingStock ? rollingStock.roadNumber : ''}</div>
        <div>Car Type: {rollingStock ? rollingStock.aarType : ''}</div>
        <button onClick={() => onCancel()}>Cancel</button>
        <button 
          onClick={handleSaveClick}
          data-testid="save-button"
        >
          Save
        </button>
      </div>
    );
  });
});

describe('RollingStock Additional Tests', () => {
  // Create properly typed mocks
  const mockGetAllRollingStock = jest.fn<Promise<RollingStockType[]>, []>();
  const mockGetAllIndustries = jest.fn<Promise<Industry[]>, []>();
  const mockUpdateRollingStock = jest.fn<Promise<void>, [string, RollingStockType]>();
  const mockCreateRollingStock = jest.fn<Promise<RollingStockType>, [RollingStockType]>();
  
  const mockServices = {
    rollingStockService: {
      getAllRollingStock: mockGetAllRollingStock,
      updateRollingStock: mockUpdateRollingStock,
      createRollingStock: mockCreateRollingStock
    } as unknown as RollingStockService,
    industryService: {
      getAllIndustries: mockGetAllIndustries,
    } as unknown as IndustryService,
  } as unknown as ClientServices;

  const mockIndustries: Industry[] = [
    {
      _id: 'yard1',
      name: 'Central Yard',
      industryType: IndustryType.YARD,
      tracks: [],
      locationId: 'loc1',
      blockName: 'Block A',
      ownerId: 'owner1',
      description: ''
    },
    {
      _id: 'yard2',
      name: 'Eastern Yard',
      industryType: IndustryType.YARD,
      tracks: [],
      locationId: 'loc2',
      blockName: 'Block B',
      ownerId: 'owner2',
      description: ''
    }
  ];

  const mockRollingStock: RollingStockType[] = [
    {
      _id: '1',
      roadName: 'ATSF',
      roadNumber: '12345',
      aarType: 'XM',
      description: 'Boxcar',
      color: 'red',
      note: 'Test note',
      homeYard: 'yard1',
      ownerId: 'owner1',
    },
    {
      _id: '2',
      roadName: 'CP',
      roadNumber: '67890',
      aarType: 'FBC',
      description: 'Flatcar Centerbeam',
      color: 'blue',
      note: '',
      homeYard: 'yard2',
      ownerId: 'owner2',
    },
    {
      _id: '3',
      roadName: 'UP',
      roadNumber: '54321',
      aarType: 'GS',
      description: 'Gondola',
      color: 'yellow',
      note: '',
      homeYard: 'yard1',
      ownerId: 'owner3',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllRollingStock.mockResolvedValue(mockRollingStock);
    mockGetAllIndustries.mockResolvedValue(mockIndustries);
    (EditRollingStockModal as jest.Mock).mockClear();
  });

  it('renders the correct color classes for different car colors', async () => {
    customRender(<RollingStock services={mockServices} />);
    
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
    
    // Find the color indicators in the table
    const colorCells = screen.getAllByTitle(/^(RED|BLUE|YELLOW)$/);
    
    // Verify that they have the correct classes based on the color
    expect(colorCells[0]).toHaveClass('bg-red-500'); // RED
    expect(colorCells[1]).toHaveClass('bg-blue-500'); // BLUE
    expect(colorCells[2]).toHaveClass('bg-yellow-500'); // YELLOW
  });

  it('opens the edit modal when an edit button is clicked', async () => {
    customRender(<RollingStock services={mockServices} />);
    
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
    
    // Click the edit button for the first item
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Check that the modal is displayed with the correct info
    const modalContent = screen.getByTestId('modal-content');
    expect(modalContent).toBeInTheDocument();
    expect(screen.getByText('Editing: ATSF')).toBeInTheDocument();
    expect(screen.getByText('Number: 12345')).toBeInTheDocument();
  });

  it('opens the create modal when the Add Rolling Stock button is clicked', async () => {
    customRender(<RollingStock services={mockServices} />);
    
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
    
    // Find and click the Add Rolling Stock button
    const addButton = screen.getByText('Add Rolling Stock');
    fireEvent.click(addButton);
    
    // Check that the modal is displayed for a new rolling stock
    const modalContent = screen.getByTestId('modal-content');
    expect(modalContent).toBeInTheDocument();
    expect(screen.getByText('Editing: New Rolling Stock')).toBeInTheDocument();
  });

  it('closes the modal when cancel is clicked', async () => {
    customRender(<RollingStock services={mockServices} />);
    
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
    
    // Open the edit modal
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Verify the modal is open
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    
    // Click the cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Verify the modal is closed
    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
  });

  it('updates the rolling stock when save is clicked', async () => {
    mockUpdateRollingStock.mockResolvedValue(undefined);
    
    customRender(<RollingStock services={mockServices} />);
    
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
    
    // Open the edit modal
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Click the save button
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
    
    // Verify updateRollingStock was called
    await waitFor(() => {
      expect(mockUpdateRollingStock).toHaveBeenCalledWith('1', expect.objectContaining({
        roadName: 'UPDATED',
        roadNumber: '99999'
      }));
    });
    
    // Verify the modal is closed after save
    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
  });

  it('handles error when updating rolling stock fails', async () => {
    // Make the update method reject
    mockUpdateRollingStock.mockRejectedValue(new Error('Update failed'));
    
    customRender(<RollingStock services={mockServices} />);
    
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
    
    // Open the edit modal
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Click the save button
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
    
    // Verify updateRollingStock was called
    await waitFor(() => {
      expect(mockUpdateRollingStock).toHaveBeenCalled();
    });
    
    // Verify the modal is still open (since save failed)
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });

  it('is accessible - all interactive elements have ARIA labels', async () => {
    customRender(<RollingStock services={mockServices} />);
    
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
    
    // Check that the pagination buttons have aria-labels
    const prevButton = screen.getByLabelText('Go to previous page');
    const nextButton = screen.getByLabelText('Go to next page');
    
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    
    // Check that the table has proper role
    expect(screen.getByRole('table')).toHaveAttribute('aria-label', 'Rolling Stock');
  });

  it('renders correct colors for different car types', async () => {
    const colorRollingStock = [
      {
        _id: '1',
        roadName: 'ATSF',
        roadNumber: '12345',
        aarType: 'XM',
        description: 'Boxcar',
        color: 'RED',
        note: '',
        homeYard: 'yard1',
        ownerId: 'owner1',
      },
      {
        _id: '2',
        roadName: 'UP',
        roadNumber: '67890',
        aarType: 'T',  // Tank car
        description: 'Tank Car',
        color: 'BLACK',
        note: '',
        homeYard: 'yard1',
        ownerId: 'owner1',
      },
      {
        _id: '3',
        roadName: 'BNSF',
        roadNumber: '54321',
        aarType: 'H',  // Hopper
        description: 'Hopper',
        color: 'GREEN',
        note: '',
        homeYard: 'yard1',
        ownerId: 'owner1',
      },
    ];
    
    mockGetAllRollingStock.mockResolvedValue(colorRollingStock);
    
    customRender(<RollingStock services={mockServices} />);
    
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
    
    // Find the color indicators
    const colorCells = screen.getAllByTitle(/^(RED|BLACK|GREEN)$/);
    
    // Check the classes
    expect(colorCells[0]).toHaveClass('bg-red-500');
    expect(colorCells[1]).toHaveClass('bg-gray-900');
    expect(colorCells[2]).toHaveClass('bg-green-500');
  });
}); 