import { LayoutState } from '../layout-state';
import { Location, RollingStock } from '@shared/types/models';

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

  describe('multiple car operations', () => {
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

    const car3: RollingStock = {
      _id: { $oid: 'test-car-3' },
      roadName: 'TEST',
      roadNumber: 789,
      aarType: 'FB',
      description: 'Test Car 3',
      color: 'GREEN',
      note: '',
      homeYard: { $oid: 'test-yard' },
      ownerId: { $oid: 'test-owner' }
    };

    it('should set multiple car positions at once', () => {
      const carPositions = {
        [testCar._id.$oid]: testLocation._id.$oid,
        [car2._id.$oid]: testLocation._id.$oid,
        [car3._id.$oid]: testLocation._id.$oid
      };

      layoutState.setCarPositions(carPositions);

      expect(layoutState.getCarPosition(testCar._id.$oid)).toBe(testLocation._id.$oid);
      expect(layoutState.getCarPosition(car2._id.$oid)).toBe(testLocation._id.$oid);
      expect(layoutState.getCarPosition(car3._id.$oid)).toBe(testLocation._id.$oid);
      expect(layoutState.getCarsAtLocation(testLocation._id.$oid)).toHaveLength(3);
    });

    it('should move multiple cars to a new location', () => {
      const newLocation: Location = {
        _id: { $oid: 'test-location-2' },
        stationName: 'New Station',
        block: 'TEST',
        ownerId: { $oid: 'test-owner' }
      };

      // Set initial positions
      layoutState.setCarPosition(testCar._id.$oid, testLocation._id.$oid);
      layoutState.setCarPosition(car2._id.$oid, testLocation._id.$oid);
      layoutState.setCarPosition(car3._id.$oid, testLocation._id.$oid);

      // Move all cars to new location
      layoutState.setCarPositions({
        [testCar._id.$oid]: newLocation._id.$oid,
        [car2._id.$oid]: newLocation._id.$oid,
        [car3._id.$oid]: newLocation._id.$oid
      });

      expect(layoutState.getCarsAtLocation(testLocation._id.$oid)).toHaveLength(0);
      expect(layoutState.getCarsAtLocation(newLocation._id.$oid)).toHaveLength(3);
    });
  });

  describe('empty locations', () => {
    it('should return empty locations', () => {
      const location2: Location = {
        _id: { $oid: 'test-location-2' },
        stationName: 'Empty Station',
        block: 'TEST',
        ownerId: { $oid: 'test-owner' }
      };

      const location3: Location = {
        _id: { $oid: 'test-location-3' },
        stationName: 'Another Empty Station',
        block: 'TEST',
        ownerId: { $oid: 'test-owner' }
      };

      // Set up some locations with cars
      layoutState.setCarPosition(testCar._id.$oid, testLocation._id.$oid);

      const emptyLocations = layoutState.getEmptyLocations([
        testLocation._id.$oid,
        location2._id.$oid,
        location3._id.$oid
      ]);

      expect(emptyLocations).toContain(location2._id.$oid);
      expect(emptyLocations).toContain(location3._id.$oid);
      expect(emptyLocations).not.toContain(testLocation._id.$oid);
    });

    it('should return all locations as empty when no cars are placed', () => {
      const location2: Location = {
        _id: { $oid: 'test-location-2' },
        stationName: 'Empty Station',
        block: 'TEST',
        ownerId: { $oid: 'test-owner' }
      };

      const emptyLocations = layoutState.getEmptyLocations([
        testLocation._id.$oid,
        location2._id.$oid
      ]);

      expect(emptyLocations).toContain(testLocation._id.$oid);
      expect(emptyLocations).toContain(location2._id.$oid);
    });
  });
}); 