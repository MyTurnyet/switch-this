import React from 'react';
import { render, screen, waitFor, fireEvent, within, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import RollingStock from '../RollingStock';
import { ClientServices, RollingStockService, IndustryService } from '@/app/shared/services/clientServices';
import { RollingStock as RollingStockType, Industry, IndustryType } from '@/app/shared/types/models';

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
      description: 'Flatcar Centerbeam',
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
      homeYard: 'yard1',
      ownerId: 'owner3',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllRollingStock.mockResolvedValue(mockRollingStock);
    mockGetAllIndustries.mockResolvedValue(mockIndustries);
  });

  it('renders the correct color classes for different car colors', async () => {
    // For this test, we need to modify the mock data to have consistent colors
    const modifiedMockRollingStock = [
      {
        ...mockRollingStock[0],
        color: 'RED'
      },
      {
        ...mockRollingStock[1],
        color: 'BLUE'
      },
      {
        ...mockRollingStock[2],
        color: 'YELLOW'
      }
    ];
    
    mockGetAllRollingStock.mockResolvedValue(modifiedMockRollingStock);
    
    render(<RollingStock services={mockServices} />);
    
    await waitFor(() => {
      expect(screen.getByText('ATSF 12345')).toBeInTheDocument();
    });

    // Each rolling stock card should have a color bar at the top
    
    // Check the red car
    const redCarElement = screen.getByTestId('car-1');
    const redColorBar = redCarElement.querySelector('.bg-red-500');
    expect(redColorBar).toBeInTheDocument();
    
    // Check the blue car
    const blueCarElement = screen.getByTestId('car-2');
    const blueColorBar = blueCarElement.querySelector('.bg-blue-500');
    expect(blueColorBar).toBeInTheDocument();
    
    // Check the yellow car
    const yellowCarElement = screen.getByTestId('car-3');
    const yellowColorBar = yellowCarElement.querySelector('.bg-yellow-500');
    expect(yellowColorBar).toBeInTheDocument();
  });

  it('shows all car types in the dropdown when editing', async () => {
    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText('ATSF 12345')).toBeInTheDocument();
    });

    // Click to edit the first car
    fireEvent.click(screen.getByText('ATSF 12345'));
    
    // Get the car type dropdown
    const carTypeSelect = screen.getByLabelText('Car Type');
    
    // Check for a sample of car types
    const carTypeOptions = within(carTypeSelect).getAllByRole('option');
    
    // Should have 17 options (the number of items in CAR_TYPES array)
    expect(carTypeOptions.length).toBe(17);
    
    // Check for specific car types
    expect(within(carTypeSelect).getByText(/XM - Boxcar/i)).toBeInTheDocument();
    expect(within(carTypeSelect).getByText(/FBC - Flatcar Centerbeam/i)).toBeInTheDocument();
    expect(within(carTypeSelect).getByText(/GS - Gondola/i)).toBeInTheDocument();
    expect(within(carTypeSelect).getByText(/TA - Tank Car/i)).toBeInTheDocument();
    expect(within(carTypeSelect).getByText(/CS - Caboose/i)).toBeInTheDocument();
  });

  it('handles error when updating rolling stock fails', async () => {
    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText('ATSF 12345')).toBeInTheDocument();
    });

    // Click to edit the first car
    fireEvent.click(screen.getByText('ATSF 12345'));
    
    // Change road name
    const roadNameInput = screen.getByDisplayValue('ATSF');
    fireEvent.change(roadNameInput, { target: { value: 'BNSF' } });
    
    // Mock API error
    mockUpdateRollingStock.mockRejectedValue(new Error('Update failed'));
    
    // Click save button
    fireEvent.click(screen.getByText('Save'));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to update rolling stock/i)).toBeInTheDocument();
    });
  });

  it('correctly handles carType when format is not as expected', async () => {
    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText('ATSF 12345')).toBeInTheDocument();
    });

    // Click to edit the first car
    fireEvent.click(screen.getByText('ATSF 12345'));
    
    // Manually setup a situation where carType might not contain the pipe character
    // We'll use a spy to manipulate the handleSave function's behavior
    const carTypeSelect = screen.getByLabelText('Car Type');
    
    // First select a valid option that does have the pipe character
    fireEvent.change(carTypeSelect, { target: { value: 'TA|Tank Car' } });
    
    // Then force the value to not have a pipe
    Object.defineProperty(carTypeSelect, 'value', {
      value: 'TA',
      writable: true
    });
    
    // Click save
    fireEvent.click(screen.getByText('Save'));
    
    // Wait for the update to be called
    await waitFor(() => {
      expect(mockUpdateRollingStock).toHaveBeenCalledWith('1', expect.objectContaining({
        aarType: 'TA', // Should still correctly use the CAR_TYPES mapping
        description: 'Tank Car' // Should still correctly use the CAR_TYPES mapping
      }));
    });
  });

  it('correctly updates when changing the car type', async () => {
    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText('ATSF 12345')).toBeInTheDocument();
    });

    // Click to edit the first car
    fireEvent.click(screen.getByText('ATSF 12345'));
    
    // Change car type to Tank Car
    const carTypeSelect = screen.getByLabelText('Car Type');
    fireEvent.change(carTypeSelect, { target: { value: 'TA|Tank Car' } });
    
    // Click save
    fireEvent.click(screen.getByText('Save'));
    
    // Verify that updateRollingStock was called with the correct car type and description
    await waitFor(() => {
      expect(mockUpdateRollingStock).toHaveBeenCalledWith('1', expect.objectContaining({
        aarType: 'TA',
        description: 'Tank Car'
      }));
    });
    
    // Update the mock data to reflect the change
    mockRollingStock[0].aarType = 'TA';
    mockRollingStock[0].description = 'Tank Car';
    mockGetAllRollingStock.mockResolvedValue(mockRollingStock);
    
    // Re-render to see the updated data
    await act(async () => {
      render(<RollingStock services={mockServices} />);
    });
    
    // Check that the updated car type is displayed
    await waitFor(() => {
      const firstCarElement = screen.getByTestId('car-1');
      expect(within(firstCarElement).getByText(/TA - Tank Car/i)).toBeInTheDocument();
    });
  });

  it('is accessible - all interactive elements have ARIA labels', async () => {
    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText('ATSF 12345')).toBeInTheDocument();
    });

    // Click to edit the first car
    fireEvent.click(screen.getByText('ATSF 12345'));
    
    // Check that all form inputs have labels
    const carTypeSelect = screen.getByLabelText('Car Type');
    const homeYardSelect = screen.getByLabelText('Home Yard');
    const roadNameInput = screen.getByLabelText('Road Name');
    const roadNumberInput = screen.getByLabelText('Road Number');
    
    expect(carTypeSelect).toBeInTheDocument();
    expect(homeYardSelect).toBeInTheDocument();
    expect(roadNameInput).toBeInTheDocument();
    expect(roadNumberInput).toBeInTheDocument();
    
    // Check that buttons have accessible names
    const saveButton = screen.getByText('Save');
    const cancelButton = screen.getByText('Cancel');
    
    expect(saveButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  it('displays notes when they are present', async () => {
    render(<RollingStock services={mockServices} />);

    await waitFor(() => {
      expect(screen.getByText('ATSF 12345')).toBeInTheDocument();
    });

    // Check for the note of the first car
    const firstCarElement = screen.getByTestId('car-1');
    const noteElement = within(firstCarElement).getByText('Test note');
    expect(noteElement).toBeInTheDocument();
    
    // Check that the note label is present
    const noteLabel = within(firstCarElement).getByText('Note:');
    expect(noteLabel).toBeInTheDocument();
  });

  it('renders correct colors for different car types', async () => {
    // Mock data with different colors
    const mockRollingStockData: RollingStockType[] = [
      { _id: '1', roadName: 'Test', roadNumber: '123', aarType: 'XM', description: 'Box Car', color: 'RED', homeYard: 'yard1', note: '', ownerId: 'user1' },
      { _id: '2', roadName: 'Test', roadNumber: '124', aarType: 'FB', description: 'Flat Car', color: 'BLUE', homeYard: 'yard1', note: '', ownerId: 'user1' },
      { _id: '3', roadName: 'Test', roadNumber: '125', aarType: 'GS', description: 'Gondola', color: 'GREEN', homeYard: 'yard1', note: '', ownerId: 'user1' },
      { _id: '4', roadName: 'Test', roadNumber: '126', aarType: 'HK', description: 'Hopper', color: 'BROWN', homeYard: 'yard1', note: '', ownerId: 'user1' },
      { _id: '5', roadName: 'Test', roadNumber: '127', aarType: 'CS', description: 'Caboose', color: 'BLACK', homeYard: 'yard1', note: '', ownerId: 'user1' },
    ];

    // Setup mocks
    mockGetAllRollingStock.mockResolvedValue(mockRollingStockData);
    mockGetAllIndustries.mockResolvedValue([
      { _id: 'yard1', name: 'Test Yard', industryType: IndustryType.YARD, locationId: 'loc1', blockName: 'B1', tracks: [], ownerId: 'user1' }
    ]);
    
    // Render the component
    render(<RollingStock services={mockServices} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading rolling stock...')).not.toBeInTheDocument();
    });

    // Verify correct color classes are applied
    expect(screen.getByTestId('car-1').querySelector('.bg-red-500')).toBeInTheDocument();
    expect(screen.getByTestId('car-2').querySelector('.bg-blue-500')).toBeInTheDocument();
    expect(screen.getByTestId('car-3').querySelector('.bg-green-500')).toBeInTheDocument();
    expect(screen.getByTestId('car-4').querySelector('.bg-yellow-700')).toBeInTheDocument();
    expect(screen.getByTestId('car-5').querySelector('.bg-black')).toBeInTheDocument();
  });
}); 