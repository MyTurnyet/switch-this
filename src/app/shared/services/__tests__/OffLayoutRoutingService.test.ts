import { OffLayoutRoutingService } from '../OffLayoutRoutingService';
import { Location, Industry, LocationType, IndustryType } from '@/app/shared/types/models';

describe('OffLayoutRoutingService', () => {
  // Mock data
  const mockLocations: Location[] = [
    {
      _id: 'loc1',
      stationName: 'Location 1',
      block: 'Block 1',
      blockId: 'block1',
      locationType: LocationType.ON_LAYOUT,
      ownerId: 'owner1'
    },
    {
      _id: 'loc2',
      stationName: 'Location 2',
      block: 'Block 2',
      blockId: 'block2',
      locationType: LocationType.OFF_LAYOUT,
      ownerId: 'owner1'
    },
    {
      _id: 'loc3',
      stationName: 'Location 3',
      block: 'Block 3',
      blockId: 'block3',
      locationType: LocationType.FIDDLE_YARD,
      ownerId: 'owner1'
    },
    {
      _id: 'loc4',
      stationName: 'Location 4',
      block: 'Block 4',
      blockId: 'block4',
      locationType: LocationType.FIDDLE_YARD,
      ownerId: 'owner1'
    }
  ];

  const mockIndustries: Industry[] = [
    {
      _id: 'ind1',
      name: 'Echo Lake Factory',
      locationId: 'loc1',
      blockName: 'ECHO',
      industryType: IndustryType.FREIGHT,
      tracks: [
        {
          _id: 'track1',
          name: 'Track 1',
          length: 100,
          capacity: 5,
          maxCars: 5,
          placedCars: [],
          acceptedCarTypes: ['Boxcar'],
          ownerId: 'owner1'
        }
      ],
      ownerId: 'owner1'
    },
    {
      _id: 'ind2',
      name: 'Chicago Steel Mill',
      locationId: 'loc2',
      blockName: 'EAST',
      industryType: IndustryType.FREIGHT,
      tracks: [
        {
          _id: 'track2',
          name: 'Track 1',
          length: 100,
          capacity: 5,
          maxCars: 5,
          placedCars: [],
          acceptedCarTypes: ['Gondola'],
          ownerId: 'owner1'
        }
      ],
      ownerId: 'owner1'
    },
    {
      _id: 'ind3',
      name: 'Echo Lake Yard',
      locationId: 'loc3',
      blockName: 'ECHO',
      industryType: IndustryType.YARD,
      tracks: [
        {
          _id: 'track3',
          name: 'Yard Track 1',
          length: 200,
          capacity: 10,
          maxCars: 10,
          placedCars: [],
          acceptedCarTypes: ['*'],
          ownerId: 'owner1'
        }
      ],
      ownerId: 'owner1'
    },
    {
      _id: 'ind4',
      name: 'Interbay Yard',
      locationId: 'loc4',
      blockName: 'SEA',
      industryType: IndustryType.YARD,
      tracks: [
        {
          _id: 'track4',
          name: 'Yard Track 1',
          length: 200,
          capacity: 10,
          maxCars: 10,
          placedCars: [],
          acceptedCarTypes: ['*'],
          ownerId: 'owner1'
        }
      ],
      ownerId: 'owner1'
    }
  ];

  let service: OffLayoutRoutingService;

  beforeEach(() => {
    service = new OffLayoutRoutingService(mockLocations, mockIndustries);
  });

  describe('getNearestFiddleYard', () => {
    it('returns the closest fiddle yard in the same block', () => {
      const result = service.getNearestFiddleYard('loc1'); // Echo Lake
      expect(result).toBeDefined();
      expect(result?._id).toBe('loc3'); // Echo Lake Yard
    });

    it('returns undefined for unknown location ID', () => {
      const result = service.getNearestFiddleYard('unknown');
      expect(result).toBeUndefined();
    });

    it('returns any fiddle yard if none in the same block', () => {
      // Create a service with a location that has no fiddle yard in its block
      const testLocations = [
        {
          _id: 'test1',
          stationName: 'Test Location',
          block: 'TEST',
          blockId: 'blockTest',
          locationType: LocationType.ON_LAYOUT,
          ownerId: 'owner1'
        },
        ...mockLocations
      ];
      const testService = new OffLayoutRoutingService(testLocations, mockIndustries);
      const result = testService.getNearestFiddleYard('test1');
      expect(result).toBeDefined();
      expect(result?.locationType).toBe(LocationType.FIDDLE_YARD);
    });
  });

  describe('getYardIndustry', () => {
    it('returns a yard industry for a fiddle yard location', () => {
      const result = service.getYardIndustry('loc3'); // Echo Lake Yard
      expect(result).toBeDefined();
      expect(result?._id).toBe('ind3'); // Echo Lake Yard industry
    });

    it('returns undefined for a location with no yard industry', () => {
      const result = service.getYardIndustry('loc1'); // Echo Lake (not a yard)
      expect(result).toBeUndefined();
    });
  });

  describe('createOffLayoutDestination', () => {
    it('creates a proper destination for off-layout routing', () => {
      const result = service.createOffLayoutDestination(
        'loc1', // Echo Lake (origin)
        'loc2', // Chicago (final destination)
        'ind2',  // Chicago Steel Mill (final industry)
        'track2' // Track at final industry
      );
      
      expect(result).toBeDefined();
      if (result) {
        // Immediate destination should be Echo Lake Yard
        expect(result.immediateDestination.locationId).toBe('loc3');
        expect(result.immediateDestination.industryId).toBe('ind3');
        expect(result.immediateDestination.trackId).toBe('track3');
        
        // Final destination should be Chicago
        expect(result.finalDestination?.locationId).toBe('loc2');
        expect(result.finalDestination?.industryId).toBe('ind2');
        expect(result.finalDestination?.trackId).toBe('track2');
      }
    });

    it('returns undefined if no fiddle yard is found', () => {
      // Create a service with no fiddle yards
      const testLocations = mockLocations.filter(
        loc => loc.locationType !== LocationType.FIDDLE_YARD
      );
      const testService = new OffLayoutRoutingService(testLocations, mockIndustries);
      
      const result = testService.createOffLayoutDestination(
        'loc1', // Echo Lake (origin)
        'loc2', // Chicago (final destination)
        'ind2',  // Chicago Steel Mill (final industry)
        'track2' // Track at final industry
      );
      
      expect(result).toBeUndefined();
    });

    it('returns undefined if no yard industry is found', () => {
      // Create a service with fiddle yards but no yard industries
      const testIndustries = mockIndustries.filter(
        ind => ind.industryType !== IndustryType.YARD
      );
      const testService = new OffLayoutRoutingService(mockLocations, testIndustries);
      
      const result = testService.createOffLayoutDestination(
        'loc1', // Echo Lake (origin)
        'loc2', // Chicago (final destination)
        'ind2',  // Chicago Steel Mill (final industry)
        'track2' // Track at final industry
      );
      
      expect(result).toBeUndefined();
    });
  });

  describe('isOffLayoutLocation', () => {
    it('returns true for off-layout locations', () => {
      const result = service.isOffLayoutLocation('loc2'); // Chicago
      expect(result).toBe(true);
    });

    it('returns false for on-layout locations', () => {
      const result = service.isOffLayoutLocation('loc1'); // Echo Lake
      expect(result).toBe(false);
    });

    it('returns false for fiddle yard locations', () => {
      const result = service.isOffLayoutLocation('loc3'); // Echo Lake Yard
      expect(result).toBe(false);
    });

    it('returns false for unknown locations', () => {
      const result = service.isOffLayoutLocation('unknown');
      expect(result).toBe(false);
    });
  });
}); 