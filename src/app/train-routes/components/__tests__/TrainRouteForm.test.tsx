import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrainRouteForm from '../TrainRouteForm';
import { TrainRoute, Location, Industry, IndustryType, LocationType } from '@/app/shared/types/models';

describe('TrainRouteForm', () => {
  const mockTrainRoute: TrainRoute = {
    _id: '1',
    ownerId: 'owner1',
    name: 'Test Route',
    routeNumber: 'TR-101',
    routeType: 'MIXED',
    originatingYardId: '101',
    terminatingYardId: '102',
    stations: ['201', '202']
  };

  const mockLocations: Location[] = [
    { _id: '201', stationName: 'Station A', block: 'A', ownerId: 'owner1', locationType: LocationType.ON_LAYOUT, blockId: 'blockA' },
    { _id: '202', stationName: 'Station B', block: 'B', ownerId: 'owner1', locationType: LocationType.ON_LAYOUT, blockId: 'blockB' },
    { _id: '203', stationName: 'Station C', block: 'C', ownerId: 'owner1', locationType: LocationType.ON_LAYOUT, blockId: 'blockC' }
  ];

  const mockIndustries: Industry[] = [
    { 
      _id: '101', 
      name: 'Yard A', 
      industryType: IndustryType.YARD, 
      locationId: '301', 
      blockName: 'A',
      ownerId: 'owner1',
      tracks: []
    },
    { 
      _id: '102', 
      name: 'Yard B', 
      industryType: IndustryType.YARD, 
      locationId: '302', 
      blockName: 'B',
      ownerId: 'owner1',
      tracks: []
    }
  ];

  const mockOnSave = jest.fn().mockResolvedValue(undefined);
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with provided train route data', () => {
    render(
      <TrainRouteForm
        trainRoute={mockTrainRoute}
        locations={mockLocations}
        industries={mockIndustries}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Check that the form is pre-filled with the train route data
    expect(screen.getByDisplayValue('Test Route')).toBeInTheDocument();
    expect(screen.getByDisplayValue('TR-101')).toBeInTheDocument();
    // Use getAllByText since Station A appears multiple times
    expect(screen.getAllByText('Station A')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Station B')[0]).toBeInTheDocument();
  });

  it('renders with empty form for new train route', () => {
    render(
      <TrainRouteForm
        locations={mockLocations}
        industries={mockIndustries}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isNew={true}
      />
    );

    // Check that the form is empty
    expect(screen.getByText('Create New Train Route')).toBeInTheDocument();
    expect(screen.getByLabelText('Route Name')).toHaveValue('');
    expect(screen.getByLabelText('Route Number')).toHaveValue('');
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <TrainRouteForm
        trainRoute={mockTrainRoute}
        locations={mockLocations}
        industries={mockIndustries}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('validates required fields before submission', async () => {
    render(
      <TrainRouteForm
        locations={mockLocations}
        industries={mockIndustries}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isNew={true}
      />
    );

    // Try to submit the form without filling required fields
    fireEvent.click(screen.getByText('Save Changes'));

    // Verification is based on mockOnSave not being called when validation fails
    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  it('calls onSave with updated train route when form is valid', async () => {
    render(
      <TrainRouteForm
        locations={mockLocations}
        industries={mockIndustries}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isNew={true}
      />
    );

    // Fill in the required fields
    fireEvent.change(screen.getByLabelText('Route Name'), { target: { value: 'New Route' } });
    fireEvent.change(screen.getByLabelText('Route Number'), { target: { value: 'NR-101' } });
    
    // Select a route type
    fireEvent.change(screen.getByLabelText('Route Type'), { target: { value: 'FREIGHT' } });
    
    // Select yards
    fireEvent.change(screen.getByLabelText('Originating Yard'), { target: { value: '101' } });
    fireEvent.change(screen.getByLabelText('Terminating Yard'), { target: { value: '102' } });

    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Route',
        routeNumber: 'NR-101',
        routeType: 'FREIGHT',
        originatingYardId: '101',
        terminatingYardId: '102',
        stations: []
      }));
    });
  });

  it('adds a station to the route when Add Station button is clicked', async () => {
    render(
      <TrainRouteForm
        trainRoute={{ ...mockTrainRoute, stations: [] }}
        locations={mockLocations}
        industries={mockIndustries}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Select a station - since this has no name, we need to find it by its "Select a station to add" option
    const stationSelect = screen.getByRole('combobox', { name: '' });
    const stationOptions = screen.getAllByRole('option');
    
    // Find the option for Station C (value 203)
    const stationCOption = stationOptions.find(option => option.getAttribute('value') === '203');
    expect(stationCOption).toBeInTheDocument();
    
    // Set the value
    fireEvent.change(stationSelect, { target: { value: '203' } });

    // Click Add Station button
    fireEvent.click(screen.getByText('Add Station'));

    // Since we have two elements with 'Station C' text (the option and the added station),
    // we need to check for the presence of Station C in the list items
    const stationEntries = screen.getAllByText('Station C');
    expect(stationEntries.length).toBeGreaterThan(1); // At least 2 (one in dropdown, one in list)
    
    // Verify that we have a list item with Station C
    const stationItemElement = screen.getByRole('listitem');
    expect(stationItemElement).toHaveTextContent('Station C');

    // Fill in required fields and submit to check stations array
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        stations: ['203']
      }));
    });
  });

  it('does not add station when no station is selected', () => {
    render(
      <TrainRouteForm
        trainRoute={{ ...mockTrainRoute, stations: [] }}
        locations={mockLocations}
        industries={mockIndustries}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Click Add Station button without selecting a station
    fireEvent.click(screen.getByText('Add Station'));

    // Verify no stations were added to the list
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('removes a station when Remove button is clicked', async () => {
    render(
      <TrainRouteForm
        trainRoute={mockTrainRoute}
        locations={mockLocations}
        industries={mockIndustries}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Find all remove buttons (they display the ✕ symbol)
    const removeButtons = screen.getAllByText('✕');
    
    // Click the first remove button
    fireEvent.click(removeButtons[0]);

    // Check the station was removed - now only one station should remain
    // We can verify this by checking that there's only one "Remove" button left
    expect(screen.getAllByText('✕')).toHaveLength(1);

    // Submit the form to check updated stations array
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        stations: ['202'] // Only the second station should remain
      }));
    });
  });

  it('moves a station up when Move Up button is clicked', async () => {
    render(
      <TrainRouteForm
        trainRoute={mockTrainRoute}
        locations={mockLocations}
        industries={mockIndustries}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Find the "Move Up" button for the second station (index 1)
    const moveUpButtons = screen.getAllByText('↑');
    fireEvent.click(moveUpButtons[1]); // Click on the second station's "Move Up" button

    // Submit the form to verify the order change
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        stations: ['202', '201'] // Order should be reversed
      }));
    });
  });

  it('moves a station down when Move Down button is clicked', async () => {
    render(
      <TrainRouteForm
        trainRoute={mockTrainRoute}
        locations={mockLocations}
        industries={mockIndustries}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Find the "Move Down" button for the first station
    const moveDownButtons = screen.getAllByText('↓');
    fireEvent.click(moveDownButtons[0]); // Click on the first station's "Move Down" button

    // Submit the form to verify the order change
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        stations: ['202', '201'] // Order should be reversed
      }));
    });
  });

  it('does not allow moving the first station up', async () => {
    const originalTrainRoute = { ...mockTrainRoute };
    
    render(
      <TrainRouteForm
        trainRoute={originalTrainRoute}
        locations={mockLocations}
        industries={mockIndustries}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Find the "Move Up" button for the first station - it should be disabled
    // We'll identify it by its disabled state
    const firstStationButtons = screen.getAllByText('↑');
    const firstStationMoveUpButton = firstStationButtons[0];
    
    // Check if button is disabled
    expect(firstStationMoveUpButton).toBeDisabled();

    // Submit the form to verify no change occurred
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        stations: originalTrainRoute.stations // Order should be unchanged
      }));
    });
  });

  it('does not allow moving the last station down', async () => {
    const originalTrainRoute = { ...mockTrainRoute };
    
    render(
      <TrainRouteForm
        trainRoute={originalTrainRoute}
        locations={mockLocations}
        industries={mockIndustries}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Find the "Move Down" button for the last station - it should be disabled
    const downButtons = screen.getAllByText('↓');
    const lastStationMoveDownButton = downButtons[downButtons.length - 1];
    
    // Check if button is disabled
    expect(lastStationMoveDownButton).toBeDisabled();

    // Submit the form to verify no change occurred
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        stations: originalTrainRoute.stations // Order should be unchanged
      }));
    });
  });

  it('shows error message when save fails', async () => {
    const mockSaveWithError = jest.fn().mockRejectedValue(new Error('Save failed'));
    
    render(
      <TrainRouteForm
        trainRoute={mockTrainRoute}
        locations={mockLocations}
        industries={mockIndustries}
        onSave={mockSaveWithError}
        onCancel={mockOnCancel}
      />
    );

    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));

    // Check that error message is shown
    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument();
    });
  });
}); 