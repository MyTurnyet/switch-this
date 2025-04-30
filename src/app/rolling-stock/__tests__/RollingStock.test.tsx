import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
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
    expect(screen.getByText(/Loading rolling stock/i)).toBeInTheDocument();
  });

  it('displays rolling stock data when loaded with yard names', async () => {
    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText('ATSF 12345')).toBeInTheDocument();
    });

    // Check if yard names are displayed correctly
    expect(screen.getByText('Central Yard')).toBeInTheDocument();
    expect(screen.getByText('Eastern Yard')).toBeInTheDocument();
    expect(screen.getByText('Unknown Industry')).toBeInTheDocument();

    expect(screen.getByText('CP 67890')).toBeInTheDocument();
    expect(screen.getByText(/XM - Boxcar/i)).toBeInTheDocument();
    expect(screen.getByText(/FBC - Flatcar BlhHd/i)).toBeInTheDocument();
  });

  it('displays error message when fetch fails', async () => {
    mockGetAllRollingStock.mockRejectedValue(
      new Error('Failed to fetch')
    );

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
      expect(screen.getByText(/No rolling stock available/i)).toBeInTheDocument();
    });
  });

  it('makes road name and number editable when clicked', async () => {
    render(<RollingStock services={mockServices} />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('ATSF 12345')).toBeInTheDocument();
    });

    // Find the heading with the road name and number and click it
    const roadNameHeading = screen.getByText('ATSF 12345');
    fireEvent.click(roadNameHeading);

    // Check that the edit form is now displayed
    const roadNameInput = screen.getByDisplayValue('ATSF');
    const roadNumberInput = screen.getByDisplayValue('12345');
    
    expect(roadNameInput).toBeInTheDocument();
    expect(roadNumberInput).toBeInTheDocument();
  });

  it('shows car type dropdown and home yard dropdown when editing', async () => {
    render(<RollingStock services={mockServices} />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('ATSF 12345')).toBeInTheDocument();
    });

    // Find the heading with the road name and number and click it
    const roadNameHeading = screen.getByText('ATSF 12345');
    fireEvent.click(roadNameHeading);

    // Check that the edit form includes dropdowns
    const carTypeSelect = screen.getByLabelText('Car Type');
    const homeYardSelect = screen.getByLabelText('Home Yard');

    expect(carTypeSelect).toBeInTheDocument();
    expect(homeYardSelect).toBeInTheDocument();

    // Check that the car type dropdown has options
    const carTypeOption = within(carTypeSelect).getByText('XM - Boxcar');
    expect(carTypeOption).toBeInTheDocument();
    
    // Check that the industry dropdown has all industry options, not just yards
    const homeYardOptions = within(homeYardSelect).getAllByRole('option');
    expect(homeYardOptions.length).toBe(5); // Should have all 5 industries
    
    // Check for specific industry names
    expect(within(homeYardSelect).getByText('Central Yard')).toBeInTheDocument();
    expect(within(homeYardSelect).getByText('Eastern Yard')).toBeInTheDocument();
    expect(within(homeYardSelect).getByText('Steel Factory')).toBeInTheDocument();
    expect(within(homeYardSelect).getByText('Coal Mine')).toBeInTheDocument();
    expect(within(homeYardSelect).getByText('Central Station')).toBeInTheDocument();
  });

  it('saves changes to car type and home yard when form is submitted', async () => {
    render(<RollingStock services={mockServices} />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('ATSF 12345')).toBeInTheDocument();
    });

    // Find the heading with the road name and number and click it
    const roadNameHeading = screen.getByText('ATSF 12345');
    fireEvent.click(roadNameHeading);

    // Change the car type and home yard using the dropdowns
    const carTypeSelect = screen.getByLabelText('Car Type');
    const homeYardSelect = screen.getByLabelText('Home Yard');
    
    fireEvent.change(carTypeSelect, { target: { value: 'FBC|Flatcar BlhHd' } });
    fireEvent.change(homeYardSelect, { target: { value: 'ind1' } }); // Now selecting a freight industry

    // Submit the form
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    // Verify that updateRollingStock was called with the updated values
    await waitFor(() => {
      expect(mockUpdateRollingStock).toHaveBeenCalledWith('1', {
        ...mockRollingStock[0],
        roadName: 'ATSF',
        roadNumber: '12345',
        aarType: 'FBC',
        description: 'Flatcar BlhHd',
        homeYard: 'ind1'
      });
    });

    // Get the first car element
    const firstCarElement = screen.getByTestId('car-1');
    
    // Use within to scope queries to just this element
    await waitFor(() => {
      const typeText = within(firstCarElement).getByText(/FBC - Flatcar BlhHd/i);
      const yardText = within(firstCarElement).getByText('Steel Factory');
      expect(typeText).toBeInTheDocument();
      expect(yardText).toBeInTheDocument();
    });
  });

  it('saves changes when form is submitted', async () => {
    render(<RollingStock services={mockServices} />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('ATSF 12345')).toBeInTheDocument();
    });

    // Find the heading with the road name and number and click it
    const roadNameHeading = screen.getByText('ATSF 12345');
    fireEvent.click(roadNameHeading);

    // Edit the road name and number
    const roadNameInput = screen.getByDisplayValue('ATSF');
    const roadNumberInput = screen.getByDisplayValue('12345');
    
    fireEvent.change(roadNameInput, { target: { value: 'BNSF' } });
    fireEvent.change(roadNumberInput, { target: { value: '54321' } });

    // Submit the form
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    // Verify that updateRollingStock was called with the updated values
    await waitFor(() => {
      expect(mockUpdateRollingStock).toHaveBeenCalledWith('1', {
        ...mockRollingStock[0],
        roadName: 'BNSF',
        roadNumber: '54321'
      });
    });

    // Verify that the component returns to view mode with updated values
    await waitFor(() => {
      expect(screen.getByText('BNSF 54321')).toBeInTheDocument();
    });
  });

  it('cancels editing when cancel button is clicked', async () => {
    render(<RollingStock services={mockServices} />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('ATSF 12345')).toBeInTheDocument();
    });

    // Find the heading with the road name and number and click it
    const roadNameHeading = screen.getByText('ATSF 12345');
    fireEvent.click(roadNameHeading);

    // Edit the road name and number
    const roadNameInput = screen.getByDisplayValue('ATSF');
    const roadNumberInput = screen.getByDisplayValue('12345');
    
    fireEvent.change(roadNameInput, { target: { value: 'BNSF' } });
    fireEvent.change(roadNumberInput, { target: { value: '54321' } });

    // Click the cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Verify that the component returns to view mode with original values
    await waitFor(() => {
      expect(screen.getByText('ATSF 12345')).toBeInTheDocument();
    });

    // Verify that updateRollingStock was not called
    expect(mockUpdateRollingStock).not.toHaveBeenCalled();
  });
}); 