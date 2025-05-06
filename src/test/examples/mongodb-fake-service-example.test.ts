import { ObjectId, Collection } from 'mongodb';
import { MongoDbProvider } from '@/lib/services/mongodb.provider';
import { createMockMongoService } from '@/test/utils/mongodb-test-utils';
import { IMongoDbService } from '@/lib/services/mongodb.interface';

// Example interface for a document model
interface RollingStock {
  _id?: string | ObjectId;
  roadName: string;
  roadNumber: string;
  aarType: string;
  homeYard: string;
}

describe('MongoDB Service Testing Example', () => {
  // Declare the mock service variable
  let mockMongoService: jest.Mocked<IMongoDbService>;
  let mockCollection: jest.Mocked<Collection>;

  // Set up the test environment before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Create a mock MongoDB service
    mockMongoService = createMockMongoService();
    mockCollection = mockMongoService.getRollingStockCollection();
  });

  it('should use mock MongoDB service with MongoDbProvider', () => {
    // Create a new provider with our mock service
    const mongoDbProvider = new MongoDbProvider(mockMongoService);
    
    // Get the service
    const service = mongoDbProvider.getService();
    
    // Verify the service was returned correctly
    expect(service).toBe(mockMongoService);
  });

  it('should connect and interact with collections', async () => {
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