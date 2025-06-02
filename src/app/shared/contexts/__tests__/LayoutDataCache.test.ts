import { LayoutDataCache } from '../LayoutDataCache';
import { Location, Industry, TrainRoute, RollingStock, IndustryType, LocationType } from '@/app/shared/types/models';

describe('LayoutDataCache', () => {
  let cache: LayoutDataCache;
  const mockLocations: Location[] = [
    { _id: '1', stationName: 'Location 1', block: 'Block 1', ownerId: 'Owner 1', blockId: 'block1', locationType: LocationType.ON_LAYOUT }
  ];
  const mockIndustries: Industry[] = [
    { 
      _id: '1', 
      name: 'Industry 1', 
      industryType: IndustryType.FREIGHT, 
      tracks: [], 
      locationId: 'Location 1', 
      blockName: 'Block 1',
      ownerId: 'Owner 1',
      description: '' 
    }
  ];
  const mockTrainRoutes: TrainRoute[] = [
    {
      _id: '1',
      name: 'Route 1',
      routeNumber: '100',
      routeType: 'MIXED',
      originatingYardId: 'yard1',
      terminatingYardId: 'yard2',
      stations: ['Location 1', 'Location 2'],
      description: '',
      ownerId: 'Owner 1',
    },
  ];
  const mockRollingStock: RollingStock[] = [
    { _id: '1', roadName: 'BNSF', roadNumber: '1234', aarType: 'XM', description: 'Boxcar', color: 'RED', note: '', homeYard: '1', ownerId: 'owner1' }
  ];

  beforeEach(() => {
    cache = new LayoutDataCache();
  });

  it('should initialize with empty arrays', () => {
    expect(cache.getLocations()).toEqual([]);
    expect(cache.getIndustries()).toEqual([]);
    expect(cache.getTrainRoutes()).toEqual([]);
    expect(cache.getRollingStock()).toEqual([]);
  });

  it('should store and retrieve locations', () => {
    cache.setLocations(mockLocations);
    expect(cache.getLocations()).toEqual(mockLocations);
  });

  it('should store and retrieve industries', () => {
    cache.setIndustries(mockIndustries);
    expect(cache.getIndustries()).toEqual(mockIndustries);
  });

  it('should store and retrieve train routes', () => {
    cache.setTrainRoutes(mockTrainRoutes);
    expect(cache.getTrainRoutes()).toEqual(mockTrainRoutes);
  });

  it('should indicate when data is loaded', () => {
    expect(cache.isDataLoaded()).toBe(false);
    
    cache.setLocations(mockLocations);
    cache.setIndustries(mockIndustries);
    cache.setTrainRoutes(mockTrainRoutes);
    cache.setRollingStock(mockRollingStock);
    
    expect(cache.isDataLoaded()).toBe(true);
  });

  it('should clear all data', () => {
    cache.setLocations(mockLocations);
    cache.setIndustries(mockIndustries);
    cache.setTrainRoutes(mockTrainRoutes);
    
    cache.clear();
    
    expect(cache.getLocations()).toEqual([]);
    expect(cache.getIndustries()).toEqual([]);
    expect(cache.getTrainRoutes()).toEqual([]);
    expect(cache.isDataLoaded()).toBe(false);
  });

  describe('rolling stock operations', () => {
    it('should store and retrieve rolling stock data', () => {
      cache.setRollingStock(mockRollingStock);
      expect(cache.getRollingStock()).toEqual(mockRollingStock);
    });

    it('should handle empty rolling stock data', () => {
      cache.setRollingStock([]);
      expect(cache.getRollingStock()).toEqual([]);
    });

    it('should clear rolling stock data', () => {
      cache.setRollingStock(mockRollingStock);
      cache.clear();
      expect(cache.getRollingStock()).toEqual([]);
    });
  });

  describe('isDataLoaded', () => {
    it('should return false when rolling stock is empty', () => {
      cache.setRollingStock([]);
      expect(cache.isDataLoaded()).toBe(false);
    });

    it('should return true when all data is loaded', () => {
      cache.setLocations(mockLocations);
      cache.setIndustries(mockIndustries);
      cache.setTrainRoutes(mockTrainRoutes);
      cache.setRollingStock(mockRollingStock);
      expect(cache.isDataLoaded()).toBe(true);
    });
  });
}); 