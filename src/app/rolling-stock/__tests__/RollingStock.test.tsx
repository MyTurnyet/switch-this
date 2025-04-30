import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RollingStock from '../RollingStock';
import { ClientServices, RollingStockService, IndustryService } from '@/app/shared/services/clientServices';
import { RollingStock as RollingStockType, Industry, IndustryType } from '@/app/shared/types/models';

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
    render(<RollingStock services={mockServices} />);
    
    // With our new component, loading state shows "Loading..."
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays rolling stock data when loaded', async () => {
    render(<RollingStock services={mockServices} />);

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
    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load rolling stock/i)).toBeInTheDocument();
    });
  });

  it('displays a message when no rolling stock is available', async () => {
    mockGetAllRollingStock.mockResolvedValue([]);
    mockGetAllIndustries.mockResolvedValue([]);

    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  it('opens edit form when edit button is clicked', async () => {
    render(<RollingStock services={mockServices} />);

    // Wait for the table to render
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Click the edit button for the first car
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Check that the edit form is now displayed with correct title
    expect(screen.getByText(/Edit Car ATSF 12345/i)).toBeInTheDocument();

    // Check that input fields are rendered with correct values
    const roadNameInput = screen.getByTestId('roadName-input');
    const roadNumberInput = screen.getByTestId('roadNumber-input');
    
    expect(roadNameInput).toHaveValue('ATSF');
    expect(roadNumberInput).toHaveValue('12345');
  });

  it('shows car type and home yard dropdowns when editing', async () => {
    render(<RollingStock services={mockServices} />);

    // Wait for the table to render
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Click the edit button for the first car
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Check that the select fields are rendered
    const carTypeSelect = screen.getByLabelText('Car Type');
    const homeYardSelect = screen.getByLabelText('Home Yard');

    expect(carTypeSelect).toBeInTheDocument();
    expect(homeYardSelect).toBeInTheDocument();
  });

  it('saves changes when form is submitted', async () => {
    render(<RollingStock services={mockServices} />);

    // Wait for the table to render
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Click the edit button for the first car
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Edit fields
    const roadNameInput = screen.getByTestId('roadName-input');
    const roadNumberInput = screen.getByTestId('roadNumber-input');
    
    fireEvent.change(roadNameInput, { target: { value: 'BNSF' } });
    fireEvent.change(roadNumberInput, { target: { value: '54321' } });

    // Submit the form
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Verify that updateRollingStock was called with the updated values
    await waitFor(() => {
      expect(mockUpdateRollingStock).toHaveBeenCalledWith('1', expect.objectContaining({
        roadName: 'BNSF',
        roadNumber: '54321'
      }));
    });
  });

  it('cancels editing when cancel button is clicked', async () => {
    render(<RollingStock services={mockServices} />);

    // Wait for the table to render
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Click the edit button for the first car
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Edit the fields
    const roadNameInput = screen.getByTestId('roadName-input');
    fireEvent.change(roadNameInput, { target: { value: 'BNSF' } });

    // Click the cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Verify that we return to the table view
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Verify that updateRollingStock was not called
    expect(mockUpdateRollingStock).not.toHaveBeenCalled();
  });
}); 