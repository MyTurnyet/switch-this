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
    layoutState.placeCarAtIndustry('1', 'track1', mockCar);
    expect(layoutState.getCarsAtIndustry('1')).toEqual([mockCar]);
  });

  it('should place a car at an industry', () => {
    layoutState.addIndustry(mockIndustry);
    layoutState.placeCarAtIndustry('1', 'track1', mockCar);
    expect(layoutState.getCarsAtIndustry('1')).toEqual([mockCar]);
  });

  it('should remove a car from an industry', () => {
    layoutState.addIndustry(mockIndustry);
    layoutState.placeCarAtIndustry('1', 'track1', mockCar);
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
    layoutState.placeCarAtIndustry('1', 'track1', mockCar1);
    
    expect(() => {
      layoutState.placeCarAtIndustry('1', 'track1', mockCar2);
    }).toThrow('Track is at maximum capacity');
  });
}); 