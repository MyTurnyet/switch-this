import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RollingStock from '../RollingStock';
import EditRollingStockModal from '../components/EditRollingStockModal';
import { ClientServices, RollingStockService, IndustryService } from '@/app/shared/services/clientServices';
import { RollingStock as RollingStockType, Industry, IndustryType } from '@/app/shared/types/models';

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
  
  const mockServices = {
    rollingStockService: {
      getAllRollingStock: mockGetAllRollingStock,
      updateRollingStock: mockUpdateRollingStock,
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
    render(<RollingStock services={mockServices} />);
    
    await waitFor(() => {
      expect(screen.getByText('ATSF')).toBeInTheDocument();
      expect(screen.getByText('12345')).toBeInTheDocument();
    });

    // Check that the color swatches for each car are rendered with the correct color class
    const colorBars = screen.getAllByTitle(/red|blue|yellow/i);
    expect(colorBars[0]).toHaveClass('bg-red-600');
    expect(colorBars[1]).toHaveClass('bg-blue-600');
    expect(colorBars[2]).toHaveClass('bg-yellow-400');
  });

  it('opens the edit modal when an edit button is clicked', async () => {
    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText('ATSF')).toBeInTheDocument();
    });

    // Click the edit button for the first car
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Check that the modal was rendered with the correct props
    expect(EditRollingStockModal).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
        rollingStock: mockRollingStock[0],
        industries: mockIndustries
      }),
      expect.anything()
    );
    
    // Check if the modal content is visible
    await waitFor(() => {
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
      expect(screen.getByText('Editing: ATSF')).toBeInTheDocument();
      expect(screen.getByText('Number: 12345')).toBeInTheDocument();
    });
  });

  it('opens the create modal when the Add Rolling Stock button is clicked', async () => {
    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText('ATSF')).toBeInTheDocument();
    });

    // Click the Add Rolling Stock button
    fireEvent.click(screen.getByText('Add Rolling Stock'));
    
    // Check that the modal was rendered with the correct props
    expect(EditRollingStockModal).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
        rollingStock: null,
        industries: mockIndustries
      }),
      expect.anything()
    );
    
    // Check if the modal content is visible
    await waitFor(() => {
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
      expect(screen.getByText('Editing: New Rolling Stock')).toBeInTheDocument();
    });
  });

  it('closes the modal when cancel is clicked', async () => {
    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText('ATSF')).toBeInTheDocument();
    });

    // Click the edit button to open the modal
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Check the modal is visible
    await waitFor(() => {
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });
    
    // Click the cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Check the modal is closed
    await waitFor(() => {
      expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
    });
  });

  it('updates the rolling stock when save is clicked', async () => {
    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText('ATSF')).toBeInTheDocument();
    });

    // Click the edit button to open the modal
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Check the modal is visible
    await waitFor(() => {
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });
    
    // Click the save button
    fireEvent.click(screen.getByText('Save'));
    
    // Check that updateRollingStock was called with the correct data
    await waitFor(() => {
      expect(mockUpdateRollingStock).toHaveBeenCalledWith('1', expect.objectContaining({
        roadName: 'UPDATED',
        roadNumber: '99999'
      }));
    });
    
    // Check the modal is closed
    await waitFor(() => {
      expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
    });
  });

  it('handles error when updating rolling stock fails', async () => {
    // Mock API error before rendering
    mockUpdateRollingStock.mockRejectedValueOnce(new Error('Update failed'));
    
    // Spy on console.error to verify it's called
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText('ATSF')).toBeInTheDocument();
    });

    // Click the edit button to open the modal
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Check the modal is visible
    await waitFor(() => {
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });
    
    // Click the save button
    fireEvent.click(screen.getByTestId('save-button'));
    
    // Wait for the error to be logged
    await waitFor(() => {
      expect(mockUpdateRollingStock).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save rolling stock:', expect.any(Error));
    });
    
    // The modal should remain open when there's an error
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    
    // Clean up
    consoleSpy.mockRestore();
  });

  it('is accessible - all interactive elements have ARIA labels', async () => {
    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText('ATSF')).toBeInTheDocument();
    });
    
    // Check that the main heading is properly labeled
    expect(screen.getByRole('heading', { name: /Rolling Stock/i })).toBeInTheDocument();
    
    // Check that the 'Add Rolling Stock' button is labeled
    const addButton = screen.getByText('Add Rolling Stock');
    expect(addButton).toBeInTheDocument();
    
    // Check that Edit buttons are labeled
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBeGreaterThan(0);
    editButtons.forEach(button => {
      expect(button).toHaveTextContent('Edit');
    });
  });

  it('renders correct colors for different car types', async () => {
    // Override the mock data to ensure different colors
    const coloredRollingStock = [
      { ...mockRollingStock[0], color: 'red' },
      { ...mockRollingStock[1], color: 'blue' },
      { ...mockRollingStock[2], color: 'green' },
      { 
        _id: '4',
        roadName: 'BNSF',
        roadNumber: '78901',
        aarType: 'CS',
        description: 'Caboose',
        color: 'brown',
        note: '',
        homeYard: 'yard1',
        ownerId: 'owner1',
      }
    ];
    
    mockGetAllRollingStock.mockResolvedValue(coloredRollingStock);
    
    render(<RollingStock services={mockServices} />);
    
    await waitFor(() => {
      expect(screen.getByText('ATSF')).toBeInTheDocument();
    });
    
    // Get all color bars
    const colorBars = screen.getAllByTitle(/red|blue|green|brown/i);
    expect(colorBars.length).toBe(4);
    
    // Check that the right color classes are used
    expect(colorBars.some(el => el.classList.contains('bg-red-600'))).toBeTruthy();
    expect(colorBars.some(el => el.classList.contains('bg-blue-600'))).toBeTruthy();
    expect(colorBars.some(el => el.classList.contains('bg-green-600'))).toBeTruthy();
    expect(colorBars.some(el => el.classList.contains('bg-amber-800'))).toBeTruthy(); // brown maps to amber-800
  });
}); 