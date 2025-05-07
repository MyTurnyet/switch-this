import { ObjectId } from 'mongodb';
import { getMongoService } from '../src/lib/services/mongodb.client';
import { PlaywrightMongoDbService } from '../src/test/utils/playwright-mongo-mock';
import { DB_COLLECTIONS } from '../src/lib/constants/dbCollections';

/**
 * Setup test data for all collections in the mock MongoDB service
 */
export async function setupFakeMongoDbData(): Promise<void> {
  console.log('Setting up fake MongoDB data for Playwright tests');
  
  // Get the MongoDB service instance (should be the Playwright mock)
  const mongoService = getMongoService();
  
  // Verify we have the correct service type
  if (!(mongoService instanceof PlaywrightMongoDbService)) {
    console.error('Expected PlaywrightMongoDbService but got:', mongoService.constructor.name);
    throw new Error('Failed to initialize PlaywrightMongoDbService');
  }
  
  console.log('Successfully loaded PlaywrightMongoDbService');
  
  // Setup mock data for collections
  await setupIndustriesData(mongoService as PlaywrightMongoDbService);
  await setupLocationsData(mongoService as PlaywrightMongoDbService);
  await setupRollingStockData(mongoService as PlaywrightMongoDbService);
  await setupTrainRoutesData(mongoService as PlaywrightMongoDbService);
  await setupSwitchlistsData(mongoService as PlaywrightMongoDbService);
  
  console.log('Fake MongoDB data setup complete');
}

/**
 * Setup test data for the industries collection
 */
async function setupIndustriesData(mongoService: PlaywrightMongoDbService): Promise<void> {
  // Mock data
  const industries = [
    {
      _id: new ObjectId('60d21b4667d0d8992e610c85'),
      name: 'Steel Mill',
      locationId: '60d21b4667d0d8992e610c90',
      industryType: 'Manufacturing',
      blockName: 'Industrial Zone A',
      tracks: [
        { name: 'Track 1', capacity: 5 },
        { name: 'Track 2', capacity: 3 }
      ]
    },
    {
      _id: new ObjectId('60d21b4667d0d8992e610c86'),
      name: 'Paper Mill',
      locationId: '60d21b4667d0d8992e610c91',
      industryType: 'Manufacturing',
      blockName: 'Industrial Zone B',
      tracks: [
        { name: 'Track 1', capacity: 4 }
      ]
    },
    {
      _id: new ObjectId('60d21b4667d0d8992e610c87'),
      name: 'Coal Mine',
      locationId: '60d21b4667d0d8992e610c92',
      industryType: 'Mining',
      blockName: 'Mining District',
      tracks: [
        { name: 'Track 1', capacity: 7 },
        { name: 'Track 2', capacity: 7 }
      ]
    }
  ];
  
  // Set the data directly in the collection
  mongoService.setCollectionData(DB_COLLECTIONS.INDUSTRIES, industries);
}

/**
 * Setup test data for the locations collection
 */
async function setupLocationsData(mongoService: PlaywrightMongoDbService): Promise<void> {
  // Mock data
  const locations = [
    {
      _id: new ObjectId('60d21b4667d0d8992e610c90'),
      name: 'East Harbor',
      description: 'Industrial harbor on the east side',
      type: 'Harbor'
    },
    {
      _id: new ObjectId('60d21b4667d0d8992e610c91'),
      name: 'West Valley',
      description: 'Manufacturing area in the west valley',
      type: 'Industrial'
    },
    {
      _id: new ObjectId('60d21b4667d0d8992e610c92'),
      name: 'North Ridge',
      description: 'Mining district in the northern mountains',
      type: 'Mining'
    }
  ];
  
  // Set the data directly in the collection
  mongoService.setCollectionData(DB_COLLECTIONS.LOCATIONS, locations);
}

/**
 * Setup test data for the rolling stock collection
 */
async function setupRollingStockData(mongoService: PlaywrightMongoDbService): Promise<void> {
  // Mock data
  const rollingStock = [
    {
      _id: new ObjectId('60d21b4667d0d8992e610c95'),
      roadName: 'BNSF',
      roadNumber: '1234',
      aarType: 'Boxcar',
      homeYard: 'Central Yard',
      currentLocation: '60d21b4667d0d8992e610c90'
    },
    {
      _id: new ObjectId('60d21b4667d0d8992e610c96'),
      roadName: 'UP',
      roadNumber: '5678',
      aarType: 'Hopper',
      homeYard: 'South Yard',
      currentLocation: '60d21b4667d0d8992e610c91'
    },
    {
      _id: new ObjectId('60d21b4667d0d8992e610c97'),
      roadName: 'CSX',
      roadNumber: '9012',
      aarType: 'Tanker',
      homeYard: 'North Yard',
      currentLocation: '60d21b4667d0d8992e610c92'
    }
  ];
  
  // Set the data directly in the collection
  mongoService.setCollectionData(DB_COLLECTIONS.ROLLING_STOCK, rollingStock);
}

/**
 * Setup test data for the train routes collection
 */
async function setupTrainRoutesData(mongoService: PlaywrightMongoDbService): Promise<void> {
  // Mock data
  const trainRoutes = [
    {
      _id: new ObjectId('60d21b4667d0d8992e610d01'),
      name: 'Local Freight #1',
      startLocation: '60d21b4667d0d8992e610c90',
      stops: [
        '60d21b4667d0d8992e610c91',
        '60d21b4667d0d8992e610c92'
      ],
      schedule: 'Daily'
    },
    {
      _id: new ObjectId('60d21b4667d0d8992e610d02'),
      name: 'Mining Express',
      startLocation: '60d21b4667d0d8992e610c92',
      stops: [
        '60d21b4667d0d8992e610c90'
      ],
      schedule: 'Weekdays'
    }
  ];
  
  // Set the data directly in the collection
  mongoService.setCollectionData(DB_COLLECTIONS.TRAIN_ROUTES, trainRoutes);
}

/**
 * Setup test data for the switchlists collection
 */
async function setupSwitchlistsData(mongoService: PlaywrightMongoDbService): Promise<void> {
  // Mock data
  const switchlists = [
    {
      _id: new ObjectId('60d21b4667d0d8992e610e01'),
      name: 'Morning Freight Run',
      trainRouteId: '60d21b4667d0d8992e610d01',
      date: new Date('2023-05-15'),
      operations: [
        {
          type: 'pickup',
          industryId: '60d21b4667d0d8992e610c85',
          rollingStockId: '60d21b4667d0d8992e610c95'
        },
        {
          type: 'dropoff',
          industryId: '60d21b4667d0d8992e610c86',
          rollingStockId: '60d21b4667d0d8992e610c96'
        }
      ]
    },
    {
      _id: new ObjectId('60d21b4667d0d8992e610e02'),
      name: 'Evening Coal Run',
      trainRouteId: '60d21b4667d0d8992e610d02',
      date: new Date('2023-05-15'),
      operations: [
        {
          type: 'pickup',
          industryId: '60d21b4667d0d8992e610c87',
          rollingStockId: '60d21b4667d0d8992e610c97'
        }
      ]
    }
  ];
  
  // Set the data directly in the collection
  mongoService.setCollectionData(DB_COLLECTIONS.SWITCHLISTS, switchlists);
} 