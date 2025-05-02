import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditTrainRouteModal from '../EditTrainRouteModal';
import { TrainRoute, Location, Industry, IndustryType, LocationType } from '@/app/shared/types/models';

// Mock the TrainRouteForm component
jest.mock('../TrainRouteForm', () => {
  return function TrainRouteFormMock({ 
    trainRoute, 
    onSave, 
    onCancel 
  }: {
    trainRoute?: TrainRoute;
    locations: Location[];
    industries: Industry[];
    onSave: (route: TrainRoute) => Promise<void>;
    onCancel: () => void;
    isNew: boolean;
  }) {
    return (
      <div data-testid="train-route-form-mock">
        <button onClick={() => onSave(trainRoute as TrainRoute)} data-testid="mock-save-button">Save</button>
        <button onClick={onCancel} data-testid="mock-cancel-button">Cancel</button>
      </div>
    );
  };
});

describe('EditTrainRouteModal', () => {
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
    { _id: '201', stationName: 'Station A', block: 'A', ownerId: 'owner1', locationType: LocationType.ON_LAYOUT },
    { _id: '202', stationName: 'Station B', block: 'B', ownerId: 'owner1', locationType: LocationType.ON_LAYOUT }
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

  it('renders nothing when isOpen is false', () => {
    render(
      <EditTrainRouteModal
        trainRoute={mockTrainRoute}
        locations={mockLocations}
        industries={mockIndustries}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isOpen={false}
      />
    );

    expect(screen.queryByTestId('train-route-form-mock')).not.toBeInTheDocument();
  });

  it('renders the form when isOpen is true', () => {
    render(
      <EditTrainRouteModal
        trainRoute={mockTrainRoute}
        locations={mockLocations}
        industries={mockIndustries}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isOpen={true}
      />
    );

    expect(screen.getByTestId('train-route-form-mock')).toBeInTheDocument();
  });

  it('calls onSave when save is triggered', async () => {
    render(
      <EditTrainRouteModal
        trainRoute={mockTrainRoute}
        locations={mockLocations}
        industries={mockIndustries}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isOpen={true}
      />
    );

    fireEvent.click(screen.getByTestId('mock-save-button'));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(mockTrainRoute);
    });
  });

  it('calls onCancel when cancel is triggered', () => {
    render(
      <EditTrainRouteModal
        trainRoute={mockTrainRoute}
        locations={mockLocations}
        industries={mockIndustries}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isOpen={true}
      />
    );

    fireEvent.click(screen.getByTestId('mock-cancel-button'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
}); 