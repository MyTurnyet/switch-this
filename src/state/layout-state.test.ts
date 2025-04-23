import { LayoutState } from './layout-state';
import { Location, RollingStock } from '../app/shared/types/models';

describe('LayoutState', () => {
  let layoutState: LayoutState;
  const testLocation: Location = {
    _id: { $oid: 'test-location-1' },
    stationName: 'Test Station',
    block: 'TEST',
    ownerId: { $oid: 'test-owner' }
  };

  const testCar: RollingStock = {
    _id: { $oid: 'test-car-1' },
    roadName: 'TEST',
    roadNumber: 123,
    aarType: 'FB',
    description: 'Test Car',
    color: 'RED',
    note: '',
    homeYard: { $oid: 'test-yard' },
    ownerId: { $oid: 'test-owner' }
  };

  beforeEach(() => {
    layoutState = new LayoutState();
  });

  it('should initialize with empty car positions', () => {
    expect(layoutState.getCarPositions()).toEqual({});
  });

  it('should allow setting a car position', () => {
    layoutState.setCarPosition(testCar._id.$oid, testLocation._id.$oid);
    expect(layoutState.getCarPosition(testCar._id.$oid)).toBe(testLocation._id.$oid);
  });

  it('should allow moving a car to a new position', () => {
    const newLocation: Location = {
      _id: { $oid: 'test-location-2' },
      stationName: 'New Station',
      block: 'TEST',
      ownerId: { $oid: 'test-owner' }
    };

    layoutState.setCarPosition(testCar._id.$oid, testLocation._id.$oid);
    layoutState.setCarPosition(testCar._id.$oid, newLocation._id.$oid);
    expect(layoutState.getCarPosition(testCar._id.$oid)).toBe(newLocation._id.$oid);
  });

  it('should return undefined for non-existent car position', () => {
    expect(layoutState.getCarPosition('non-existent-car')).toBeUndefined();
  });

  it('should return all cars at a location', () => {
    const car2: RollingStock = {
      _id: { $oid: 'test-car-2' },
      roadName: 'TEST',
      roadNumber: 456,
      aarType: 'FB',
      description: 'Test Car 2',
      color: 'BLUE',
      note: '',
      homeYard: { $oid: 'test-yard' },
      ownerId: { $oid: 'test-owner' }
    };

    layoutState.setCarPosition(testCar._id.$oid, testLocation._id.$oid);
    layoutState.setCarPosition(car2._id.$oid, testLocation._id.$oid);

    const carsAtLocation = layoutState.getCarsAtLocation(testLocation._id.$oid);
    expect(carsAtLocation).toContain(testCar._id.$oid);
    expect(carsAtLocation).toContain(car2._id.$oid);
  });
}); 