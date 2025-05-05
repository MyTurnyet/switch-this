import { OperationsService } from '../OperationsService';
import { 
  TrainRoute, 
  Industry, 
  RollingStock, 
  IndustryType 
} from '@/app/shared/types/models';

describe('OperationsService', () => {
  const mockTrainRoute: TrainRoute = {
    _id: 'route1',
    name: 'Test Route',
    routeNumber: 'TR-101',
    routeType: 'FREIGHT',
    originatingYardId: 'yard1',
    terminatingYardId: 'yard2',
    stations: ['yard1', 'loc1', 'loc2', 'yard2'],
    ownerId: 'owner1'
  };

  const mockIndustries: Industry[] = [
    {
      _id: 'ind_yard1',
      name: 'Starting Yard',
      locationId: 'yard1',
      blockName: 'YARD',
      industryType: IndustryType.YARD,
      tracks: [
        {
          _id: 'track1',
          name: 'Track 1',
          length: 100,
          maxCars: 5,
          capacity: 5,
          placedCars: ['car1', 'car2', 'car3'],
          acceptedCarTypes: ['*'],
          ownerId: 'owner1'
        },
        {
          _id: 'track2',
          name: 'Track 2',
          length: 100,
          maxCars: 5,
          capacity: 5,
          placedCars: ['car4', 'car5'],
          acceptedCarTypes: ['*'],
          ownerId: 'owner1'
        }
      ],
      ownerId: 'owner1'
    },
    {
      _id: 'ind1',
      name: 'Echo Lake Factory',
      locationId: 'loc1',
      blockName: 'ECHO',
      industryType: IndustryType.FREIGHT,
      tracks: [],
      ownerId: 'owner1'
    }
  ];

  const mockRollingStock: RollingStock[] = [
    {
      _id: 'car1',
      roadName: 'BNSF',
      roadNumber: '12345',
      aarType: 'XM',
      description: 'Boxcar',
      color: 'brown',
      note: '',
      homeYard: 'yard1',
      currentLocation: {
        industryId: 'ind_yard1',
        trackId: 'track1'
      },
      ownerId: 'owner1'
    },
    {
      _id: 'car2',
      roadName: 'UP',
      roadNumber: '54321',
      aarType: 'T',
      description: 'Tank car',
      color: 'black',
      note: '',
      homeYard: 'yard1',
      currentLocation: {
        industryId: 'ind_yard1',
        trackId: 'track1'
      },
      ownerId: 'owner1'
    },
    {
      _id: 'car3',
      roadName: 'SP',
      roadNumber: '67890',
      aarType: 'G',
      description: 'Gondola',
      color: 'red',
      note: '',
      homeYard: 'yard1',
      currentLocation: {
        industryId: 'ind_yard1',
        trackId: 'track1'
      },
      ownerId: 'owner1'
    },
    {
      _id: 'car4',
      roadName: 'CSX',
      roadNumber: '98765',
      aarType: 'FM',
      description: 'Flat car',
      color: 'green',
      note: '',
      homeYard: 'yard1',
      currentLocation: {
        industryId: 'ind_yard1',
        trackId: 'track2'
      },
      ownerId: 'owner1'
    },
    {
      _id: 'car5',
      roadName: 'NS',
      roadNumber: '24680',
      aarType: 'H',
      description: 'Hopper',
      color: 'gray',
      note: '',
      homeYard: 'yard1',
      currentLocation: {
        industryId: 'ind_yard1',
        trackId: 'track2'
      },
      ownerId: 'owner1'
    },
    {
      _id: 'car6',
      roadName: 'CN',
      roadNumber: '13579',
      aarType: 'RS',
      description: 'Refrigerator car',
      color: 'white',
      note: '',
      homeYard: 'yard2',
      currentLocation: {
        industryId: 'ind1',
        trackId: 'track3'
      },
      ownerId: 'owner1'
    }
  ];

  let operationsService: OperationsService;

  beforeEach(() => {
    operationsService = new OperationsService();
  });

  it('should find cars in the originating yard', () => {
    const carsInYard = operationsService.getCarsInOriginatingYard(
      mockTrainRoute,
      mockIndustries,
      mockRollingStock
    );

    // Should find 5 cars in the yard
    expect(carsInYard.length).toBe(5);
    
    // All cars should belong to one of the yard tracks
    carsInYard.forEach((car: RollingStock) => {
      expect(car.currentLocation?.industryId).toBe('ind_yard1');
    });
    
    // The car that's not in the yard should not be included
    const nonYardCar = carsInYard.find((car: RollingStock) => car._id === 'car6');
    expect(nonYardCar).toBeUndefined();
  });

  it('should return empty array if no cars are in originating yard', () => {
    const emptyTrainRoute: TrainRoute = {
      ...mockTrainRoute,
      originatingYardId: 'nonexistent-yard'
    };

    const carsInYard = operationsService.getCarsInOriginatingYard(
      emptyTrainRoute,
      mockIndustries,
      mockRollingStock
    );

    expect(carsInYard).toEqual([]);
  });

  it('should find cars in a specific track of the originating yard', () => {
    const carsInTrack = operationsService.getCarsInYardTrack(
      mockTrainRoute,
      mockIndustries,
      mockRollingStock,
      'track1'
    );

    // Should find 3 cars in track1
    expect(carsInTrack.length).toBe(3);
    
    // All cars should be in track1
    carsInTrack.forEach((car: RollingStock) => {
      expect(car.currentLocation?.trackId).toBe('track1');
    });
    
    // Cars from track2 should not be included
    const track2Car = carsInTrack.find((car: RollingStock) => car._id === 'car4');
    expect(track2Car).toBeUndefined();
  });

  it('should find all industries at the originating yard', () => {
    const yardIndustries = operationsService.getOriginatingYardIndustries(
      mockTrainRoute,
      mockIndustries
    );

    expect(yardIndustries.length).toBe(1);
    expect(yardIndustries[0]._id).toBe('ind_yard1');
    expect(yardIndustries[0].locationId).toBe('yard1');
    expect(yardIndustries[0].industryType).toBe(IndustryType.YARD);
  });

  it('should return empty array if no industries at originating yard', () => {
    const emptyTrainRoute: TrainRoute = {
      ...mockTrainRoute,
      originatingYardId: 'nonexistent-yard'
    };

    const yardIndustries = operationsService.getOriginatingYardIndustries(
      emptyTrainRoute,
      mockIndustries
    );

    expect(yardIndustries).toEqual([]);
  });
}); 