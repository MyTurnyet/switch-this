import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RollingStock from '../RollingStock';
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
    
    return (
      <div data-testid="edit-modal">
        <h2>Edit Rolling Stock</h2>
        <div>
          <label>
            Railroad
            <input 
              defaultValue={rollingStock?.roadName || ''} 
              data-testid="road-name-input"
              aria-label="Railroad"
            />
          </label>
          <label>
            Number
            <input 
              defaultValue={rollingStock?.roadNumber || ''} 
              data-testid="road-number-input"
              aria-label="Number"
            />
          </label>
          <label>
            Car Type
            <select aria-label="Car Type">
              <option value={rollingStock?.aarType || ''}>{rollingStock?.aarType || ''}</option>
            </select>
          </label>
          <label>
            Home Yard
            <select aria-label="Home Yard">
              <option value={rollingStock?.homeYard || ''}>{rollingStock?.homeYard || ''}</option>
            </select>
          </label>
        </div>
        <button onClick={() => onCancel()}>Cancel</button>
        <button 
          onClick={() => onSave({
            ...rollingStock,
            roadName: 'BNSF',
          })}
          data-testid="save-button"
        >
          Save
        </button>
      </div>
    );
  });
});

describe('RollingStock', () => {
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
    // Yards
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
    },
    // Freight Industries
    {
      _id: 'ind1',
      name: 'Steel Factory',
      industryType: IndustryType.FREIGHT,
      tracks: [],
      locationId: 'loc3',
      blockName: 'Block C',
      ownerId: 'owner1',
      description: ''
    },
    {
      _id: 'ind2',
      name: 'Coal Mine',
      industryType: IndustryType.FREIGHT,
      tracks: [],
      locationId: 'loc4',
      blockName: 'Block D',
      ownerId: 'owner2',
      description: ''
    },
    // Passenger Industries
    {
      _id: 'ind3',
      name: 'Central Station',
      industryType: IndustryType.PASSENGER,
      tracks: [],
      locationId: 'loc5',
      blockName: 'Block E',
      ownerId: 'owner3',
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
      color: 'RED',
      note: 'Test note',
      homeYard: 'yard1',
      ownerId: 'owner1',
    },
    {
      _id: '2',
      roadName: 'CP',
      roadNumber: '67890',
      aarType: 'FBC',
      description: 'Flatcar BlhHd',
      color: 'BLUE',
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
      color: 'YELLOW',
      note: '',
      homeYard: 'unknown', // Test unknown yard
      ownerId: 'owner3',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllRollingStock.mockResolvedValue(mockRollingStock);
    mockGetAllIndustries.mockResolvedValue(mockIndustries);
  });

  it('renders loading state initially', () => {
    mockGetAllRollingStock.mockImplementation(() => new Promise(() => {})); // Never resolves
    mockGetAllIndustries.mockImplementation(() => new Promise(() => {})); // Never resolves
    customRender(<RollingStock services={mockServices} />);
    
    // With our new component, loading state shows "Loading..."
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays rolling stock data when loaded', async () => {
    customRender(<RollingStock services={mockServices} />);

    // Wait for the data table to be rendered
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Check for the rolling stock in the table
    expect(screen.getByText('ATSF')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByText('CP')).toBeInTheDocument();
    expect(screen.getByText('67890')).toBeInTheDocument();
    expect(screen.getByText('UP')).toBeInTheDocument();
    expect(screen.getByText('54321')).toBeInTheDocument();
    
    // Check if descriptions are displayed correctly
    expect(screen.getByText('Boxcar')).toBeInTheDocument();
    expect(screen.getByText('Flatcar BlhHd')).toBeInTheDocument();
    expect(screen.getByText('Gondola')).toBeInTheDocument();
    
    // Check if the badges for car types are displayed
    expect(screen.getAllByText('XM')[0]).toBeInTheDocument();
    expect(screen.getAllByText('FBC')[0]).toBeInTheDocument();
    expect(screen.getAllByText('GS')[0]).toBeInTheDocument();
    
    // Check for 'Edit' buttons
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBe(3);
  });

  it('displays error message when fetch fails', async () => {
    mockGetAllRollingStock.mockRejectedValue(new Error('Failed to fetch'));
    customRender(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getAllByText(/Failed to load rolling stock/i)[0]).toBeInTheDocument();
    });
  });

  it('displays a message when no rolling stock is available', async () => {
    mockGetAllRollingStock.mockResolvedValue([]);
    mockGetAllIndustries.mockResolvedValue([]);

    customRender(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  it('opens edit form when edit button is clicked', async () => {
    customRender(<RollingStock services={mockServices} />);

    // Wait for the table to render
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // First, click the actions button to open the dropdown
    const actionButtons = screen.getAllByText('Actions');
    fireEvent.click(actionButtons[0]);

    // Then, click the edit option in the dropdown
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Check that the edit modal is displayed
    expect(screen.getByText('Edit Rolling Stock')).toBeInTheDocument();
    
    // Check for inputs in the form
    expect(screen.getByLabelText(/Railroad/i)).toHaveValue('ATSF');
    expect(screen.getByLabelText(/Number/i)).toHaveValue('12345');
  });

  it('shows car type and home yard dropdowns when editing', async () => {
    customRender(<RollingStock services={mockServices} />);

    // Wait for the table to render
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // First, click the actions button to open the dropdown
    const actionButtons = screen.getAllByText('Actions');
    fireEvent.click(actionButtons[0]);

    // Then, click the edit option in the dropdown
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Check that the select fields are rendered
    const carTypeSelect = screen.getByLabelText(/Car Type/i);
    const homeYardSelect = screen.getByLabelText(/Home Yard/i);

    expect(carTypeSelect).toBeInTheDocument();
    expect(homeYardSelect).toBeInTheDocument();
  });

  it('saves changes when form is submitted', async () => {
    customRender(<RollingStock services={mockServices} />);

    // Wait for the table to render
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // First, click the actions button to open the dropdown
    const actionButtons = screen.getAllByText('Actions');
    fireEvent.click(actionButtons[0]);

    // Then, click the edit option in the dropdown
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Edit fields
    const roadNameInput = screen.getByLabelText(/Railroad/i);
    
    fireEvent.change(roadNameInput, { target: { value: 'BNSF' } });

    // Submit the form
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    // Verify that updateRollingStock was called with the updated values
    await waitFor(() => {
      expect(mockUpdateRollingStock).toHaveBeenCalledWith('1', expect.objectContaining({
        roadName: 'BNSF',
      }));
    });
    
    // Check that modal is closed after submission
    await waitFor(() => {
      expect(screen.queryByText('Edit Rolling Stock')).not.toBeInTheDocument();
    });
  });

  it('cancels editing when cancel button is clicked', async () => {
    customRender(<RollingStock services={mockServices} />);

    // Wait for the table to render
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // First, click the actions button to open the dropdown
    const actionButtons = screen.getAllByText('Actions');
    fireEvent.click(actionButtons[0]);

    // Then, click the edit option in the dropdown
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Check that the modal is open
    await waitFor(() => {
      expect(screen.getByText('Edit Rolling Stock')).toBeInTheDocument();
    });

    // Edit railroad name field
    const roadNameInput = screen.getByLabelText(/Railroad/i);
    fireEvent.change(roadNameInput, { target: { value: 'BNSF' } });

    // Click the cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByText('Edit Rolling Stock')).not.toBeInTheDocument();
    });

    // The changes should not have been saved
    expect(mockUpdateRollingStock).not.toHaveBeenCalled();
  });

  it('deletes rolling stock when delete button is clicked', async () => {
    customRender(<RollingStock services={mockServices} />);

    // Wait for the table to render
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Get initial row count
    const initialRows = screen.getAllByRole('row');
    const initialRowCount = initialRows.length;

    // First, click the actions button to open the dropdown
    const actionButtons = screen.getAllByText('Actions');
    fireEvent.click(actionButtons[0]);

    // Then, click the delete option in the dropdown
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Verify that the row was removed from the table
    await waitFor(() => {
      const updatedRows = screen.getAllByRole('row');
      expect(updatedRows.length).toBe(initialRowCount - 1);
    });
  });

  it('sorts rolling stock by Road name when column header is clicked', async () => {
    customRender(<RollingStock services={mockServices} />);

    // Wait for the table to render
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Find the Road column header and click it
    const roadHeader = screen.getByText('Road');
    fireEvent.click(roadHeader);

    // First row should now be ATSF (alphabetically first)
    const rows = screen.getAllByRole('row');
    // First row is the header, so check from the second row
    const firstDataRow = rows[1];
    expect(firstDataRow).toHaveTextContent('ATSF');

    // Click again to sort in descending order
    fireEvent.click(roadHeader);
    
    // First row should now be UP (alphabetically last)
    const updatedRows = screen.getAllByRole('row');
    const firstUpdatedDataRow = updatedRows[1];
    expect(firstUpdatedDataRow).toHaveTextContent('UP');
  });

  it('sorts rolling stock by Type when column header is clicked', async () => {
    customRender(<RollingStock services={mockServices} />);

    // Wait for the table to render
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Find the Type column header and click it
    const typeHeader = screen.getByText('Type');
    fireEvent.click(typeHeader);

    // Check the sorting order - FBC should come first alphabetically
    const rows = screen.getAllByRole('row');
    // First row is the header, so check from the second row
    const firstDataRow = rows[1];
    expect(firstDataRow).toHaveTextContent('FBC');
  });

  it('sorts rolling stock by Home Yard when column header is clicked', async () => {
    customRender(<RollingStock services={mockServices} />);

    // Wait for the table to render
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Find the Home Yard column header and click it
    const homeYardHeader = screen.getByText('Home Yard');
    fireEvent.click(homeYardHeader);

    // The sorting should be based on yard names
    const rows = screen.getAllByRole('row');
    // First row is the header, so check from the second row
    const firstDataRow = rows[1];
    
    // Central Yard should come first alphabetically
    expect(firstDataRow).toHaveTextContent('Central Yard');
  });

  it('does not open edit form when row is clicked', async () => {
    customRender(<RollingStock services={mockServices} />);

    // Wait for the table to render
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Get all rows (excluding the header row)
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1]; // First row after header

    // Click the row
    fireEvent.click(firstDataRow);

    // Verify edit modal is not opened
    expect(screen.queryByText('Edit Rolling Stock')).not.toBeInTheDocument();
  });
}); 