import { LayoutState } from '../LayoutState';
import { Industry, RollingStock } from '@/shared/types/models';

describe('LayoutState', () => {
  let layoutState: LayoutState;
  const mockIndustry: Industry = {
    _id: '1',
    name: 'Test Industry',
    industryType: 'FREIGHT',
    tracks: [{
      _id: 'track1',
      name: 'Track 1',
      maxCars: 3,
      placedCars: []
    }],
    locationId: 'loc1',
    ownerId: 'owner1'
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
      tracks: [{ _id: 'track1', name: 'Track 1', maxCars: 1, placedCars: [] }],
      locationId: 'loc1',
      industryType: 'FREIGHT',
      ownerId: 'owner1'
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
      industryType: 'FREIGHT',
      tracks: [{
        _id: 'track2',
        name: 'Track 2',
        maxCars: 3,
        placedCars: []
      }],
      locationId: 'loc2',
      ownerId: 'owner1'
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
}); 