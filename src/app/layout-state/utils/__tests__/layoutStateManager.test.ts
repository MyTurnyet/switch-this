import { initializeLayoutState, findLeastOccupiedTrack, placeCarAtTrack } from '../layoutStateManager';
import { Industry, IndustryType, RollingStock, Track } from '@/app/shared/types/models';

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
    it('should return the track with the fewest cars', () => {
      const tracks: Track[] = [
        {
          _id: 'track-1',
          name: 'Track 1',
          length: 100,
          capacity: 5,
          maxCars: 5,
          placedCars: ['car-1', 'car-2', 'car-3'],
          acceptedCarTypes: ['XM', 'FB'],
          ownerId: 'owner-1'
        },
        {
          _id: 'track-2',
          name: 'Track 2',
          length: 100,
          capacity: 5,
          maxCars: 5,
          placedCars: ['car-4'],
          acceptedCarTypes: ['XM', 'FB'],
          ownerId: 'owner-1'
        },
        {
          _id: 'track-3',
          name: 'Track 3',
          length: 100,
          capacity: 5,
          maxCars: 5,
          placedCars: ['car-5', 'car-6'],
          acceptedCarTypes: ['XM', 'FB'],
          ownerId: 'owner-1'
        }
      ];

      // Find the least occupied track
      const leastOccupied = findLeastOccupiedTrack(tracks);

      // Verify it's the one with only one car
      expect(leastOccupied._id).toBe('track-2');
      expect(leastOccupied.placedCars.length).toBe(1);
    });

    it('should throw an error when no tracks are available', () => {
      expect(() => {
        findLeastOccupiedTrack([]);
      }).toThrow('No tracks available');
    });
  });

  describe('placeCarAtTrack', () => {
    it('should add the car to the track and return updated industry', () => {
      const track: Track = {
        _id: 'track-1',
        name: 'Test Track',
        length: 100,
        capacity: 3,
        maxCars: 3,
        placedCars: [],
        acceptedCarTypes: ['XM', 'FB'],
        ownerId: 'owner-1'
      };

      const industry: Industry = {
        _id: 'industry-1',
        name: 'Test Industry',
        industryType: IndustryType.YARD,
        locationId: 'location-1',
        blockName: 'Block A',
        tracks: [track],
        ownerId: 'owner-1'
      };

      const car: RollingStock = {
        _id: 'car-1',
        roadName: 'Test',
        roadNumber: '123',
        aarType: 'XM',
        description: 'Box Car',
        color: 'black',
        note: '',
        homeYard: 'industry-1',
        ownerId: 'owner-1'
      };

      // Place the car at the track
      const updatedIndustry = placeCarAtTrack(industry, 'track-1', car);

      // Verify the car was added
      expect(updatedIndustry.tracks[0].placedCars).toContain('car-1');
      expect(updatedIndustry.tracks[0].placedCars.length).toBe(1);
    });

    it('should throw an error when track is at capacity', () => {
      const track: Track = {
        _id: 'track-1',
        name: 'Test Track',
        length: 100,
        capacity: 2,
        maxCars: 2,
        placedCars: ['car-1', 'car-2'],
        acceptedCarTypes: ['XM', 'FB'],
        ownerId: 'owner-1'
      };

      const industry: Industry = {
        _id: 'industry-1',
        name: 'Test Industry',
        industryType: IndustryType.FREIGHT,
        locationId: 'location-1',
        blockName: 'Block A',
        tracks: [track],
        ownerId: 'owner-1'
      };

      const car: RollingStock = {
        _id: 'car-3',
        roadName: 'Test',
        roadNumber: '123',
        aarType: 'XM',
        description: 'Box Car',
        color: 'black',
        note: '',
        homeYard: 'industry-1',
        ownerId: 'owner-1'
      };

      // Verify that the function throws an error
      expect(() => {
        placeCarAtTrack(industry, 'track-1', car);
      }).toThrow('Track is at maximum capacity');
    });

    it('should throw an error when track is not found', () => {
      const industry: Industry = {
        _id: 'industry-1',
        name: 'Test Industry',
        industryType: IndustryType.FREIGHT,
        locationId: 'location-1',
        blockName: 'Block A',
        tracks: [],
        ownerId: 'owner-1'
      };

      const car: RollingStock = {
        _id: 'car-1',
        roadName: 'Test',
        roadNumber: '123',
        aarType: 'XM',
        description: 'Box Car',
        color: 'black',
        note: '',
        homeYard: 'industry-1',
        ownerId: 'owner-1'
      };

      // Verify that the function throws an error
      expect(() => {
        placeCarAtTrack(industry, 'track-1', car);
      }).toThrow('Track not found');
    });

    it('should throw an error when placing a car with an unaccepted type', () => {
      // Setup a track that only accepts XM and FB car types
      const track: Track = {
        _id: 'track-1',
        name: 'Test Track',
        length: 100,
        capacity: 3,
        maxCars: 3,
        placedCars: [],
        acceptedCarTypes: ['XM', 'FB'],
        ownerId: 'owner-1'
      };

      const industry: Industry = {
        _id: 'industry-1',
        name: 'Test Industry',
        industryType: IndustryType.FREIGHT,
        locationId: 'location-1',
        blockName: 'Block A',
        tracks: [track],
        ownerId: 'owner-1'
      };

      // Setup a car with an unaccepted type
      const car: RollingStock = {
        _id: 'car-1',
        roadName: 'Test',
        roadNumber: '123',
        aarType: 'TA', // Tank car, not in accepted types
        description: 'Tank Car',
        color: 'black',
        note: '',
        homeYard: 'industry-1',
        ownerId: 'owner-1'
      };

      // Verify that the function throws an error
      expect(() => {
        placeCarAtTrack(industry, 'track-1', car);
      }).toThrow('Track Test Track does not accept car type TA');
    });

    it('should not throw an error when placing a car with an accepted type', () => {
      // Setup a track that only accepts XM and FB car types
      const track: Track = {
        _id: 'track-1',
        name: 'Test Track',
        length: 100,
        capacity: 3,
        maxCars: 3,
        placedCars: [],
        acceptedCarTypes: ['XM', 'FB'],
        ownerId: 'owner-1'
      };

      const industry: Industry = {
        _id: 'industry-1',
        name: 'Test Industry',
        industryType: IndustryType.FREIGHT,
        locationId: 'location-1',
        blockName: 'Block A',
        tracks: [track],
        ownerId: 'owner-1'
      };

      // Setup a car with an accepted type
      const car: RollingStock = {
        _id: 'car-1',
        roadName: 'Test',
        roadNumber: '123',
        aarType: 'XM', // Boxcar, in accepted types
        description: 'Boxcar',
        color: 'black',
        note: '',
        homeYard: 'industry-1',
        ownerId: 'owner-1'
      };

      // This should not throw an error
      const updatedIndustry = placeCarAtTrack(industry, 'track-1', car);
      
      // Verify the car was placed
      expect(updatedIndustry.tracks[0].placedCars).toContain('car-1');
    });

    it('should accept any car type when acceptedCarTypes is undefined', () => {
      // Setup a track without acceptedCarTypes defined
      const track: Track = {
        _id: 'track-1',
        name: 'Test Track',
        length: 100,
        capacity: 3,
        maxCars: 3,
        placedCars: [],
        acceptedCarTypes: [], // Empty array
        ownerId: 'owner-1'
      };

      const industry: Industry = {
        _id: 'industry-1',
        name: 'Test Industry',
        industryType: IndustryType.FREIGHT,
        locationId: 'location-1',
        blockName: 'Block A',
        tracks: [track],
        ownerId: 'owner-1'
      };

      // Setup any car
      const car: RollingStock = {
        _id: 'car-1',
        roadName: 'Test',
        roadNumber: '123',
        aarType: 'TA', // Any type
        description: 'Tank Car',
        color: 'black',
        note: '',
        homeYard: 'industry-1',
        ownerId: 'owner-1'
      };

      // This should not throw an error
      const updatedIndustry = placeCarAtTrack(industry, 'track-1', car);
      
      // Verify the car was placed
      expect(updatedIndustry.tracks[0].placedCars).toContain('car-1');
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