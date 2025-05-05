import { ObjectId } from 'mongodb';
import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { FakeMongoDbService, createMongoDbTestSetup } from '@/test/utils/mongodb-test-utils';
import { Document } from 'mongodb';

// Example interface for a document model
interface RollingStock {
  _id?: string | ObjectId;
  roadName: string;
  roadNumber: string;
  aarType: string;
  homeYard: string;
}

describe('FakeMongoDbService Usage Example', () => {
  // Declare the FakeMongoDbService variable
  let fakeMongoService: FakeMongoDbService;

  // Set up the test environment before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Use our utility to set up the FakeMongoDbService and mock MongoDbProvider
    ({ fakeMongoService } = createMongoDbTestSetup());
  });

  it('should use FakeMongoDbService with MongoDbProvider', () => {
    // Create a new provider (this will use our mocked implementation)
    const mongoDbProvider = new MongoDbProvider(fakeMongoService);
    
    // Get the service
    const service = mongoDbProvider.getService();
    
    // Verify the service was returned correctly
    expect(service).toBe(fakeMongoService);
  });

  it('should connect and interact with collections', async () => {
    // Connect to the fake MongoDB
    await fakeMongoService.connect();
    
    // Verify connect was called
    expect(fakeMongoService.callHistory).toContainEqual({ 
      method: 'connect', 
      args: [] 
    });
    
    // Get a collection
    const rollingStockCollection = fakeMongoService.getRollingStockCollection();
    expect(rollingStockCollection).toBeTruthy();
    
    // Verify collection was requested
    expect(fakeMongoService.callHistory).toContainEqual({ 
      method: 'getRollingStockCollection', 
      args: [] 
    });
    
    // Insert a document
    const mockRollingStock: RollingStock = {
      roadName: 'BNSF',
      roadNumber: '1234',
      aarType: 'XM',
      homeYard: 'yard1'
    };
    
    await rollingStockCollection.insertOne(mockRollingStock as unknown as Document);
    
    // Find documents
    const findCursor = rollingStockCollection.find();
    const documents = await findCursor.toArray();
    
    // Verify the document was inserted
    expect(documents.length).toBe(1);
    expect(documents[0].roadName).toBe('BNSF');
  });

  it('should mock specific collection behaviors', async () => {
    // Get a collection from the fake service
    const rollingStockCollection = fakeMongoService.getRollingStockCollection();
    
    // Set up custom mock behavior for this test
    const mockRollingStocks = [
      { _id: new ObjectId(), roadName: 'UP', roadNumber: '5678', aarType: 'GS' },
      { _id: new ObjectId(), roadName: 'CSX', roadNumber: '9012', aarType: 'FM' }
    ];
    
    // Mock the find method to return our custom data
    rollingStockCollection.find = jest.fn().mockImplementation(() => ({
      toArray: jest.fn().mockResolvedValue(mockRollingStocks)
    }));
    
    // Use the collection
    const findCursor = rollingStockCollection.find();
    const documents = await findCursor.toArray();
    
    // Verify our mock data was returned
    expect(documents.length).toBe(2);
    expect(documents[0].roadName).toBe('UP');
    expect(documents[1].roadName).toBe('CSX');
  });

  it('should track call history for verification', async () => {
    // Use various methods on the fake service
    await fakeMongoService.connect();
    fakeMongoService.getRollingStockCollection();
    fakeMongoService.getIndustriesCollection();
    fakeMongoService.toObjectId('507f1f77bcf86cd799439011');
    
    // Verify call history
    expect(fakeMongoService.callHistory).toEqual([
      { method: 'connect', args: [] },
      { method: 'getRollingStockCollection', args: [] },
      { method: 'getIndustriesCollection', args: [] },
      { method: 'toObjectId', args: ['507f1f77bcf86cd799439011'] }
    ]);
    
    // Clear call history for a fresh start
    fakeMongoService.clearCallHistory();
    expect(fakeMongoService.callHistory).toEqual([]);
  });

  // Clean up after tests
  afterEach(() => {
    fakeMongoService.clearCallHistory();
  });
}); 