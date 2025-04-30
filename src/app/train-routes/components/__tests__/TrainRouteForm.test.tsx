import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrainRouteForm from '../TrainRouteForm';
import { TrainRoute, Location, Industry, IndustryType } from '@/app/shared/types/models';

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
    { _id: '201', stationName: 'Station A', block: 'A', ownerId: 'owner1' },
    { _id: '202', stationName: 'Station B', block: 'B', ownerId: 'owner1' },
    { _id: '203', stationName: 'Station C', block: 'C', ownerId: 'owner1' }
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

  const mockOnSave = jest.fn();
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
}); 