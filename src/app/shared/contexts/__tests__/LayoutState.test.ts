import { LayoutState } from '../LayoutState';
import { Industry, RollingStock, IndustryType } from '@/app/shared/types/models';

describe('LayoutState', () => {
  let layoutState: LayoutState;
  const mockIndustry: Industry = {
    _id: '1',
    name: 'Test Industry',
    industryType: IndustryType.FREIGHT,
    tracks: [{
      _id: 'track1',
      name: 'Track 1',
      maxCars: 3,
      placedCars: [],
      length: 0,
      capacity: 3,
      ownerId: 'owner1',
      acceptedCarTypes: []
    }],
    locationId: 'loc1',
    blockName: 'Test Block',
    ownerId: 'owner1',
    description: ''
  };

  const mockCar: RollingStock = {
    _id: 'car1',
    roadName: 'TEST',
    roadNumber: '1234',
    aarType: 'XM',
    description: 'Test Car',
    color: 'RED',
    note: '',
    homeYard: 'yard1',
    ownerId: 'owner1'
  };

  beforeEach(() => {
    layoutState = new LayoutState();
  });

  it('should initialize with empty state', () => {
    expect(layoutState.getIndustries()).toEqual([]);
    expect(layoutState.getCarsAtIndustry('1')).toEqual([]);
  });

  it('should add an industry to the state', () => {
    layoutState.addIndustry(mockIndustry);
    expect(layoutState.getIndustries()).toEqual([mockIndustry]);
  });

  it('should add a car to the state', () => {
    layoutState.addCar(mockCar);
    layoutState.addIndustry(mockIndustry);
    layoutState.placeCarAtIndustry('1', 'track1', mockCar, true);
    expect(layoutState.getCarsAtIndustry('1')).toEqual([mockCar]);
  });

  it('should place a car at an industry', () => {
    layoutState.addIndustry(mockIndustry);
    layoutState.placeCarAtIndustry('1', 'track1', mockCar, true);
    expect(layoutState.getCarsAtIndustry('1')).toEqual([mockCar]);
  });

  it('should remove a car from an industry', () => {
    layoutState.addIndustry(mockIndustry);
    layoutState.placeCarAtIndustry('1', 'track1', mockCar, true);
    layoutState.removeCarFromIndustry('1', 'track1', 'car1');
    expect(layoutState.getCarsAtIndustry('1')).toEqual([]);
  });

  it('should not allow placing a car at a non-existent industry', () => {
    expect(() => {
      layoutState.placeCarAtIndustry('nonexistent', 'track1', mockCar);
    }).toThrow('Industry not found');
  });

  it('should not allow placing a car at a non-existent track', () => {
    layoutState.addIndustry(mockIndustry);
    expect(() => {
      layoutState.placeCarAtIndustry('1', 'nonexistent', mockCar);
    }).toThrow('Track not found');
  });

  it('should not allow placing more cars than track capacity', () => {
    const layoutState = new LayoutState();
    const mockIndustry: Industry = {
      _id: '1',
      name: 'Test Industry',
      tracks: [{ 
        _id: 'track1', 
        name: 'Track 1', 
        maxCars: 1, 
        placedCars: [],
        length: 0,
        capacity: 1,
        ownerId: 'owner1',
        acceptedCarTypes: []
      }],
      locationId: 'loc1',
      industryType: IndustryType.FREIGHT,
      blockName: 'Test Block',
      ownerId: 'owner1',
      description: ''
    };
    const mockCar1: RollingStock = {
      _id: 'car1',
      roadName: 'TEST',
      roadNumber: '1234',
      aarType: 'XM',
      color: 'RED',
      description: 'Test Car',
      homeYard: 'yard1',
      ownerId: 'owner1',
      note: ''
    };
    const mockCar2: RollingStock = {
      _id: 'car2',
      roadName: 'TEST',
      roadNumber: '5678',
      aarType: 'XM',
      color: 'BLUE',
      description: 'Test Car 2',
      homeYard: 'yard1',
      ownerId: 'owner1',
      note: ''
    };

    layoutState.addIndustry(mockIndustry);
    layoutState.placeCarAtIndustry('1', 'track1', mockCar1, true);
    
    expect(() => {
      layoutState.placeCarAtIndustry('1', 'track1', mockCar2, true);
    }).toThrow('Track is at maximum capacity');
  });

  it('should reset the state to the original industries', () => {
    // Add initial industry and car
    layoutState.addIndustry(mockIndustry);
    layoutState.placeCarAtIndustry('1', 'track1', mockCar, true);
    
    // Verify state is modified
    expect(layoutState.getCarsAtIndustry('1')).toEqual([mockCar]);
    
    // Reset the state
    layoutState.reset([mockIndustry]);
    
    // Verify state is reset - industry should exist but with no cars
    const expectedIndustry = {
      ...mockIndustry,
      tracks: mockIndustry.tracks.map(track => ({
        ...track,
        placedCars: []
      }))
    };
    expect(layoutState.getIndustries()).toEqual([expectedIndustry]);
    expect(layoutState.getCarsAtIndustry('1')).toEqual([]);
  });

  it('should clear all cars when resetting', () => {
    // Add initial industry and car
    layoutState.addIndustry(mockIndustry);
    layoutState.addCar(mockCar);
    layoutState.placeCarAtIndustry('1', 'track1', mockCar, true);
    
    // Add another industry and car
    const mockIndustry2: Industry = {
      _id: '2',
      name: 'Test Industry 2',
      industryType: IndustryType.FREIGHT,
      tracks: [{
        _id: 'track2',
        name: 'Track 2',
        maxCars: 3,
        placedCars: [],
        length: 0,
        capacity: 3,
        ownerId: 'owner1',
        acceptedCarTypes: []
      }],
      locationId: 'loc2',
      blockName: 'Test Block 2',
      ownerId: 'owner1',
      description: ''
    };
    const mockCar2: RollingStock = {
      _id: 'car2',
      roadName: 'TEST2',
      roadNumber: '5678',
      aarType: 'XM',
      description: 'Test Car 2',
      color: 'BLUE',
      note: '',
      homeYard: 'yard1',
      ownerId: 'owner1'
    };
    layoutState.addIndustry(mockIndustry2);
    layoutState.addCar(mockCar2);
    layoutState.placeCarAtIndustry('2', 'track2', mockCar2, true);
    
    // Reset with only the first industry
    layoutState.reset([mockIndustry]);
    
    // Add and place a new car after reset
    const mockCar3: RollingStock = {
      _id: 'car3',
      roadName: 'TEST3',
      roadNumber: '9012',
      aarType: 'XM',
      description: 'Test Car 3',
      color: 'GREEN',
      note: '',
      homeYard: 'yard1',
      ownerId: 'owner1'
    };
    layoutState.addCar(mockCar3);
    layoutState.placeCarAtIndustry('1', 'track1', mockCar3, true);
    
    // Verify only the first industry exists and only the new car is placed
    const expectedIndustry = {
      ...mockIndustry,
      tracks: mockIndustry.tracks.map(track => ({
        ...track,
        placedCars: ['car3']
      }))
    };
    expect(layoutState.getIndustries()).toEqual([expectedIndustry]);
    expect(layoutState.getCarsAtIndustry('1')).toEqual([mockCar3]);
  });

  // Additional tests to improve coverage for lines 48-52, 60-61, 89, 94, 99

  it('should check if a car is already placed when trying to place it (lines 48-52)', () => {
    // Setup industry 1 with a track
    const industry1: Industry = {
      _id: 'industry1',
      name: 'Industry 1',
      industryType: IndustryType.FREIGHT,
      tracks: [{
        _id: 'track1',
        name: 'Track 1',
        maxCars: 3,
        placedCars: [],
        length: 0,
        capacity: 3,
        ownerId: 'owner1',
        acceptedCarTypes: []
      }],
      locationId: 'loc1',
      blockName: 'Block 1',
      ownerId: 'owner1',
      description: ''
    };

    // Setup industry 2 with a track
    const industry2: Industry = {
      _id: 'industry2',
      name: 'Industry 2',
      industryType: IndustryType.FREIGHT,
      tracks: [{
        _id: 'track2',
        name: 'Track 2',
        maxCars: 3,
        placedCars: [],
        length: 0,
        capacity: 3,
        ownerId: 'owner1',
        acceptedCarTypes: []
      }],
      locationId: 'loc2',
      blockName: 'Block 2',
      ownerId: 'owner1',
      description: ''
    };

    const testCar: RollingStock = {
      _id: 'testcar',
      roadName: 'TEST',
      roadNumber: '1000',
      aarType: 'XM',
      description: 'Test Car',
      color: 'RED',
      note: '',
      homeYard: 'yard1',
      ownerId: 'owner1'
    };

    // Add both industries
    layoutState.addIndustry(industry1);
    layoutState.addIndustry(industry2);

    // Place car at industry 1
    layoutState.placeCarAtIndustry('industry1', 'track1', testCar, true);

    // Now try to place it at industry 2 without skipping duplicate check
    expect(() => {
      layoutState.placeCarAtIndustry('industry2', 'track2', testCar, false);
    }).toThrow('Car is already placed at another location');
  });

  it('should throw an error when track does not accept car type (lines 60-61)', () => {
    // Setup an industry with a track that accepts only specific car types
    const restrictedIndustry: Industry = {
      _id: 'restricted',
      name: 'Restricted Industry',
      industryType: IndustryType.FREIGHT,
      tracks: [{
        _id: 'restrictedTrack',
        name: 'Restricted Track',
        maxCars: 3,
        placedCars: [],
        acceptedCarTypes: ['TANK', 'HOPPER'], // Only accept certain car types
        length: 0,
        capacity: 3,
        ownerId: 'owner1'
      }],
      locationId: 'loc1',
      blockName: 'Block 1',
      ownerId: 'owner1',
      description: ''
    };

    const boxCar: RollingStock = {
      _id: 'boxcar',
      roadName: 'TEST',
      roadNumber: '2000',
      aarType: 'XM', // Box car type not in accepted list
      description: 'Box Car',
      color: 'RED',
      note: '',
      homeYard: 'yard1',
      ownerId: 'owner1'
    };

    // Add the industry
    layoutState.addIndustry(restrictedIndustry);

    // Try to place a box car on a track that doesn't accept it
    expect(() => {
      layoutState.placeCarAtIndustry('restricted', 'restrictedTrack', boxCar);
    }).toThrow('Track Restricted Track does not accept car type XM');
  });

  it('should throw error when removing car from nonexistent industry (line 89)', () => {
    expect(() => {
      layoutState.removeCarFromIndustry('nonexistent', 'track1', 'car1');
    }).toThrow('Industry not found');
  });

  it('should throw error when removing car from nonexistent track (line 94)', () => {
    layoutState.addIndustry(mockIndustry);
    expect(() => {
      layoutState.removeCarFromIndustry('1', 'nonexistentTrack', 'car1');
    }).toThrow('Track not found');
  });

  it('should throw error when removing nonexistent car from track (line 99)', () => {
    layoutState.addIndustry(mockIndustry);
    expect(() => {
      layoutState.removeCarFromIndustry('1', 'track1', 'nonexistentCar');
    }).toThrow('Car not found on track');
  });
}); 