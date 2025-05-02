import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import LocationsPage from '../page';
import { LocationService } from '@/app/shared/services/LocationService';
import { LocationType } from '@/app/shared/types/models';

// Mock the LocationService
jest.mock('@/app/shared/services/LocationService', () => {
  return {
    LocationService: jest.fn().mockImplementation(() => {
      return {
        getAllLocations: jest.fn().mockResolvedValue([
          { 
            _id: 'loc1', 
            stationName: 'Echo Lake, WA', 
            block: 'ECHO', 
            locationType: LocationType.ON_LAYOUT,
            ownerId: 'owner1'
          },
          { 
            _id: 'loc2', 
            stationName: 'Chicago, IL', 
            block: 'EAST', 
            locationType: LocationType.OFF_LAYOUT,
            ownerId: 'owner1'
          },
          { 
            _id: 'loc3', 
            stationName: 'Echo Lake Yard', 
            block: 'ECHO', 
            locationType: LocationType.FIDDLE_YARD,
            ownerId: 'owner1'
          }
        ]),
        getLocationById: jest.fn().mockImplementation((id) => {
          return Promise.resolve({
            _id: id,
            stationName: 'Test Location',
            block: 'TEST',
            locationType: LocationType.ON_LAYOUT,
            ownerId: 'owner1'
          });
        }),
        createLocation: jest.fn().mockImplementation((locationData) => {
          return Promise.resolve({
            ...locationData,
            _id: 'new-location-id'
          });
        }),
        updateLocation: jest.fn().mockImplementation((id, locationData) => {
          return Promise.resolve({
            _id: id,
            ...locationData
          });
        }),
        deleteLocation: jest.fn().mockResolvedValue(undefined)
      };
    })
  };
});

// Mock the ui components
jest.mock('@/app/components/ui', () => {
  const originalModule = jest.requireActual('@/app/components/ui');
  return {
    ...originalModule,
    PageContainer: ({ children, title, description, actions }: any) => (
      <div data-testid="page-container">
        <h1>{title}</h1>
        <p>{description}</p>
        <div data-testid="page-actions">
          {Array.isArray(actions) && actions.map((action, idx) => (
            <button 
              key={idx} 
              onClick={action.onClick} 
              data-testid={`button-${action.label?.toString().toLowerCase().replace(/\s/g, '-')}`}
            >
              {action.label}
            </button>
          ))}
        </div>
        <div>{children}</div>
      </div>
    ),
    DataTable: ({ columns, data, keyExtractor }: any) => (
      <div data-testid="data-table">
        <table>
          <thead>
            <tr>
              {columns.map((col: any) => (
                <th key={col.key}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item: any) => (
              <tr key={keyExtractor(item)} data-testid={`row-${keyExtractor(item)}`}>
                {columns.map((col: any) => (
                  <td key={`${keyExtractor(item)}-${col.key}`}>
                    {col.accessor ? col.accessor(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
    Pagination: () => <div data-testid="pagination">Pagination</div>,
    Button: ({ children, onClick }: any) => (
      <button onClick={onClick} data-testid={`button-${children?.toString().toLowerCase().replace(/\s/g, '-')}`}>
        {children}
      </button>
    ),
    Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
    ToastProvider: ({ children }: any) => <div>{children}</div>,
    useToast: () => ({ toast: jest.fn() }),
    ConfirmDialog: ({ isOpen, title, onConfirm, onClose }: any) => {
      if (!isOpen) return null;
      return (
        <div data-testid="confirm-dialog">
          <h2>{title}</h2>
          <button onClick={onConfirm} data-testid="confirm-button">Confirm</button>
          <button onClick={onClose} data-testid="cancel-button">Cancel</button>
        </div>
      );
    }
  };
});

// Mock the EditLocationModal component
jest.mock('../components/EditLocationModal', () => {
  return {
    __esModule: true,
    default: ({ location, isOpen, onSave, onCancel }: any) => {
      if (!isOpen) return null;
      return (
        <div data-testid="edit-location-modal">
          <h2>{location ? `Edit ${location.stationName}` : 'Add New Location'}</h2>
          <button 
            data-testid="modal-save-button" 
            onClick={() => {
              const newLocation = location || { stationName: 'New Location', block: 'NEW', locationType: LocationType.ON_LAYOUT };
              onSave(newLocation);
            }}
          >
            Save
          </button>
          <button data-testid="modal-cancel-button" onClick={onCancel}>Cancel</button>
        </div>
      );
    }
  };
});

describe('LocationsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the locations page with correct title and description', async () => {
    render(<LocationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Locations')).toBeInTheDocument();
      expect(screen.getByText('Manage your layout locations')).toBeInTheDocument();
    });
  });

  it('displays the Add New Location button', async () => {
    render(<LocationsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('button-add-new-location')).toBeInTheDocument();
    });
  });

  it('fetches and displays locations in a table', async () => {
    render(<LocationsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
      
      // Check for column headers
      expect(screen.getByText('Station Name')).toBeInTheDocument();
      expect(screen.getByText('Block')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
      
      // Check for rows
      expect(screen.getByTestId('row-loc1')).toBeInTheDocument();
      expect(screen.getByTestId('row-loc2')).toBeInTheDocument();
      expect(screen.getByTestId('row-loc3')).toBeInTheDocument();
    });
  });

  it('opens the edit modal when Add New Location button is clicked', async () => {
    render(<LocationsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('button-add-new-location')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('button-add-new-location'));

    await waitFor(() => {
      expect(screen.getByTestId('edit-location-modal')).toBeInTheDocument();
      const headingElem = screen.getByTestId('edit-location-modal').querySelector('h2');
      expect(headingElem).toHaveTextContent('Add New Location');
    });
  });

  it('creates a new location and updates the UI', async () => {
    // Reset the LocationService mock
    (LocationService as jest.Mock).mockClear();
    
    // Create a mock implementation for this specific test
    const mockCreateLocation = jest.fn().mockResolvedValue({
      _id: 'new-location-id',
      stationName: 'New Location',
      block: 'NEW',
      locationType: LocationType.ON_LAYOUT,
      ownerId: 'owner1'
    });
    
    // Set the correct implementation for getAllLocations and createLocation
    (LocationService as jest.Mock).mockImplementation(() => ({
      getAllLocations: jest.fn().mockResolvedValue([
        { _id: 'loc1', stationName: 'Echo Lake, WA', block: 'ECHO', locationType: LocationType.ON_LAYOUT, ownerId: 'owner1' },
        { _id: 'loc2', stationName: 'Chicago, IL', block: 'EAST', locationType: LocationType.OFF_LAYOUT, ownerId: 'owner1' },
        { _id: 'loc3', stationName: 'Echo Lake Yard', block: 'ECHO', locationType: LocationType.FIDDLE_YARD, ownerId: 'owner1' }
      ]),
      createLocation: mockCreateLocation,
      updateLocation: jest.fn(),
      deleteLocation: jest.fn()
    }));
    
    render(<LocationsPage />);

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    // Open the add location modal
    const addButton = await screen.findByTestId('button-add-new-location');
    fireEvent.click(addButton);
    
    // Wait for the modal to appear
    const modalSaveButton = await screen.findByTestId('modal-save-button');
    
    // Save the new location
    fireEvent.click(modalSaveButton);

    // Verify that createLocation was called
    await waitFor(() => {
      expect(mockCreateLocation).toHaveBeenCalled();
    });
  });

  it('handles deletion confirmation and deletes a location', async () => {
    // Reset the LocationService mock
    (LocationService as jest.Mock).mockClear();
    
    // Create a mock delete function
    const mockDeleteLocation = jest.fn().mockResolvedValue(undefined);
    
    // Set the correct implementation for this test
    (LocationService as jest.Mock).mockImplementation(() => ({
      getAllLocations: jest.fn().mockResolvedValue([
        { _id: 'loc1', stationName: 'Echo Lake, WA', block: 'ECHO', locationType: LocationType.ON_LAYOUT, ownerId: 'owner1' },
        { _id: 'loc2', stationName: 'Chicago, IL', block: 'EAST', locationType: LocationType.OFF_LAYOUT, ownerId: 'owner1' },
        { _id: 'loc3', stationName: 'Echo Lake Yard', block: 'ECHO', locationType: LocationType.FIDDLE_YARD, ownerId: 'owner1' }
      ]),
      createLocation: jest.fn(),
      updateLocation: jest.fn(),
      deleteLocation: mockDeleteLocation
    }));
    
    render(<LocationsPage />);

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    // Find and click a delete button
    const deleteButtons = await screen.findAllByTestId('button-delete');
    fireEvent.click(deleteButtons[0]); // Click the first delete button

    // Confirm dialog should be visible
    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    // Confirm deletion
    fireEvent.click(screen.getByTestId('confirm-button'));

    // Verify that deleteLocation was called
    await waitFor(() => {
      expect(mockDeleteLocation).toHaveBeenCalled();
    });
  });

  it('handles API errors gracefully', async () => {
    // Reset the LocationService mock
    (LocationService as jest.Mock).mockClear();
    
    // Create a mock that rejects with an error
    const mockGetAllLocations = jest.fn().mockRejectedValue(new Error('API error'));
    
    // Set the correct implementation for this test
    (LocationService as jest.Mock).mockImplementation(() => ({
      getAllLocations: mockGetAllLocations,
      createLocation: jest.fn(),
      updateLocation: jest.fn(),
      deleteLocation: jest.fn()
    }));
    
    render(<LocationsPage />);
    
    // Wait for the loading state to finish and error to be set
    await waitFor(() => {
      expect(mockGetAllLocations).toHaveBeenCalled();
    });
    
    // Use a more flexible approach to find the error text
    // Check if the error text is within the page container
    const pageContainer = screen.getByTestId('page-container');
    
    // Use waitFor instead of findByText to give the component time to update
    await waitFor(() => {
      // This checks if the text is anywhere in the container
      expect(pageContainer.textContent).toContain('Failed to load data');
    });
  });
}); 