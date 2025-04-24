import { LayoutDataCache } from '../LayoutDataCache';
import { Location, Industry, TrainRoute } from '@/shared/types/models';

describe('LayoutDataCache', () => {
  let cache: LayoutDataCache;
  const mockLocations: Location[] = [
    { _id: '1', stationName: 'Location 1', block: 'Block 1', ownerId: 'Owner 1' }
  ];
  const mockIndustries: Industry[] = [
    { _id: '1', name: 'Industry 1', industryType: 'FREIGHT', tracks: [], locationId: 'Location 1', ownerId: 'Owner 1' }
  ];
  const mockTrainRoutes: TrainRoute[] = [
    { _id: '1', name: 'Route 1', routeNumber: 'R1', routeType: 'MIXED', originatingYardId: 'Yard 1', terminatingYardId: 'Yard 2', stations: [] }
  ];

  beforeEach(() => {
    cache = new LayoutDataCache();
  });

  it('should initialize with null data', () => {
    expect(cache.getLocations()).toBeNull();
    expect(cache.getIndustries()).toBeNull();
    expect(cache.getTrainRoutes()).toBeNull();
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
    
    expect(cache.isDataLoaded()).toBe(true);
  });

  it('should clear all data', () => {
    cache.setLocations(mockLocations);
    cache.setIndustries(mockIndustries);
    cache.setTrainRoutes(mockTrainRoutes);
    
    cache.clear();
    
    expect(cache.getLocations()).toBeNull();
    expect(cache.getIndustries()).toBeNull();
    expect(cache.getTrainRoutes()).toBeNull();
    expect(cache.isDataLoaded()).toBe(false);
  });
}); 