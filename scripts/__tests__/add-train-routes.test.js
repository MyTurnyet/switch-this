const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Mock dependencies
jest.mock('mongodb');
jest.mock('fs');
jest.mock('path');

// Mock the process.env properties
process.env.MONGODB_URI = 'mongodb://test:test@localhost:27017';
process.env.MONGODB_DB = 'test-db';

describe('add-train-routes script', () => {
  // Save original module cache
  const originalCache = { ...require.cache };
  
  beforeEach(() => {
    // Clear the module cache for the script
    delete require.cache[require.resolve('../add-train-routes')];
    
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Setup MongoDB mocks
    const mockCollection = {
      countDocuments: jest.fn(),
      insertMany: jest.fn()
    };
    
    const mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    };
    
    const mockClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      db: jest.fn().mockReturnValue(mockDb),
      close: jest.fn().mockResolvedValue(undefined)
    };
    
    // Setup the MongoClient mock
    MongoClient.mockImplementation(() => mockClient);
    
    // Setup path mock
    path.join.mockReturnValue('/mock/path/to/train-routes.json');
    
    // Setup fs mock
    fs.readFileSync = jest.fn().mockReturnValue('[]');
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  afterAll(() => {
    // Restore original module cache
    require.cache = originalCache;
  });

  it('should skip import if train routes already exist', async () => {
    // Arrange
    const mockClient = new MongoClient();
    const mockDb = mockClient.db();
    const mockCollection = mockDb.collection();
    mockCollection.countDocuments.mockResolvedValue(2);
    
    // Act
    const addTrainRoutes = require('../add-train-routes');
    await addTrainRoutes();
    
    // Assert
    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.db).toHaveBeenCalled();
    expect(mockDb.collection).toHaveBeenCalledWith('trainRoutes');
    expect(mockCollection.countDocuments).toHaveBeenCalledWith({});
    expect(console.log).toHaveBeenCalledWith('Found 2 train routes in database. Skipping import.');
    expect(mockCollection.insertMany).not.toHaveBeenCalled();
    expect(mockClient.close).toHaveBeenCalled();
  });

  it('should import train routes if none exist', async () => {
    // Arrange
    const mockClient = new MongoClient();
    const mockDb = mockClient.db();
    const mockCollection = mockDb.collection();
    mockCollection.countDocuments.mockResolvedValue(0);
    mockCollection.insertMany.mockResolvedValue({ insertedCount: 1 });
    
    const mockTrainRoutes = [
      {
        "_id": { "$oid": "123456789012345678901234" },
        "name": "Test Route 1",
        "routeNumber": "TR 101",
        "routeType": "MIXED",
        "originatingYardId": { "$oid": "123456789012345678901234" },
        "terminatingYardId": { "$oid": "123456789012345678901234" },
        "stations": [{ "$oid": "123456789012345678901234" }],
        "ownerId": { "$oid": "123456789012345678901234" }
      }
    ];
    
    fs.readFileSync.mockReturnValue(JSON.stringify(mockTrainRoutes));
    
    // Act
    const addTrainRoutes = require('../add-train-routes');
    await addTrainRoutes();
    
    // Assert
    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.db).toHaveBeenCalled();
    expect(mockDb.collection).toHaveBeenCalledWith('trainRoutes');
    expect(mockCollection.countDocuments).toHaveBeenCalledWith({});
    expect(fs.readFileSync).toHaveBeenCalled();
    expect(mockCollection.insertMany).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Successfully imported 1 train routes');
    expect(mockClient.close).toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    // Arrange
    const mockClient = new MongoClient();
    mockClient.connect.mockRejectedValue(new Error('Database error'));
    
    // Act
    const addTrainRoutes = require('../add-train-routes');
    await addTrainRoutes().catch(() => {});
    
    // Assert
    expect(mockClient.connect).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Error importing train routes:', expect.any(Error));
  });
}); 