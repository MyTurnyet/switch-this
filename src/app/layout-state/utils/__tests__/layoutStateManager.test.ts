import { initializeLayoutState, findLeastOccupiedTrack, placeCarAtTrack } from '../layoutStateManager';
import { Industry, RollingStock, Track } from '@/app/shared/types/models';

describe('layoutStateManager', () => {
  const mockYards: Industry[] = [
    {
      _id: 'yard1',
      name: 'BNSF Yard',
      locationId: 'loc1',
      blockName: 'Block1',
      industryType: 'YARD',
      tracks: [
        {
          _id: 'track1',
          name: 'Track 1',
          length: 100,
          capacity: 4,
          maxCars: 4,
          placedCars: []
        },
        {
          _id: 'track2',
          name: 'Track 2',
          length: 100,
          capacity: 5,
          maxCars: 5,
          placedCars: ['car3']
        }
      ],
      ownerId: 'owner1'
    },
    {
      _id: 'yard2',
      name: 'UP Yard',
      locationId: 'loc2',
      blockName: 'Block2',
      industryType: 'YARD',
      tracks: [
        {
          _id: 'track3',
          name: 'Track 3',
          length: 100,
          capacity: 3,
          maxCars: 3,
          placedCars: ['car4', 'car5']
        }
      ],
      ownerId: 'owner1'
    }
  ];

  const mockNonYards: Industry[] = [
    {
      _id: 'industry1',
      name: 'Factory',
      locationId: 'loc3',
      blockName: 'Block3',
      industryType: 'FREIGHT',
      tracks: [
        {
          _id: 'track4',
          name: 'Loading Dock',
          length: 50,
          capacity: 2,
          maxCars: 2,
          placedCars: []
        }
      ],
      ownerId: 'owner1'
    }
  ];

  const mockRollingStock: RollingStock[] = [
    {
      _id: 'car1',
      roadName: 'BNSF',
      roadNumber: '1234',
      aarType: 'XM',
      description: 'Boxcar',
      color: 'RED',
      note: '',
      homeYard: 'yard1',
      ownerId: 'owner1'
    },
    {
      _id: 'car2',
      roadName: 'UP',
      roadNumber: '5678',
      aarType: 'GS',
      description: 'Gondola',
      color: 'GREEN',
      note: '',
      homeYard: 'yard1',
      ownerId: 'owner1'
    },
    {
      _id: 'car3',
      roadName: 'CSX',
      roadNumber: '9012',
      aarType: 'FM',
      description: 'Flatcar',
      color: 'BLUE',
      note: '',
      homeYard: 'yard1',
      ownerId: 'owner1',
      currentLocation: {
        industryId: 'yard1',
        trackId: 'track2'
      }
    },
    {
      _id: 'car4',
      roadName: 'NS',
      roadNumber: '3456',
      aarType: 'HT',
      description: 'Hopper',
      color: 'BLACK',
      note: '',
      homeYard: 'yard2',
      ownerId: 'owner1',
      currentLocation: {
        industryId: 'yard2',
        trackId: 'track3'
      }
    },
    {
      _id: 'car5',
      roadName: 'DRGW',
      roadNumber: '7890',
      aarType: 'XM',
      description: 'Boxcar',
      color: 'YELLOW',
      note: '',
      homeYard: 'yard2',
      ownerId: 'owner1',
      currentLocation: {
        industryId: 'yard2',
        trackId: 'track3'
      }
    }
  ];

  describe('findLeastOccupiedTrack', () => {
    it('should find the track with the least cars', () => {
      const result = findLeastOccupiedTrack(mockYards[0].tracks);
      expect(result._id).toBe('track1');
    });

    it('should handle empty tracks array', () => {
      expect(() => findLeastOccupiedTrack([])).toThrow('No tracks available');
    });
  });

  describe('placeCarAtTrack', () => {
    it('should place a car at the specified track', () => {
      const industry = { ...mockYards[0] };
      const car = mockRollingStock[0];
      
      const updatedIndustry = placeCarAtTrack(industry, 'track1', car);
      
      expect(updatedIndustry.tracks[0].placedCars).toContain('car1');
      // Original industry should not be modified
      expect(mockYards[0].tracks[0].placedCars).not.toContain('car1');
    });

    it('should throw an error if the track is at capacity', () => {
      const industry = {
        ...mockYards[0],
        tracks: [
          {
            _id: 'track1',
            name: 'Track 1',
            length: 100,
            capacity: 1,
            maxCars: 1,
            placedCars: ['car3']
          }
        ]
      };
      
      expect(() => placeCarAtTrack(industry, 'track1', mockRollingStock[0]))
        .toThrow('Track is at maximum capacity');
    });

    it('should throw an error if the track is not found', () => {
      expect(() => placeCarAtTrack(mockYards[0], 'nonexistent', mockRollingStock[0]))
        .toThrow('Track not found');
    });
  });

  describe('initializeLayoutState', () => {
    it('should place cars at their home yards on the least occupied tracks', () => {
      const allIndustries = [...mockYards, ...mockNonYards];
      const carsToPlace = mockRollingStock.filter(car => !car.currentLocation);
      
      const result = initializeLayoutState(allIndustries, carsToPlace);
      
      // Check cars were placed at their home yards
      const yard1 = result.find((ind: Industry) => ind._id === 'yard1');
      const yard1Track1 = yard1?.tracks.find((t: Track) => t._id === 'track1');
      expect(yard1Track1?.placedCars).toContain('car1');
      expect(yard1Track1?.placedCars).toContain('car2');
      
      // Check non-YARD industries are unchanged
      const industry1 = result.find((ind: Industry) => ind._id === 'industry1');
      expect(industry1?.tracks[0].placedCars).toEqual([]);
    });

    it('should handle cars that already have a location', () => {
      const allIndustries = [...mockYards, ...mockNonYards];
      const result = initializeLayoutState(allIndustries, mockRollingStock.filter(car => car.currentLocation));
      
      // Cars with existing locations should not be moved
      expect(result).toEqual(allIndustries);
    });

    it('should handle cars with unknown home yards', () => {
      const carWithUnknownYard: RollingStock = {
        _id: 'unknown',
        roadName: 'TEST',
        roadNumber: '9999',
        aarType: 'XM',
        description: 'Test Car',
        color: 'RED',
        note: '',
        homeYard: 'unknownYard',
        ownerId: 'owner1'
      };
      
      // Should not throw an error, just skip the car
      const result = initializeLayoutState(mockYards, [carWithUnknownYard]);
      expect(result).toEqual(mockYards);
    });
  });
}); 