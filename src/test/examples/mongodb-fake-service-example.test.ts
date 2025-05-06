import { ObjectId, Collection, Document } from 'mongodb';
import { createMockMongoService, FakeMongoDbService } from '@/test/utils/mongodb-test-utils';
import { IMongoDbService } from '@/lib/services/mongodb.interface';

// Example interface for a document model
interface RollingStock extends Document {
  _id?: ObjectId;
  roadName: string;
  roadNumber: string;
  aarType: string;
  homeYard: string;
}

describe('MongoDB Service Testing Example', () => {
  // Declare the mock service variable
  let mockMongoService: jest.Mocked<IMongoDbService>;
  let mockCollection: jest.Mocked<Collection<Document>>;

  // Set up the test environment before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Create a mock MongoDB service
    mockMongoService = createMockMongoService();
    mockCollection = mockMongoService.getRollingStockCollection() as jest.Mocked<Collection<Document>>;
  });

  it('should use IMongoDbService directly', () => {
    // Create and use the service directly
    const service: IMongoDbService = mockMongoService;
    
    // Verify the service was created correctly
    expect(service).toBeDefined();
    expect(service.connect).toBeDefined();
    expect(service.getCollection).toBeDefined();
  });
  
  it('should use FakeMongoDbService for testing', async () => {
    // Create a new FakeMongoDbService instance
    const fakeMongoService = new FakeMongoDbService();
    
    // Connect to MongoDB
    await fakeMongoService.connect();
    
    // Get a collection
    const rollingStockCollection = fakeMongoService.getRollingStockCollection();
    
    // Verify the collection exists
    expect(rollingStockCollection).toBeDefined();
    
    // Disconnect when done
    await fakeMongoService.close();
  });

  it('should connect and interact with collections', async () => {
    // Spy on getRollingStockCollection method for verification
    jest.spyOn(mockMongoService, 'getRollingStockCollection');
    
    // Connect to the MongoDB
    await mockMongoService.connect();
    
    // Verify connect was called
    expect(mockMongoService.connect).toHaveBeenCalled();
    
    // Get a collection
    const rollingStockCollection = mockMongoService.getRollingStockCollection();
    expect(rollingStockCollection).toBeTruthy();
    
    // Verify collection was requested
    expect(mockMongoService.getRollingStockCollection).toHaveBeenCalled();
    
    // Setup mock response for insertOne
    const mockRollingStock: RollingStock = {
      roadName: 'BNSF',
      roadNumber: '1234',
      aarType: 'XM',
      homeYard: 'yard1'
    };
    
    (mockCollection.insertOne as jest.Mock).mockResolvedValue({ 
      insertedId: new ObjectId(), 
      acknowledged: true 
    });
    
    // Insert a document
    await rollingStockCollection.insertOne(mockRollingStock);
    
    // Verify insertOne was called with the right data
    expect(mockCollection.insertOne).toHaveBeenCalledWith(mockRollingStock);
    
    // Setup mock response for find
    const mockDocuments = [
      { ...mockRollingStock, _id: new ObjectId() }
    ];
    
    (mockCollection.find as jest.Mock).mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockDocuments)
    });
    
    // Find documents
    const documents = await rollingStockCollection.find().toArray();
    
    // Verify find was called
    expect(mockCollection.find).toHaveBeenCalled();
    
    // Verify the document was returned
    expect(documents.length).toBe(1);
    expect(documents[0].roadName).toBe('BNSF');
  });

  it('should mock specific collection behaviors', async () => {
    // Get a collection from the mock service
    const rollingStockCollection = mockMongoService.getRollingStockCollection();
    
    // Set up custom mock behavior for this test
    const mockRollingStocks = [
      { _id: new ObjectId(), roadName: 'UP', roadNumber: '5678', aarType: 'GS' },
      { _id: new ObjectId(), roadName: 'CSX', roadNumber: '9012', aarType: 'FM' }
    ];
    
    // Mock the find method to return our custom data
    (mockCollection.find as jest.Mock).mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockRollingStocks)
    });
    
    // Use the collection
    const documents = await rollingStockCollection.find().toArray();
    
    // Verify our mock data was returned
    expect(documents.length).toBe(2);
    expect(documents[0].roadName).toBe('UP');
    expect(documents[1].roadName).toBe('CSX');
  });

  it('should allow verification of method calls', async () => {
    // Add spies for methods we want to verify
    jest.spyOn(mockMongoService, 'getRollingStockCollection');
    jest.spyOn(mockMongoService, 'getIndustriesCollection');
    jest.spyOn(mockMongoService, 'toObjectId');
    
    // Use various methods on the mock service
    await mockMongoService.connect();
    mockMongoService.getRollingStockCollection();
    mockMongoService.getIndustriesCollection();
    
    const testId = '507f1f77bcf86cd799439011';
    mockMongoService.toObjectId(testId);
    
    // Verify all method calls
    expect(mockMongoService.connect).toHaveBeenCalled();
    expect(mockMongoService.getRollingStockCollection).toHaveBeenCalled();
    expect(mockMongoService.getIndustriesCollection).toHaveBeenCalled();
    expect(mockMongoService.toObjectId).toHaveBeenCalledWith(testId);
  });
}); 